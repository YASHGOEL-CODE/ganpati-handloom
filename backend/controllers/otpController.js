const OTP = require('../models/OTP');
const axios = require('axios');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via MSG91
// Send OTP via MSG91 - FIXED VERSION
const sendOTPviaSMS = async (phone, otp) => {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    
    if (!authKey || !templateId) {
      console.log('⚠️ MSG91 not configured');
      console.log('AUTH_KEY:', authKey ? 'Present' : 'Missing');
      console.log('TEMPLATE_ID:', templateId ? 'Present' : 'Missing');
      console.log('🔐 OTP (console):', otp, 'for phone:', phone);
      return false;
    }

    console.log('📧 Attempting to send OTP via MSG91...');
    console.log('✅ AUTH_KEY:', authKey.substring(0, 10) + '...');
    console.log('✅ TEMPLATE_ID:', templateId);
    console.log('✅ Phone:', phone);
    console.log('✅ OTP:', otp);

    // ✅ CORRECT MSG91 OTP API v5
    const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${phone}&authkey=${authKey}&otp=${otp}`;

    console.log('📤 API URL:', url);

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ MSG91 Response Status:', response.status);
    console.log('✅ MSG91 Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data.type === 'success') {
      console.log('🎉 OTP SENT SUCCESSFULLY!');
      return true;
    } else {
      console.log('⚠️ MSG91 returned non-success:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ MSG91 API Error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    console.log('🔐 OTP (console fallback):', otp, 'for phone:', phone);
    return false;
  }
};

// @desc    Send OTP
// @route   POST /api/otp/send
// @access  Private
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    console.log('📱 OTP request for:', phone);

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits starting with 6-9.',
      });
    }

    // Prevent spam
    const recentOTP = await OTP.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 1 minute before requesting another OTP.',
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.deleteMany({ phone });

    await OTP.create({
      phone,
      otp,
      expiresAt,
      attempts: 0,
      isVerified: false,
    });

    const smsSent = await sendOTPviaSMS(phone, otp);

    console.log('✅ OTP created:', otp);
    console.log('📧 SMS sent:', smsSent);

    res.json({
      success: true,
      message: smsSent 
        ? 'OTP sent successfully to your phone.' 
        : 'OTP created (check console - SMS service not configured)',
      expiresIn: 300,
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Private
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log('🔍 Verifying OTP:', otp, 'for:', phone);

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required.',
      });
    }

    const otpRecord = await OTP.findOne({
      phone,
      expiresAt: { $gt: Date.now() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      console.log('❌ OTP not found or expired');
      return res.status(400).json({
        success: false,
        message: 'OTP expired or invalid. Please request a new one.',
      });
    }

    if (otpRecord.attempts >= 5) {
      console.log('❌ Too many attempts');
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    if (otpRecord.otp !== otp) {
      console.log('❌ Invalid OTP');
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`,
      });
    }

    console.log('✅ OTP verified');
    
    otpRecord.isVerified = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: 'Phone number verified successfully.',
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed. Please try again.',
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};