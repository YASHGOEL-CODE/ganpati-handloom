const { orderEvents, EVENTS } = require('../events/orderEvents');
const smsService = require('./sms/SMSService');

// Listen to order events and send SMS
orderEvents.on(EVENTS.ORDER_CREATED, async ({ order, user }) => {
  try {
    console.log(`📦 Order created event: ${order._id}`);
    if (user.phone) {
      await smsService.sendOrderConfirmation(order, user);
    }
  } catch (error) {
    console.error('Error in ORDER_CREATED handler:', error);
  }
});

orderEvents.on(EVENTS.ORDER_SHIPPED, async ({ order, user }) => {
  try {
    console.log(`📦 Order shipped event: ${order._id}`);
    if (user.phone) {
      await smsService.sendOrderShipped(order, user);
    }
  } catch (error) {
    console.error('Error in ORDER_SHIPPED handler:', error);
  }
});

orderEvents.on(EVENTS.ORDER_DELIVERED, async ({ order, user }) => {
  try {
    console.log(`📦 Order delivered event: ${order._id}`);
    if (user.phone) {
      await smsService.sendOrderDelivered(order, user);
    }
  } catch (error) {
    console.error('Error in ORDER_DELIVERED handler:', error);
  }
});

module.exports = { orderEvents, EVENTS };