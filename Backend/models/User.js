const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["admin", "staff"],
    default: "staff"
  },

  contact: String,

  // 🔗 Relations
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon"
  },

  /* ===== STAFF EXTRA DETAILS ===== */

  gender: String,

  dob: String,

  address: String,

  designation: String,      // Hair Stylist, Makeup Artist

  experience: Number,       // years

  specialization: String,   // Hair, Makeup, Skin, Nails

  shift: {
    type: String,
    enum: ["morning", "evening", "full-day"],
    default: "full-day"
  },

  salary: Number,

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },

  joiningDate: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("User", userSchema);
