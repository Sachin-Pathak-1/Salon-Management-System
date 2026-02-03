const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: String,
  duration: String,
  category: String,
  imageUrl: String,
  status: { type: String, default: "Active" }
});

module.exports = mongoose.model("Service", ServiceSchema);
