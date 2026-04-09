const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment, simulatePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate/:orderId', protect, initiatePayment);
router.post('/verify', protect, verifyPayment);
router.post('/simulate/:orderId', protect, simulatePayment);

module.exports = router;
