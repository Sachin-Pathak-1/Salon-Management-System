const express = require("express");
const Staff = require("../models/Staff");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth(), async (req, res) => {
  try {

    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const staff = await Staff.findById(req.user.id).select("-password");

    res.json(staff);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
