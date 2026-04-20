const Notification = require('../models/Notification');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get notifications (user sees own, admin sees all admin notifs)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter = {};

    if (req.user.role === 'admin') {
      filter.role = 'admin';
    } else {
      filter.role = 'user';
      filter.$or = [
        { userId: req.user._id },
        { userId: null },
      ];
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lightweight unread count — polled by navbar every 15s
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    let filter = { isRead: false };

    if (req.user.role === 'admin') {
      filter.role = 'admin';
    } else {
      filter.role = 'user';
      filter.$or = [{ userId: req.user._id }, { userId: null }];
    }

    const count = await Notification.countDocuments(filter);
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (
      req.user.role !== 'admin' &&
      notif.userId &&
      notif.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notif.isRead = true;
    await notif.save();

    res.json({ success: true, notification: notif });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
const markAllRead = async (req, res) => {
  try {
    let filter = { isRead: false };

    if (req.user.role === 'admin') {
      filter.role = 'admin';
    } else {
      filter.role = 'user';
      filter.$or = [{ userId: req.user._id }, { userId: null }];
    }

    const result = await Notification.updateMany(filter, { $set: { isRead: true } });

    res.json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read`,
    });
  } catch (error) {
    console.error('❌ Mark all read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create notification (admin only, manual)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotificationAPI = async (req, res) => {
  try {
    const { title, message, type, role, userId, actionLink, meta } = req.body;

    if (!title || !message || !role) {
      return res.status(400).json({
        success: false,
        message: 'title, message, and role are required',
      });
    }

    const notif = await createNotification({
      title, message, type, role, userId, actionLink, meta,
    });

    res.status(201).json({ success: true, notification: notif });
  } catch (error) {
    console.error('❌ Create notification API error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  createNotificationAPI,
};