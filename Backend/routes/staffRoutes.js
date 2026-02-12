const express = require("express");
const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff");
const Salon = require("../models/Salon");
const auth = require("../middleware/auth");

const router = express.Router();

/* =====================================================
   ADD STAFF (Admin or Manager)
===================================================== */
router.post("/add", auth(["admin", "manager"]), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      salonId,
      role = "staff",
      contact,
      designation,
      specialization,
      experience,
      shift,
      salary,
      status,
      gender,
      dob,
      address
    } = req.body;

    if (!name || !email || !password || !salonId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existing = await Staff.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    // Authorization checks
    if (req.user.role === "admin") {
      // Admin must own the salon
      if (salon.adminId?.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized - salon not owned by you" });
      }
    }

    if (req.user.role === "manager") {
      if (req.user.salonId.toString() !== salonId) {
        return res.status(403).json({ message: "Unauthorized salon access" });
      }
      if (role === "manager") {
        return res.status(403).json({ message: "Only admin can create manager" });
      }
    }

    const lastStaff = await Staff.find({ salonId })
      .sort({ order: -1 })
      .limit(1);

    const nextOrder = lastStaff.length ? lastStaff[0].order + 1 : 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
      name,
      email,
      password: hashedPassword,
      salonId,
      role,
      contact,
      designation,
      specialization,
      experience,
      shift,
      salary,
      status,
      gender,
      dob,
      address,
      adminId:
        req.user.role === "admin"
          ? req.user.id
          : req.user.adminId,
      order: nextOrder
    });

    await Salon.findByIdAndUpdate(salonId, {
      $addToSet: { staff: staff._id }
    });

    const safeStaff = await Staff.findById(staff._id).select("-password");

    res.status(201).json({
      message: "Staff created successfully",
      staff: safeStaff
    })

  } catch (err) {
    console.error("ADD STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   GET STAFF (STRICT SALON FILTERING)
===================================================== */
router.get("/", auth(["admin", "manager"]), async (req, res) => {
  try {

    const { salonId } = req.query;

    if (!salonId) return res.json([]);

    let query = { salonId };

    if (req.user.role === "admin") {
      query.adminId = req.user.id;
    }

    if (req.user.role === "manager") {
      query.salonId = req.user.salonId;
    }

    const staff = await Staff.find(query)
      .sort({ role: -1, order: 1 })
      .select("-password");

    res.json(staff);

  } catch (err) {
    console.error("GET STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   UPDATE STAFF (Admin only + salon protection)
===================================================== */
router.put("/:id", auth(["admin", "manager"]), async (req, res) => {
  try {

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Authorization: admin owns the salon, or manager works at the salon
    if (req.user.role === "admin") {
      if (staff.adminId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    } else if (req.user.role === "manager") {
      if (staff.salonId.toString() !== req.user.salonId.toString()) {
        return res.status(403).json({ message: "Unauthorized salon access" });
      }
    }

    // Prevent managers from changing role
    if (req.user.role === "manager" && req.body.role && req.body.role !== staff.role) {
      return res.status(403).json({ message: "Only admin can change staff role" });
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updated = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json({
      message: "Staff updated successfully",
      staff: updated
    });

  } catch (err) {
    console.error("UPDATE STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   DELETE STAFF (Admin only + salon protection)
===================================================== */
router.delete("/:id", auth(["admin", "manager"]), async (req, res) => {
  try {

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (staff.role === "manager") {
      return res.status(400).json({ message: "Manager cannot be deleted" });
    }

    if (staff.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Salon.findByIdAndUpdate(staff.salonId, {
      $pull: { staff: staff._id }
    });

    await Staff.findByIdAndDelete(req.params.id);

    res.json({ message: "Staff deleted successfully" });

  } catch (err) {
    console.error("DELETE STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   REORDER STAFF
===================================================== */
router.put("/reorder", auth(["admin"]), async (req, res) => {
  try {

    const bulk = req.body.order.map(o => ({
      updateOne: {
        filter: { _id: o.id },
        update: { order: o.order }
      }
    }));

    const validStaff = await Staff.find({
      _id: { $in: req.body.order.map(o => o.id) },
      adminId: req.user.id
    });

    if (validStaff.length !== req.body.order.length) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Staff.bulkWrite(bulk);

    res.json({ message: "Order saved" });

  } catch (err) {
    console.error("REORDER ERROR:", err);
    res.status(500).json({ message: "Reorder failed" });
  }
});

module.exports = router;
