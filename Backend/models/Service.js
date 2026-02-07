const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({

  name: String,
  description: String,
  price: String,
  duration: String,
  category: String,
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
