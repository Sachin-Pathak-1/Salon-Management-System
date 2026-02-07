const express = require('express');
const Plan = require('../models/Plans');

const router = express.Router();

// GET /api/plans - Get all plans
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
