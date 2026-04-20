const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price:    { type: Number, required: true },
  image:    { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      houseStreet: { type: String, required: true },
      city:        { type: String, required: true },
      state:       { type: String, required: true },
      pincode:     { type: String, required: true },
    },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    paymentMethod:  { type: String, default: 'COD' },
    paymentResult:  { id: String, status: String, update_time: String },
    taxPrice:       { type: Number, required: true, default: 0.0 },
    shippingPrice:  { type: Number, required: true, default: 0.0 },

    // ── Price breakdown (NEVER recalculate after order is placed) ──────────
    // subtotal      = sum of all item prices (before discount & shipping)
    // discountAmount = coupon saving applied at checkout
    // totalPrice     = final amount customer pays (subtotal + shipping - discount)
    // ──────────────────────────────────────────────────────────────────────
    subtotal:       { type: Number, default: 0 },
    couponCode:     { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    totalPrice:     { type: Number, required: true, default: 0.0 },

    orderStatus: {
      type: String,
      enum: ['processing', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    isPaid:      { type: Boolean, default: false },
    paidAt:      { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    estimatedDelivery:     { type: Date },
    statusHistory: [{ status: String, timestamp: { type: Date, default: Date.now } }],
    deliveryDistance:      { type: Number, required: true },
    deliveryCharge:        { type: Number, required: true, default: 0 },
    isServiceable:         { type: Boolean, required: true, default: false },
    estimatedDeliveryTime: { type: Number },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({ status: 'processing', timestamp: new Date() });
    this.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);