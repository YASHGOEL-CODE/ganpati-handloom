const Product = require('../models/Product');
const UserInteraction = require('../models/UserInteraction');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const mongoose = require('mongoose');

class RecommendationEngine {
  // Calculate time decay factor (recent interactions are more important)
  getTimeDecayFactor(timestamp) {
    const now = new Date();
    const daysSince = (now - new Date(timestamp)) / (1000 * 60 * 60 * 24);
    
    // Exponential decay: weight decreases as time passes
    // Formula: e^(-0.1 * days)
    return Math.exp(-0.1 * daysSince);
  }

  // Get user interaction history with weighted scoring
  async getUserInteractionProfile(userId, sessionId = null) {
    const query = userId ? { user: userId } : { sessionId: sessionId };
    
    const interactions = await UserInteraction.find(query)
      .populate('product', 'category fabricType productType collections')
      .sort({ timestamp: -1 })
      .limit(100);

    const profile = {
      categories: {},
      fabricTypes: {},
      productTypes: {},
      collections: {},
      recentProducts: [],
      totalScore: 0,
    };

    interactions.forEach((interaction) => {
      if (!interaction.product) return;

      const timeDecay = this.getTimeDecayFactor(interaction.timestamp);
      const score = interaction.interactionWeight * timeDecay;

      // Track category preferences
      const category = interaction.product.category?.toString();
      if (category) {
        profile.categories[category] = (profile.categories[category] || 0) + score;
      }

      // Track fabric preferences
      if (interaction.product.fabricType) {
        profile.fabricTypes[interaction.product.fabricType] =
          (profile.fabricTypes[interaction.product.fabricType] || 0) + score;
      }

      // Track product type preferences
      if (interaction.product.productType) {
        profile.productTypes[interaction.product.productType] =
          (profile.productTypes[interaction.product.productType] || 0) + score;
      }

      // Track collection preferences
      if (interaction.product.collections) {
        interaction.product.collections.forEach((col) => {
          profile.collections[col] = (profile.collections[col] || 0) + score;
        });
      }

      // Track recent products
      if (profile.recentProducts.length < 20) {
        profile.recentProducts.push(interaction.product._id);
      }

      profile.totalScore += score;
    });

    return profile;
  }

