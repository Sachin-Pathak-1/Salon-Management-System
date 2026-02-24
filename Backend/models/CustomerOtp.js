const mongoose = require("mongoose");

const customerOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, enum: ["signup", "login"], required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: "customer_otps"
  }
);

customerOtpSchema.index({ email: 1, purpose: 1 }, { unique: true });
customerOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("CustomerOtp", customerOtpSchema);
