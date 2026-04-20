const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { protect } = require('../middleware/auth');

router.post('/send', protect, sendOTP);
router.post('/verify', protect, verifyOTP);

module.exports = router;