  // Collaborative filtering: Find similar users
  async findSimilarUsers(userId, limit = 10) {
    const userInteractions = await UserInteraction.find({ user: userId })
      .select('product interactionType')
      .limit(50);

    const userProductIds = userInteractions.map((i) => i.product);

    // Find users who interacted with similar products
    const similarUsers = await UserInteraction.aggregate([
      {
        $match: {
          product: { $in: userProductIds },
          user: { $ne: mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $group: {
          _id: '$user',
          commonProducts: { $addToSet: '$product' },
          totalInteractions: { $sum: 1 },
        },
      },
      {
        $project: {
          similarityScore: { $size: '$commonProducts' },
          totalInteractions: 1,
        },
      },
      { $sort: { similarityScore: -1 } },
      { $limit: limit },
    ]);

    return similarUsers.map((u) => u._id);
  }

  // Get products liked by similar users
  async getCollaborativeRecommendations(userId, limit = 10) {
    const similarUsers = await this.findSimilarUsers(userId, 5);

    if (similarUsers.length === 0) return [];

    // Get products these similar users liked
    const recommendations = await UserInteraction.aggregate([
      {
        $match: {
          user: { $in: similarUsers },
          interactionType: { $in: ['purchase', 'add_to_wishlist', 'add_to_cart'] },
        },
      },
      {
        $group: {
          _id: '$product',
          score: { $sum: '$interactionWeight' },
          interactions: { $sum: 1 },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
    ]);

    const productIds = recommendations.map((r) => r._id);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true })
      .populate('category', 'name')
      .lean();

    return products;
  }

  // Content-based filtering: Similar products based on attributes
  async getContentBasedRecommendations(userProfile, excludeProducts = [], limit = 10) {
    // Build scoring criteria based on user preferences
    const categoryScores = userProfile.categories;
    const fabricScores = userProfile.fabricTypes;
    const productTypeScores = userProfile.productTypes;

    // Get top preferences
    const topCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => mongoose.Types.ObjectId(cat));

    const topFabrics = Object.entries(fabricScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([fabric]) => fabric);

    const topProductTypes = Object.entries(productTypeScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // Find products matching user preferences
    const matchQuery = {
      _id: { $nin: excludeProducts },
      isActive: true,
      $or: [
        { category: { $in: topCategories } },
        { fabricType: { $in: topFabrics } },
        { productType: { $in: topProductTypes } },
      ],
    };

    const products = await Product.find(matchQuery)
      .populate('category', 'name')
      .limit(limit * 2)
      .lean();

    // Calculate relevance score for each product
    const scoredProducts = products.map((product) => {
      let score = 0;

      if (categoryScores[product.category?._id]) {
        score += categoryScores[product.category._id] * 3;
      }

      if (fabricScores[product.fabricType]) {
        score += fabricScores[product.fabricType] * 2;
      }

      if (productTypeScores[product.productType]) {
        score += productTypeScores[product.productType] * 2;
      }

      // Bonus for premium and high-rated products
      if (product.isPremium) score += 10;
      score += product.rating * 5;

      return { ...product, relevanceScore: score };
    });

    // Sort by relevance and return top N
    return scoredProducts.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }

  // Get trending products (time-based popularity)
  async getTrendingProducts(timeWindow = 7, limit = 10) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeWindow);

    const trending = await UserInteraction.aggregate([
      {
        $match: {
          timestamp: { $gte: cutoffDate },
          interactionType: { $in: ['view', 'click', 'add_to_cart', 'purchase'] },
        },
      },
      {
        $group: {
          _id: '$product',
          totalScore: { $sum: '$interactionWeight' },
          views: {
            $sum: {
              $cond: [{ $eq: ['$interactionType', 'view'] }, 1, 0],
            },
          },
          purchases: {
            $sum: {
              $cond: [{ $eq: ['$interactionType', 'purchase'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          trendingScore: {
            $add: [
              '$totalScore',
              { $multiply: ['$views', 1] },
              { $multiply: ['$purchases', 20] },
            ],
          },
        },
      },
      { $sort: { trendingScore: -1 } },
      { $limit: limit },
    ]);

    const productIds = trending.map((t) => t._id);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true })
      .populate('category', 'name')
      .lean();

    return products;
  }

  // Frequently bought together
  async getFrequentlyBoughtTogether(productId, limit = 4) {
    // Find orders containing this product
    const ordersWithProduct = await Order.find({
      'orderItems.product': productId,
    }).select('orderItems');

    // Collect all products bought with this product
    const productCounts = {};

    ordersWithProduct.forEach((order) => {
      const productsInOrder = order.orderItems
        .map((item) => item.product.toString())
        .filter((id) => id !== productId.toString());

      productsInOrder.forEach((pid) => {
        productCounts[pid] = (productCounts[pid] || 0) + 1;
      });
    });

    // Sort by frequency
    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([pid]) => pid);

    const products = await Product.find({ _id: { $in: topProducts }, isActive: true })
      .populate('category', 'name')
      .lean();

    return products;
  }

  // Hybrid recommendation: Combine multiple strategies
  async getHybridRecommendations(userId, sessionId = null, limit = 12) {
    const userProfile = await this.getUserInteractionProfile(userId, sessionId);
    const excludeProducts = userProfile.recentProducts || [];

    // Get recommendations from different strategies
    const [contentBased, collaborative, trending] = await Promise.all([
      this.getContentBasedRecommendations(userProfile, excludeProducts, limit),
      userId ? this.getCollaborativeRecommendations(userId, Math.floor(limit / 3)) : [],
      this.getTrendingProducts(7, Math.floor(limit / 3)),
    ]);

    // Combine and deduplicate
    const allRecommendations = [...contentBased, ...collaborative, ...trending];
    const uniqueProducts = {};

    allRecommendations.forEach((product) => {
      const id = product._id.toString();
      if (!uniqueProducts[id] && !excludeProducts.includes(id)) {
        uniqueProducts[id] = product;
      }
    });

    return Object.values(uniqueProducts).slice(0, limit);
  }

  // Update product recommendation scores (run periodically)
  async updateProductScores() {
    const products = await Product.find({ isActive: true });

    for (const product of products) {
      // Calculate trending score (last 7 days)
      const trendingScore = await UserInteraction.aggregate([
        {
          $match: {
            product: product._id,
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: null,
            score: { $sum: '$interactionWeight' },
          },
        },
      ]);

      // Calculate overall recommendation score
      const recommendationScore =
        product.rating * 10 +
        product.purchaseCount * 5 +
        product.viewCount * 0.1 +
        (product.isPremium ? 20 : 0);

      await Product.findByIdAndUpdate(product._id, {
        trendingScore: trendingScore[0]?.score || 0,
        recommendationScore,
        lastTrendingUpdate: new Date(),
      });
    }

    console.log('✅ Product recommendation scores updated');
  }
}

module.exports = new RecommendationEngine();