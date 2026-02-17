const Salon = require("../models/Salon");
const User = require("../models/User");
const Staff = require("../models/Staff");
const Category = require("../models/Category");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

/* ======================================================
   HELPER → CHECK IF TODAY IS HOLIDAY
====================================================== */
function checkIsHoliday(holidays = []) {
    const today = new Date().toISOString().slice(0, 10);
    return holidays.includes(today);
}

/* ============================
   ADD SALON
============================ */
exports.addSalon = async (req, res) => {
    try {
        const {
            name,
            address,
            contact,
            email,
            ownerName,
            openingTime,
            closingTime,
            logo,
            holidays,
            status,
            isPrimary
        } = req.body;

        const missing = [];
        if (!name) missing.push("Name");
        if (!address) missing.push("Address");
        if (!contact) missing.push("Contact");

        if (missing.length > 0) {
            return res.status(400).json({
                message: `${missing.join(", ")} required`
            });
        }

        const adminUser = await User.findById(req.user.id);
        if (!adminUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const salonLimit = adminUser.planBranchLimit || 0;
        if (salonLimit > 0) {
            const existing = await Salon.countDocuments({ adminId: req.user.id });
            if (existing >= salonLimit) {
                return res.status(403).json({
                    message: "Salon limit reached for your selected plan"
                });
            }
        }

        // Only one primary salon
        if (isPrimary === true) {
            await Salon.updateMany(
                { adminId: req.user.id },
                { isPrimary: false }
            );
        }

        // Get next order
        const last = await Salon.find({ adminId: req.user.id })
            .sort({ order: -1 })
            .limit(1);

        const nextOrder = last.length ? last[0].order + 1 : 0;

        const salon = await Salon.create({
            name,
            address,
            contact,
            email,
            ownerName,
            openingTime,
            closingTime,
            logo,
            holidays: holidays || [],
            status: status || "open",
            isPrimary: isPrimary || false,
            adminId: req.user.id,
            order: nextOrder
        });

        res.status(201).json({
            message: "Salon added successfully",
            salon
        });

    } catch (err) {
        console.error("ADD SALON ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ======================================================
   HELPER → CHECK IF OPEN BASED ON TIME
====================================================== */
function checkIsOpenNow(openingTime, closingTime) {
    if (!openingTime || !closingTime) return true;

    // Get current time in local timezone (metadata says +05:30)
    // To be safe, we use the Date object which uses system time.
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = openingTime.split(":").map(Number);
    const openMinutes = openH * 60 + openM;

    const [closeH, closeM] = closingTime.split(":").map(Number);
    const closeMinutes = closeH * 60 + closeM;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

/* ============================
   GET SALONS
============================ */
exports.getSalons = async (req, res) => {
    try {
        // 🚫 DISABLE CACHE
        res.set("Cache-Control", "no-store");

        let query = {};
        if (req.user.role === "admin") {
            query = { adminId: req.user.id };
        } else if (req.user.role === "staff" || req.user.role === "manager") {
            if (!req.user.salonId) return res.json([]);
            query = { _id: req.user.salonId };
        } else {
            return res.status(403).json({ message: "Unauthorized" });
        }

        let salons = await Salon.find(query)
            .populate("staff", "-password")
            .sort({ isPrimary: -1, order: 1 })
            .lean(); // Use lean for performance and to add virtual fields easily

        // Add holiday and time-based status without mutating DB
        const processedSalons = salons.map(salon => {
            const isHoliday = checkIsHoliday(salon.holidays);
            const isOpenNow = checkIsOpenNow(salon.openingTime, salon.closingTime);

            let displayStatus = salon.status;
            if (isHoliday) {
                displayStatus = "Holiday";
            } else if (!isOpenNow && salon.status === "open") {
                displayStatus = "Closed";
            }

            return {
                ...salon,
                isHolidayToday: isHoliday,
                isOpenNow: isOpenNow && !isHoliday && salon.status === "open",
                displayStatus: displayStatus
            };
        });

        res.json(processedSalons);

    } catch (err) {
        console.error("GET SALONS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ============================
   REORDER SALONS
============================ */
exports.reorderSalons = async (req, res) => {
    try {
        const { order } = req.body;
        if (!order || !Array.isArray(order)) {
            return res.status(400).json({ message: "Invalid order data" });
        }

        const bulk = order.map(o => ({
            updateOne: {
                filter: { _id: o.id, adminId: req.user.id },
                update: { order: o.order, isPrimary: false }
            }
        }));

        await Salon.bulkWrite(bulk);

        // Primary always first (if still exists as primary after bulk update)
        // Note: the bulk write above sets isPrimary to false for all. 
        // Usually reorder shouldn't overwrite primary status unless specified.
        // However, keeping existing logic for consistency with original.
        await Salon.updateMany(
            { adminId: req.user.id, isPrimary: true },
            { order: -1 }
        );

        res.json({ message: "Order saved" });

    } catch (err) {
        console.error("REORDER ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ============================
   EMERGENCY CLOSE ALL
============================ */
exports.emergencyCloseAll = async (req, res) => {
    try {
        await Salon.updateMany(
            { adminId: req.user.id },
            { status: "temporarily-closed" }
        );
        res.json({ message: "All salons temporarily closed" });
    } catch (err) {
        console.error("EMERGENCY CLOSE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ============================
   REOPEN ALL
============================ */
exports.emergencyOpenAll = async (req, res) => {
    try {
        await Salon.updateMany(
            { adminId: req.user.id },
            { status: "open" }
        );
        res.json({ message: "All salons reopened" });
    } catch (err) {
        console.error("EMERGENCY OPEN ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ============================
   UPDATE SALON
============================ */
exports.updateSalon = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.body.isPrimary === true) {
            await Salon.updateMany(
                { adminId: req.user.id },
                { isPrimary: false }
            );
        }

        const salon = await Salon.findOneAndUpdate(
            { _id: id, adminId: req.user.id },
            req.body,
            { new: true }
        );

        if (!salon) {
            return res.status(404).json({ message: "Salon not found" });
        }

        res.json({ message: "Salon updated", salon });

    } catch (err) {
        console.error("UPDATE SALON ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ============================
   DELETE SALON
============================ */
exports.deleteSalon = async (req, res) => {
    try {
        const { id } = req.params;

        const salon = await Salon.findOne({ _id: id, adminId: req.user.id });
        if (!salon) {
            return res.status(404).json({ message: "Salon not found" });
        }

        const oid = new mongoose.Types.ObjectId(id);

        // Total Cascading Delete
        await Staff.deleteMany({ salonId: oid });
        await Category.deleteMany({ salonId: oid });
        await Service.deleteMany({ salonId: oid });
        await Appointment.deleteMany({ salonId: oid });
        await Attendance.deleteMany({ salonId: oid });

        // Delete the salon itself
        await Salon.deleteOne({ _id: oid, adminId: req.user.id });

        res.json({ message: "Salon and all associated records deleted successfully" });

    } catch (err) {
        console.error("DELETE SALON ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
