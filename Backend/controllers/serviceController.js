const Service = require("../models/Service");
const fs = require("fs");
const path = require("path");

const logPath = "d:/Intern/Services-Management-System/Backend/deletion_debug.log";
const debugLog = (msg) => {
  const time = new Date().toISOString();
  fs.appendFileSync(logPath, `[${time}] ${msg}\n`);
};

/* ==================================================
   GET SERVICES (Salon Isolated)
================================================== */
exports.getServices = async (req, res) => {
  try {

    let filter = {};

    // Manager & Staff → locked to their salon
    if (req.user.role === "manager" || req.user.role === "staff") {
      filter.salonId = req.user.salonId;
    }

    // Admin → must provide salonId
    if (req.user.role === "admin") {
      if (!req.query.salonId) {
        return res.status(400).json({ message: "SalonId required" });
      }
      filter.salonId = req.query.salonId;
    }

    const services = await Service
      .find(filter)
      .populate("categoryId")
      .populate("assignedStaff")
      .sort({ isFeatured: -1, order: 1 });

    res.json(services);

  } catch (err) {
    console.error("GET SERVICES ERROR:", err);
    res.status(500).json({ message: "Failed to load services" });
  }
};


/* ==================================================
   ADD SERVICE
================================================== */
exports.addService = async (req, res) => {
  try {

    const { salonId } = req.body;
    debugLog(`ADD SERVICE REQUEST: Body: ${JSON.stringify(req.body)} | User: ${req.user.id}, Role: ${req.user.role}, Salon: ${req.user.salonId}`);

    if (!salonId) {
      debugLog("ADD SERVICE FAILED: SalonId missing in request body");
      return res.status(400).json({ message: "SalonId required" });
    }

    // Manager can only add to their salon
    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      req.user.salonId.toString() !== salonId.toString()
    ) {
      debugLog(`ADD SERVICE FAILED: Unauthorized salon access. UserSalon: ${req.user.salonId}, ReqSalon: ${salonId}`);
      return res.status(403).json({ message: "Unauthorized salon access" });
    }

    const last = await Service
      .find({ salonId })
      .sort({ order: -1 })
      .limit(1);

    const nextOrder = last.length ? last[0].order + 1 : 0;

    const service = await Service.create({
      ...req.body,
      order: nextOrder,
      isFeatured: req.body.isFeatured || false
    });

    // BIDIRECTIONAL SYNC: Add service to assigned staff
    if (req.body.assignedStaff && req.body.assignedStaff.length > 0) {
      const Staff = require("../models/Staff");
      await Staff.updateMany(
        { _id: { $in: req.body.assignedStaff } },
        { $addToSet: { services: service._id } }
      );
    }

    const populated = await service.populate(["categoryId", "assignedStaff"]);

    debugLog(`Service created successfully: ${service._id}`);
    res.status(201).json(populated);

  } catch (err) {
    debugLog(`ADD SERVICE ERROR: ${err.stack || err.message}`);
    console.error("ADD SERVICE ERROR:", err);
    res.status(500).json({ message: err.message || "Add failed" });
  }
};


/* ==================================================
   UPDATE SERVICE
================================================== */
exports.updateService = async (req, res) => {
  try {

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Prevent cross-salon updates
    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      service.salonId.toString() !== req.user.salonId
    ) {
      return res.status(403).json({ message: "Unauthorized update" });
    }

    // Only one featured per salon
    if (req.body.isFeatured === true) {
      await Service.updateMany(
        { salonId: service.salonId },
        { isFeatured: false }
      );
    }

    // BIDIRECTIONAL SYNC: Update Staff.services when assignedStaff changes
    if (req.body.assignedStaff !== undefined) {
      const Staff = require("../models/Staff");

      const oldStaffIds = service.assignedStaff.map(id => id.toString());
      const newStaffIds = req.body.assignedStaff.map(id => id.toString());

      // Remove service from staff who are no longer assigned
      const removedStaff = oldStaffIds.filter(id => !newStaffIds.includes(id));
      if (removedStaff.length > 0) {
        await Staff.updateMany(
          { _id: { $in: removedStaff } },
          { $pull: { services: service._id } }
        );
      }

      // Add service to newly assigned staff
      const addedStaff = newStaffIds.filter(id => !oldStaffIds.includes(id));
      if (addedStaff.length > 0) {
        await Staff.updateMany(
          { _id: { $in: addedStaff } },
          { $addToSet: { services: service._id } }
        );
      }
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("categoryId")
      .populate("assignedStaff");

    res.json(updated);

  } catch (err) {
    console.error("UPDATE SERVICE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};


/* ==================================================
   DELETE SERVICE
================================================== */
exports.deleteService = async (req, res) => {
  try {

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      service.salonId.toString() !== req.user.salonId
    ) {
      return res.status(403).json({ message: "Unauthorized delete" });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("DELETE SERVICE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};


/* ==================================================
   REORDER SERVICES
================================================== */
exports.reorderServices = async (req, res) => {
  try {

    const ids = req.body.order.map(o => o.id);

    const services = await Service.find({ _id: { $in: ids } });

    // Ensure all services belong to same salon
    const salonId = services[0]?.salonId;

    for (let s of services) {
      if (s.salonId.toString() !== salonId.toString()) {
        return res.status(400).json({ message: "Invalid reorder request" });
      }
    }

    // Prevent featured reorder
    const featured = services.find(s => s.isFeatured);
    if (featured) {
      return res.status(400).json({
        message: "Featured service cannot be reordered"
      });
    }

    const bulk = req.body.order.map(o => ({
      updateOne: {
        filter: { _id: o.id },
        update: { order: o.order }
      }
    }));

    await Service.bulkWrite(bulk);

    res.json({ message: "Order saved" });

  } catch (err) {
    console.error("REORDER ERROR:", err);
    res.status(500).json({ message: "Reorder failed" });
  }
};
