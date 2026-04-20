const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ── usageLimit = how many times EACH USER can use this coupon ──
    // null = each user can use it unlimited times
    // 1    = each user can use it once (most common)
    // 5    = each user can use it up to 5 times
    usageLimit: {
      type: Number,
      default: null,
    },
    // usedCount = total uses across all users (for admin analytics display only)
    usedCount: {
      type: Number,
      default: 0,
    },
    applicableCategory: {
      type: String,
      default: null,
    },
    forNewUsers: {
      type: Boolean,
      default: false,
    },
    // ── UPDATED: track per-user usage count (was plain ObjectId array) ──
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiryDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);