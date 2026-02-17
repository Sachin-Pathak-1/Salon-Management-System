const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Staff = require("../models/Staff");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

const router = express.Router();

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isBcryptHash = (value) =>
  typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);

const verifyAndUpgradePassword = async (account, inputPassword) => {
  if (isBcryptHash(account.password)) {
    return bcrypt.compare(inputPassword, account.password);
  }

  // Legacy support: plain-text passwords are upgraded after first successful login.
  if (account.password === inputPassword) {
    account.password = await bcrypt.hash(inputPassword, 10);
    await account.save();
    return true;
  }

  return false;
};

const findUserByEmailFlexible = async (Model, normalizedEmail) => {
  let account = await Model.findOne({ email: normalizedEmail })
    .collation({ locale: "en", strength: 2 });

  if (account) return account;

  // Legacy support: tolerate accidental spaces in stored emails.
  const emailRegex = new RegExp(`^\\s*${escapeRegex(normalizedEmail)}\\s*$`, "i");
  return Model.findOne({ email: { $regex: emailRegex } });
};

/* ======================
   ADMIN SIGNUP
====================== */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: "admin"
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
        role: admin.role
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
    const rawEmail = String(req.body?.email || "").trim();
    const password = String(req.body?.password || "");
    const normalizedEmail = rawEmail.toLowerCase();

    if (!rawEmail || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    let account = await findUserByEmailFlexible(User, normalizedEmail);

    if (!account) {
      account = await findUserByEmailFlexible(Staff, normalizedEmail);
    }

    if (!account) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (account.role !== "admin" && account.status === "inactive") {
      return res.status(403).json({ message: "Staff inactive" });
    }

    const ok = await verifyAndUpgradePassword(account, password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
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
        salonId: account.salonId || null
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
