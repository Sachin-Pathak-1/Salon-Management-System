require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Salon = require("../models/Salon");
const Category = require("../models/Category");
const Service = require("../models/Service");
const Staff = require("../models/Staff");

const DEFAULT_PASSWORD = "Pass@12345";

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");
}

const salonImagePool = [
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80",
  "https://picsum.photos/seed/salon-malad/1200/800"
];

const spaImagePool = [
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80"
];

const salonAreas = [
  "Colaba", "Dadar", "Andheri", "Powai", "Bandra",
  "Ghatkopar", "Chembur", "Vashi", "Borivali", "Malad"
];

const spaAreas = [
  "Worli", "Thane", "Juhu", "Lower Parel", "Khar",
  "Nerul", "Seawoods", "BKC", "Airoli", "Santacruz"
];

const staffNamePool = [
  "Aisha Khan", "Meera Joshi", "Ritika Menon", "Kabir Shah", "Sonia Arora",
  "Nisha Patil", "Arjun Nair", "Pooja Iyer", "Nandini Rao", "Vikram Das",
  "Isha Kulkarni", "Rhea Bansal", "Aditya Ghosh", "Sneha Rao", "Karan Malhotra"
];

const salonServiceTemplates = [
  { category: "Hair", name: "Precision Haircut", price: 699, duration: "45" },
  { category: "Hair", name: "Global Hair Color", price: 1899, duration: "120" },
  { category: "Skin", name: "Hydra Facial", price: 1499, duration: "60" },
  { category: "Nails", name: "Gel Manicure", price: 999, duration: "50" },
  { category: "Grooming", name: "Head Massage", price: 499, duration: "25" }
];

const spaServiceTemplates = [
  { category: "Massage", name: "Deep Tissue Massage", price: 2299, duration: "60" },
  { category: "Therapy", name: "Aromatherapy Ritual", price: 2499, duration: "75" },
  { category: "Wellness", name: "Detox Steam Circuit", price: 1399, duration: "45" },
  { category: "Ayurveda", name: "Abhyanga Massage", price: 2199, duration: "60" },
  { category: "Therapy", name: "Hot Stone Therapy", price: 2899, duration: "80" }
];

const buildStaff = (prefix, index) =>
  Array.from({ length: 5 }, (_, i) => ({
    name: `${staffNamePool[(index * 3 + i) % staffNamePool.length]} ${prefix}`,
    role: i === 0 ? "manager" : "staff",
    specialization: i % 2 === 0 ? "Senior Specialist" : "Therapy Specialist"
  }));

const buildCategoriesFromServices = (templates, label) => {
  const byCategory = new Map();
  templates.forEach((template) => {
    if (!byCategory.has(template.category)) byCategory.set(template.category, []);
    byCategory.get(template.category).push({
      name: `${template.name} - ${label}`,
      price: template.price,
      duration: template.duration
    });
  });
  return [...byCategory.entries()].map(([name, services]) => ({ name, services }));
};

const salonSeeds = salonAreas.map((area, idx) => ({
  name: `Signature Glow Salon - ${area}`,
  type: "salon",
  address: `${area}, Mumbai`,
  contact: `+91-91001${String(idx + 1).padStart(4, "0")}`,
  email: `${slugify(area)}.signature.salon@example.com`,
  ownerName: "House Team",
  openingTime: "09:00",
  closingTime: "21:00",
  logo: salonImagePool[idx],
  staff: buildStaff(area, idx),
  categories: buildCategoriesFromServices(salonServiceTemplates, area)
}));

const spaSeeds = spaAreas.map((area, idx) => ({
  name: `Serenity Wellness Spa - ${area}`,
  type: "spa",
  address: `${area}, Mumbai`,
  contact: `+91-92001${String(idx + 1).padStart(4, "0")}`,
  email: `${slugify(area)}.serenity.spa@example.com`,
  ownerName: "House Team",
  openingTime: "10:00",
  closingTime: "22:00",
  logo: spaImagePool[idx],
  staff: buildStaff(area, idx + 10),
  categories: buildCategoriesFromServices(spaServiceTemplates, area)
}));

const experienceSeeds = [...salonSeeds, ...spaSeeds];

async function ensureAdminUser() {
  const preferredEmail = process.env.ADMIN_SEED_EMAIL || process.env.ADMIN_EMAIL || "";

  if (preferredEmail) {
    const found = await User.findOne({ email: preferredEmail.trim().toLowerCase(), role: "admin" });
    if (found) return found;
  }

  const firstAdmin = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });
  if (!firstAdmin) {
    throw new Error("No admin user found. Create at least one admin first.");
  }
  return firstAdmin;
}

