const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const TRIAL_DAYS = 14;
const TRIAL_WINDOW_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

const router = express.Router();

const resolveTrialEnd = (adminUser) => {
  if (adminUser?.trialEndsAt) return new Date(adminUser.trialEndsAt);
  const start = new Date(adminUser?.trialStartAt || adminUser?.createdAt || new Date());
  return new Date(start.getTime() + TRIAL_WINDOW_MS);
};

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const staff = await Staff.findOne({ email });
    if (!staff)
      return res.status(400).json({ message: "Invalid credentials" });

    if (staff.status === "inactive")
      return res.status(403).json({ message: "Staff inactive" });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const adminUser = await User.findById(staff.adminId).select(
      "selectedPlanId trialStartAt trialEndsAt demoAccessUntil createdAt"
    );
    const demoActive = adminUser?.demoAccessUntil && Date.now() <= new Date(adminUser.demoAccessUntil).getTime();
    if (adminUser && !adminUser.selectedPlanId && !demoActive && Date.now() > resolveTrialEnd(adminUser).getTime()) {
      return res.status(403).json({
        code: "TRIAL_EXPIRED",
        message: "Your salon's 14-day free demo has expired. Please ask the owner to purchase a plan.",
        trialDays: TRIAL_DAYS,
        trialEndsAt: resolveTrialEnd(adminUser)
      });
    }

    const token = jwt.sign(
      {
        id: staff._id,
        role: staff.role,   // dynamic (staff or manager)
        salonId: staff.salonId,
        adminId: staff.adminId
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        salonId: staff.salonId,
        adminId: staff.adminId,
        access: staff.access
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
