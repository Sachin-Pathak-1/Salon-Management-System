const express = require("express");
const Salon = require("../models/Salon");

const router = express.Router();

/* ============================
   ADD SALON
============================ */
router.post("/add", async (req, res) => {
  try {
    const {
      name,
      address,
      contact,
      email,
      ownerName,
      openingTime,
      closingTime,
      logo
    } = req.body;

    if (!name || !address || !contact) {
      return res.status(400).json({
        message: "Name, address and contact required"
      });
    }

    const salon = await Salon.create({
      name,
      address,
      contact,
      email,
      ownerName,
      openingTime,
      closingTime,
      logo
    });

    res.status(201).json({
      message: "Salon added successfully",
      salon
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   GET ALL SALONS
============================ */
router.get("/get", async (req, res) => {
  try {
        const salons = await Salon.findById(req.salonId);
        res.json({
          name: salons.name,
          address: salons.address,
          contact: salons.contact,

          email: salons.email,
          ownerName: salons.ownerName,
          openingTime: salons.openingTime,
          closingTime: salons.closingTime,
          logo: salons.logo
        });
  }
  catch(err ){
    res.status(500).json({ message: "Server error"});
  }
});

/* ============================
   UPDATE SALON
============================ */
router.put("/:id", async (req, res) => {
  try {
    const salon = await Salon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Salon updated",
      salon
    });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   DELETE SALON
============================ */
router.delete("/:id", async (req, res) => {
  try {
    await Salon.findByIdAndDelete(req.params.id);
    res.json({ message: "Salon deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