async function upsertExperience({ admin, seed, orderBase }) {
  const salon = await Salon.findOneAndUpdate(
    { adminId: admin._id, name: seed.name },
    {
      $set: {
        adminId: admin._id,
        name: seed.name,
        type: seed.type,
        address: seed.address,
        contact: seed.contact,
        email: seed.email,
        ownerName: seed.ownerName,
        openingTime: seed.openingTime,
        closingTime: seed.closingTime,
        logo: seed.logo,
        status: "open",
        holidays: []
      },
      $setOnInsert: {
        isPrimary: false,
        order: orderBase
      }
    },
    { new: true, upsert: true }
  );

  const categoryByName = {};
  for (let i = 0; i < seed.categories.length; i += 1) {
    const categorySeed = seed.categories[i];
    const category = await Category.findOneAndUpdate(
      { salonId: salon._id, name: categorySeed.name },
      {
        $set: {
          salonId: salon._id,
          name: categorySeed.name,
          description: `${categorySeed.name} services`,
          status: "active",
          order: i
        }
      },
      { new: true, upsert: true }
    );
    categoryByName[categorySeed.name] = category;
  }

  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const staffDocs = [];
  for (let i = 0; i < seed.staff.length; i += 1) {
    const staffSeed = seed.staff[i];
    const email = `${slugify(seed.name)}.${i + 1}@seed.staff.local`;
    const staff = await Staff.findOneAndUpdate(
      { email },
      {
        $set: {
          name: staffSeed.name,
          email,
          password: hashed,
          contact: `+91-90002${String(orderBase).padStart(2, "0")}${String(i + 1).padStart(2, "0")}`,
          role: staffSeed.role,
          adminId: admin._id,
          salonId: salon._id,
          designation: staffSeed.specialization,
          specialization: staffSeed.specialization,
          status: "active",
          services: []
        }
      },
      { new: true, upsert: true }
    );
    staffDocs.push(staff);
  }

  const serviceDocs = [];
  const staffToServices = new Map(staffDocs.map((s) => [String(s._id), []]));
  for (let ci = 0; ci < seed.categories.length; ci += 1) {
    const categorySeed = seed.categories[ci];
    for (let si = 0; si < categorySeed.services.length; si += 1) {
      const serviceSeed = categorySeed.services[si];
      const category = categoryByName[categorySeed.name];
      const service = await Service.findOneAndUpdate(
        { salonId: salon._id, name: serviceSeed.name },
        {
          $set: {
            salonId: salon._id,
            categoryId: category._id,
            name: serviceSeed.name,
            description: `${serviceSeed.name} at ${seed.name}`,
            price: serviceSeed.price,
            duration: String(serviceSeed.duration),
            status: "active"
          },
          $setOnInsert: {
            order: si,
            assignedStaff: []
          }
        },
        { new: true, upsert: true }
      );
      serviceDocs.push(service);
    }
  }

  // Round-robin assign each service to at least one staff.
  for (let i = 0; i < serviceDocs.length; i += 1) {
    const service = serviceDocs[i];
    const assigned = [
      staffDocs[i % staffDocs.length]._id,
      staffDocs[(i + 1) % staffDocs.length]._id
    ];

    await Service.updateOne(
      { _id: service._id },
      { $set: { assignedStaff: assigned } }
    );

    assigned.forEach((staffId) => {
      const key = String(staffId);
      const current = staffToServices.get(key) || [];
      current.push(service._id);
      staffToServices.set(key, current);
    });
  }

  for (const staff of staffDocs) {
    const staffServiceIds = staffToServices.get(String(staff._id)) || [];

    await Staff.updateOne(
      { _id: staff._id },
      { $set: { services: staffServiceIds } }
    );
  }

  return {
    salon: salon.name,
    type: salon.type,
    staffCount: staffDocs.length,
    serviceCount: serviceDocs.length
  };
}

async function seedBookableExperiences() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 });

  const admin = await ensureAdminUser();
  console.log(`SEED_ADMIN=${admin.email}`);

  const results = [];
  for (let i = 0; i < experienceSeeds.length; i += 1) {
    const summary = await upsertExperience({
      admin,
      seed: experienceSeeds[i],
      orderBase: 100 + i
    });
    results.push(summary);
    console.log(
      `SEEDED=${summary.salon} | TYPE=${summary.type} | STAFF=${summary.staffCount} | SERVICES=${summary.serviceCount}`
    );
  }

  console.log(`TOTAL_EXPERIENCES=${results.length}`);
  console.log(`DEFAULT_STAFF_PASSWORD=${DEFAULT_PASSWORD}`);
}

seedBookableExperiences()
  .catch((err) => {
    console.error("SEED_ERROR", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.error("DISCONNECT_ERROR", err.message);
    }
  });
