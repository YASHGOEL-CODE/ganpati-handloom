const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const {
  getDashboardStats,
  getAllProducts,
  getProductById, // ✅ ADDED THIS LINE
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  toggleUserBlock,
  deleteUser,
  updateUserRole,
  deactivateUser,
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
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// ============================================
// PRODUCTS
// ============================================
router.post('/products/upload', protect, isAdmin, upload.array('images', 5), createProductWithImages);
router.get('/products/low-stock', protect, isAdmin, getLowStockProducts);
router.get('/products/:id', protect, isAdmin, getProductById); // ✅ MOVED THIS UP (specific routes before general)
router.get('/products', protect, isAdmin, getAllProducts);
router.post('/products', protect, isAdmin, createProduct);
router.put('/products/:id', protect, isAdmin, updateProduct);
router.delete('/products/:id', protect, isAdmin, deleteProduct);
router.post('/products/:id/images', protect, isAdmin, uploadProductImages);

// ============================================
// CATEGORIES
// ============================================
router.get('/categories', protect, isAdmin, getCategories);
router.post('/categories', protect, isAdmin, createCategory);
router.put('/categories/:id', protect, isAdmin, updateCategory);
router.delete('/categories/:id', protect, isAdmin, deleteCategory);

// ============================================
// ORDERS
// ============================================
router.get('/orders/recent', protect, isAdmin, getRecentOrders);
router.get('/orders', protect, isAdmin, getAllOrders);
router.put('/orders/:id/status', protect, isAdmin, updateOrderStatus);

// ============================================
// USERS
// ============================================
router.get('/users', protect, isAdmin, getAllUsers);
router.put('/users/:id/block', protect, isAdmin, toggleUserBlock);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.put('/users/:id/role', protect, isAdmin, updateUserRole);
router.put('/users/:id/deactivate', protect, isAdmin, deactivateUser);

// ============================================
// ANALYTICS
// ============================================
router.get('/analytics/weekly', protect, isAdmin, getWeeklyAnalytics);
router.get('/analytics/overview', protect, isAdmin, getAnalyticsOverview);
router.get('/analytics/revenue-trend', protect, isAdmin, getRevenueTrend);
router.get('/analytics/orders-trend', protect, isAdmin, getOrdersTrend);
router.get('/analytics/status-breakdown', protect, isAdmin, getOrderStatusBreakdown);
router.get('/analytics/top-products', protect, isAdmin, getTopSellingProducts);
router.get('/analytics', protect, isAdmin, getAnalytics);

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', protect, isAdmin, getDashboardStats);

const { createCoupon, getAllCoupons, updateCoupon, deleteCoupon, toggleCoupon } = require('../controllers/couponController');

router.get('/coupons',              protect, isAdmin, getAllCoupons);
router.post('/coupons',             protect, isAdmin, createCoupon);
router.put('/coupons/:id',          protect, isAdmin, updateCoupon);
router.delete('/coupons/:id',       protect, isAdmin, deleteCoupon);
router.patch('/coupons/:id/toggle', protect, isAdmin, toggleCoupon);
module.exports = router;