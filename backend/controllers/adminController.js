const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');

// ✅ NEW: Notification helper — standalone, no circular dependency
const { createNotification } = require('../utils/notificationHelper');

// ============ DASHBOARD STATISTICS ============

const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats for admin:', req.user.email);

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      pendingOrders,
      deliveredOrders,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ orderStatus: 'processing' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
    ]);

    const revenueData = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    const recentOrders = await Order.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id orderStatus totalPrice createdAt orderItems');

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    const stats = {
      totalUsers, totalOrders, totalProducts,
      pendingOrders, deliveredOrders, totalRevenue,
      recentOrders, ordersByStatus,
    };

    console.log('✅ Dashboard stats fetched successfully');
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
  }
};

// ============ PRODUCT MANAGEMENT ============

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    else if (status === 'inactive') query.isActive = false;

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Get product by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, category, productType,
      fabricType, size, color, stock, images,
      careInstructions, collections, isPremium,
    } = req.body;

    if (!name || !price || !category || !productType || !fabricType) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const product = await Product.create({
      name, description, price, category, productType, fabricType,
      size: size || 'standard', color, stock: stock || 0,
      images: images || [], careInstructions,
      collections: collections || [], isPremium: isPremium || false, isActive: true,
    });

    console.log('✅ Product created:', product._id);
    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.collections && typeof req.body.collections === 'string') {
      try { req.body.collections = JSON.parse(req.body.collections); }
      catch (e) { req.body.collections = []; }
    }

    if (req.body.existingImages && typeof req.body.existingImages === 'string') {
      try { req.body.existingImages = JSON.parse(req.body.existingImages); }
      catch (e) { /* ignore */ }
    }

    console.log('🔍 Update data received:', req.body);
    console.log('🔍 Stock value:', req.body.stock, 'Type:', typeof req.body.stock);

    const updatedProduct = await Product.findByIdAndUpdate(
      id, { $set: req.body }, { new: true, runValidators: true }
    ).populate('category', 'name');

    console.log('✅ Product updated:', id);
    console.log('🔍 Updated stock:', updatedProduct.stock);

    res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isActive = false;
    await product.save();

    console.log('✅ Product deleted (soft):', id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

const uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ success: false, message: 'Please provide image URLs' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.images = images;
    await product.save();

    res.json({ success: true, message: 'Images uploaded successfully', product });
  } catch (error) {
    console.error('❌ Upload images error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload images' });
  }
};

// ============ ORDER MANAGEMENT ============

const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const orders = await Order.find(query)
      .populate('user', 'fullName email phone')
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// ✅ ONLY THIS FUNCTION CHANGED — notification triggers added
// @desc    Update order status
// @route   PUT /admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['processing', 'packed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    // ✅ Populate user so we have userId for the notification
    const order = await Order.findById(id).populate('user', 'fullName email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;

    // ✅ All original status update logic — completely unchanged
    order.orderStatus = status;
    order.statusHistory.push({ status, timestamp: Date.now() });

    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.isDelivered = true;
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();
    console.log('✅ Order status updated:', id, status);

    // ── Notification triggers (non-blocking, after save) ──
    const shortId = order._id.toString().slice(-8).toUpperCase();

    // Resolve userId safely
    const userId = order.user?._id ? order.user._id : order.user;

    const STATUS_NOTIF = {
      packed: {
        title: '📦 Order Packed',
        message: `Your order #${shortId} is packed and ready for dispatch.`,
      },
      shipped: {
        title: '🚚 Order Shipped!',
        message: `Your order #${shortId} is on its way! Expected delivery in 2–5 days.`,
      },
      delivered: {
        title: '✅ Order Delivered!',
        message: `Your order #${shortId} has been delivered. Enjoy your purchase!`,
      },
      cancelled: {
        title: '❌ Order Cancelled',
        message: `Your order #${shortId} has been cancelled. Contact us for any queries.`,
      },
    };

    // Notify customer about their order status
    if (STATUS_NOTIF[status] && userId) {
      createNotification({
        title: STATUS_NOTIF[status].title,
        message: STATUS_NOTIF[status].message,
        type: 'order',
        role: 'user',
        userId,
        actionLink: `/orders/${order._id}`,
        meta: { orderId: order._id, status },
      });
    }

    // Notify admin about cancellations
    if (status === 'cancelled') {
      createNotification({
        title: 'Order Cancelled',
        message: `Order #${shortId} was cancelled by admin (was: ${previousStatus}).`,
        type: 'order',
        role: 'admin',
        actionLink: `/admin/orders`,
        meta: { orderId: order._id },
      });
    }

    res.json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// ============ USER MANAGEMENT ============

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot block admin users' });

    user.isActive = !user.isActive;
    await user.save();

    console.log('✅ User block status toggled:', id, user.isActive);
    res.json({
      success: true,
      message: user.isActive ? 'User unblocked successfully' : 'User blocked successfully',
      user: { _id: user._id, fullName: user.fullName, email: user.email, isActive: user.isActive },
    });
  } catch (error) {
    console.error('❌ Toggle user block error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin users' });

    await User.findByIdAndDelete(id);
    console.log('✅ User deleted:', id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be "user" or "admin"' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    console.log('✅ User role updated:', id, role);
    res.json({ success: true, message: `User role updated to ${role} successfully`, user });
  } catch (error) {
    console.error('❌ Update user role error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin users' });

    user.isActive = false;
    await user.save();
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('❌ Deactivate user error:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate user' });
  }
};

