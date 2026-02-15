const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true
  },

  description: String,

  icon: String,

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },

  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema);
