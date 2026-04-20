// This file is now deprecated - using the new SMS service
// Keeping for backward compatibility

const smsService = require('../services/sms/SMSService');

// Redirect to new SMS service
const sendOrderConfirmationSMS = async (phone, orderDetails) => {
  return await smsService.sendSMS({
    phone,
    template: 'order_confirmation',
    data: orderDetails,
  });
};

const sendOrderShippedSMS = async (phone, orderDetails) => {
  return await smsService.sendSMS({
    phone,
    template: 'order_shipped',
    data: orderDetails,
  });
};

const sendOrderDeliveredSMS = async (phone, orderDetails) => {
  return await smsService.sendSMS({
    phone,
    template: 'order_delivered',
    data: orderDetails,
  });
};

module.exports = {
  sendOrderConfirmationSMS,
  sendOrderShippedSMS,
  sendOrderDeliveredSMS,
};