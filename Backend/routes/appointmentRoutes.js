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

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time || "").split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const isPastDateTime = (date, time) => {
  const bookingDateTime = new Date(`${date}T${time}`);
  return bookingDateTime < new Date();
};

const toLocalDateOnly = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getTodayDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getCurrentHHMM = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const toId = (value) => String(value || "");

const isStaffAssignedToService = (staff, service) => {
  if (!staff || !service) return false;

  const serviceId = toId(service._id);
  const staffId = toId(staff._id);
  const staffServices = Array.isArray(staff.services) ? staff.services : [];
  const assignedStaff = Array.isArray(service.assignedStaff) ? service.assignedStaff : [];

  const mappedFromStaff = staffServices.some((id) => toId(id) === serviceId);
  const mappedFromService = assignedStaff.some((id) => toId(id) === staffId);

  return mappedFromStaff || mappedFromService;
};

const resolveAdminId = async (user) => {
  if (user.role === "admin") return user.id;
  if (user.adminId) return user.adminId;

  if (user.role === "manager" || user.role === "staff") {
    const staff = await Staff.findById(user.id).select("adminId");
    return staff?.adminId || null;
  }

  return null;
};

const ensureSalonAccess = async ({ salonId, user, adminId }) => {
  let query = { _id: salonId, adminId };

  if (user.role === "manager" || user.role === "staff") {
    query = { ...query, _id: user.salonId || salonId };
  }

  const salon = await Salon.findOne(query);
  if (!salon) return { salon: null, error: "Salon not found", statusCode: 404 };

  if (salon.status === "closed") {
    return {
      salon: null,
      error: "Cannot book appointment. Salon is closed.",
      statusCode: 400
    };
  }

  if (salon.status === "temporarily-closed") {
    return {
      salon: null,
      error: "Salon is temporarily closed.",
      statusCode: 400
    };
  }

  return { salon, error: null, statusCode: 200 };
};

const findNextWalkInTime = async ({ staffId, date, salon }) => {
  const openingMinutes = salon.openingTime ? timeToMinutes(salon.openingTime) : 0;
  const closingMinutes = salon.closingTime ? timeToMinutes(salon.closingTime) : 23 * 60 + 59;

  const nowMinutes = timeToMinutes(getCurrentHHMM());
  let slotMinutes = Math.max(nowMinutes, openingMinutes);

  while (slotMinutes <= closingMinutes) {
    const slotTime = minutesToTime(slotMinutes);

    const conflict = await Appointment.findOne({
      staffId,
      date,
      time: slotTime,
      status: { $ne: "cancelled" }
    });

    if (!conflict) return slotTime;
    slotMinutes += 5;
  }

  return null;
};

