const express = require('express');
const router = express.Router();
const { getInventory, getLowStock, createInventoryItem, updateInventoryItem, restockItem, deleteInventoryItem } = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getInventory);
router.get('/low-stock', protect, adminOnly, getLowStock);
router.post('/', protect, adminOnly, createInventoryItem);
router.put('/:id', protect, adminOnly, updateInventoryItem);
router.post('/:id/restock', protect, adminOnly, restockItem);
router.delete('/:id', protect, adminOnly, deleteInventoryItem);

module.exports = router;
