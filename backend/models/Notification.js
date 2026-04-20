const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['order', 'payment', 'offer', 'system', 'stock', 'user'],
      default: 'system',
    },
    // 'user' = customer notification, 'admin' = admin notification
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    // For user-specific notifications (null = broadcast to all users)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Optional deep-link (e.g. /orders/abc123)
    actionLink: {
      type: String,
      default: null,
    },
    // Extra metadata (orderId, productId, etc.)
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
notificationSchema.index({ role: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);