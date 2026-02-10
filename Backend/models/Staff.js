const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
{
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  contact: String,

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

  order: {
    type: Number,
    default: 0
  },

  isManager: {
    type: Boolean,
    default: false
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
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
