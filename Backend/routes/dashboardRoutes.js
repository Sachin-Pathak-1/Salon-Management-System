const router = require("express").Router();
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/auth");

/* STAFF STATS */
router.get("/staff-stats", auth(["staff", "manager"]), async (req, res) => {
  res.json({ message: "Staff dashboard stats retrieved successfully" });
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      staffId: req.staff.id,
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    const completed = await Appointment.countDocuments({
      staffId: req.staff.id,
      status: 'completed',
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    const pending = await Appointment.countDocuments({
      staffId: req.staff.id,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    const totalServices = await Appointment.countDocuments({ staffId: req.staff.id });

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
    const popularServices = await Appointment.aggregate([
      { $match: { staffId: req.staff.id } },
      { $group: { _id: "$serviceId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service"
        }
      },
      { $unwind: "$service" },
      { $project: { name: "$service.name", count: 1 } }
    ]);

    res.json(popularServices);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* RECENT ACTIVITY */
router.get("/recent-activity", auth(["staff"]), async (req, res) => {
  try {
    // Dummy data for recent activity
    res.json([
      { customer: "John Doe", action: "Completed Haircut", time: "2 hours ago" },
      { customer: "Jane Smith", action: "Booked Facial", time: "4 hours ago" },
      { customer: "Alice Johnson", action: "Completed Manicure", time: "6 hours ago" },
      { customer: "Bob Brown", action: "Booked Massage", time: "8 hours ago" },
      { customer: "Charlie Wilson", action: "Completed Pedicure", time: "10 hours ago" }
    ]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
