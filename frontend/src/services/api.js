import axios from 'axios';
import { apiCache } from '../utils/cache';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Create axios instance for public routes (with /api prefix)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ✅ Create separate axios instance for admin routes (WITHOUT /api prefix)
const adminAxios = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor to admin axios
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 for admin axios
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Cached API wrapper
const cachedRequest = async (cacheKey, requestFn, ttl = 5 * 60 * 1000) => {
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const response = await requestFn();
  apiCache.set(cacheKey, response, ttl);
  return response;
};

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Products API - WITH CACHING
export const productsAPI = {
  getAll: (params) => {
    const cacheKey = `products_${JSON.stringify(params)}`;
    return cachedRequest(cacheKey, () => api.get('/products', { params }), 2 * 60 * 1000);
  },
  getById: (id) => api.get(`/products/${id}`),
  
  getFeatured: () => {
    const cacheKey = 'products_featured';
    return cachedRequest(cacheKey, () => api.get('/products/featured/list'), 10 * 60 * 1000);
  },
  getTrending: () => {
    const cacheKey = 'products_trending';
    return cachedRequest(cacheKey, () => api.get('/products/trending/list'), 5 * 60 * 1000);
  },
  getByCollection: (collectionName) => {
    const cacheKey = `products_collection_${collectionName}`;
    return cachedRequest(cacheKey, () => api.get(`/products/collection/${collectionName}`), 10 * 60 * 1000);
  },
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  addAddress: (addressData) => api.post('/users/addresses', addressData),
  updateAddress: (id, addressData) => api.put(`/users/addresses/${id}`, addressData),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getRecentlyViewed: () => api.get('/users/recently-viewed'),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/myorders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Payment API
export const paymentAPI = {
  createOrder: (orderData) => api.post('/payments/create-order', orderData),
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData),
};

// OTP API
export const otpAPI = {
  send: (phone) => api.post('/otp/send', { phone }),
  verify: (phone, otp) => api.post('/otp/verify', { phone, otp }),
};

// Reviews API
export const reviewsAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// Recommendations API - WITH CACHING
export const recommendationsAPI = {
  getPersonalized: (limit = 12) => {
    const cacheKey = `recommendations_personalized_${limit}`;
    return cachedRequest(
      cacheKey,
      () => api.get('/recommendations/personalized', { params: { limit } }),
      3 * 60 * 1000
    );
  },
  getGuest: (limit = 12, sessionId) => {
    const cacheKey = `recommendations_guest_${limit}_${sessionId}`;
    return cachedRequest(
      cacheKey,
      () => api.get('/recommendations/guest', {
        params: { limit },
        headers: sessionId ? { 'x-session-id': sessionId } : {},
      }),
      3 * 60 * 1000
    );
  },
  getSimilar: (productId) => {
    const cacheKey = `recommendations_similar_${productId}`;
    return cachedRequest(
      cacheKey,
      () => api.get(`/recommendations/similar/${productId}`),
      10 * 60 * 1000
    );
  },
  getFrequentlyBought: (productId, limit = 4) => {
    const cacheKey = `recommendations_frequently_${productId}_${limit}`;
    return cachedRequest(
      cacheKey,
      () => api.get(`/recommendations/frequently-bought/${productId}`, { params: { limit } }),
      10 * 60 * 1000
    );
  },
  getTrending: (days = 7, limit = 10) => {
    const cacheKey = `recommendations_trending_${days}_${limit}`;
    return cachedRequest(
      cacheKey,
      () => api.get('/recommendations/trending', { params: { days, limit } }),
      5 * 60 * 1000
    );
  },
  getWishlistBased: () => api.get('/recommendations/wishlist-based'),
};

// Interactions API
export const interactionsAPI = {
  track: (interactionData) => api.post('/interactions', interactionData),
  getHistory: (limit = 50) => api.get('/interactions/history', { params: { limit } }),
  getAnalytics: () => api.get('/interactions/analytics'),
};

