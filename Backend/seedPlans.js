const mongoose = require('mongoose');
const Plan = require('./models/Plans');
require('dotenv').config();

async function seedPlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    // Seed new plans
    const plans = [
      {
        name: 'Basic',
        maxBranches: 5,
        price: 29.99,
        description: 'Perfect for small businesses with up to 5 salon branches.'
      },
      {
        name: 'Standard',
        maxBranches: 15,
        price: 79.99,
        description: 'Ideal for growing businesses with up to 15 salon branches.'
      },
      {
        name: 'Premium',
        maxBranches: 0, // 0 means unlimited
        price: 149.99,
        description: 'Unlimited salon branches for large enterprises.'
      }
    ];

    await Plan.insertMany(plans);
    console.log('Plans seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();
