const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    images: [
      {
        type: String,
        default: 'https://via.placeholder.com/500x500.png?text=Ganpati+Handloom',
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    productType: {
      type: String,
      enum: ['bedsheet', 'pillow', 'sofa-cover', 'blanket', 'quilt', 'curtain', 'door-mat', 'other'],
      required: true,
    },
    fabricType: {
      type: String,
      enum: ['cotton', 'silk', 'wool', 'blended', 'linen', 'synthetic'],
      required: true,
    },
    size: {
      type: String,
      enum: ['single', 'double', 'king', 'queen', 'custom', 'standard'],
      default: 'standard',
    },
    color: {
      type: String,
      required: true,
    },
    isHandmade: {
      type: Boolean,
      default: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },
    careInstructions: {
      type: String,
      default: 'Hand wash or gentle machine wash. Do not bleach.',
    },
    collections: {
      type: [String],
      enum: [
        'rajasthan-handloom',
        'winter-quilt',
        'wedding-special',
        'eco-friendly-cotton',
        'premium-handmade',
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    frequentlyBoughtTogether: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    recommendationScore: {
      type: Number,
      default: 0,
    },
    trendingScore: {
      type: Number,
      default: 0,
    },
    lastTrendingUpdate: {
      type: Date,
      default: Date.now,
    },
    categoryAffinityScore: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1, viewCount: -1 });
// Add these indexes for recommendation optimization
productSchema.index({ recommendationScore: -1 });
productSchema.index({ trendingScore: -1, timestamp: -1 });
productSchema.index({ category: 1, fabricType: 1, productType: 1 });

module.exports = mongoose.model('Product', productSchema);