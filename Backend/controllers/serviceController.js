const Service = require("../models/Service");

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

    if (!salonId) {
      return res.status(400).json({ message: "SalonId required" });
    }

    // Manager can only add to their salon
    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      req.user.salonId !== salonId
    ) {
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

    res.status(201).json(service);

  } catch (err) {
    console.error("ADD SERVICE ERROR:", err);
    res.status(500).json({ message: "Add failed" });
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

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

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
