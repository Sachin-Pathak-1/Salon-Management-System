const mongoose = require("mongoose");

const salonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },

    email: String,
    ownerName: String,
    openingTime: String,
    closingTime: String,
    logo: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salon", salonSchema);
