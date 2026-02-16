const Inventory = require("../models/Inventory");

/* ==================================================
   GET INVENTORY ITEMS
================================================== */
exports.getInventory = async (req, res) => {
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

    const inventory = await Inventory.find(filter).sort({ createdAt: -1 });
    res.json(inventory);

  } catch (err) {
    console.error("GET INVENTORY ERROR:", err);
    res.status(500).json({ message: "Failed to load inventory" });
  }
};

/* ==================================================
   ADD INVENTORY ITEM
================================================== */
exports.addInventory = async (req, res) => {
  try {
    const { salonId } = req.body;

    if (!salonId) {
      return res.status(400).json({ message: "SalonId required" });
    }

    // Prevent cross-salon additions
    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      req.user.salonId.toString() !== salonId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized salon access" });
    }

    const inventory = await Inventory.create(req.body);
    res.status(201).json(inventory);

  } catch (err) {
    console.error("ADD INVENTORY ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to add inventory" });
  }
};

/* ==================================================
   UPDATE INVENTORY ITEM
================================================== */
exports.updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Prevent cross-salon updates
    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      inventory.salonId.toString() !== req.user.salonId
    ) {
      return res.status(403).json({ message: "Unauthorized update" });
    }

    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    console.error("UPDATE INVENTORY ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ==================================================
   DELETE INVENTORY ITEM
================================================== */
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Prevent cross-salon deletions
    if (
      (req.user.role === "manager" || req.user.role === "staff") &&
      inventory.salonId.toString() !== req.user.salonId
    ) {
      return res.status(403).json({ message: "Unauthorized delete" });
    }

    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("DELETE INVENTORY ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ==================================================
   GET LOW STOCK ITEMS
================================================== */
exports.getLowStockItems = async (req, res) => {
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

    // Get items where quantity is less than or equal to lowStockThreshold
    const inventory = await Inventory.find({
      ...filter,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
    }).sort({ quantity: 1 });

    res.json(inventory);

  } catch (err) {
    console.error("GET LOW STOCK ERROR:", err);
    res.status(500).json({ message: "Failed to load low stock items" });
  }
};
