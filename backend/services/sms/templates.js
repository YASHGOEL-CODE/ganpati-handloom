// SMS Templates
const templates = {
  order_confirmation: {
    name: 'Order Confirmation',
    getMessage: (data) => {
      const { orderId, customerName, totalAmount, items } = data;
      return `Dear ${customerName}, your order #${orderId} for Rs.${totalAmount} has been confirmed. ${items} items ordered. Track at ganpatihandloom.com. Thank you!`;
    },
  },

  order_shipped: {
    name: 'Order Shipped',
    getMessage: (data) => {
      const { orderId, customerName, trackingUrl } = data;
      return `Dear ${customerName}, your order #${orderId} has been shipped! Track your order: ${trackingUrl || 'ganpatihandloom.com/orders'}. Delivery in 5-7 days.`;
    },
  },

  order_delivered: {
    name: 'Order Delivered',
    getMessage: (data) => {
      const { orderId, customerName } = data;
      return `Dear ${customerName}, your order #${orderId} has been delivered! We hope you love your handloom products. Please share your review at ganpatihandloom.com. Thank you!`;
    },
  },

  order_cancelled: {
    name: 'Order Cancelled',
    getMessage: (data) => {
      const { orderId, customerName, reason } = data;
      return `Dear ${customerName}, your order #${orderId} has been cancelled. ${reason ? 'Reason: ' + reason : ''} Refund will be processed in 5-7 days. Contact support for help.`;
    },
  },

  otp_verification: {
    name: 'OTP Verification',
    getMessage: (data) => {
      const { otp, expiryMinutes } = data;
      return `Your Ganpati Handloom verification code is ${otp}. Valid for ${expiryMinutes || 10} minutes. Do not share this code with anyone.`;
    },
  },

  password_reset: {
    name: 'Password Reset',
    getMessage: (data) => {
      const { customerName, resetUrl } = data;
      return `Dear ${customerName}, reset your Ganpati Handloom password: ${resetUrl}. Link valid for 10 minutes. If you didn't request this, ignore this message.`;
    },
  },

  custom: {
    name: 'Custom Message',
    getMessage: (data) => {
      return data.message || 'Custom message from Ganpati Handloom';
    },
  },
};

// Get template message
const getTemplate = (templateName, data) => {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }
  return template.getMessage(data);
};

// Validate phone number
const validatePhone = (phone, countryCode = '+91') => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with country code, remove it
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Should be 10 digits for India
  if (cleaned.length !== 10) {
    throw new Error('Invalid phone number. Must be 10 digits.');
  }

  return `${countryCode}${cleaned}`;
};

// Format order ID for display
const formatOrderId = (orderId) => {
  if (typeof orderId === 'string') {
    return orderId.slice(-8).toUpperCase();
  }
  return orderId.toString().slice(-8).toUpperCase();
};

module.exports = {
  templates,
  getTemplate,
  validatePhone,
  formatOrderId,
};