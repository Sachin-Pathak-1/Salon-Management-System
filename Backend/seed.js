const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Load Models
const User = require("./models/User");
const Salon = require("./models/Salon");
const Staff = require("./models/Staff");
const Service = require("./models/Service");
const Category = require("./models/Category");
const Appointment = require("./models/Appointment");

// --- DATA CONSTANTS ---

const CATEGORIES = [
    { name: "Hair", icon: "✂️", description: "Haircuts, styling, and treatments" },
    { name: "Skin", icon: "✨", description: "Facials, cleanup, and treatments" },
    { name: "Nails", icon: "💅", description: "Manicure, pedicure, and nail art" },
    { name: "Massage", icon: "💆", description: "Relaxing body massages" }
];

const SERVICES_FULL = [
    { name: "Classic Haircut", category: "Hair", price: 500, duration: 45, isFeatured: true },
    { name: "Hair Coloring", category: "Hair", price: 1500, duration: 120, isFeatured: false },
    { name: "Keratin Treatment", category: "Hair", price: 3000, duration: 180, isFeatured: true },
    { name: "Express Facial", category: "Skin", price: 800, duration: 30, isFeatured: true },
    { name: "Deep Cleanse", category: "Skin", price: 1200, duration: 60, isFeatured: false },
    { name: "Gel Manicure", category: "Nails", price: 1200, duration: 60, isFeatured: true },
    { name: "Pedicure", category: "Nails", price: 900, duration: 45, isFeatured: false },
    { name: "Full Body Massage", category: "Massage", price: 2000, duration: 60, isFeatured: false }
];

const SERVICES_EXPRESS = [
    { name: "Quick Cut", category: "Hair", price: 300, duration: 30, isFeatured: true },
    { name: "Dry Shave", category: "Skin", price: 200, duration: 20, isFeatured: false },
    { name: "Head Massage", category: "Massage", price: 500, duration: 30, isFeatured: true }
];

const STAFF_PREMIUM = [
    { name: "Amit Sharma", role: "manager", designation: "Salon Manager", specialization: "All", experience: 10, salary: 50000, shift: "full-day", gender: "Male" },
    { name: "Priya Singh", role: "staff", designation: "Senior Stylist", specialization: "Hair", experience: 5, salary: 35000, shift: "morning", gender: "Female" },
    { name: "Rahul Verma", role: "staff", designation: "Nail Artist", specialization: "Nails", experience: 3, salary: 25000, shift: "evening", gender: "Male" },
    { name: "Neha Gupta", role: "staff", designation: "Beautician", specialization: "Skin", experience: 4, salary: 28000, shift: "full-day", gender: "Female" }
];

const STAFF_EXPRESS = [
    { name: "Vikram Das", role: "manager", designation: "Store Manager", specialization: "All", experience: 7, salary: 40000, shift: "full-day", gender: "Male" },
    { name: "Riya Roy", role: "staff", designation: "Junior Stylist", specialization: "Hair", experience: 1, salary: 15000, shift: "full-day", gender: "Female" }
];

const seed = async () => {
    try {
        console.log("🌱 Connecting to MongoDB...");
        if (!process.env.MONGO_URI) throw new Error("MONGO_URI is undefined!");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected");

        console.log("🔥 WIPING SYSTEM DATA (keeping Users)...");
        await Salon.deleteMany({});
        await Staff.deleteMany({});
        await Service.deleteMany({});
        await Category.deleteMany({});
        await Appointment.deleteMany({});
        console.log("✅ Data Wiped");

        // Find Admins
        const admins = await User.find({ role: "admin" });
        if (admins.length === 0) {
            console.log("❌ No Admin users found. Cannot seed.");
            process.exit(1);
        }

        console.log(`🌱 Seeding data for ${admins.length} admin(s)...`);

        for (const admin of admins) {
            console.log(`\n👑 Processing Admin: ${admin.name}`);

            // --- 1. PREMIUM SALON ---
            await createSalon(admin, {
                name: `${admin.name}'s Premium Salon`,
                address: "101 Luxury Lane, Metropolis",
                type: "Premium",
                isPrimary: true,
                servicesList: SERVICES_FULL,
                staffList: STAFF_PREMIUM
            });

            // --- 2. EXPRESS SALON ---
            await createSalon(admin, {
                name: `${admin.name} Express`,
                address: "42 Market Street, Downtown",
                type: "Budget",
                isPrimary: false,
                servicesList: SERVICES_EXPRESS,
                staffList: STAFF_EXPRESS
            });
        }

        console.log("\n✅ SEEDING COMPLETE! System is ready.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding Failed:", err);
        process.exit(1);
    }
};

async function createSalon(admin, config) {
    console.log(`   building Salon: ${config.name}`);

    // 1. Create Salon
    const salon = await Salon.create({
        name: config.name,
        address: config.address,
        contact: admin.contact || "9876543210",
        adminId: admin._id,
        email: admin.email,
        status: "open",
        isPrimary: config.isPrimary,
        openingTime: "09:00",
        closingTime: "21:00",
    });

    // 2. Create Categories
    const categoryMap = {}; // name -> _id
    for (const catData of CATEGORIES) {
        const cat = await Category.create({
            ...catData,
            salonId: salon._id,
            adminId: admin._id,
            status: "active"
        });
        categoryMap[catData.name] = cat._id;
    }

    // 3. Create Services
    const serviceObjects = [];
    for (const svcData of config.servicesList) {
        if (!categoryMap[svcData.category]) continue; // Skip if category missing (e.g. Massage in express?)
        const svc = await Service.create({
            name: svcData.name,
            categoryId: categoryMap[svcData.category],
            price: svcData.price,
            duration: svcData.duration,
            isFeatured: svcData.isFeatured,
            salonId: salon._id,
            adminId: admin._id,
            description: `Professional ${svcData.name} service`,
            status: "active",
            assignedStaff: [] // Initialize empty
        });
        serviceObjects.push({ ...svc.toObject(), categoryName: svcData.category });
    }

    // 4. Create Staff & BI-DIRECTIONAL Assignment
    for (const profile of config.staffList) {
        const passwordPlain = profile.name.split(" ")[0].toLowerCase() + "123";
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        // Logic: Filter services based on specialization
        let assignedServiceIds = [];
        if (profile.specialization === "All") {
            assignedServiceIds = serviceObjects.map(s => s._id);
        } else {
            assignedServiceIds = serviceObjects
                .filter(s => s.categoryName === profile.specialization)
                .map(s => s._id);
        }

        // Create Staff
        const staff = await Staff.create({
            ...profile,
            email: `${profile.name.split(" ")[0].toLowerCase()}.${Math.floor(Math.random() * 1000)}@example.com`,
            password: hashedPassword,
            adminId: admin._id,
            salonId: salon._id,
            contact: "9876543210",
            status: "active",
            services: assignedServiceIds
        });

        // CRITICAL: Update Service.assignedStaff
        if (assignedServiceIds.length > 0) {
            await Service.updateMany(
                { _id: { $in: assignedServiceIds } },
                { $push: { assignedStaff: staff._id } }
            );
        }

        console.log(`      -> Staff: ${profile.name} (${profile.designation}) - Assigned ${assignedServiceIds.length} services`);
    }
}

seed();
