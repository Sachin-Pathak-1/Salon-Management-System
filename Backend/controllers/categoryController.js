const Category = require("../models/Category");
const Service = require("../models/Service");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const logPath = "d:/Intern/Services-Management-System/Backend/deletion_debug.log";
const debugLog = (msg) => {
  const time = new Date().toISOString();
  fs.appendFileSync(logPath, `[${time}] ${msg}\n`);
};

/* ==================================================
   GET CATEGORIES (Salon Isolated)
================================================== */
exports.getCategories = async (req, res) => {
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

    const categories = await Category
      .find(filter)
      .sort({ order: 1 });

    res.json(categories);

  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
};

/* ==================================================
   ADD CATEGORY
================================================== */
exports.addCategory = async (req, res) => {
  try {
    const { salonId, name } = req.body;

    if (!salonId || !name) {
      return res.status(400).json({ message: "SalonId and name required" });
    }

    // Manager can only add to their salon
    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      req.user.salonId.toString() !== salonId.toString()
    ) {
      debugLog(`ADD CATEGORY FAILED: Unauthorized. UserSalon: ${req.user.salonId}, ReqSalon: ${salonId}`);
      return res.status(403).json({ message: "Unauthorized salon access" });
    }

    const last = await Category
      .find({ salonId })
      .sort({ order: -1 })
      .limit(1);

    const nextOrder = last.length ? last[0].order + 1 : 0;

    const category = await Category.create({
      ...req.body,
      order: nextOrder
    });

    res.status(201).json(category);

  } catch (err) {
    debugLog(`ADD CATEGORY ERROR: ${err.stack || err.message}`);
    console.error("ADD CATEGORY ERROR:", err);
    res.status(500).json({ message: err.message || "Add failed" });
  }
};

/* ==================================================
   UPDATE CATEGORY
================================================== */
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Prevent cross-salon updates
    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      category.salonId.toString() !== req.user.salonId
    ) {
      return res.status(403).json({ message: "Unauthorized update" });
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ==================================================
   DELETE CATEGORY
================================================== */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      category.salonId.toString() !== req.user.salonId
    ) {
      return res.status(403).json({ message: "Unauthorized delete" });
    }

    // Cascading delete: Remove all services in this category
    await Service.deleteMany({ categoryId: new mongoose.Types.ObjectId(req.params.id) });

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Category and associated services deleted successfully" });

  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ==================================================
   REORDER CATEGORIES
================================================== */
exports.reorderCategories = async (req, res) => {
  try {
    const ids = req.body.order.map(o => o.id);
    const categories = await Category.find({ _id: { $in: ids } });

    // Ensure all categories belong to same salon
    const salonId = categories[0]?.salonId;

    for (let c of categories) {
      if (c.salonId.toString() !== salonId.toString()) {
        return res.status(400).json({ message: "Invalid reorder request" });
      }
    }

    const bulk = req.body.order.map(o => ({
      updateOne: {
        filter: { _id: o.id },
        update: { order: o.order }
      }
    }));

    await Category.bulkWrite(bulk);

    res.json({ message: "Order saved" });

  } catch (err) {
    console.error("REORDER ERROR:", err);
    res.status(500).json({ message: "Reorder failed" });
  }
};
