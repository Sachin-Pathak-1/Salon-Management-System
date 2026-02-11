const router = require("express").Router();
const Service = require("../models/Service");
const auth = require("../middleware/auth");

/* STAFF STATS */
router.get("/staff-stats", auth(["staff", "manager"]), async (req, res) => {
  res.json({ message: "Staff dashboard stats retrieved successfully" });
  try {
    const totalServices = await Service.countDocuments();

    res.json({
      todayAppointments: 0,
      completed: 0,
      pending: totalServices
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
