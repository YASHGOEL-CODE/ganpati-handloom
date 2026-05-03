// backend/routes/contactRoutes.js
const express = require('express');
const router  = express.Router();
const { createNotification } = require('../utils/notificationHelper');

// @desc    Submit contact form — creates admin notification
// @route   POST /api/contact
// @access  Public (no auth required)
router.post('/', async (req, res) => {
  try {
    const { name, email, message, phone, subject } = req.body;

    // ── Validate required fields ──
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required',
      });
    }

    // ── Build notification message ──
    const subjectLine = subject ? ` [${subject}]` : '';
    const phoneInfo   = phone   ? ` | Phone: ${phone}` : '';
    const preview     = message.length > 120
      ? message.substring(0, 120) + '...'
      : message;

    // ── Create admin notification ──
    await createNotification({
      title:      `New Contact Message${subjectLine}`,
      message:    `From: ${name} (${email})${phoneInfo}\n${preview}`,
      type:       'contact',
      role:       'admin',
      userId:     null,
      actionLink: '/admin',
      meta: {
        name,
        email,
        phone:   phone   || null,
        subject: subject || null,
        message,
      },
    });

    console.log(`📬 Contact form submitted by ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you within 24 hours.',
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.',
    });
  }
});

module.exports = router;