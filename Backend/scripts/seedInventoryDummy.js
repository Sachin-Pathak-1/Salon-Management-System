require("dotenv").config();
const mongoose = require("mongoose");
const Salon = require("../models/Salon");
const Inventory = require("../models/Inventory");

async function seedInventoryDummy() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000
  });

  const salons = await Salon.find().sort({ createdAt: 1 });
  if (!salons.length) {
    console.log("NO_SALON_FOUND");
    return;
  }

  const baseItems = [
    {
      name: "Dummy Shampoo 500ml",
      description: "Dummy product for testing inventory module",
      quantity: 24,
      lowStockThreshold: 8,
      unitPrice: 320,
      category: "products",
      supplier: "Test Supplier A",
      status: "active"
    },
    {
      name: "Dummy Hair Serum",
      description: "Dummy product for testing inventory module",
      quantity: 6,
      lowStockThreshold: 10,
      unitPrice: 540,
      category: "products",
      supplier: "Test Supplier A",
      status: "active"
    },
    {
      name: "Dummy Towels Pack",
      description: "Dummy supplies item for testing",
      quantity: 40,
      lowStockThreshold: 15,
      unitPrice: 80,
      category: "supplies",
      supplier: "Test Supplier B",
      status: "active"
    },
    {
      name: "Dummy Trimmer",
      description: "Dummy equipment item for testing",
      quantity: 3,
      lowStockThreshold: 2,
      unitPrice: 2200,
      category: "equipment",
      supplier: "Test Supplier C",
      status: "active"
    },
    {
      name: "Dummy Disposable Gloves",
      description: "Dummy supplies item for testing",
      quantity: 10,
      lowStockThreshold: 20,
      unitPrice: 12,
      category: "supplies",
      supplier: "Test Supplier B",
      status: "active"
    }
  ];

  for (const salon of salons) {
    const items = baseItems.map((item) => ({ ...item, salonId: salon._id }));
    const names = items.map((item) => item.name);
    await Inventory.deleteMany({ salonId: salon._id, name: { $in: names } });
    const inserted = await Inventory.insertMany(items);

    console.log(`SEEDED_SALON_ID=${salon._id.toString()}`);
    console.log(`SEEDED_SALON_NAME=${salon.name}`);
    console.log(`INSERTED_COUNT=${inserted.length}`);
  }
}

seedInventoryDummy()
  .catch((err) => {
    console.error("SEED_ERROR", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.error("DISCONNECT_ERROR", err.message);
    }
  });
