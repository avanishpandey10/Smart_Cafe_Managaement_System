const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, adminOnly, kitchenOrAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.put('/:id/status', protect, kitchenOrAdmin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