// ============ CATEGORY MANAGEMENT ============

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

const createCategory = async (req, res) => {
  console.log('🔵 CREATE CATEGORY FUNCTION CALLED');
  console.log('🔵 Request body:', req.body);
  console.log('🔵 User:', req.user);

  try {
    const { name, slug, description } = req.body;
    console.log('🔵 Extracted fields:', { name, slug, description });

    if (!name || !name.trim()) {
      console.log('❌ Validation failed: Name is required');
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    console.log('🔵 Checking for existing category...');
    const Category = require('../models/Category');
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingCategory) {
      console.log('❌ Category already exists');
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    console.log('🔵 Generating slug...');
    const finalSlug = slug && slug.trim()
      ? slug.trim()
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    console.log('🔵 Final slug:', finalSlug);
    console.log('🔵 Creating category in database...');

    const category = await Category.create({
      name: name.trim(),
      slug: finalSlug,
      description: description?.trim() || '',
      isActive: true,
    });

    console.log('✅ Category created successfully:', category._id);
    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    console.error('❌ CREATE CATEGORY ERROR:', error);
    console.error('❌ Error stack:', error.stack);

    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A category with this name or slug already exists' });
    }

    res.status(500).json({ success: false, message: error.message || 'Failed to create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    if (name) category.name = name.trim();
    if (slug) category.slug = slug.trim();
    if (description !== undefined) category.description = description.trim();

    await category.save();
    console.log('✅ Category updated:', category._id);
    res.json({ success: true, message: 'Category updated successfully', category });
  } catch (error) {
    console.error('❌ Update category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A category with this name or slug already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const Product = require('../models/Product');
    const productsCount = await Product.countDocuments({ category: req.params.id });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productsCount} product(s) are using this category.`,
      });
    }

    await category.deleteOne();
    console.log('✅ Category deleted:', req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete category' });
  }
};

// ============ ANALYTICS ============

const getAnalytics = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const mostViewed = await Product.find({ isActive: true }).sort({ viewCount: -1 }).limit(10).populate('category', 'name');
    const bestSelling = await Product.find({ isActive: true }).sort({ purchaseCount: -1 }).limit(10).populate('category', 'name');

    res.json({ success: true, analytics: { revenueByMonth, mostViewed, bestSelling } });
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const lowStockThreshold = 5;
    const products = await Product.find({ stock: { $lt: lowStockThreshold }, isActive: true })
      .select('name stock price images')
      .sort({ stock: 1 })
      .limit(10);

    res.json({ success: true, products, count: products.length });
  } catch (error) {
    console.error('❌ Get low stock products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock products' });
  }
};

const getWeeklyAnalytics = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailyStats.find((d) => d._id === dateStr);
      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayData?.revenue || 0,
        orders: dayData?.orders || 0,
      });
    }

    res.json({ success: true, analytics: last7Days });
  } catch (error) {
    console.error('❌ Get weekly analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weekly analytics' });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const orders = await Order.find()
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('_id user phone totalPrice orderStatus createdAt');

    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Get recent orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent orders' });
  }
};

const getAnalyticsOverview = async (req, res) => {
  try {
    const [totalRevenue, todayRevenue, last7DaysRevenue, last30DaysRevenue] = await Promise.all([
      Order.aggregate([{ $match: { orderStatus: 'delivered' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.aggregate([{ $match: { orderStatus: 'delivered', createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.aggregate([{ $match: { orderStatus: 'delivered', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.aggregate([{ $match: { orderStatus: 'delivered', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    ]);

    const [totalOrders, pendingOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'processing' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),
    ]);

    res.json({
      success: true,
      overview: {
        revenue: {
          total: totalRevenue[0]?.total || 0,
          today: todayRevenue[0]?.total || 0,
          last7Days: last7DaysRevenue[0]?.total || 0,
          last30Days: last30DaysRevenue[0]?.total || 0,
        },
        orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders, cancelled: cancelledOrders },
      },
    });
  } catch (error) {
    console.error('❌ Get analytics overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics overview' });
  }
};

const getRevenueTrend = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysCount = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const revenueTrend = await Order.aggregate([
      { $match: { orderStatus: 'delivered', createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const trendData = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = revenueTrend.find((d) => d._id === dateStr);
      trendData.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayData?.revenue || 0,
        orders: dayData?.orders || 0,
      });
    }

    res.json({ success: true, trend: trendData });
  } catch (error) {
    console.error('❌ Get revenue trend error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue trend' });
  }
};

const getOrdersTrend = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysCount = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const ordersTrend = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const trendData = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = ordersTrend.find((d) => d._id === dateStr);
      trendData.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayData?.count || 0,
      });
    }

    res.json({ success: true, trend: trendData });
  } catch (error) {
    console.error('❌ Get orders trend error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders trend' });
  }
};

const getOrderStatusBreakdown = async (req, res) => {
  try {
    const breakdown = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    const total = breakdown.reduce((sum, item) => sum + item.count, 0);
    const statusData = breakdown.map((item) => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
    }));

    res.json({ success: true, breakdown: statusData, total });
  } catch (error) {
    console.error('❌ Get order status breakdown error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order status breakdown' });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          productName: { $first: '$orderItems.name' },
          unitsSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: parseInt(limit) },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
      { $project: { productName: 1, unitsSold: 1, revenue: 1, image: { $arrayElemAt: ['$productDetails.images', 0] } } },
    ]);

    res.json({ success: true, products: topProducts });
  } catch (error) {
    console.error('❌ Get top selling products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch top selling products' });
  }
};

const createProductWithImages = async (req, res) => {
  try {
    console.log('📦 Creating product with images');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const {
      name, description, price, category, productType,
      fabricType, size, color, stock, careInstructions,
      collections, isPremium, isHandmade,
    } = req.body;

    if (!name || !price || !category || !productType || !fabricType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, price, category, productType, fabricType',
      });
    }

    const imageUrls = req.files
      ? req.files.map((file) => `/uploads/products/${file.filename}`)
      : [];

    let parsedCollections = [];
    if (collections) {
      try {
        parsedCollections = typeof collections === 'string' ? JSON.parse(collections) : collections;
      } catch (error) {
        parsedCollections = [];
      }
    }

    const product = await Product.create({
      name, description,
      price: parseFloat(price),
      category, productType, fabricType,
      size: size || 'standard', color,
      stock: parseInt(stock) || 0,
      images: imageUrls,
      careInstructions: careInstructions || 'Hand wash or gentle machine wash. Do not bleach.',
      collections: parsedCollections,
      isPremium: isPremium === 'true' || isPremium === true,
      isHandmade: isHandmade === 'true' || isHandmade === true || true,
      isActive: true,
    });

    console.log('✅ Product created:', product._id);
    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
  }
};

module.exports = {
  getDashboardStats,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  toggleUserBlock,
  deleteUser,
  updateUserRole,
  deactivateUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAnalytics,
  getLowStockProducts,
  getWeeklyAnalytics,
  getRecentOrders,
  getAnalyticsOverview,
  getRevenueTrend,
  getOrdersTrend,
  getOrderStatusBreakdown,
  getTopSellingProducts,
  createProductWithImages,
};