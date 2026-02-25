const Salon = require("../models/Salon");
const User = require("../models/User");
const Staff = require("../models/Staff");
const Category = require("../models/Category");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

/* ======================================================
   HELPER -> CHECK IF TODAY IS HOLIDAY
====================================================== */
function checkIsHoliday(holidays = []) {
    const today = new Date().toISOString().slice(0, 10);
    return holidays.includes(today);
}

function inferSalonType(record = {}) {
    const haystack = `${record.name || ""} ${record.email || ""}`.toLowerCase();
    const spaHints = ["spa", "wellness", "therapy", "retreat", "massage", "ayur"];
    const hasSpaHint = spaHints.some((hint) => haystack.includes(hint));

    if (record.type === "spa") return "spa";
    if (record.type === "salon") return hasSpaHint ? "spa" : "salon";
    return hasSpaHint ? "spa" : "salon";
}

/* ============================
   PUBLIC SALONS
============================ */
exports.getPublicSalons = async (_req, res) => {
    try {
        const salons = await Salon.find({})
            .sort({ isPrimary: -1, order: 1, createdAt: -1 })
            .lean();
        return res.json(salons);
    } catch (err) {
        console.error("GET PUBLIC SALONS ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

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
            type,
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

        const now = new Date();
        const demoActive = Boolean(
            adminUser.isDemoPlanSelected &&
            adminUser.demoTrialStartAt &&
            adminUser.demoTrialEndsAt &&
            now <= new Date(adminUser.demoTrialEndsAt)
        );
        const hasPaidPlan = Boolean(adminUser.selectedPlanId);
        const hasPlanAccess = hasPaidPlan || demoActive;

        if (!hasPlanAccess) {
            return res.status(403).json({
                message: "Subscription required. Please choose Demo or a paid plan."
            });
        }

        const salonLimit = hasPaidPlan ? (adminUser.planBranchLimit || 0) : 1;
        const existing = await Salon.countDocuments({ adminId: req.user.id });
        if (salonLimit > 0 && existing >= salonLimit) {
            return res.status(403).json({
                message: hasPaidPlan
                    ? "Salon limit reached for your selected plan"
                    : "Demo plan allows only 1 salon/spa"
            });
        }

        if (isPrimary === true) {
            await Salon.updateMany(
                { adminId: req.user.id },
                { isPrimary: false }
            );
        }

        const last = await Salon.find({ adminId: req.user.id })
            .sort({ order: -1 })
            .limit(1);

        const nextOrder = last.length ? last[0].order + 1 : 0;
        const normalizedType =
            type === "spa" || type === "salon"
                ? type
                : inferSalonType({ name, email });

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
            type: normalizedType,
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
   HELPER -> CHECK IF OPEN BASED ON TIME
====================================================== */
function checkIsOpenNow(openingTime, closingTime) {
    if (!openingTime || !closingTime) return true;

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
        res.set("Cache-Control", "no-store");

        let query = {};
        if (req.user.role === "admin") {
            query = { adminId: req.user.id };
        } else if (req.user.role === "staff" || req.user.role === "manager") {
            if (!req.user.salonId) return res.json([]);
            query = { _id: req.user.salonId };
        } else if (req.user.role === "customer") {
            query = {};
        } else {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const salons = await Salon.find(query)
            .populate("staff", "-password")
            .sort({ isPrimary: -1, order: 1 })
            .lean();

        const processedSalons = salons.map((salon) => {
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
                displayStatus
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

        const bulk = order.map((o) => ({
            updateOne: {
                filter: { _id: o.id, adminId: req.user.id },
                update: { order: o.order, isPrimary: false }
            }
        }));

        await Salon.bulkWrite(bulk);

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

        await Staff.deleteMany({ salonId: oid });
        await Category.deleteMany({ salonId: oid });
        await Service.deleteMany({ salonId: oid });
        await Appointment.deleteMany({ salonId: oid });
        await Attendance.deleteMany({ salonId: oid });

        await Salon.deleteOne({ _id: oid, adminId: req.user.id });

        res.json({ message: "Salon and all associated records deleted successfully" });

    } catch (err) {
        console.error("DELETE SALON ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ============================
   GET PUBLIC SALONS/SPAS
============================ */
exports.getPublicSalons = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store");

        const { type, bookableOnly } = req.query;
        const shouldFilterBookable = String(bookableOnly || "").toLowerCase() === "true";

        const salons = await Salon.find({})
            .sort({ isPrimary: -1, order: 1, createdAt: -1 })
            .lean();

        const processedSalons = salons.map((salon) => {
            const isHoliday = checkIsHoliday(salon.holidays);
            const isOpenNow = checkIsOpenNow(salon.openingTime, salon.closingTime);

            let displayStatus = salon.status;
            if (isHoliday) {
                displayStatus = "Holiday";
            } else if (!isOpenNow && salon.status === "open") {
                displayStatus = "Closed";
            }

            const inferredType = inferSalonType(salon);

            return {
                ...salon,
                type: inferredType,
                isHolidayToday: isHoliday,
                isOpenNow: isOpenNow && !isHoliday && salon.status === "open",
                displayStatus
            };
        });

        let filtered =
            type === "salon" || type === "spa"
                ? processedSalons.filter((salon) => salon.type === type)
                : processedSalons;

        if (shouldFilterBookable) {
            const withBookableFlag = await Promise.all(
                filtered.map(async (salon) => {
                    const [staffCount, serviceCount] = await Promise.all([
                        Staff.countDocuments({ salonId: salon._id, status: "active" }),
                        Service.countDocuments({ salonId: salon._id, status: "active" })
                    ]);

                    return {
                        ...salon,
                        hasBookableStaff: staffCount > 0,
                        hasBookableServices: serviceCount > 0,
                        isBookable: staffCount > 0 && serviceCount > 0
                    };
                })
            );

            filtered = withBookableFlag.filter((salon) => salon.isBookable);
        }

        res.json(filtered);
    } catch (err) {
        console.error("GET PUBLIC SALONS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
