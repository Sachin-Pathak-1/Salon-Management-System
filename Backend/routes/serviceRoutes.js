const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

const {
  getServices,
  addService,
  updateService,
  deleteService,
  reorderServices
} = require("../controllers/serviceController");

router.get("/", auth, admin, getServices);
router.post("/", auth, admin, addService);
router.put("/reorder", auth, admin, reorderServices);
router.put("/:id", auth, admin, updateService);
router.delete("/:id", auth, admin, deleteService);

module.exports = router;
