const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/email');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    console.log('📝 Registration attempt:', { fullName, email });

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {

      // ── ADDED: Check if existing user signed up with Google ──
      if (existingUser.googleId) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists via Google. Please sign in with Google.',
        });
      }
      // ── End added ──

      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user (isVerified: false by default)
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      isVerified: false,
    });

    console.log('✅ User created (unverified):', user._id);

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    console.log('🔑 Verification token generated');

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
      console.log('📧 Verification email sent');
    } catch (emailError) {
      console.error('❌ Email send failed:', emailError);

      // Delete user if email fails
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      email: user.email,
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    console.log('🔍 Verification attempt');
    console.log('📥 Received token (first 20 chars):', token.substring(0, 20));

    // Hash token to match database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    console.log('🔐 Hashed token (first 20 chars):', hashedToken.substring(0, 20));

    // Find user with valid token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() },
    }).select('+verificationToken +verificationTokenExpiry');

    console.log('👤 User found:', !!user);

    if (user) {
      console.log('⏰ Token expiry:', new Date(user.verificationTokenExpiry));
      console.log('🕐 Current time:', new Date());
      console.log('✅ Token valid:', user.verificationTokenExpiry > Date.now());
    }

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    console.log('✅ Email verified:', user.email);

    // Send welcome email
    await sendWelcomeEmail(user);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📧 Resend verification request:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address',
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. You can login now.',
      });
    }

    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    console.log('✅ Verification email resent');

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check user exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // ── ADDED: Check if user signed up with Google ──
    if (user.googleId && (!user.password || user.password.startsWith('google-oauth-'))) {
      return res.status(400).json({
        success: false,
        message: 'This account was created using Google. Please sign in with Google instead.',
        isGoogleAccount: true, // frontend can use this to show Google button
      });
    }
    // ── End added ──

    // Check email verification
    if (!user.isVerified) {
      console.log('❌ Login blocked: Email not verified');
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for verification link.',
        requiresVerification: true,
        email: user.email,
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    console.log('✅ Login successful:', user.email);

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
    });
  }
};

// @desc    Google OAuth callback — generate JWT and redirect to frontend
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/signin?error=google_failed`);
    }

    // Generate JWT using existing generateToken function
    const token = generateToken(user._id);

    // Build user object same shape as login response
    const userPayload = encodeURIComponent(JSON.stringify({
      _id:        user._id,
      fullName:   user.fullName,
      email:      user.email,
      phone:      user.phone || '',
      role:       user.role,
      isVerified: user.isVerified,
    }));

    res.redirect(
      `${process.env.CLIENT_URL}/login-success?token=${token}&user=${userPayload}`
    );
  } catch (error) {
    console.error('❌ Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/signin?error=google_failed`);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  getMe,
  googleCallback,
};