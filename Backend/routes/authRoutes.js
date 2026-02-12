const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Staff = require("../models/Staff");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

const router = express.Router();

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
