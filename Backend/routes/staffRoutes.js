const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

/* ===================================================
   REORDER STAFF  (MUST BE ON TOP)
=================================================== */
router.put("/reorder", auth, admin, async (req, res) => {
  try {

    const bulk = req.body.order.map(o => ({
      updateOne: {
        filter: { _id: o.id, adminId: req.userId },
        update: { order: o.order }
      }
    }));

    await User.bulkWrite(bulk);

    res.json({ message: "Order saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   ADD STAFF
=========================== */
router.post("/add", auth, admin, async (req, res) => {
  try {

    const { name, email, password, salonId, isManager } = req.body;

    if (!name || !email || !password || !salonId) {
      return res.status(400).json({
        message: "Name, email, password and salonId required"
      });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Only one manager per salon
    if (isManager === true) {
      await User.updateMany(
        { salonId, role: "staff" },
        { isManager: false }
      );
    }

    // 🔥 Get next order number
    const last = await User.find({ salonId, role: "staff" })
      .sort({ order: -1 })
      .limit(1);

    const nextOrder = last.length ? last[0].order + 1 : 0;

    const hashed = await bcrypt.hash(password, 10);

    const staff = await User.create({
      ...req.body,
      password: hashed,
      role: "staff",
      adminId: req.userId,
      order: nextOrder
    });

    res.status(201).json({ message: "Staff added", staff });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   GET STAFF
=========================== */
router.get("/", auth, async (req, res) => {
  try {

    const query = {
      role: "staff",
      adminId: req.userId
    };

    if (req.query.salonId) {
      query.salonId = req.query.salonId;
    }

    const staff = await User.find(query)
      .sort({ isManager: -1, order: 1 })   // 🔥
      .select("-password");

    res.json(staff);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   UPDATE STAFF
=========================== */
router.put("/:id", auth, admin, async (req, res) => {
  try {

    if (req.body.isManager === true) {
      const current = await User.findById(req.params.id);

      if (current?.salonId) {
        await User.updateMany(
          { salonId: current.salonId, role: "staff" },
          { isManager: false }
        );
      }
    }

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, adminId: req.userId },
      req.body,
      { new: true }
    ).select("-password");

    res.json({ message: "Staff updated", staff });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   DELETE STAFF
=========================== */
router.delete("/:id", auth, admin, async (req, res) => {
  try {

    const staff = await User.findOne({ _id: req.params.id });

    if (staff?.isManager) {
      return res.status(400).json({
        message: "Manager cannot be deleted"
      });
    }

    await User.findOneAndDelete({
      _id: req.params.id,
      adminId: req.userId
    });

    res.json({ message: "Staff deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
