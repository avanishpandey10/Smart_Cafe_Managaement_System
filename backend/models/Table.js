const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  qrCode: { type: String, default: '' },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Table', tableSchema);
