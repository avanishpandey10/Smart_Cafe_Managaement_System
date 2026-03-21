const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/tables
const getTables = async (req, res) => {
    try {
        const tables = await Table.find().sort('tableNumber');
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create tables (admin)
// @route   POST /api/tables
const createTables = async (req, res) => {
    try {
        const { tables } = req.body; // Array of tables
        const createdTables = await Table.insertMany(tables);
        res.status(201).json(createdTables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update table status
// @route   PUT /api/tables/:id
const updateTable = async (req, res) => {
    try {
        const table = await Table.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        
        res.json(table);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTables, createTables, updateTable };