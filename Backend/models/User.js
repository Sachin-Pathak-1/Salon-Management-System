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
  address: String,

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
  },

  demoTrialStartAt: {
    type: Date,
    default: null
  },

  demoTrialEndsAt: {
    type: Date,
    default: null
  },

  isDemoPlanSelected: {
    type: Boolean,
    default: false
  },

  demoPlanSelectedAt: {
    type: Date,
    default: null
  },

  demoPlanConsumed: {
    type: Boolean,
    default: false
  },

  billingHistory: [
    {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        default: null
      },
      planName: {
        type: String,
        default: ""
      },
      branchCount: {
        type: Number,
        default: 0
      },
      pricePerBranch: {
        type: Number,
        default: 0
      },
      totalPrice: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ["Paid", "Due", "Cancel"],
        default: "Paid"
      },
      issueDate: {
        type: Date,
        default: Date.now
      },
      dueDate: {
        type: Date,
        default: null
      },
      paidAt: {
        type: Date,
        default: null
      }
    }
  ]

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
