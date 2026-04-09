const express = require('express');
const router = express.Router();
const { getTables, createTable, updateTable, deleteTable, regenerateQR } = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getTables);
router.post('/', protect, adminOnly, createTable);
router.put('/:id', protect, adminOnly, updateTable);
router.delete('/:id', protect, adminOnly, deleteTable);
router.post('/:id/qr', protect, adminOnly, regenerateQR);

module.exports = router;
