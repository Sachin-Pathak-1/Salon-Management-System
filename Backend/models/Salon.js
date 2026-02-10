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

  order: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["open", "closed", "temporarily-closed"],
    default: "open"
  },

  holidays: { type: [String], default: [] },

  isPrimary: { type: Boolean, default: false },

  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // STAFF IDS
  staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff"
    }
  ]
},
{ timestamps: true }
);

module.exports = mongoose.model("Salon", salonSchema);
