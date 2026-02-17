const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

const {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory,
  getLowStockItems
} = require("../controllers/inventoryController");

// Get all inventory - accessible by admin, manager, and staff
router.get("/", auth(["admin", "manager", "staff"]), getInventory);

// Get low stock items - accessible by admin, manager, and staff
router.get("/low-stock", auth(["admin", "manager", "staff"]), getLowStockItems);

// Add inventory item - admin only
router.post("/", auth(["admin"]), addInventory);

// Update inventory item - admin only
router.put("/:id", auth(["admin"]), updateInventory);

// Delete inventory item - admin only
router.delete("/:id", auth(["admin"]), deleteInventory);

module.exports = router;
