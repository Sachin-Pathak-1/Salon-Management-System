const express = require('express');
const Plan = require('../models/Plans');
const User = require("../models/User");
const Salon = require("../models/Salon");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/plans - Get all plans
router.get('/', auth(["admin"]), async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/plans/selection - Get admin plan selection + salon counts
router.get("/selection", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const selectedPlan = user.selectedPlanId
      ? await Plan.findById(user.selectedPlanId)
      : null;

    const salonsAdded = await Salon.countDocuments({ adminId: req.user.id });
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

// GET /api/plans/billing-history - Get admin billing history
router.get("/billing-history", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("billingHistory.planId", "name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const history = Array.isArray(user.billingHistory) ? user.billingHistory : [];
    let normalized = [...history]
      .sort((a, b) => new Date(b.issueDate || 0) - new Date(a.issueDate || 0))
      .map((entry) => ({
        id: entry._id,
        planId: entry.planId?._id || entry.planId || null,
        billFor: entry.planName || entry.planId?.name || "Plan Subscription",
        issueDate: entry.issueDate,
        dueDate: entry.dueDate,
        total: Number(entry.totalPrice) || 0,
        status: entry.status || "Paid",
        branchCount: Number(entry.branchCount) || 0,
        pricePerBranch: Number(entry.pricePerBranch) || 0
      }));

    if (normalized.length === 0 && user.selectedPlanId) {
      const selectedPlan = await Plan.findById(user.selectedPlanId).select("name");
      normalized = [
        {
          id: `legacy-${user._id}`,
          planId: user.selectedPlanId,
          billFor: `${selectedPlan?.name || "Plan"} Subscription`,
          issueDate: user.selectedPlanAt || user.updatedAt,
          dueDate: user.selectedPlanAt || user.updatedAt,
          total: (Number(user.planPricePerBranch) || 0) * (Number(user.planBranchLimit) || 0),
          status: "Paid",
          branchCount: Number(user.planBranchLimit) || 0,
          pricePerBranch: Number(user.planPricePerBranch) || 0
        }
      ];
    }

    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/plans/select - Save admin plan selection
router.post("/select", auth(["admin"]), async (req, res) => {
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

    const existingSalons = await Salon.countDocuments({ adminId: req.user.id });
    if (existingSalons > count) {
      return res.status(400).json({
        message: "You already have more salons than this limit"
      });
    }

    const selectedAt = new Date();
    const dueDate = new Date(selectedAt);
    dueDate.setDate(dueDate.getDate() + 7);
    const totalPrice = plan.price * count;

    await User.findByIdAndUpdate(
      req.user.id,
      {
        selectedPlanId: plan._id,
        planBranchLimit: count,
        planPricePerBranch: plan.price,
        selectedPlanAt: selectedAt,
        $push: {
          billingHistory: {
            planId: plan._id,
            planName: `${plan.name} Subscription`,
            branchCount: count,
            pricePerBranch: plan.price,
            totalPrice,
            status: "Paid",
            issueDate: selectedAt,
            dueDate,
            paidAt: selectedAt
          }
        }
      },
      { new: true }
    );

    res.json({
      message: "Plan selected successfully",
      planId: plan._id,
      planBranchLimit: count,
      pricePerBranch: plan.price,
      totalPrice
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
