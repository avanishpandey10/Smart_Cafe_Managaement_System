const express = require('express');
const router = express.Router();
const { exportOrders, exportMenu, exportInventory, exportStaff } = require('../controllers/exportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/orders', protect, adminOnly, exportOrders);
router.get('/menu', protect, adminOnly, exportMenu);
router.get('/inventory', protect, adminOnly, exportInventory);
router.get('/staff', protect, adminOnly, exportStaff);

module.exports = router;
