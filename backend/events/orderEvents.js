const EventEmitter = require('events');

class OrderEventEmitter extends EventEmitter {}

const orderEvents = new OrderEventEmitter();

// Event names
const EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_CONFIRMED: 'order:confirmed',
  ORDER_SHIPPED: 'order:shipped',
  ORDER_DELIVERED: 'order:delivered',
  ORDER_CANCELLED: 'order:cancelled',
  ORDER_STATUS_UPDATED: 'order:status_updated',
};

module.exports = {
  orderEvents,
  EVENTS,
};