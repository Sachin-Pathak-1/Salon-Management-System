const router = require("express").Router();
const auth = require("../middleware/auth");
const Staff = require("../models/Staff");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");

/* =========================
   DASHBOARD STATS
========================= */
router.get("/stats", auth(["manager"]), async (req, res) => {
  try {

    const salonId = req.user.salonId;

    const staffCount = await Staff.countDocuments({ salonId });
    const servicesCount = await Service.countDocuments({ salonId });
    const appointmentCount = await Appointment.countDocuments({ salonId });

    res.json({
      staffCount,
      servicesCount,
      appointmentCount
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   SALARY SUMMARY
========================= */
router.get("/salary", auth(["manager"]), async (req, res) => {
  try {

    const staff = await Staff.find({
      salonId: req.user.salonId,
      status: "active"
    });

    const totalSalary = staff.reduce(
      (sum, s) => sum + (s.salary || 0),
      0
    );

    res.json({
      totalStaff: staff.length,
      totalSalary
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   APPOINTMENT ANALYTICS
========================= */
router.get("/appointments", auth(["manager"]), async (req, res) => {
  try {

    const salonId = req.user.salonId;

    const total = await Appointment.countDocuments({ salonId });
    const completed = await Appointment.countDocuments({ salonId, status: "completed" });
    const pending = await Appointment.countDocuments({ salonId, status: "pending" });
    const cancelled = await Appointment.countDocuments({ salonId, status: "cancelled" });

    res.json({
      total,
      completed,
      pending,
      cancelled
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
