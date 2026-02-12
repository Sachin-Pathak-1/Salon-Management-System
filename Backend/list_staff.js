const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Staff = require("./models/Staff");
const Salon = require("./models/Salon");

const listStaff = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        const staff = await Staff.find({}).populate("salonId", "name");

        console.log("\n📋 --- STAFF CREDENTIALS ---");
        staff.forEach(s => {
            console.log(`
            Name: ${s.name}
            Email: ${s.email}
            Pass: ${s.name.split(" ")[0].toLowerCase()}123
            Role: ${s.role}
            Salon: ${s.salonId?.name}
            `);
        });
        console.log("---------------------------\n");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
listStaff();
