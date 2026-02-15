const router = require("express").Router();
const Service = require("../models/Service");
const auth = require("../middleware/auth");
const Appointment = require("../models/Appointment");

/* STAFF STATS */
router.get("/staff-stats", auth(["staff", "manager"]), async (req, res) => {
  try {
    
    const salonId = req.user.salonId;
    const totalServices = await Service.countDocuments({ salonId });
    const todayAppointments = await Service.countDocuments({
      salonId,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });
    const completed = await Appointment.countDocuments({
      salonId,
      status: "completed"
    });
    const pending = await Appointment.countDocuments({
      salonId,
      status: "pending"
    });

    res.json({
      todayAppointments,
      completed,
      pending,
      totalServices
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* POPULAR SERVICES */
router.get("/popular-services", auth(["staff"]), async (req, res) => {
  try {
    const services = await Service.find().limit(5);

    res.json(
      services.map(s => ({
        name: s.name,
        count: Math.floor(Math.random() * 40) + 1
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* RECENT ACTIVITY */
router.get("/recent-activity", auth(["staff"]), async (req, res) => {
  try {
    const services = await Service.find().limit(5);

    res.json(
      services.map(s => ({
        customer: "Customer",
        action: `Viewed ${s.name}`,
        time: "Recently"
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
