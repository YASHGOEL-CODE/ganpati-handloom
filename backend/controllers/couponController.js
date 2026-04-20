const Coupon = require('../models/Coupon');
const Order  = require('../models/Order');

/* ─────────────────────────────────────────────────────────────────────────────
   SEMANTIC DEFINITION (important for understanding all checks below):

   coupon.usageLimit      → how many times EACH USER can use this coupon.
                             null = each user can use it unlimited times.
                             1    = each user can use it once (default intent).
                             5    = each user can use it up to 5 times.

   coupon.usedCount       → total uses across all users (analytics only, no blocking).

   coupon.usedBy          → [{userId, count}] per-user use history.
───────────────────────────────────────────────────────────────────────────── */

/* ── helper: calculate discount amount ── */
const calcDiscount = (coupon, cartTotal) => {
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }
  return Math.min(Math.round(discount), cartTotal);
};

/* ── helper: how many times has this specific user used this coupon ── */
const getUserUsageCount = (coupon, userId) => {
  const entry = coupon.usedBy.find(
    (u) => u.userId.toString() === userId.toString()
  );
  return entry ? entry.count : 0;
};

/* ── helper: has this user exceeded their per-user usage limit ── */
const hasUserExceededLimit = (coupon, userId) => {
  // usageLimit = per-user cap (null = unlimited per user)
  if (coupon.usageLimit === null || coupon.usageLimit === undefined) return false;
  const userCount = getUserUsageCount(coupon, userId);
  return userCount >= coupon.usageLimit;
};

// ─────────────────────────────────────────────────
// @desc   Apply a coupon code (validate only — does NOT increment usage)
// @route  POST /api/coupons/apply
// @access Private
// ─────────────────────────────────────────────────
const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const userId = req.user._id;

    if (!code || !cartTotal) {
      return res.status(400).json({ success: false, message: 'Coupon code and cart total are required' });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon)
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (!coupon.isActive)
      return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
    if (new Date() > new Date(coupon.expiryDate))
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    if (cartTotal < coupon.minOrderValue)
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      });

    // ✅ Per-user usage check: has THIS user already used it usageLimit times?
    if (hasUserExceededLimit(coupon, userId)) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    }

    // New user check
    if (coupon.forNewUsers) {
      const orderCount = await Order.countDocuments({ user: userId });
      if (orderCount > 0)
        return res.status(400).json({ success: false, message: 'This coupon is only for new users' });
    }

    const discount   = calcDiscount(coupon, cartTotal);
    const finalTotal = cartTotal - discount;

    return res.json({
      success:       true,
      discount,
      finalTotal,
      code:          coupon.code,
      discountType:  coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscount:   coupon.maxDiscount,
      expiryDate:    coupon.expiryDate,
      isActive:      coupon.isActive,
      message:       `Coupon applied! You saved ₹${discount}`,
    });
  } catch (error) {
    console.error('❌ Apply coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to apply coupon' });
  }
};

