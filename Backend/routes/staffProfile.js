const express = require("express");
const Staff = require("../models/Staff");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth(), async (req, res) => {
  try {

    if (req.user.role !== "staff" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const staff = await Staff.findById(req.user.id).select("-password");

    res.json(staff);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update", auth(["staff", "manager"]), async (req, res) => {
  try {
    const { name, contact, address, gender, dob } = req.body;

    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (name) staff.name = name;
    if (contact !== undefined) staff.contact = contact;
    if (address !== undefined) staff.address = address;
    if (gender !== undefined) staff.gender = gender;
    if (dob !== undefined) staff.dob = dob;

    await staff.save();

    res.json({
      message: "Profile updated successfully",
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        contact: staff.contact,
        address: staff.address,
        gender: staff.gender,
        dob: staff.dob
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
