const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const Salon = require("../models/Salon");
const User = require("../models/User");

const router = express.Router();

/* ======================================================
   HELPER → CHECK IF TODAY IS HOLIDAY
====================================================== */
function isTodayHoliday(holidays = []) {
  const today = new Date().toISOString().slice(0, 10);
  return holidays.includes(today);
}

/* ============================
   ADD SALON
============================ */
router.post("/add", auth, admin, async (req, res) => {
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

    if (!name || !address || !contact) {
      return res.status(400).json({
        message: "Name, address and contact required"
      });
    }

    const adminUser = await User.findById(req.userId);
    if (!adminUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!adminUser.selectedPlanId || adminUser.planBranchLimit < 1) {
      return res.status(403).json({
        message: "Select a plan before adding salons"
      });
    }

    const salonLimit = adminUser.planBranchLimit || 0;
    if (salonLimit > 0) {
      const existing = await Salon.countDocuments({ adminId: req.userId });
      if (existing >= salonLimit) {
        return res.status(403).json({
          message: "Salon limit reached for your selected plan"
        });
      }
    }

    // Only one primary salon
    if (isPrimary === true) {
      await Salon.updateMany(
        { adminId: req.userId },
        { isPrimary: false }
      );
    }

    // Get next order
    const last = await Salon.find({ adminId: req.userId })
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
      adminId: req.userId,
      order: nextOrder
    });

    res.status(201).json({
      message: "Salon added successfully",
      salon
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   GET SALONS
============================ */
router.get("/get", auth, admin, async (req, res) => {
  try {

    // 🚫 DISABLE CACHE (CRITICAL)
    res.set("Cache-Control", "no-store");

    let salons = await Salon
      .find({ adminId: req.userId })
      .sort({ isPrimary: -1, order: 1 });

    // Auto close on holidays
    for (let salon of salons) {
      if (isTodayHoliday(salon.holidays)) {
        if (salon.status !== "temporarily-closed") {
          salon.status = "temporarily-closed";
          await salon.save();
        }
      }
    }

    res.json(salons);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   REORDER SALONS
============================ */
router.put("/reorder", auth, admin, async (req, res) => {
  try {

    const bulk = req.body.order.map(o => ({
      updateOne: {
        filter: { _id: o.id, adminId: req.userId },
        update: { order: o.order, isPrimary: false }
      }
    }));

    await Salon.bulkWrite(bulk);

    // Primary always first
    await Salon.updateMany(
      { adminId: req.userId, isPrimary: true },
      { order: -1 }
    );

    res.json({ message: "Order saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   EMERGENCY CLOSE ALL
============================ */
router.put("/emergency/close-all", auth, admin, async (req, res) => {
  try {
    await Salon.updateMany(
      { adminId: req.userId },
      { status: "temporarily-closed" }
    );

    res.json({ message: "All salons temporarily closed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   REOPEN ALL
============================ */
router.put("/emergency/open-all", auth, admin, async (req, res) => {
  try {
    await Salon.updateMany(
      { adminId: req.userId },
      { status: "open" }
    );

    res.json({ message: "All salons reopened" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   UPDATE SALON
============================ */
router.put("/:id", auth, admin, async (req, res) => {
  try {

    if (req.body.isPrimary === true) {
      await Salon.updateMany(
        { adminId: req.userId },
        { isPrimary: false }
      );
    }

    const salon = await Salon.findOneAndUpdate(
      { _id: req.params.id, adminId: req.userId },
      req.body,
      { new: true }
    );

    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    res.json({ message: "Salon updated", salon });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   DELETE SALON
============================ */
router.delete("/:id", auth, admin, async (req, res) => {
  try {

    const salon = await Salon.findOneAndDelete({
      _id: req.params.id,
      adminId: req.userId
    });

    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    res.json({ message: "Salon deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
