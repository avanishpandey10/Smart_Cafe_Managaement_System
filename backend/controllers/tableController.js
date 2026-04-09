const Table = require('../models/Table');
const QRCode = require('qrcode');

const getTables = async (req, res) => {
  try {
    const tables = await Table.find().populate('currentOrder');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const existing = await Table.findOne({ tableNumber });
    if (existing) return res.status(400).json({ message: 'Table number already exists' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrUrl = `${frontendUrl}/order-table?table=${tableNumber}`;
    const qrCode = await QRCode.toDataURL(qrUrl);

    const table = await Table.create({ tableNumber, capacity: capacity || 4, qrCode });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const regenerateQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrUrl = `${frontendUrl}/order-table?table=${table.tableNumber}`;
    table.qrCode = await QRCode.toDataURL(qrUrl);
    await table.save();
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTables, createTable, updateTable, deleteTable, regenerateQR };
