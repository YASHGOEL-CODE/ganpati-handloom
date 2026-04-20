const express = require('express');
const router = express.Router();
const SMSLog = require('../models/SMSLog');
const smsService = require('../services/sms/SMSService');
const { protect, admin } = require('../middleware/auth');

// @desc    Get SMS logs for user
// @route   GET /api/sms/logs
// @access  Private
router.get('/logs', protect, async (req, res) => {
  try {
    const logs = await SMSLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get SMS statistics (Admin)
// @route   GET /api/sms/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate),
    } : null;

    const stats = await smsService.getStats(null, dateRange);

    // Get total counts
    const totalSent = await SMSLog.countDocuments({ status: 'sent' });
    const totalFailed = await SMSLog.countDocuments({ status: 'failed' });
    const totalCost = await SMSLog.aggregate([
      { $match: { status: 'sent' } },
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]);

    res.json({
      stats,
      summary: {
        totalSent,
        totalFailed,
        totalCost: totalCost[0]?.total || 0,
        successRate: totalSent / (totalSent + totalFailed) * 100 || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Resend failed SMS (Admin)
// @route   POST /api/sms/resend/:id
// @access  Private/Admin
router.post('/resend/:id', protect, admin, async (req, res) => {
  try {
    const smsLog = await SMSLog.findById(req.params.id).populate('user');

    if (!smsLog) {
      return res.status(404).json({ message: 'SMS log not found' });
    }

    if (smsLog.status === 'sent') {
      return res.status(400).json({ message: 'SMS already sent successfully' });
    }

    // Resend SMS
    const result = await smsService.sendSMS({
      phone: smsLog.phone,
      template: smsLog.template,
      data: smsLog.metadata || {},
      userId: smsLog.user._id,
      orderId: smsLog.order,
    });

    res.json({ message: 'SMS resent', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Send test SMS (Admin)
// @route   POST /api/sms/test
// @access  Private/Admin
router.post('/test', protect, admin, async (req, res) => {
  try {
    const { phone, message } = req.body;

    const result = await smsService.sendSMS({
      phone,
      template: 'custom',
      data: { message: message || 'Test SMS from Ganpati Handloom' },
      userId: req.user._id,
    });

    res.json({ message: 'Test SMS sent', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;