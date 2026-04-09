const Order = require('../models/Order');
const Menu = require('../models/Menu');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, todayOrders, totalRevenue, todayRevenue, totalUsers, menuCount] = await Promise.all([
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } }),
      Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: today, $lt: tomorrow }, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      User.countDocuments({ role: 'user' }),
      Menu.countDocuments({ available: true }),
    ]);

    res.json({
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalUsers,
      menuCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesByPeriod = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate, groupFormat;

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      groupFormat = '%Y-%m-%d';
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupFormat = '%Y-%m-%d';
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      groupFormat = '%Y-%m';
    } else {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      groupFormat = '%Y-%m-%d';
    }

    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $in: ['completed', 'approved', 'preparing', 'ready'] } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPopularItems = async (req, res) => {
  try {
    const popular = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);
    res.json(popular);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRevenueByCategory = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menus',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuDetails',
        },
      },
      { $unwind: { path: '$menuDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$menuDetails.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getSalesByPeriod, getPopularItems, getRevenueByCategory };