// ─────────────────────────────────────────────────
// @desc   Get available coupons for current user
// @route  GET /api/coupons/available?cartTotal=2500
// @access Private
// ─────────────────────────────────────────────────
const getAvailableCoupons = async (req, res) => {
  try {
    const cartTotal = Number(req.query.cartTotal) || 0;
    const userId    = req.user._id;
    const now       = new Date();

    // Fetch all active, non-expired coupons — no global usage cap filter here
    const coupons = await Coupon.find({
      isActive:   true,
      expiryDate: { $gt: now },
    });

    const available = [];
    for (const c of coupons) {
      // Skip if new-user coupon but user already has orders
      if (c.forNewUsers) {
        const orderCount = await Order.countDocuments({ user: userId });
        if (orderCount > 0) continue;
      }

      // ✅ Skip only if THIS user has hit their per-user limit
      if (hasUserExceededLimit(c, userId)) continue;

      const discount = cartTotal >= c.minOrderValue ? calcDiscount(c, cartTotal) : 0;
      const eligible = cartTotal >= c.minOrderValue;

      available.push({
        code:          c.code,
        description:   c.description || buildDescription(c),
        discountType:  c.discountType,
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
        maxDiscount:   c.maxDiscount,
        expiryDate:    c.expiryDate,
        forNewUsers:   c.forNewUsers,
        isActive:      c.isActive,
        usageLimit:    c.usageLimit,
        discount,
        eligible,
        shortfall: eligible ? 0 : Math.ceil(c.minOrderValue - cartTotal),
      });
    }

    available.sort((a, b) => {
      if (a.eligible !== b.eligible) return b.eligible - a.eligible;
      return b.discount - a.discount;
    });

    res.json({ success: true, coupons: available });
  } catch (error) {
    console.error('❌ Get coupons error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
};

// ─────────────────────────────────────────────────
// @desc   Get welcome coupon for new users (public)
// @route  GET /api/coupons/welcome
// @access Public
// ─────────────────────────────────────────────────
const getWelcomeCoupon = async (req, res) => {
  try {
    const now = new Date();
    const coupon = await Coupon.findOne({
      isActive:    true,
      forNewUsers: true,
      expiryDate:  { $gt: now },
    }).sort({ discountValue: -1 });

    if (!coupon) return res.json({ success: true, coupon: null });

    res.json({
      success: true,
      coupon: {
        code:          coupon.code,
        description:   coupon.description || buildDescription(coupon),
        discountType:  coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        isActive:      coupon.isActive,
        expiryDate:    coupon.expiryDate,
      },
    });
  } catch (error) {
    console.error('❌ Get welcome coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch welcome coupon' });
  }
};

// ─────────────────────────────────────────────────
// @desc   Mark coupon as used — ONLY call after order is successfully placed
// @route  POST /api/coupons/mark-used
// @access Private
// ─────────────────────────────────────────────────
const markCouponUsed = async (req, res) => {
  try {
    const { code } = req.body;
    const userId   = req.user._id;
    if (!code) return res.status(400).json({ success: false, message: 'Code required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    // Increment total usage count (analytics only)
    coupon.usedCount += 1;

    // Increment per-user count (or add user if first use)
    const userEntry = coupon.usedBy.find(
      (u) => u.userId.toString() === userId.toString()
    );
    if (userEntry) {
      userEntry.count += 1;
    } else {
      coupon.usedBy.push({ userId, count: 1 });
    }

    await coupon.save();
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Mark coupon used error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark coupon used' });
  }
};

// ─────────────────────────────────────────────────
// @desc   Revalidate coupon (called by checkout before placing order)
// @route  POST /api/coupons/revalidate
// @access Private
// ─────────────────────────────────────────────────
const revalidateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const userId = req.user._id;

    if (!code) return res.json({ valid: false, message: 'No coupon code provided' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon)           return res.json({ valid: false, message: 'Coupon not found' });
    if (!coupon.isActive)  return res.json({ valid: false, message: 'Coupon is no longer active' });
    if (new Date() > new Date(coupon.expiryDate))
                           return res.json({ valid: false, message: 'Coupon has expired' });
    if (cartTotal < coupon.minOrderValue)
                           return res.json({ valid: false, message: `Minimum order ₹${coupon.minOrderValue} required` });

    // ✅ Only check THIS user's personal usage
    if (hasUserExceededLimit(coupon, userId)) {
      return res.json({ valid: false, message: 'You have already used this coupon' });
    }

    const discount = calcDiscount(coupon, cartTotal);
    res.json({
      valid:   true,
      discount,
      message: `Coupon valid — you save ₹${discount}`,
    });
  } catch (error) {
    console.error('❌ Revalidate coupon error:', error);
    res.status(500).json({ valid: false, message: 'Validation failed' });
  }
};

// ── ADMIN handlers ─────────────────────────────────────────────────────────

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};

const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, isActive: coupon.isActive, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle coupon' });
  }
};

const validateCoupon = async (req, res) => revalidateCoupon(req, res);

// ── Auto-build description ──
const buildDescription = (c) => {
  const val = c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`;
  const min = c.minOrderValue > 0 ? ` on orders above ₹${c.minOrderValue}` : '';
  const cap = c.maxDiscount ? ` (max ₹${c.maxDiscount})` : '';
  return `${val}${min}${cap}`;
};

module.exports = {
  applyCoupon,
  getAvailableCoupons,
  getWelcomeCoupon,
  markCouponUsed,
  revalidateCoupon,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  validateCoupon,
};