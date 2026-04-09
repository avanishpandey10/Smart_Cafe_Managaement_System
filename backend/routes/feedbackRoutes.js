// feedbackRoutes.js content - save to backend/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { getAllFeedback, createFeedback, getUserFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getAllFeedback);
router.get('/mine', protect, getUserFeedback);
router.post('/', protect, createFeedback);
router.delete('/:id', protect, adminOnly, deleteFeedback);

module.exports = router;
