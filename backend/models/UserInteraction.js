const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return !this.sessionId;
      },
    },
    sessionId: {
      type: String,
      required: function() {
        return !this.user;
      },
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    interactionType: {
      type: String,
      enum: ['view', 'click', 'add_to_cart', 'add_to_wishlist', 'purchase', 'remove_from_cart', 'remove_from_wishlist'],
      required: true,
    },
    interactionWeight: {
      type: Number,
      default: function() {
        const weights = {
          view: 1,
          click: 2,
          add_to_cart: 5,
          add_to_wishlist: 4,
          purchase: 10,
          remove_from_cart: -2,
          remove_from_wishlist: -1,
        };
        return weights[this.interactionType] || 1;
      },
    },
    metadata: {
      timeSpent: Number,
      scrollDepth: Number,
      source: String,
      deviceType: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimization
userInteractionSchema.index({ user: 1, timestamp: -1 });
userInteractionSchema.index({ sessionId: 1, timestamp: -1 });
userInteractionSchema.index({ product: 1, interactionType: 1 });
userInteractionSchema.index({ timestamp: -1 });
userInteractionSchema.index({ user: 1, product: 1, interactionType: 1 });

// Compound index for trending products
userInteractionSchema.index({ timestamp: -1, interactionType: 1, interactionWeight: -1 });

module.exports = mongoose.model('UserInteraction', userInteractionSchema);