const express = require("express");
const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff");
const Salon = require("../models/Salon");
const auth = require("../middleware/auth");

const router = express.Router();

/* ADD STAFF */
router.post("/add", auth(["admin"]), async (req, res) => {
  try {

    const { name, email, password, salonId, isManager } = req.body;

    if (!name || !email || !password || !salonId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (await Staff.findOne({ email })) {
      return res.status(400).json({ message: "Email exists" });
    }

    // One manager per salon
    if (isManager === true) {
      await Staff.updateMany({ salonId }, { isManager: false });
    }

    const last = await Staff.find({ salonId })
      .sort({ order: -1 })
      .limit(1);

    const nextOrder = last.length ? last[0].order + 1 : 0;

    const hashed = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
      ...req.body,
      password: hashed,
      adminId: req.user.id,
      order: nextOrder
    });

    // push into salon
    await Salon.findByIdAndUpdate(
      salonId,
      { $addToSet: { staff: staff._id } }
    );

    res.status(201).json({ message: "Staff added", staff });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* GET STAFF */
router.get("/", auth(), async (req, res) => {
  try {

    const query = { adminId: req.user.id };

    if (req.query.salonId) query.salonId = req.query.salonId;

    const staff = await Staff.find(query)
      .sort({ isManager: -1, order: 1 })
      .select("-password");

    res.json(staff);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* UPDATE STAFF */
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {

    const existing = await Staff.findById(req.params.id);

    if (req.body.isManager === true) {
      await Staff.updateMany(
        { salonId: existing.salonId },
        { isManager: false }
      );
    }

    // salon change
    if (req.body.salonId && existing.salonId.toString() !== req.body.salonId) {

      await Salon.findByIdAndUpdate(
        existing.salonId,
        { $pull: { staff: existing._id } }
      );

      await Salon.findByIdAndUpdate(
        req.body.salonId,
        { $addToSet: { staff: existing._id } }
      );
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json({ message: "Staff updated", staff });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* DELETE STAFF */
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {

    const staff = await Staff.findById(req.params.id);

    if (staff?.isManager) {
      return res.status(400).json({ message: "Manager cannot be deleted" });
    }

    await Salon.findByIdAndUpdate(
      staff.salonId,
      { $pull: { staff: staff._id } }
    );

    await Staff.findByIdAndDelete(req.params.id);

    res.json({ message: "Staff deleted" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
