const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

const router = express.Router();

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

    const token = jwt.sign(
      {
        id: staff._id,
        role: staff.role,   // dynamic (staff or manager)
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
