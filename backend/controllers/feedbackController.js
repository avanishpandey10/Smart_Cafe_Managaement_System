const Feedback = require('../models/Feedback');
const Menu = require('../models/Menu');
const Order = require('../models/Order');

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'name email')
      .populate('order', 'totalAmount createdAt')
      .populate('menuItem', 'name')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { orderId, menuItemId, rating, comment, type } = req.body;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (order.status !== 'completed') {
        return res.status(400).json({ message: 'Can only rate completed orders' });
      }
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      order: orderId || undefined,
      menuItem: menuItemId || undefined,
      rating,
      comment,
      type: type || 'order',
    });

    // Update menu item average rating if item feedback
    if (menuItemId) {
      const allItemFeedback = await Feedback.find({ menuItem: menuItemId });
      const avgRating = allItemFeedback.reduce((acc, f) => acc + f.rating, 0) / allItemFeedback.length;
      await Menu.findByIdAndUpdate(menuItemId, {
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: allItemFeedback.length,
      });
    }

    const populated = await Feedback.findById(feedback._id)
      .populate('user', 'name email')
      .populate('order')
      .populate('menuItem', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate('order')
      .populate('menuItem', 'name')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllFeedback, createFeedback, getUserFeedback, deleteFeedback };
