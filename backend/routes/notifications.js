const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  createNotificationAPI,
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// ── IMPORTANT: Static routes MUST come before /:id param routes ──
// Otherwise Express matches "unread-count" and "mark-all-read"
// as the :id parameter and hits the wrong handler.

// GET  /api/notifications                → get list
router.get('/', getNotifications);

// GET  /api/notifications/unread-count   → lightweight count for navbar
router.get('/unread-count', getUnreadCount);

// PATCH /api/notifications/mark-all-read → mark all as read
router.patch('/mark-all-read', markAllRead);

// POST /api/notifications                → create (admin only)
router.post('/', admin, createNotificationAPI);

// PATCH /api/notifications/:id/read      → mark single as read
// ← must be AFTER the static routes above
router.patch('/:id/read', markAsRead);

module.exports = router;