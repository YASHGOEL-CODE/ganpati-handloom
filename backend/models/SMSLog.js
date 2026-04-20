const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      required: true,
      enum: ['order_confirmation', 'order_shipped', 'order_delivered', 'custom'],
    },
    provider: {
      type: String,
      required: true,
      enum: ['msg91', 'twilio', 'aws_sns', 'mock'],
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'delivered'],
      default: 'pending',
    },
    providerId: {
      type: String, // Message ID from provider
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    lastAttemptAt: Date,
    sentAt: Date,
    deliveredAt: Date,
    failedAt: Date,
    errorMessage: String,
    cost: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
smsLogSchema.index({ user: 1, createdAt: -1 });
smsLogSchema.index({ order: 1 });
smsLogSchema.index({ status: 1, createdAt: -1 });
smsLogSchema.index({ provider: 1, status: 1 });

module.exports = mongoose.model('SMSLog', smsLogSchema);