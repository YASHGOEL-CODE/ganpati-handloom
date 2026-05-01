// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, verifyEmail, resendVerification, login, getMe, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('../config/passport');

// ── Existing routes — completely unchanged ──
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);

// ── NEW: Google OAuth routes ──
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/signin?error=google_failed`,
    session: false,
  }),
  googleCallback
);

module.exports = router;