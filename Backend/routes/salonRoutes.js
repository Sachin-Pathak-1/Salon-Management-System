const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

const {
  addSalon,
  getSalons,
  getPublicSalons,
  reorderSalons,
  emergencyCloseAll,
  emergencyOpenAll,
  updateSalon,
  deleteSalon
} = require("../controllers/salonController");

/* ============================
   SALON ROUTES
============================ */

router.get("/public", getPublicSalons);
router.post("/add", auth(["admin"]), addSalon);
router.get("/public", getPublicSalons);
router.get("/get", auth(), getSalons);
router.put("/reorder", auth(["admin"]), reorderSalons);
router.put("/emergency/close-all", auth(["admin"]), emergencyCloseAll);
router.put("/emergency/open-all", auth(["admin"]), emergencyOpenAll);
router.put("/:id", auth(["admin"]), updateSalon);
router.delete("/:id", auth(["admin"]), deleteSalon);

module.exports = router;
