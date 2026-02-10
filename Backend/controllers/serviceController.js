const Service = require("../models/Service");
const User = require("../models/User");

/* ===========================
   GET SERVICES
=========================== */
exports.getServices = async (req, res) => {
  try {
    
    const query = {};
    if (req.userRole === "admin") {
      if (req.query.salonId) {
        query.salonId = req.query.salonId;
      }
    }

    if (req.userRole === "staff") {
      query.salonId = req.userSalonId;
    }

    const services = await Service
      .find(query)
      .sort({ isFeatured: -1, order: 1 });

    res.json(services);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load services" });
  }
};

/* ===========================
   ADD SERVICE
=========================== */
exports.addService = async (req, res) => {
  try {

    const last = await Service
      .find({ salonId: req.body.salonId })
      .sort({ order: -1 })
      .limit(1);

    const nextOrder = last.length ? last[0].order + 1 : 0;

    const service = await Service.create({
      ...req.body,
      order: nextOrder,
      isFeatured: req.body.isFeatured || false
    });

    res.json(service);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Add failed" });
  }
};

/* ===========================
   UPDATE SERVICE
=========================== */
exports.updateService = async (req, res) => {
  try {

    // Only one featured per salon
    if (req.body.isFeatured === true) {

      const current = await Service.findById(req.params.id);

      await Service.updateMany(
        { salonId: current.salonId },
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
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ===========================
   DELETE SERVICE
=========================== */
exports.deleteService = async (req, res) => {
  try {

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ===========================
   REORDER SERVICES
=========================== */
exports.reorderServices = async (req, res) => {
  try {

    // ❌ prevent featured from being reordered
    const ids = req.body.order.map(o => o.id);
    const featured = await Service.find({
      _id: { $in: ids },
      isFeatured: true
    });

    if (featured.length) {
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
    console.error(err);
    res.status(500).json({ message: "Reorder failed" });
  }
};
