const Order = require('../models/Order');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/razorpayService');

const initiatePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const receipt = `order_${order._id.toString().slice(-8)}`;
    const razorpayOrder = await createRazorpayOrder(order.totalAmount, 'INR', receipt);

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderDetails: {
        _id: order._id,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return res.status(400).json({ message: 'Invalid payment signature' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = 'paid';
    order.paymentId = razorpay_payment_id;
    await order.save();

    const io = req.app.get('io');
    io.emit('payment_completed', { orderId: order._id, paymentId: razorpay_payment_id });

    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Simulate payment for testing (when Razorpay is not configured)
const simulatePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.paymentStatus = 'paid';
    order.paymentId = `sim_pay_${Date.now()}`;
    await order.save();

    const io = req.app.get('io');
    io.emit('payment_completed', { orderId: order._id });

    res.json({ message: 'Payment simulated successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { initiatePayment, verifyPayment, simulatePayment };
