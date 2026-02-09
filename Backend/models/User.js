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

  // 🔥 DRAG ORDER
  order: {
    type: Number,
    default: 0
  },

  // 🔥 MANAGER FLAG
  isManager: {
    type: Boolean,
    default: false
  },

  contact: String,

  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon"
  },

  gender: String,
  dob: String,
  address: String,

  designation: String,
  experience: Number,
  specialization: String,

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

  // ✅ PLAN SELECTION (ADMIN ONLY)
  selectedPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    default: null
  },

  planBranchLimit: {
    type: Number,
    default: 0
  },

  planPricePerBranch: {
    type: Number,
    default: 0
  },

  selectedPlanAt: {
    type: Date,
    default: null
  },

  joiningDate: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("User", userSchema);
