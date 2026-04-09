const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  unit: { type: String, required: true, default: 'units' },
  currentStock: { type: Number, required: true, default: 0 },
  minimumStock: { type: Number, required: true, default: 10 },
  costPerUnit: { type: Number, default: 0 },
  supplier: { type: String, default: '' },
  lastRestocked: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

inventorySchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.minimumStock;
});

inventorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
