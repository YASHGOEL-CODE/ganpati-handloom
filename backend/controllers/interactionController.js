const UserInteraction = require('../models/UserInteraction');

// @desc    Track user interaction
// @route   POST /api/interactions
// @access  Public
const trackInteraction = async (req, res) => {
  try {
    const { productId, interactionType, metadata } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.sessionID || `guest-${Date.now()}`;

    if (!productId || !interactionType) {
      return res.status(400).json({ message: 'Product ID and interaction type are required' });
    }

    const interaction = await UserInteraction.create({
      user: userId || undefined,
      sessionId: userId ? undefined : sessionId,
      product: productId,
      interactionType,
      metadata: metadata || {},
    });

    res.status(201).json({ success: true, interaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's interaction history
// @route   GET /api/interactions/history
// @access  Private
const getUserInteractionHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const interactions = await UserInteraction.find({ user: req.user._id })
      .populate('product', 'name images price category')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get interaction analytics
// @route   GET /api/interactions/analytics
// @access  Private
const getInteractionAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const analytics = await UserInteraction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$interactionType',
          count: { $sum: 1 },
          totalWeight: { $sum: '$interactionWeight' },
        },
      },
      { $sort: { totalWeight: -1 } },
    ]);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  trackInteraction,
  getUserInteractionHistory,
  getInteractionAnalytics,
};