// ✅ Admin API - using adminAxios (NO /api prefix)
export const adminAPI = {
  // Dashboard
  getDashboard: () => adminAxios.get('/admin/dashboard'),

  // Products
  getAllProducts: (params) => adminAxios.get('/admin/products', {
    params,
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
  }),
  getProductById: (id) => adminAxios.get(`/admin/products/${id}`),
  getLowStockProducts: () => adminAxios.get('/admin/products/low-stock'),
  createProduct: (productData) => adminAxios.post('/admin/products', productData),
  updateProduct: (id, productData) => adminAxios.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => adminAxios.delete(`/admin/products/${id}`),
  uploadImages: (id, images) => adminAxios.post(`/admin/products/${id}/images`, { images }),

  // Orders
  getAllOrders: (params) => adminAxios.get('/admin/orders', { params }),
  getRecentOrders: (limit) => adminAxios.get('/admin/orders/recent', { params: { limit } }),
  updateOrderStatus: (id, status) => adminAxios.put(`/admin/orders/${id}/status`, { status }),

  // Users
  getAllUsers: (params) => adminAxios.get('/admin/users', { params }),
  toggleUserBlock: (id) => adminAxios.put(`/admin/users/${id}/block`),
  deleteUser: (id) => adminAxios.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => adminAxios.put(`/admin/users/${id}/role`, { role }),

  // Categories
  getCategories: () => adminAxios.get('/admin/categories'),
  getAllCategories: () => adminAxios.get('/admin/categories'),
  createCategory: (categoryData) => adminAxios.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => adminAxios.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => adminAxios.delete(`/admin/categories/${id}`),

  // Analytics
  getAnalytics: () => adminAxios.get('/admin/analytics'),
  getWeeklyAnalytics: () => adminAxios.get('/admin/analytics/weekly'),
  getAnalyticsOverview: (params) => adminAxios.get('/admin/analytics/overview', { params }),
  getRevenueTrend: (days) => adminAxios.get('/admin/analytics/revenue-trend', { params: { days } }),
  getOrdersTrend: (days) => adminAxios.get('/admin/analytics/orders-trend', { params: { days } }),
  getOrderStatusBreakdown: () => adminAxios.get('/admin/analytics/status-breakdown'),
  getTopSellingProducts: (limit) => adminAxios.get('/admin/analytics/top-products', { params: { limit } }),

  // Coupons (Admin)
  getAllCoupons: ()         => adminAxios.get('/admin/coupons'),
  createCoupon: (data)     => adminAxios.post('/admin/coupons', data),
  updateCoupon: (id, data) => adminAxios.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id)       => adminAxios.delete(`/admin/coupons/${id}`),
  toggleCoupon: (id)       => adminAxios.patch(`/admin/coupons/${id}/toggle`),

  // ✅ Festive Collections (Admin)
  getAllFestiveCollections: () => adminAxios.get('/festive-collections'),
createFestiveCollection: (data) => adminAxios.post('/festive-collections', data),
updateFestiveCollection: (id, data) => adminAxios.put(`/festive-collections/${id}`, data),
deleteFestiveCollection: (id) => adminAxios.delete(`/festive-collections/${id}`),
toggleFestiveCollection: (id) => adminAxios.patch(`/festive-collections/${id}/toggle`),
uploadFestiveImage: (formData) => adminAxios.post('/festive-collections/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Address API
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  getById: (id) => api.get(`/addresses/${id}`),
  create: (addressData) => api.post('/addresses', addressData),
  update: (id, addressData) => api.put(`/addresses/${id}`, addressData),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
  verify: (addressData) => api.post('/addresses/verify', addressData),
  getStoreLocation: () => api.get('/addresses/store-location'),
};

// ✅ Notifications API
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  create: (data) => api.post('/notifications', data),
};

// ✅ NEW: Festive Collections public API
export const festiveCollectionsAPI = {
  getAll: () => api.get('/festive-collections'),
};

// Clear cache function
export const clearCache = () => {
  apiCache.clear();
};

export default api;