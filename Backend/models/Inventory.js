const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  quantity: {
    type: Number,
    required: true,
    default: 0
  },

  lowStockThreshold: {
    type: Number,
    default: 10
  },

  unitPrice: {
    type: Number,
    default: 0
  },

  category: {
    type: String,
    enum: ["products", "equipment", "supplies", "other"],
    default: "products"
  },

  supplier: {
    type: String
  },

  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, {
  timestamps: true
});

// Virtual for low stock status
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

// Ensure virtuals are included in JSON
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Inventory", inventorySchema);
