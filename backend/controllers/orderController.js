// backend/controllers/orderController.js
const Order   = require('../models/Order');
const Coupon  = require('../models/Coupon');
const Product = require('../models/Product');

// ─── Helper: server-side coupon discount calculation ───────────────────────
const calcCouponDiscount = (coupon, itemsTotal) => {
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (itemsTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }
  return Math.min(Math.round(discount), itemsTotal);
};

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      shippingPrice    = 0,
      couponCode,
      discountAmount: frontendDiscount,
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

    // ── 2. Validate stock for every item ─────────────────────────────────────
    const productIds  = orderItems.map((item) => item.product);
    const productDocs = await Product.find({ _id: { $in: productIds } }).select('_id name stock');
    const productMap  = {};
    productDocs.forEach((p) => { productMap[p._id.toString()] = p; });

    for (const item of orderItems) {
      const prod = productMap[item.product?.toString()];
      if (!prod) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name || item.product}`,
        });
      }
      if (prod.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // ── 3. Calculate items subtotal ──────────────────────────────────────────
    const itemsSubtotal = orderItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // ── 4. Re-validate coupon SERVER-SIDE ────────────────────────────────────
    let verifiedDiscount   = 0;
    let verifiedCouponCode = null;

    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: couponCode.trim().toUpperCase(),
        });

        const now    = new Date();
        const userId = req.user._id;

        const basicValid =
          coupon &&
          coupon.isActive &&
          now <= new Date(coupon.expiryDate) &&
          itemsSubtotal >= coupon.minOrderValue;

        if (basicValid) {
          let userCount = 0;
          const userEntry = coupon.usedBy.find(u => u.userId.toString() === userId.toString());
          if (userEntry) userCount = userEntry.count;

          const perUserLimit   = coupon.usageLimit ?? null;
          const userUnderLimit = perUserLimit === null || userCount < perUserLimit;

          if (userUnderLimit) {
            verifiedDiscount   = calcCouponDiscount(coupon, itemsSubtotal);
            verifiedCouponCode = coupon.code;
          }
        }
      } catch (couponErr) {
        console.warn('⚠️  Coupon re-validation error (order proceeding without discount):', couponErr.message);
      }
    }

    // ── 5. Final price calculation ───────────────────────────────────────────
    const shipping   = Number(shippingPrice) || 0;
    const subtotal   = itemsSubtotal;
    const finalTotal = Math.max(0, subtotal + shipping - verifiedDiscount);

    // ── 6. Extract clean address fields ──────────────────────────────────────
    const {
      houseStreet,
      city,
      state,
      pincode,
      phone: addressPhone,
    } = shippingAddress;

    const cleanAddress = { houseStreet, city, state, pincode };
    const phone = addressPhone || req.user?.phone || '9999999999';

    // ── 7. Save order ────────────────────────────────────────────────────────
    const order = new Order({
      user:            req.user._id,
      orderItems,
      shippingAddress: cleanAddress,
      phone,
      shippingPrice:   shipping,
      taxPrice:        0,
      subtotal,
      couponCode:      verifiedCouponCode,
      discountAmount:  verifiedDiscount,
      totalPrice:      finalTotal,
      deliveryDistance: Number(deliveryDistance) || 0,
      deliveryCharge:   Number(deliveryCharge ?? shippingPrice) || 0,
      isServiceable:    Boolean(isServiceable),
    });

    const savedOrder = await order.save();

    // ── 8. Deduct stock atomically after order is saved ───────────────────────
    const stockUpdateOps = orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity, purchaseCount: item.quantity } },
      },
    }));
    await Product.bulkWrite(stockUpdateOps);

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