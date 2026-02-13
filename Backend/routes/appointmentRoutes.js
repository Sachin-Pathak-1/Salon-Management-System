const express = require("express");
const Appointment = require("../models/Appointment");
const Staff = require("../models/Staff");
const Service = require("../models/Service");
const Salon = require("../models/Salon");
const auth = require("../middleware/auth");

const router = express.Router();

/* ============================
   HELPER FUNCTIONS
============================ */

// Convert "HH:MM" to minutes
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Check if date is in past
const isPastDateTime = (date, time) => {
  const bookingDateTime = new Date(`${date}T${time}`);
  return bookingDateTime < new Date();
};

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

    if (
      !customerName ||
      !customerEmail ||
      !customerContact ||
      !date ||
      !time ||
      !salonId ||
      !staffId ||
      !serviceId
    ) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
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

    if (salon.status === "closed") {
      return res.status(400).json({
        message: "Cannot book appointment. Salon is closed."
      });
    }

    if (salon.status === "temporarily-closed") {
      return res.status(400).json({
        message: "Salon is temporarily closed."
      });
    }

    /* ============================
       HOLIDAY CHECK
    ============================ */

    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toISOString().split("T")[0];

    if (salon.holidays.includes(formattedDate)) {
      return res.status(400).json({
        message: "Salon is closed on selected date (holiday)."
      });
    }

    /* ============================
       WORKING HOURS CHECK
    ============================ */

    const bookingMinutes = timeToMinutes(time);
    const openingMinutes = timeToMinutes(salon.openingTime);
    const closingMinutes = timeToMinutes(salon.closingTime);

    if (bookingMinutes < openingMinutes || bookingMinutes > closingMinutes) {
      return res.status(400).json({
        message: "Selected time is outside salon working hours."
      });
    }

    /* ============================
       PAST DATE CHECK
    ============================ */

    if (isPastDateTime(date, time)) {
      return res.status(400).json({
        message: "Cannot book appointment in the past."
      });
    }

    /* ============================
       VALIDATE STAFF
    ============================ */

    const staff = await Staff.findOne({ _id: staffId, salonId });

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found in this salon"
      });
    }

    if (staff.status === "inactive") {
      return res.status(400).json({
        message: "Cannot book appointment. Staff is inactive."
      });
    }

    /* ============================
       VALIDATE SERVICE
    ============================ */

    const service = await Service.findOne({ _id: serviceId, salonId });

    if (!service) {
      return res.status(404).json({
        message: "Service not found in this salon"
      });
    }

    const price = service.price && service.price > 0 ? service.price : 50;

    /* ============================
       DOUBLE BOOKING CHECK
    ============================ */

    const existingAppointment = await Appointment.findOne({
      staffId,
      date: new Date(date),
      time,
      status: { $ne: "cancelled" }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "Staff already has an appointment at this time."
      });
    }

    /* ============================
       CREATE APPOINTMENT
    ============================ */

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

    const populatedAppointment = await appointment.populate([
      { path: "salonId", select: "name" },
      { path: "staffId", select: "name" },
      { path: "serviceId", select: "name price" }
    ]);

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: populatedAppointment
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
      .populate("salonId", "name")
      .populate("staffId", "name")
      .populate("serviceId", "name price")
      .sort({ date: 1, time: 1 });

    res.json(appointments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   UPDATE STATUS
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
      { path: "salonId", select: "name" },
      { path: "staffId", select: "name" },
      { path: "serviceId", select: "name price" }
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
   GET SALON DETAILS (STAFF & SERVICES)
============================ */
router.get("/salon/:salonId/details", auth(), async (req, res) => {
  try {
    const { salonId } = req.params;

    // Get active staff for this salon
    const staff = await Staff.find({ salonId, status: "active" });

    // Get active services for this salon
    const services = await Service.find({ salonId, status: "active" });

    res.json({ staff, services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
