const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesByPeriod, getPopularItems, getRevenueByCategory } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/sales', protect, adminOnly, getSalesByPeriod);
router.get('/popular', protect, adminOnly, getPopularItems);
router.get('/revenue-by-category', protect, adminOnly, getRevenueByCategory);

module.exports = router;
