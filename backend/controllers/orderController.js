const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Table = require('../models/Table');

// @desc    Create new order
// @route   POST /api/orders
const createOrder = async (req, res) => {
    try {
        const { items, tableNumber } = req.body;

        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await Menu.findById(item.menuItem);
            if (!menuItem) {
                return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });
            }
            
            const itemTotal = menuItem.price * item.quantity;
            totalAmount += itemTotal;
            
            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                quantity: item.quantity,
                price: menuItem.price
            });
        }

        const order = await Order.create({
            user: req.user._id,
            tableNumber,
            items: orderItems,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending'
        });

        // Update table status
        await Table.findOneAndUpdate(
            { tableNumber },
            { status: 'occupied', currentOrder: order._id }
        );

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
const getOrders = async (req, res) => {
    try {
        let query = {};
        
        // If user is not admin, only show their orders
        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('approvedBy', 'name')
            .sort('-createdAt');
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending orders (for admin)
// @route   GET /api/orders/pending
const getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'pending' })
            .populate('user', 'name email')
            .sort('-createdAt');
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get kitchen orders
// @route   GET /api/orders/kitchen
const getKitchenOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            status: { $in: ['approved', 'preparing'] } 
        })
            .populate('user', 'name')
            .sort('-approvedAt');
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve order (admin)
// @route   PUT /api/orders/:id/approve
const approveOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'approved';
        order.approvedBy = req.user._id;
        order.approvedAt = Date.now();

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status (kitchen)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        
        // If order is completed, free the table
        if (status === 'completed') {
            await Table.findOneAndUpdate(
                { tableNumber: order.tableNumber },
                { status: 'available', currentOrder: null }
            );
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getPendingOrders,
    getKitchenOrders,
    approveOrder,
    updateOrderStatus
};