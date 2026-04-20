const express = require('express');
const router = express.Router();
const {
  getPersonalizedRecommendations,
  getGuestRecommendations,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getTrendingProducts,
  getWishlistBasedRecommendations,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');
const { trackInteraction } = require('../middleware/trackInteraction');

// Personalized recommendations (requires login)
router.get('/personalized', protect, getPersonalizedRecommendations);

// Guest recommendations (no login required)
router.get('/guest', getGuestRecommendations);

// Similar products
router.get('/similar/:productId', getSimilarProducts);

// Frequently bought together
router.get('/frequently-bought/:productId', getFrequentlyBoughtTogether);

// Trending products
router.get('/trending', getTrendingProducts);

// Wishlist-based recommendations
router.get('/wishlist-based', protect, getWishlistBasedRecommendations);

// Track user interaction (for analytics)
router.post('/track', trackInteraction);

module.exports = router;