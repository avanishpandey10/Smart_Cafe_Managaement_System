const Staff = require('../models/Staff');

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ active: true }).populate('user', 'name email');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Staff deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clockIn = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    if (staff.isClockedIn) return res.status(400).json({ message: 'Already clocked in' });

    const today = new Date().toISOString().split('T')[0];
    staff.shifts.push({ clockIn: new Date(), date: today });
    staff.isClockedIn = true;
    staff.lastClockIn = new Date();
    await staff.save();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clockOut = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    if (!staff.isClockedIn) return res.status(400).json({ message: 'Not clocked in' });

    const lastShift = staff.shifts[staff.shifts.length - 1];
    if (lastShift && !lastShift.clockOut) {
      lastShift.clockOut = new Date();
      const ms = lastShift.clockOut - lastShift.clockIn;
      lastShift.hoursWorked = Math.round((ms / 3600000) * 100) / 100;
    }
    staff.isClockedIn = false;
    await staff.save();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStaffShifts = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff.shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStaff, createStaff, updateStaff, deleteStaff, clockIn, clockOut, getStaffShifts };
