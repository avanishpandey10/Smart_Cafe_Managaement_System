const Order = require('../models/Order');
const Table = require('../models/Table');
const Menu = require('../models/Menu');
const Inventory = require('../models/Inventory');
const Coupon = require('../models/Coupon');
const { sendOrderStatusEmail } = require('../services/emailService');

const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') query.user = req.user._id;
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { tableId, items, specialInstructions, couponCode } = req.body;
    const io = req.app.get('io');

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (table.status === 'occupied') return res.status(400).json({ message: 'Table is occupied' });

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItemId);
      if (!menuItem) return res.status(404).json({ message: `Menu item not found: ${item.menuItemId}` });
      if (!menuItem.available) return res.status(400).json({ message: `${menuItem.name} is not available` });
      const lineTotal = menuItem.price * item.quantity;
      subtotal += lineTotal;
      orderItems.push({ menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: item.quantity });
    }

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon' });
      if (coupon.validUntil < new Date()) return res.status(400).json({ message: 'Coupon has expired' });
      if (coupon.validFrom > new Date()) return res.status(400).json({ message: 'Coupon is not yet valid' });
      if (subtotal < coupon.minOrderAmount) return res.status(400).json({ message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon usage limit reached' });

      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.discountValue;
      }
      appliedCoupon = coupon;
    }

    const totalAmount = Math.max(0, subtotal - discount);

    const order = await Order.create({
      user: req.user._id,
      table: tableId,
      items: orderItems,
      subtotal,
      discount,
      totalAmount,
      couponCode: couponCode || '',
      specialInstructions: specialInstructions || '',
    });

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    table.status = 'occupied';
    table.currentOrder = order._id;
    await table.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name');

    io.emit('new_order', populatedOrder);
    io.to('admin').emit('new_order', populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const io = req.app.get('io');
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('table', 'tableNumber').populate('items.menuItem', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const allowedTransitions = {
      pending: ['approved', 'cancelled'],
      approved: ['preparing', 'cancelled'],
      preparing: ['ready'],
      ready: ['completed'],
      completed: [],
      cancelled: [],
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ message: `Cannot transition from ${order.status} to ${status}` });
    }

    order.status = status;

    if (status === 'approved') {
      order.approvedAt = new Date();
      // Deduct inventory for each item
      for (const item of order.items) {
        const menuItem = await Menu.findById(item.menuItem._id || item.menuItem).populate('inventoryItem');
        if (menuItem && menuItem.inventoryItem) {
          const inv = await Inventory.findById(menuItem.inventoryItem);
          if (inv) {
            inv.currentStock = Math.max(0, inv.currentStock - item.quantity);
            await inv.save();
            if (inv.currentStock <= inv.minimumStock) {
              io.to('admin').emit('low_stock_alert', { item: inv.name, stock: inv.currentStock, minimum: inv.minimumStock });
            }
          }
        }
      }
    }

    if (status === 'completed') {
      order.completedAt = new Date();
      const table = await Table.findById(order.table._id || order.table);
      if (table) {
        table.status = 'available';
        table.currentOrder = null;
        await table.save();
      }
    }

    if (status === 'cancelled') {
      const table = await Table.findById(order.table._id || order.table);
      if (table) {
        table.status = 'available';
        table.currentOrder = null;
        await table.save();
      }
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name');

    // Send email notification
    if (order.user && order.user.email) {
      sendOrderStatusEmail(
        order.user.email,
        order.user.name,
        order._id,
        status,
        order.items,
        order.totalAmount
      );
    }

    // Emit socket events
    io.emit('order_updated', updatedOrder);
    io.to(`user_${order.user._id}`).emit('order_status_changed', { orderId: order._id, status, order: updatedOrder });
    io.to('kitchen').emit('order_updated', updatedOrder);
    io.to('admin').emit('order_updated', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const io = req.app.get('io');
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('table', 'tableNumber');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'user' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'approved'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    await order.save();

    const table = await Table.findById(order.table._id || order.table);
    if (table) {
      table.status = 'available';
      table.currentOrder = null;
      await table.save();
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name');

    io.emit('order_updated', updatedOrder);
    io.to('admin').emit('order_updated', updatedOrder);
    io.to('kitchen').emit('order_updated', updatedOrder);

    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder };
