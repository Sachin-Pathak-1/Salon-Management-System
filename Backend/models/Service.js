const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({

  name: String,
  description: String,
  price: Number,
  priceMale: Number,
  priceFemale: Number,
  duration: String,

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  imageUrl: String,

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },

  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true
  },

  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff"
  }],

  isFeatured: {
    type: Boolean,
    default: false
  },

  order: {
    type: Number,
    default: 0
  }

});

module.exports = mongoose.model("Service", ServiceSchema);
