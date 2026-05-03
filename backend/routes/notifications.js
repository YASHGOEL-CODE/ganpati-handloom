const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  createNotificationAPI,
  getNotificationById, // ── ADDED ──
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// ── IMPORTANT: Static routes MUST come before /:id param routes ──
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/mark-all-read', markAllRead);
router.post('/', admin, createNotificationAPI);
router.patch('/:id/read', markAsRead);

// ── ADDED: Get single notification by ID ──
router.get('/:id', getNotificationById);

module.exports = router;