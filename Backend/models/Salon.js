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

    logo: String,

    // 🔗 OWNER ADMIN
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salon", salonSchema);
