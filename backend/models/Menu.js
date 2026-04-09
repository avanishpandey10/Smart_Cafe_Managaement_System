const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['Beverages', 'Snacks', 'Meals', 'Desserts', 'Specials'] },
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
  inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Menu', menuSchema);
