const express = require('express');
const router = express.Router();
const { getReservations, createReservation, updateReservation, cancelReservation, getAvailableSlots } = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getReservations);
router.get('/available-slots', protect, getAvailableSlots);
router.post('/', protect, createReservation);
router.put('/:id', protect, adminOnly, updateReservation);
router.put('/:id/cancel', protect, cancelReservation);

module.exports = router;
