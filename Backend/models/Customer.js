const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: "" },
    role: { type: String, default: "customer" },
    contact: { type: String, default: "" },
    address: { type: String, default: "" },
    gender: { type: String, enum: ["", "female", "male", "other"], default: "" },
    dob: { type: Date, default: null },
    preferredServices: { type: [String], default: [] },
    skinType: { type: String, default: "" },
    hairType: { type: String, default: "" },
    allergies: { type: String, default: "" },
    preferredVisitTime: { type: String, default: "" },
    communicationPreference: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false }
    },
    notes: { type: String, default: "" }
  },
  {
    timestamps: true,
    collection: "customers"
  }
);

module.exports = mongoose.model("Customer", customerSchema);
