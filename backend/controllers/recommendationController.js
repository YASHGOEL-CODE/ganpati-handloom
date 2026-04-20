const recommendationEngine = require('../services/recommendationEngine');
const Product = require('../models/Product');

// @desc    Get personalized recommendations for logged-in users
// @route   GET /api/recommendations/personalized
// @access  Private
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 12;

    const recommendations = await recommendationEngine.getHybridRecommendations(
      userId,
      null,
      limit
    );

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommendations for guest users
// @route   GET /api/recommendations/guest
// @access  Public
const getGuestRecommendations = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.sessionID;
    const limit = parseInt(req.query.limit) || 12;

    // For guests, primarily use trending products
    const recommendations = await recommendationEngine.getHybridRecommendations(
      null,
      sessionId,
      limit
    );

    // If no session-based recommendations, fallback to trending
    if (recommendations.length < limit) {
      const trending = await recommendationEngine.getTrendingProducts(7, limit);
      recommendations.push(...trending);
    }

    // Remove duplicates
    const unique = Array.from(
      new Map(recommendations.map((item) => [item._id.toString(), item])).values()
    );

    res.json(unique.slice(0, limit));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get similar products
// @route   GET /api/recommendations/similar/:productId
// @access  Public
const getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find similar products based on category, fabric, and product type
    const similarProducts = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { fabricType: product.fabricType },
        { productType: product.productType },
        { collections: { $in: product.collections } },
      ],
    })
      .populate('category', 'name')
      .sort({ rating: -1, viewCount: -1 })
      .limit(8);

    res.json(similarProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get frequently bought together products
// @route   GET /api/recommendations/frequently-bought/:productId
// @access  Public
const getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const productId = req.params.productId;
    const limit = parseInt(req.query.limit) || 4;

    const products = await recommendationEngine.getFrequentlyBoughtTogether(
      productId,
      limit
    );

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending products
// @route   GET /api/recommendations/trending
// @access  Public
const getTrendingProducts = async (req, res) => {
  try {
    const timeWindow = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;

    const trending = await recommendationEngine.getTrendingProducts(timeWindow, limit);

    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommendations based on user's wishlist
// @route   GET /api/recommendations/wishlist-based
// @access  Private
const getWishlistBasedRecommendations = async (req, res) => {
  try {
    const Wishlist = require('../models/Wishlist');
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products.product');

    if (!wishlist || wishlist.products.length === 0) {
      // Fallback to personalized recommendations
      return getPersonalizedRecommendations(req, res);
    }

    // Get categories and types from wishlist
    const categories = wishlist.products.map((item) => item.product.category);
    const fabricTypes = wishlist.products.map((item) => item.product.fabricType);

    const recommendations = await Product.find({
      isActive: true,
      $or: [{ category: { $in: categories } }, { fabricType: { $in: fabricTypes } }],
      _id: { $nin: wishlist.products.map((item) => item.product._id) },
    })
      .populate('category', 'name')
      .sort({ rating: -1 })
      .limit(10);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getGuestRecommendations,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getTrendingProducts,
  getWishlistBasedRecommendations,
};