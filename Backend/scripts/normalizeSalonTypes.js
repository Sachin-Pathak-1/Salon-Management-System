require("dotenv").config();
const mongoose = require("mongoose");
const Salon = require("../models/Salon");

function inferSalonType(record = {}) {
  const haystack = `${record.name || ""} ${record.email || ""}`.toLowerCase();
  const spaHints = ["spa", "wellness", "therapy", "retreat", "massage", "ayur"];
  const hasSpaHint = spaHints.some((hint) => haystack.includes(hint));

  if (record.type === "spa") return "spa";
  if (record.type === "salon") return hasSpaHint ? "spa" : "salon";
  return hasSpaHint ? "spa" : "salon";
}

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in Backend/.env");
  }

  await mongoose.connect(uri);

  const salons = await Salon.find({}, "name email type").lean();
  let updated = 0;

  for (const salon of salons) {
    const inferred = inferSalonType(salon);

    if (salon.type !== inferred) {
      await Salon.updateOne({ _id: salon._id }, { $set: { type: inferred } });
      updated += 1;
    }
  }

  console.log(`Total records: ${salons.length}`);
  console.log(`Updated type field: ${updated}`);

  await mongoose.disconnect();
}

run()
  .then(() => {
    console.log("Salon type normalization complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Normalization failed:", err.message);
    process.exit(1);
  });
