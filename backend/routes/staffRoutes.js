const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff, deleteStaff, clockIn, clockOut, getStaffShifts } = require('../controllers/staffController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getStaff);
router.post('/', protect, adminOnly, createStaff);
router.put('/:id', protect, adminOnly, updateStaff);
router.delete('/:id', protect, adminOnly, deleteStaff);
router.post('/:id/clock-in', protect, adminOnly, clockIn);
router.post('/:id/clock-out', protect, adminOnly, clockOut);
router.get('/:id/shifts', protect, adminOnly, getStaffShifts);

module.exports = router;
