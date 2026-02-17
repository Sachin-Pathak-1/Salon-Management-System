const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

const router = express.Router();

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isBcryptHash = (value) =>
  typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);

const verifyAndUpgradePassword = async (staff, inputPassword) => {
  if (isBcryptHash(staff.password)) {
    return bcrypt.compare(inputPassword, staff.password);
  }

  if (staff.password === inputPassword) {
    staff.password = await bcrypt.hash(inputPassword, 10);
    await staff.save();
    return true;
  }

  return false;
};

const findStaffByEmailFlexible = async (normalizedEmail) => {
  let staff = await Staff.findOne({ email: normalizedEmail })
    .collation({ locale: "en", strength: 2 });

  if (staff) return staff;

  const emailRegex = new RegExp(`^\\s*${escapeRegex(normalizedEmail)}\\s*$`, "i");
  return Staff.findOne({ email: { $regex: emailRegex } });
};

router.post("/login", async (req, res) => {
  try {
    const rawEmail = String(req.body?.email || "").trim();
    const password = String(req.body?.password || "");
    const normalizedEmail = rawEmail.toLowerCase();

    if (!rawEmail || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const staff = await findStaffByEmailFlexible(normalizedEmail);

    if (!staff) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (staff.status === "inactive") {
      return res.status(403).json({ message: "Staff inactive" });
    }

    const isMatch = await verifyAndUpgradePassword(staff, password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: staff._id,
        role: staff.role,
        salonId: staff.salonId
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
        access: staff.access
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
