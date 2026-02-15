const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Staff = require("../models/Staff");
const Salon = require("../models/Salon");
const auth = require("../middleware/auth");

// GET /api/attendance?date=YYYY-MM-DD
// Fetch attendance for the logged-in user's salon for a specific date
router.get("/", auth(["admin", "manager", "staff"]), async (req, res) => {
    try {
        const { date, salonId } = req.query; // Admin might pass salonId, Manager uses user.salonId

        // Determine Salon ID
        let targetSalonId = req.user.salonId;
        if (req.user.role === "admin" && salonId) {
            targetSalonId = salonId;
        }

        if (!targetSalonId) {
            // Fallback: if admin hasn't selected a salon yet or user data is incomplete
            if (req.user.role === 'admin' && !salonId) {
                // If super admin, maybe return all? But scheme is 1 record per salon per date.
                // For now enforce salonId.
                // return res.status(400).json({ error: "Admin must provide salonId" });
                // Actually, let's just return empty or handle gracefully
            }
        }

        if (!date) {
            return res.status(400).json({ error: "Date is required" });
        }

        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            salonId: targetSalonId,
            date: queryDate
        }).populate("records.staffId", "name");

        if (!attendance) {
            // Return empty structure, frontend can initialize
            return res.json({ date: queryDate, records: [] });
        }

        res.json(attendance);

    } catch (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/attendance
// Create or Update attendance for a date
router.post("/", auth(["admin", "manager"]), async (req, res) => {
    try {
        const { date, records, salonId } = req.body; // records: [{ staffId, status, ... }]

        let targetSalonId = req.user.salonId;

        // If admin is marking attendance
        if (req.user.role === "admin" && salonId) {
            targetSalonId = salonId;
        }

        if (!targetSalonId) {
            return res.status(400).json({ error: "Salon ID missing" });
        }

        const recordDate = new Date(date);
        recordDate.setHours(0, 0, 0, 0);

        // Upsert
        const updatedAttendance = await Attendance.findOneAndUpdate(
            { salonId: targetSalonId, date: recordDate },
            {
                $set: {
                    records: records
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(updatedAttendance);

    } catch (err) {
        console.error("Error saving attendance:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
