const express = require('express');
const {
    createOrder,
    getOrders,
    getPendingOrders,
    getKitchenOrders,
    approveOrder,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin, kitchen } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, createOrder)
    .get(protect, getOrders);

router.get('/pending', protect, admin, getPendingOrders);
router.get('/kitchen', protect, kitchen, getKitchenOrders);
router.put('/:id/approve', protect, admin, approveOrder);
router.put('/:id/status', protect, kitchen, updateOrderStatus);

module.exports = router;