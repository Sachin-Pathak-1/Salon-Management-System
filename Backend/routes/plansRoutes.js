const express = require('express');
const Plan = require('../models/Plans');
const User = require("../models/User");
const Salon = require("../models/Salon");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// GET /api/plans - Get all plans
router.get('/', auth, admin, async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/plans/selection - Get admin plan selection + salon counts
router.get("/selection", auth, admin, async (req, res) => {
  try {
    console.log("GET /selection - User ID:", req.userId);
    const user = await User.findById(req.userId);
    if (!user) {
      console.log("User not found for ID:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user.name, "Role:", user.role, "Selected Plan:", user.selectedPlanId);

    const selectedPlan = user.selectedPlanId
      ? await Plan.findById(user.selectedPlanId)
      : null;

    const salonsAdded = await Salon.countDocuments({ adminId: req.userId });
    const salonLimit = user.planBranchLimit || 0;
    const remaining = salonLimit ? Math.max(salonLimit - salonsAdded, 0) : 0;

    const response = {
      selectedPlan,
      salonLimit,
      salonsAdded,
      salonsRemaining: remaining,
      pricePerBranch: user.planPricePerBranch || 0,
      totalPrice: (user.planPricePerBranch || 0) * (user.planBranchLimit || 0),
      selectedPlanAt: user.selectedPlanAt
    };
    console.log("Response:", response);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/plans/select - Save admin plan selection
router.post("/select", auth, admin, async (req, res) => {
  try {
    const { planId, branchCount } = req.body;

    const count = Number(branchCount);
    if (!planId || !Number.isFinite(count) || count < 1) {
      return res.status(400).json({ message: "Plan and branch count required" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (plan.maxBranches && plan.maxBranches > 0 && count > plan.maxBranches) {
      return res.status(400).json({
        message: `Max ${plan.maxBranches} salons allowed for this plan`
      });
    }

    const existingSalons = await Salon.countDocuments({ adminId: req.userId });
    if (existingSalons > count) {
      return res.status(400).json({
        message: "You already have more salons than this limit"
      });
    }

    await User.findByIdAndUpdate(
      req.userId,
      {
        selectedPlanId: plan._id,
        planBranchLimit: count,
        planPricePerBranch: plan.price,
        selectedPlanAt: new Date()
      },
      { new: true }
    );

    res.json({
      message: "Plan selected successfully",
      planId: plan._id,
      planBranchLimit: count,
      pricePerBranch: plan.price,
      totalPrice: plan.price * count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/plans - Create a new plan (admin only, but for now public)
router.post('/', async (req, res) => {
  try {
    const { name, maxBranches, price, description } = req.body;

    if (!name || !price || !description) {
      return res.status(400).json({ message: 'Name, price, and description are required' });
    }

    const plan = await Plan.create({
      name,
      maxBranches: maxBranches || 0,
      price,
      description
    });

    res.status(201).json({
      message: 'Plan created successfully',
      plan
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Plan name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

module.exports = router;
