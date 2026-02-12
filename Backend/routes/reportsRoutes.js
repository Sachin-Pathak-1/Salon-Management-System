const staffAuth = require("../middleware/staffAuth");
const router = require("express").Router();
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");

/* GET REPORTS SUMMARY */
router.get("/summary", staffAuth, async (req, res) => {
  try {
    // Monthly revenue (assuming current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      date: { $gte: currentMonth }
    }).populate('services');

    let monthlyRevenue = 0;
    appointments.forEach(apt => {
      apt.services.forEach(service => {
        monthlyRevenue += service.price || 0;
      });
    });

    // Total appointments
    const totalAppointments = await Appointment.countDocuments();

    // Popular services
    const services = await Service.find().limit(5);
    const popularServices = services.map(s => ({
      name: s.name,
      bookings: Math.floor(Math.random() * 50) + 1 // Placeholder, replace with actual booking count
    }));

    // Appointments stats
    const completed = await Appointment.countDocuments({ status: 'completed' });
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const cancelled = await Appointment.countDocuments({ status: 'cancelled' });

    res.json({
      monthlyRevenue,
      totalAppointments,
      popularServices,
      appointmentsStats: { completed, pending, cancelled }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET MONTHLY REVENUE */
router.get("/monthly-revenue", staffAuth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const appointments = await Appointment.find({
      date: { $gte: startDate, $lt: endDate }
    }).populate('services');

    let revenue = 0;
    appointments.forEach(apt => {
      apt.services.forEach(service => {
        revenue += service.price || 0;
      });
    });

    res.json({ revenue });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* GET APPOINTMENTS STATS */
router.get("/appointments-stats", staffAuth, async (req, res) => {
  try {
    const completed = await Appointment.countDocuments({ status: 'completed' });
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const cancelled = await Appointment.countDocuments({ status: 'cancelled' });

    res.json({ completed, pending, cancelled });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
