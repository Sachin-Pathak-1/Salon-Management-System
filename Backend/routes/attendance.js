const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");

const normalizeDate = (value) => {
    const date = value ? new Date(value) : new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

const toISODate = (date) => {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value.toISOString().slice(0, 10);
};

const getViewRange = (view, baseDate) => {
    const start = new Date(baseDate);
    const end = new Date(baseDate);

    if (view === "weekly") {
        const day = baseDate.getDay(); // 0 = Sun ... 6 = Sat
        const mondayOffset = day === 0 ? -6 : 1 - day;
        start.setDate(baseDate.getDate() + mondayOffset);
        end.setDate(start.getDate() + 6);
    } else if (view === "yearly") {
        start.setMonth(0, 1);
        end.setMonth(11, 31);
    } else {
        start.setDate(1);
        end.setMonth(baseDate.getMonth() + 1, 0);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const countStatuses = (records = []) => {
    const counts = { present: 0, absent: 0, leave: 0, halfDay: 0 };

    records.forEach((record) => {
        if (record.status === "Present") counts.present += 1;
        else if (record.status === "Absent") counts.absent += 1;
        else if (record.status === "Leave") counts.leave += 1;
        else if (record.status === "Half Day") counts.halfDay += 1;
    });

    return counts;
};

const getPredominantStatus = ({ present, absent, leave, halfDay }) => {
    const leaveBucket = leave + halfDay;
    if (present === 0 && absent === 0 && leaveBucket === 0) return "Unmarked";

    const scores = [
        { key: "Present", value: present },
        { key: "Absent", value: absent },
        { key: "Leave", value: leaveBucket }
    ];

    scores.sort((a, b) => b.value - a.value);
    const [first, second] = scores;
    if (!second || first.value > second.value) return first.key;
    return "Mixed";
};

const resolveSalonId = (req) => {
    const { salonId } = req.query;
    let targetSalonId = req.user.salonId;

    if (req.user.role === "admin" && salonId) {
        targetSalonId = salonId;
    }

    return targetSalonId;
};

// GET /api/attendance/report?view=weekly|monthly|yearly&date=YYYY-MM-DD
router.get("/report", auth(["admin", "manager"]), async (req, res) => {
    try {
        const view = ["weekly", "monthly", "yearly"].includes(req.query.view)
            ? req.query.view
            : "monthly";
        const baseDate = normalizeDate(req.query.date);
        const targetSalonId = resolveSalonId(req);

        if (!targetSalonId || !mongoose.Types.ObjectId.isValid(targetSalonId)) {
            return res.status(400).json({ error: "Valid salonId is required" });
        }

        const { start, end } = getViewRange(view, baseDate);
        const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 0, 0, 0, 0);
        const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999);

        const [periodDocs, monthDocs] = await Promise.all([
            Attendance.find({
                salonId: targetSalonId,
                date: { $gte: start, $lte: end }
            }).sort({ date: 1 }),
            Attendance.find({
                salonId: targetSalonId,
                date: { $gte: monthStart, $lte: monthEnd }
            }).sort({ date: 1 })
        ]);

        const summary = {
            present: 0,
            absent: 0,
            leave: 0,
            halfDay: 0,
            totalRecords: 0,
            markedDays: periodDocs.length
        };

        const dailyBreakdown = periodDocs.map((doc) => {
            const counts = countStatuses(doc.records);
            summary.present += counts.present;
            summary.absent += counts.absent;
            summary.leave += counts.leave;
            summary.halfDay += counts.halfDay;

            const total = counts.present + counts.absent + counts.leave + counts.halfDay;
            summary.totalRecords += total;

            return {
                date: toISODate(doc.date),
                ...counts,
                total,
                predominantStatus: getPredominantStatus(counts)
            };
        });

        const monthMap = new Map(
            monthDocs.map((doc) => {
                const counts = countStatuses(doc.records);
                return [
                    toISODate(doc.date),
                    {
                        date: toISODate(doc.date),
                        ...counts,
                        total: counts.present + counts.absent + counts.leave + counts.halfDay,
                        predominantStatus: getPredominantStatus(counts)
                    }
                ];
            })
        );

        const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
        const calendarDays = [];
        const monthTotals = {
            presentDays: 0,
            absentDays: 0,
            leaveDays: 0,
            mixedDays: 0,
            unmarkedDays: 0,
            totalDays: daysInMonth
        };

        for (let day = 1; day <= daysInMonth; day += 1) {
            const currentDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
            const key = toISODate(currentDate);
            const existing = monthMap.get(key) || {
                date: key,
                present: 0,
                absent: 0,
                leave: 0,
                halfDay: 0,
                total: 0,
                predominantStatus: "Unmarked"
            };

            if (existing.predominantStatus === "Present") monthTotals.presentDays += 1;
            else if (existing.predominantStatus === "Absent") monthTotals.absentDays += 1;
            else if (existing.predominantStatus === "Leave") monthTotals.leaveDays += 1;
            else if (existing.predominantStatus === "Mixed") monthTotals.mixedDays += 1;
            else monthTotals.unmarkedDays += 1;

            calendarDays.push(existing);
        }

        res.json({
            view,
            period: {
                startDate: toISODate(start),
                endDate: toISODate(end),
                label: `${start.toLocaleDateString("en-US")} - ${end.toLocaleDateString("en-US")}`
            },
            summary,
            dailyBreakdown,
            monthlyCalendar: {
                monthLabel: baseDate.toLocaleString("en-US", { month: "long", year: "numeric" }),
                totals: monthTotals,
                days: calendarDays
            }
        });
    } catch (err) {
        console.error("Error generating attendance report:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/attendance?date=YYYY-MM-DD
// Fetch attendance for the logged-in user's salon for a specific date
router.get("/", auth(["admin", "manager", "staff"]), async (req, res) => {
    try {
        const { date } = req.query;
        const targetSalonId = resolveSalonId(req);

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
