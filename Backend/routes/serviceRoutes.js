const express = require("express");
const router = express.Router();

const {
  getServices,
  addService,
  updateService,
  deleteService,
  reorderServices
} = require("../controllers/serviceController");

router.get("/", getServices);
router.post("/", addService);
router.put("/reorder", reorderServices);   // 👈 before :id
router.put("/:id", updateService);
router.delete("/:id", deleteService);

module.exports = router;
