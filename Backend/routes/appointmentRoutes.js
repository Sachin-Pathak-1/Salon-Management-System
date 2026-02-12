const express = require("express");
const Appointment = require("../models/Appointment");
const Staff = require("../models/Staff");
const Service = require("../models/Service");
const Salon = require("../models/Salon");
const auth = require("../middleware/auth");

const router = express.Router();

/* ============================
   CREATE APPOINTMENT
============================ */
router.post("/create", auth(["admin"]), async (req, res) => {
  const adminId = req.user.id; // Extract adminId from authenticated user
  try {
    const {
      customerName,
      customerEmail,
      customerContact,
      date,
      time,
      notes,
      salonId,
      staffId,
      serviceId
    } = req.body;

    if (!customerName || !customerEmail || !customerContact || !date || !time || !salonId || !staffId || !serviceId) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    /* ============================
       VALIDATE SALON
    ============================ */

    const salon = await Salon.findOne({
      _id: salonId,
      adminId: req.user.id
    });

    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    // Verify staff belongs to the salon
    const staff = await Staff.findOne({ _id: staffId, salonId: salonId });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found in this salon" });
    }

    // Verify service belongs to the salon and get price
    const service = await Service.findOne({ _id: serviceId, salonId: salonId });
    if (!service) {
      return res.status(404).json({ message: "Service not found in this salon" });
    }

    // Set default price if not set
    let price = service.price;
    if (!price || price === "0" || price === "") {
      price = "50"; // Default price
      await Service.findByIdAndUpdate(serviceId, { price: price });
    }

    const appointment = await Appointment.create({
      customerName,
      customerEmail,
      customerContact,
      date: new Date(date),
      time,
      notes,
      salonId,
      staffId,
      serviceId,
      adminId: req.user.id,
      totalPrice: price,
      status: "pending"
    });

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: await appointment.populate([
        { path: 'salonId', select: 'name' },
        { path: 'staffId', select: 'name' },
        { path: 'serviceId', select: 'name price' }
      ])
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   GET APPOINTMENTS
============================ */
router.get("/", auth(), async (req, res) => {
  try {
    const query = { adminId: req.user.id };

    if (req.query.salonId) query.salonId = req.query.salonId;
    if (req.query.staffId) query.staffId = req.query.staffId;
    if (req.query.status) query.status = req.query.status;

    const appointments = await Appointment.find(query)
      .populate('salonId', 'name')
      .populate('staffId', 'name')
      .populate('serviceId', 'name price')
      .sort({ date: 1, time: 1 });

    res.json(appointments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   UPDATE APPOINTMENT STATUS
============================ */
router.put("/:id/status", auth(["admin"]), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user.id },
      { status },
      { new: true }
    ).populate([
      { path: 'salonId', select: 'name' },
      { path: 'staffId', select: 'name' },
      { path: 'serviceId', select: 'name price' }
    ]);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment updated", appointment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   DELETE APPOINTMENT
============================ */
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      adminId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   GET STAFF AND SERVICES FOR SALON
============================ */
router.get("/salon/:salonId/details", auth, async (req, res) => {
  try {
    const salonId = req.params.salonId;

    // Verify salon access
    if (req.userRole === "admin") {
      const salon = await Salon.findOne({ _id: salonId, adminId: req.userId });
      if (!salon) {
        return res.status(404).json({ message: "Salon not found" });
      }
    } else if (req.userRole === "staff") {
      if (req.userSalonId.toString() !== salonId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    // Get staff for the salon
    const staff = await Staff.find({ salonId })
      .select('name designation specialization')
      .sort({ isManager: -1, order: 1 });

    // Get services for the salon and set default prices if missing
    const services = await Service.find({ salonId })
      .sort({ isFeatured: -1, order: 1 });

    // Set default prices for services without prices
    for (let service of services) {
      if (!service.price || service.price === "0" || service.price === "") {
        service.price = "50"; // Default price
        await Service.findByIdAndUpdate(service._id, { price: service.price });
      }
    }

    res.json({ staff, services });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
