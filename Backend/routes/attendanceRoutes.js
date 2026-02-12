const express = require("express");
const router = express.Router();
const {
  createOrUpdateAttendance,
  getStaffAttendance,
  getSalonAttendance,
  getAttendanceSummary,
  deleteAttendance
} = require("../controllers/attendanceController");
const { authMiddleware } = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");

// Make sure all routes are protected
router.use(authMiddleware);

// Create or update attendance record
router.post("/", adminMiddleware, createOrUpdateAttendance);

// Get attendance for a specific staff member
router.get("/staff/:staffId", getStaffAttendance);

// Get attendance summary for a staff member
router.get("/staff/:staffId/summary", getAttendanceSummary);

// Get attendance for all staff in a salon
router.get("/salon/:salonId", adminMiddleware, getSalonAttendance);

// Delete attendance record
router.delete("/:attendanceId", adminMiddleware, deleteAttendance);

module.exports = router;
