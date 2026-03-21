const express = require('express');
const { getTables, createTables, updateTable } = require('../controllers/tableController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, getTables)
    .post(protect, admin, createTables);

router.route('/:id')
    .put(protect, updateTable);

module.exports = router;