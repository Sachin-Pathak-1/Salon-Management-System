const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["admin"],
    default: "admin"
  },

  contact: String,

  /* =========================
     PLAN / SUBSCRIPTION
  ========================= */

  selectedPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    default: null
  },

  planBranchLimit: {
    type: Number,
    default: 0
  },

  planPricePerBranch: {
    type: Number,
    default: 0
  },

  selectedPlanAt: {
    type: Date,
    default: null
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
