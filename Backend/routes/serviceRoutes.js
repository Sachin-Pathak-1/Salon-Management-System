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

router.get("/", auth(), getServices);
router.post("/", auth(["admin", "manager"]), addService);
router.put("/reorder", auth(["admin", "manager"]), reorderServices);
router.put("/:id", auth(["admin", "manager"]), updateService);
router.delete("/:id", auth(["admin", "manager"]), deleteService);

module.exports = router;
