require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Customer = require("../models/Customer");

async function seedCustomersDummy() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000
  });

  const dummyCustomers = [
    {
      name: "Aarav Sharma",
      email: "aarav.customer@example.com",
      contact: "+91-9000000001",
      address: "Mumbai, Maharashtra",
      role: "customer",
      gender: "male",
      dob: "1997-05-21",
      preferredServices: ["Haircut", "Spa"],
      skinType: "Combination",
      hairType: "Wavy",
      allergies: "Strong fragrance products",
      preferredVisitTime: "Evening",
      communicationPreference: { email: true, sms: true, whatsapp: false },
      notes: "Prefers short sessions on weekdays."
    },
    {
      name: "Diya Patel",
      email: "diya.customer@example.com",
      contact: "+91-9000000002",
      address: "Pune, Maharashtra",
      role: "customer",
      gender: "female",
      dob: "1999-09-14",
      preferredServices: ["Facial", "Manicure", "Pedicure"],
      skinType: "Dry",
      hairType: "Straight",
      allergies: "",
      preferredVisitTime: "Weekend",
      communicationPreference: { email: true, sms: false, whatsapp: true },
      notes: "Likes premium facial packages."
    },
    {
      name: "Rohan Mehta",
      email: "rohan.customer@example.com",
      contact: "+91-9000000003",
      address: "Bengaluru, Karnataka",
      role: "customer",
      gender: "male",
      dob: "1995-02-08",
      preferredServices: ["Hair Coloring", "Haircut"],
      skinType: "Oily",
      hairType: "Curly",
      allergies: "None",
      preferredVisitTime: "Morning",
      communicationPreference: { email: true, sms: true, whatsapp: true },
      notes: "Requests senior stylist when available."
    }
  ];

  for (const customer of dummyCustomers) {
    await Customer.updateOne(
      { email: customer.email },
      { $set: customer },
      { upsert: true }
    );
    console.log(`SEEDED_CUSTOMER=${customer.email}`);
  }

  console.log("DEFAULT_OTP=Use login OTP flow (Send OTP button)");
  console.log(`TOTAL_SEEDED=${dummyCustomers.length}`);
}

seedCustomersDummy()
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
