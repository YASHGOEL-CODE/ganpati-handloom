const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  applyCoupon,
  getAvailableCoupons,
  getWelcomeCoupon,
  markCouponUsed,
  revalidateCoupon,
} = require('../controllers/couponController');

// Public
router.get('/welcome', getWelcomeCoupon);

// Protected (user must be logged in)
router.post('/apply',      protect, applyCoupon);
router.get('/available',   protect, getAvailableCoupons);
router.post('/mark-used',  protect, markCouponUsed);
router.post('/revalidate', protect, revalidateCoupon); // ← NEW: checkout calls this

module.exports = router;