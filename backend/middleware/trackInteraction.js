const UserInteraction = require('../models/UserInteraction');

// Middleware to automatically track product views
const trackProductView = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    if (productId) {
      await UserInteraction.create({
        user: userId || undefined,
        sessionId: userId ? undefined : sessionId,
        product: productId,
        interactionType: 'view',
        metadata: {
          source: req.headers.referer || 'direct',
          deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
        },
      });
    }
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }

  next();
};

// Manual interaction tracking endpoint
const trackInteraction = async (req, res) => {
  try {
    const { productId, interactionType, metadata } = req.body;
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    const interaction = await UserInteraction.create({
      user: userId || undefined,
      sessionId: userId ? undefined : sessionId,
      product: productId,
      interactionType,
      metadata,
    });

    res.status(201).json({ success: true, interaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { trackProductView, trackInteraction };