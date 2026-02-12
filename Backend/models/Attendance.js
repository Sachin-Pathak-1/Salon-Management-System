const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true
    },

    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true
    },

    date: {
      type: String, // Format: YYYY-MM-DD
      required: true
    },

    status: {
      type: String,
      enum: ["present", "absent", "leave"],
      required: true
    },

    notes: {
      type: String,
      default: ""
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique attendance record per staff per date
attendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
