const { Parser } = require('json2csv');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Inventory = require('../models/Inventory');
const Staff = require('../models/Staff');

const exportOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('table', 'tableNumber')
      .lean();

    const data = orders.map(o => ({
      orderId: o._id.toString().slice(-8).toUpperCase(),
      customerName: o.user?.name || 'N/A',
      customerEmail: o.user?.email || 'N/A',
      tableNumber: o.table?.tableNumber || 'N/A',
      items: o.items.map(i => `${i.name}(${i.quantity})`).join(', '),
      subtotal: o.subtotal,
      discount: o.discount,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentStatus: o.paymentStatus,
      couponCode: o.couponCode || '',
      createdAt: new Date(o.createdAt).toLocaleString(),
    }));

    const fields = ['orderId', 'customerName', 'customerEmail', 'tableNumber', 'items', 'subtotal', 'discount', 'totalAmount', 'status', 'paymentStatus', 'couponCode', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportMenu = async (req, res) => {
  try {
    const items = await Menu.find().lean();
    const data = items.map(i => ({
      name: i.name,
      category: i.category,
      price: i.price,
      available: i.available ? 'Yes' : 'No',
      averageRating: i.averageRating || 0,
      totalRatings: i.totalRatings || 0,
      description: i.description,
    }));

    const fields = ['name', 'category', 'price', 'available', 'averageRating', 'totalRatings', 'description'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="menu.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportInventory = async (req, res) => {
  try {
    const items = await Inventory.find().lean();
    const data = items.map(i => ({
      name: i.name,
      unit: i.unit,
      currentStock: i.currentStock,
      minimumStock: i.minimumStock,
      costPerUnit: i.costPerUnit,
      supplier: i.supplier,
      isLowStock: i.currentStock <= i.minimumStock ? 'Yes' : 'No',
      lastRestocked: i.lastRestocked ? new Date(i.lastRestocked).toLocaleDateString() : 'Never',
    }));

    const fields = ['name', 'unit', 'currentStock', 'minimumStock', 'costPerUnit', 'supplier', 'isLowStock', 'lastRestocked'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="inventory.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportStaff = async (req, res) => {
  try {
    const staff = await Staff.find().lean();
    const data = staff.map(s => ({
      name: s.name,
      email: s.email,
      role: s.role,
      phone: s.phone || '',
      salary: s.salary,
      active: s.active ? 'Yes' : 'No',
      totalShifts: s.shifts?.length || 0,
      totalHours: s.shifts?.reduce((acc, sh) => acc + (sh.hoursWorked || 0), 0).toFixed(2) || 0,
    }));

    const fields = ['name', 'email', 'role', 'phone', 'salary', 'active', 'totalShifts', 'totalHours'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="staff.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { exportOrders, exportMenu, exportInventory, exportStaff };
