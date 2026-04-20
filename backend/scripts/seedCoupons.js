// backend/scripts/seedCoupons.js
// Run with: node backend/scripts/seedCoupons.js

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Coupon = require('../models/Coupon');

const connectDB = require('../config/db');

const sampleCoupons = [
  {
    code:          'WELCOME100',
    description:   '₹100 OFF on your first order',
    discountType:  'flat',
    discountValue: 100,
    minOrderValue: 500,
    maxDiscount:   100,
    expiryDate:    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    isActive:      true,
    usageLimit:    null,
    forNewUsers:   true,
  },
  {
    code:          'SUMMER10',
    description:   '10% OFF on orders above ₹1000 (max ₹300)',
    discountType:  'percentage',
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscount:   300,
    expiryDate:    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    isActive:      true,
    usageLimit:    null,
    forNewUsers:   false,
  },
  {
    code:          'FLAT50',
    description:   'Flat ₹50 OFF on any order',
    discountType:  'flat',
    discountValue: 50,
    minOrderValue: 200,
    maxDiscount:   50,
    expiryDate:    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive:      true,
    usageLimit:    null,
    forNewUsers:   false,
  },
  {
    code:          'GANPATI15',
    description:   '15% OFF — Ganpati Special (max ₹500)',
    discountType:  'percentage',
    discountValue: 15,
    minOrderValue: 1500,
    maxDiscount:   500,
    expiryDate:    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive:      true,
    usageLimit:    200,
    forNewUsers:   false,
  },
];

const seedCoupons = async () => {
  try {
    await connectDB();
    console.log('🔌 Connected to MongoDB');

    // Remove existing sample coupons (by code)
    const codes = sampleCoupons.map(c => c.code);
    await Coupon.deleteMany({ code: { $in: codes } });
    console.log('🗑️  Cleared existing sample coupons');

    const created = await Coupon.insertMany(sampleCoupons);
    console.log(`✅ Created ${created.length} coupons:`);
    created.forEach(c => console.log(`   • ${c.code} — ${c.description}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedCoupons();