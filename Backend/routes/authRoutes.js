const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Staff = require("../models/Staff");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const TRIAL_DAYS = 14;
const TRIAL_WINDOW_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

const router = express.Router();

const resolveTrialEnd = (adminUser) => {
  if (adminUser?.trialEndsAt) return new Date(adminUser.trialEndsAt);
  const start = new Date(adminUser?.trialStartAt || adminUser?.createdAt || new Date());
  return new Date(start.getTime() + TRIAL_WINDOW_MS);
};

const isTrialExpired = (adminUser) => {
  if (!adminUser || adminUser.selectedPlanId) return false;
  if (adminUser.demoAccessUntil && Date.now() <= new Date(adminUser.demoAccessUntil).getTime()) {
    return false;
  }
  return Date.now() > resolveTrialEnd(adminUser).getTime();
};

/* ======================
   ADMIN SIGNUP
====================== */
router.post("/signup", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashed,
      role: "admin",
      trialStartAt: new Date(),
      trialEndsAt: new Date(Date.now() + TRIAL_WINDOW_MS)
    });

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        salonId: null
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        trialStartAt: admin.trialStartAt,
        trialEndsAt: admin.trialEndsAt,
        trialDays: TRIAL_DAYS
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   LOGIN (ALL ROLES)
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // 1️⃣ Check Admin (User)
    let account = await User.findOne({ email });
    let roleSource = "admin";

    // 2️⃣ If not admin, check Staff (staff or manager)
    if (!account) {
      account = await Staff.findOne({ email });
      roleSource = "staff";
    }

    if (!account)
      return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, account.password);
    if (!ok)
      return res.status(400).json({ message: "Invalid credentials" });

    let trialOwner = null;
    if (roleSource === "admin") {
      trialOwner = account;
    } else if (account.adminId) {
      trialOwner = await User.findById(account.adminId).select(
        "selectedPlanId trialStartAt trialEndsAt demoAccessUntil createdAt"
      );
    }

    if (isTrialExpired(trialOwner)) {
      return res.status(403).json({
        code: "TRIAL_EXPIRED",
        message: "Your 14-day free demo has expired. Please purchase a plan to continue.",
        trialDays: TRIAL_DAYS,
        trialEndsAt: resolveTrialEnd(trialOwner)
      });
    }

    const token = jwt.sign(
      {
        id: account._id,
        role: account.role,
        salonId: account.salonId || null,
        adminId: account.adminId || null
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        role: account.role,
        salonId: account.salonId || null,
        adminId: account.adminId || null
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