/* ============================
   CREATE APPOINTMENT
============================ */
router.post("/create", auth(["admin", "manager"]), async (req, res) => {
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

    const adminId = await resolveAdminId(req.user);
    if (!adminId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { salon, error, statusCode } = await ensureSalonAccess({ salonId, user: req.user, adminId });
    if (!salon) {
      return res.status(statusCode).json({ message: error });
    }

    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toISOString().split("T")[0];

    if (salon.holidays.includes(formattedDate)) {
      return res.status(400).json({
        message: "Salon is closed on selected date (holiday)."
      });
    }

    const bookingMinutes = timeToMinutes(time);
    const openingMinutes = timeToMinutes(salon.openingTime);
    const closingMinutes = timeToMinutes(salon.closingTime);

    if (bookingMinutes < openingMinutes || bookingMinutes > closingMinutes) {
      return res.status(400).json({
        message: "Selected time is outside salon working hours."
      });
    }

    if (isPastDateTime(date, time)) {
      return res.status(400).json({
        message: "Cannot book appointment in the past."
      });
    }

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

    const service = await Service.findOne({ _id: serviceId, salonId });

    if (!service) {
      return res.status(404).json({
        message: "Service not found in this salon"
      });
    }

    if (!isStaffAssignedToService(staff, service)) {
      return res.status(400).json({
        message: "Selected staff is not assigned to this service."
      });
    }

    const price = service.price && service.price > 0 ? service.price : 50;

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

    const appointment = await Appointment.create({
      customerName: String(customerName).trim(),
      customerEmail: String(customerEmail).trim().toLowerCase(),
      customerContact: String(customerContact).trim(),
      date: new Date(date),
      time,
      notes,
      salonId,
      staffId,
      serviceId,
      adminId,
      totalPrice: price,
      status: "pending",
      isWalkIn: false
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
   CREATE WALK-IN SLOT
============================ */
router.post("/create-walkin", auth(["admin", "manager", "staff"]), async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerContact,
      notes,
      salonId,
      staffId,
      serviceId
    } = req.body;

    if (!customerName || !customerContact || !salonId || !staffId || !serviceId) {
      return res.status(400).json({
        message: "Customer name, contact, salon, staff and service are required"
      });
    }

    if (req.user.role === "staff" && String(req.user.id) !== String(staffId)) {
      return res.status(403).json({ message: "Staff can only assign walk-ins to themselves" });
    }

    const adminId = await resolveAdminId(req.user);
    if (!adminId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { salon, error, statusCode } = await ensureSalonAccess({ salonId, user: req.user, adminId });
    if (!salon) {
      return res.status(statusCode).json({ message: error });
    }

    const todayString = getTodayDateString();
    if (salon.holidays.includes(todayString)) {
      return res.status(400).json({ message: "Cannot create walk-in slot on holiday." });
    }

    const staff = await Staff.findOne({ _id: staffId, salonId, status: "active" });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found in this salon" });
    }

    const service = await Service.findOne({ _id: serviceId, salonId, status: "active" });
    if (!service) {
      return res.status(404).json({ message: "Service not found in this salon" });
    }

    if (!isStaffAssignedToService(staff, service)) {
      return res.status(400).json({ message: "Selected staff is not assigned to this service." });
    }

    const bookingDate = toLocalDateOnly(new Date());
    const slotTime = await findNextWalkInTime({ staffId, date: bookingDate, salon });

    if (!slotTime) {
      return res.status(400).json({ message: "No walk-in slots available today for selected staff." });
    }

    const todaysWalkIns = await Appointment.countDocuments({
      adminId,
      salonId,
      date: bookingDate,
      isWalkIn: true
    });

    const price = service.price && service.price > 0 ? service.price : 50;

    const walkIn = await Appointment.create({
      customerName: String(customerName).trim(),
      customerEmail: customerEmail ? String(customerEmail).trim().toLowerCase() : "",
      customerContact: String(customerContact).trim(),
      date: bookingDate,
      time: slotTime,
      notes,
      salonId,
      staffId,
      serviceId,
      adminId,
      totalPrice: price,
      status: "confirmed",
      isWalkIn: true,
      walkInToken: todaysWalkIns + 1
    });

    const populatedWalkIn = await walkIn.populate([
      { path: "salonId", select: "name" },
      { path: "staffId", select: "name" },
      { path: "serviceId", select: "name price" }
    ]);

    res.status(201).json({
      message: "Walk-in slot created successfully",
      appointment: populatedWalkIn
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
    const adminId = await resolveAdminId(req.user);
    if (!adminId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const query = { adminId };

    if (req.query.salonId) {
      query.salonId = req.query.salonId;
    } else if ((req.user.role === "manager" || req.user.role === "staff") && req.user.salonId) {
      query.salonId = req.user.salonId;
    }

    if (req.query.staffId) query.staffId = req.query.staffId;
    if (req.query.status) query.status = req.query.status;

    if (req.query.type === "walkin") query.isWalkIn = true;
    if (req.query.type === "scheduled") query.isWalkIn = false;

    if (req.user.role === "staff") {
      query.staffId = req.user.id;
    }

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
router.put("/:id/status", auth(["admin", "manager", "staff"]), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const adminId = await resolveAdminId(req.user);
    if (!adminId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const query = { _id: req.params.id, adminId };

    if (req.user.role === "staff") {
      query.staffId = req.user.id;
    }

    if ((req.user.role === "manager" || req.user.role === "staff") && req.user.salonId) {
      query.salonId = req.user.salonId;
    }

    const appointment = await Appointment.findOneAndUpdate(
      query,
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
router.delete("/:id", auth(["admin", "manager"]), async (req, res) => {
  try {
    const adminId = await resolveAdminId(req.user);
    if (!adminId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const query = { _id: req.params.id, adminId };
    if (req.user.role === "manager" && req.user.salonId) {
      query.salonId = req.user.salonId;
    }

    const appointment = await Appointment.findOneAndDelete(query);

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

    const adminId = await resolveAdminId(req.user);
    if (!adminId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const salonQuery = { _id: salonId, adminId };
    if ((req.user.role === "manager" || req.user.role === "staff") && req.user.salonId) {
      salonQuery._id = req.user.salonId;
    }

    const salon = await Salon.findOne(salonQuery).select("_id");
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    const staff = await Staff.find({ salonId: salon._id, status: "active" });
    const services = await Service.find({ salonId: salon._id, status: "active" });

    res.json({ staff, services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
