const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

/* ===========================
   ADD STAFF (ADMIN ONLY)
=========================== */
router.post("/add", auth, admin, async (req, res) => {
  try {
    const { name, email, password, contact, salonId, gender, dob, address, designation, experience, specialization, shift, salary } = req.body;

    if (!salonId) {
      return res.status(400).json({
        message: "Salon ID is required"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const staff = await User.create({
      name,
      email,
      password: hashed,
      role: "staff",
      contact,
      adminId: req.userId,
      salonId: req.body.salonId
      gender,
      dob,
      address,
      designation,
      experience,
      specialization,
      shift,
      salary
    });

    res.status(201).json({
      message: "Staff added",
      staff
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ===========================
   GET ALL STAFF
=========================== */
router.get("/", auth, admin, async (req, res) => {
  const staff = await User.find({ role: "staff", adminId: req.userId }).select("-password");
  res.json(staff);
});

/* ===========================
   UPDATE STAFF
=========================== */
router.put("/:id", auth, admin, async (req, res) => {
  const staff = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({
    message: "Staff updated",
    staff
  });
});

/* ===========================
   DELETE STAFF
=========================== */
router.delete("/:id", auth, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Staff deleted" });
});

module.exports = router;
