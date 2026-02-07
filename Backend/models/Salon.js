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

    order: {
      type: Number,
      default: 0
    },

    /* ============================
       NEW FIELDS
    ============================ */

    // open | closed | temporarily-closed
    status: {
      type: String,
      enum: ["open", "closed", "temporarily-closed"],
      default: "open"
    },

    // yyyy-mm-dd format dates
    holidays: {
      type: [String],
      default: []
    },

    // Primary salon flag
    isPrimary: {
      type: Boolean,
      default: false
    },

    /* ============================
       OWNER ADMIN
    ============================ */

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salon", salonSchema);
