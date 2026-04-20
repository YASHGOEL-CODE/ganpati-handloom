const express = require('express');
const router = express.Router();
const { register, verifyEmail, resendVerification, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// Protected routes
router.get('/me', protect, getMe);

// ✅ REMOVED: Update phone verification route (not needed without OTP)

module.exports = router;