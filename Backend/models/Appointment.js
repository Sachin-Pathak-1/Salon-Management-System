const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: {
      type: String,
      default: "",
      required: function () {
        return !this.isWalkIn;
      }
    },
    customerContact: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    },
    notes: String,
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    totalPrice: { type: Number, required: true },
    isWalkIn: {
      type: Boolean,
      default: false
    },
    walkInToken: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
