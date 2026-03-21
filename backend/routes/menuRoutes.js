const express = require('express');
const {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getMenuItems)
    .post(protect, admin, createMenuItem);

router.route('/:id')
    .put(protect, admin, updateMenuItem)
    .delete(protect, admin, deleteMenuItem);

module.exports = router;