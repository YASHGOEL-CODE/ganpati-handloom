const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  const transporter = createTransporter();

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Verify Your Email - Ganpati Handloom',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #FF9933 0%, #FFB366 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #FF9933 0%, #FFB366 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Ganpati Handloom!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName},</h2>
            <p>Thank you for signing up! We're excited to have you join our community of handloom lovers.</p>
            
            <p>To complete your registration and start shopping, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This verification link will expire in <strong>${process.env.VERIFICATION_TOKEN_EXPIRY || 15} minutes</strong>.
            </div>
            
            <p>If you didn't create an account with Ganpati Handloom, please ignore this email.</p>
            
            <p>Best regards,<br>
            <strong>Ganpati Handloom Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Ganpati Handloom. All rights reserved.</p>
            <p>Authentic handloom products crafted with love by skilled artisans.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to Ganpati Handloom! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #FF9933 0%, #FFB366 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #FF9933 0%, #FFB366 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Verified Successfully!</h1>
          </div>
          <div class="content">
            <h2>Welcome aboard, ${user.fullName}! 🎊</h2>
            <p>Your email has been verified and your account is now active.</p>
            
            <p>You can now enjoy all the features of Ganpati Handloom:</p>
            <ul>
              <li>✨ Browse authentic handloom products</li>
              <li>🛍️ Shop with secure checkout</li>
              <li>📍 Save multiple delivery addresses</li>
              <li>📦 Track your orders</li>
              <li>💝 Create wishlists</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/products" class="button">Start Shopping Now</a>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Happy shopping!<br>
            <strong>Ganpati Handloom Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', user.email);
  } catch (error) {
    console.error('❌ Welcome email error:', error);
  }
};

// ✅ Order Confirmation Email
const sendOrderConfirmationEmail = async (order, user) => {
  const transporter = createTransporter();

  const orderItemsHTML = order.orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.name}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${item.price.toLocaleString()}
      </td>
    </tr>
  `
    )
    .join('');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} - Ganpati Handloom`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #FF9933 0%, #FFB366 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .order-summary {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .total-row {
            font-weight: bold;
            background: #fff3e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Thank you for your order, ${user.fullName}!</h2>
            <p>We've received your order and will process it shortly.</p>
            
            <div class="order-summary">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            </div>
            
            <h3>Items Ordered:</h3>
            <table>
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHTML}
                <tr class="total-row">
                  <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
                  <td style="padding: 10px; text-align: right;">₹${order.totalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>📍 Delivery Address:</strong></p>
              <p style="margin: 5px 0;">${order.shippingAddress.houseStreet}</p>
              <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
                 style="display: inline-block; background: linear-gradient(135deg, #FF9933 0%, #FFB366 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Track Your Order
              </a>
            </div>
            
            <p>We'll send you another email when your order ships!</p>
            
            <p>Best regards,<br>
            <strong>Ganpati Handloom Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Order confirmation email error:', error);
    return false;
  }
};

// ✅ Order Shipped Email
const sendOrderShippedEmail = async (order, user) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Shipped #${order._id.toString().slice(-8).toUpperCase()} - Ganpati Handloom`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order is On Its Way!</h1>
          </div>
          <div class="content">
            <h2>Great news, ${user.fullName}!</h2>
            <p>Your order has been shipped and is on its way to you.</p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Order ID</p>
              <p style="font-size: 24px; font-weight: bold; color: #2196F3; margin: 0;">
                #${order._id.toString().slice(-8).toUpperCase()}
              </p>
            </div>
            
            ${
              order.estimatedDelivery
                ? `<p style="text-align: center; font-size: 16px;">
                     <strong>Expected Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}
                   </p>`
                : ''
            }
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
                 style="display: inline-block; background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Track Your Order
              </a>
            </div>
            
            <p>Thank you for shopping with Ganpati Handloom!</p>
            
            <p>Best regards,<br>
            <strong>Ganpati Handloom Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Order shipped email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Order shipped email error:', error);
    return false;
  }
};

// ✅ Order Delivered Email
const sendOrderDeliveredEmail = async (order, user) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Delivered #${order._id.toString().slice(-8).toUpperCase()} - Ganpati Handloom`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Your Order Has Been Delivered!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName}!</h2>
            <p>Your order has been successfully delivered. We hope you love your purchase!</p>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Order ID</p>
              <p style="font-size: 24px; font-weight: bold; color: #4CAF50; margin: 0;">
                #${order._id.toString().slice(-8).toUpperCase()}
              </p>
              <p style="margin: 15px 0 0 0; color: #666;">
                Delivered on ${new Date(order.deliveredAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
                 style="display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #81C784 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Order Details
              </a>
            </div>
            
            <p>We'd love to hear your feedback! Please leave a review for the products you purchased.</p>
            
            <p>Thank you for choosing Ganpati Handloom!</p>
            
            <p>Best regards,<br>
            <strong>Ganpati Handloom Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Order delivered email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Order delivered email error:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,     
  sendOrderShippedEmail,          
  sendOrderDeliveredEmail,     
};