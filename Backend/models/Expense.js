const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
