const express = require('express');
const router = express.Router();
const UserInteraction = require('../models/UserInteraction');
const { protect } = require('../middleware/auth');

// @desc    Track user interaction
// @route   POST /api/interactions
// @access  Public
const trackInteraction = async (req, res) => {
  try {
    const { productId, interactionType, metadata } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.sessionID;

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
      .populate('product', 'name images price')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.post('/', trackInteraction);
router.get('/history', protect, getUserInteractionHistory);

module.exports = router;