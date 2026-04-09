const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOrderStatusEmail = async (userEmail, userName, orderId, status, items, totalAmount) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured, skipping email notification');
      return;
    }

    const transporter = createTransporter();

    const statusMessages = {
      approved: 'Your order has been approved and will be prepared shortly.',
      preparing: 'Your order is now being prepared in our kitchen.',
      ready: 'Your order is ready! Please wait for it to be served.',
      completed: 'Your order has been completed. Thank you for visiting!',
      cancelled: 'Your order has been cancelled.',
    };

    const itemsList = items.map(i => `<li>${i.name} x${i.quantity} — ₹${i.price * i.quantity}</li>`).join('');

    const mailOptions = {
      from: `"Smart Café" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order #${orderId.toString().slice(-6).toUpperCase()} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #2d6a4f; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">☕ Smart Café</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <h2 style="color: #333;">Hello ${userName}!</h2>
            <p style="color: #555; font-size: 16px;">${statusMessages[status] || 'Your order status has been updated.'}</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #2d6a4f; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> #${orderId.toString().slice(-6).toUpperCase()}</p>
              <p><strong>Status:</strong> <span style="color: #2d6a4f; font-weight: bold;">${status.toUpperCase()}</span></p>
              <ul style="list-style: none; padding: 0;">${itemsList}</ul>
              <p style="font-size: 18px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">Total: ₹${totalAmount}</p>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">Thank you for choosing Smart Café!</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail} for order ${orderId}`);
  } catch (error) {
    console.error('Email sending error:', error.message);
  }
};

module.exports = { sendOrderStatusEmail };
