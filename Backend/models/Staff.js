const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
{
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  contact: String,

  role: {
    type: String,
    enum: ["staff", "manager"],
    default: "staff"
  },

  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true
  },

  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service"
  }],

  order: {
    type: Number,
    default: 0
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

  joiningDate: {
    type: Date,
    default: Date.now
  },

  access: {
    type: [String],
    default: ["Dashboard", "Services", "Appointments", "Expenses", "Profile", "Support"]
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
