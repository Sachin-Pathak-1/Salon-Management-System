const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();


// PROFILE API
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
