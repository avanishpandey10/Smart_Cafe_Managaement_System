const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  hoursWorked: { type: Number, default: 0 },
  date: { type: String, required: true },
});

const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true, default: 'waiter' },
  phone: { type: String },
  salary: { type: Number, default: 0 },
  shifts: [shiftSchema],
  isClockedIn: { type: Boolean, default: false },
  lastClockIn: { type: Date },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Staff', staffSchema);
