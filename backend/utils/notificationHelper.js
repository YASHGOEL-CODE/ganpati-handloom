const Notification = require('../models/Notification');

/**
 * createNotification — standalone utility, safe to import anywhere
 *
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} options.type      — 'order' | 'payment' | 'offer' | 'system' | 'stock' | 'user'
 * @param {string} options.role      — 'user' | 'admin'
 * @param {*}      options.userId    — ObjectId (optional, for user-specific)
 * @param {string} options.actionLink — e.g. '/orders/abc123'
 * @param {Object} options.meta      — any extra data
 */
const createNotification = async ({
  title,
  message,
  type = 'system',
  role,
  userId = null,
  actionLink = null,
  meta = {},
}) => {
  try {
    const notif = await Notification.create({
      title,
      message,
      type,
      role,
      userId: userId || null,
      isRead: false,
      actionLink: actionLink || null,
      meta,
    });
    console.log(`🔔 Notification created [${role}]: ${title}`);
    return notif;
  } catch (err) {
    // Never let notification failure break the main flow
    console.error('⚠️  Notification creation failed (non-blocking):', err.message);
    return null;
  }
};

module.exports = { createNotification };