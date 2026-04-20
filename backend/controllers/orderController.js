// backend/controllers/orderController.js
const Order  = require('../models/Order');
const Coupon = require('../models/Coupon');

// ─── Helper: server-side coupon discount calculation ───────────────────────
const calcCouponDiscount = (coupon, itemsTotal) => {
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (itemsTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }
  return Math.min(Math.round(discount), itemsTotal); // never exceed cart total
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Create new order
// @route  POST /api/orders
// @access Private
//
// Payload sent by Checkout.jsx:
// {
//   orderItems:      [{product, name, image, price, quantity}],
//   shippingAddress: selectedAddress (raw DB address object),
//   shippingPrice:   number (from deliveryInfo.charge),
//   totalPrice:      number (already discounted by frontend),
//   couponCode:      string | undefined,
//   discountAmount:  number | undefined,
//   deliveryDistance: number (sent separately from deliveryInfo),
//   deliveryCharge:   number,
//   isServiceable:    boolean,
// }
//
// NOTE: The frontend sends shippingAddress as the raw address object from DB.
// Delivery fields (deliveryDistance, deliveryCharge, isServiceable) are sent
// as top-level fields alongside shippingAddress.
// ─────────────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      shippingPrice    = 0,
      couponCode,         // ← sent by Checkout.jsx when coupon is applied
      discountAmount: frontendDiscount, // ← frontend hint; we re-verify server-side
      // Delivery fields sent as top-level (set by frontend from deliveryInfo)
      deliveryDistance = 0,
      deliveryCharge,
      isServiceable    = true,
    } = req.body;

    // ── 1. Validate required fields ──────────────────────────────────────────
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address required' });
    }

    // ── 2. Calculate items subtotal from actual prices ───────────────────────
    const itemsSubtotal = orderItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // ── 3. Re-validate coupon SERVER-SIDE (never blindly trust frontend) ─────
    let verifiedDiscount   = 0;
    let verifiedCouponCode = null;

    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: couponCode.trim().toUpperCase(),
        });

        const now    = new Date();
        const userId = req.user._id;

        // Basic coupon validity (active, not expired, min order met)
        const basicValid =
          coupon &&
          coupon.isActive &&
          now <= new Date(coupon.expiryDate) &&
          itemsSubtotal >= coupon.minOrderValue;

        if (basicValid) {
          // ✅ Per-user usage check: usageLimit = how many times THIS user can use it
          // (null = unlimited per user)
          let userCount = 0;
          const userEntry = coupon.usedBy.find(u => u.userId.toString() === userId.toString());
          if (userEntry) userCount = userEntry.count;

          const perUserLimit   = coupon.usageLimit ?? null; // null = unlimited
          const userUnderLimit = perUserLimit === null || userCount < perUserLimit;

          if (userUnderLimit) {
            verifiedDiscount   = calcCouponDiscount(coupon, itemsSubtotal);
            verifiedCouponCode = coupon.code;
          }
        }
      } catch (couponErr) {
        // Non-fatal: if coupon lookup fails, order still goes through without discount
        console.warn('⚠️  Coupon re-validation error (order proceeding without discount):', couponErr.message);
      }
    }

    // ── 4. Final price calculation ───────────────────────────────────────────
    const shipping   = Number(shippingPrice) || 0;
    const subtotal   = itemsSubtotal;                               // items only, pre-discount
    const finalTotal = Math.max(0, subtotal + shipping - verifiedDiscount);

    // ── 5. Extract clean address fields (strip non-schema fields) ────────────
    // shippingAddress from frontend is the raw address DB doc; we pick only what the schema needs.
    const {
      houseStreet,
      city,
      state,
      pincode,
      phone: addressPhone,
      // ignore latitude, longitude, isDefault, user, _id, __v, createdAt, updatedAt, etc.
    } = shippingAddress;

    const cleanAddress = { houseStreet, city, state, pincode };

    // Phone: prefer address-level phone, then req.user.phone, then fallback
    const phone = addressPhone || req.user?.phone || '9999999999';

    // ── 6. Save order ────────────────────────────────────────────────────────
    const order = new Order({
      user:            req.user._id,
      orderItems,
      shippingAddress: cleanAddress,
      phone,
      shippingPrice:   shipping,
      taxPrice:        0,

      // ✅ THE FIX: always persist the full price breakdown
      subtotal,                              // items total before discount
      couponCode:     verifiedCouponCode,    // null if no valid coupon
      discountAmount: verifiedDiscount,      // 0 if no coupon
      totalPrice:     finalTotal,            // final amount customer pays

      // Delivery fields (sent from Checkout as top-level fields)
      deliveryDistance: Number(deliveryDistance) || 0,
      deliveryCharge:   Number(deliveryCharge ?? shippingPrice) || 0,
      isServiceable:    Boolean(isServiceable),
    });

    const savedOrder = await order.save();

    res.status(201).json({ success: true, order: savedOrder });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get order by ID
// @route  GET /api/orders/:id
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Users can only see their own orders; admins see all
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get logged-in user's orders
// @route  GET /api/orders/myorders
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Update order status
// @route  PUT /api/orders/:id/status
// @access Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const validStatuses = ['processing', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    order.orderStatus = status;
    order.statusHistory.push({ status, timestamp: new Date() });

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get all orders (admin)
// @route  GET /admin/orders
// @access Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  getAllOrders,
};