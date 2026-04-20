const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Rate limiting for API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitize user input
const sanitizeInput = (req, res, next) => {
  console.log('🔵 SANITIZE INPUT MIDDLEWARE');
  // Remove any keys that contain prohibited characters
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

// ✅ FIXED: Validate Content-Type for POST/PUT requests
const validateContentType = (req, res, next) => {
  console.log('🔵 VALIDATE CONTENT-TYPE MIDDLEWARE');
  console.log('🔵 Method:', req.method);
  console.log('🔵 Content-Type:', req.get('Content-Type'));
  
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    // ✅ Skip validation for multipart/form-data (file uploads)
    if (contentType && contentType.includes('multipart/form-data')) {
      console.log('✅ Multipart form data - skipping validation');
      return next();
    }
    
    // ✅ Check for application/json
    if (!contentType || !contentType.includes('application/json')) {
      console.log('❌ Invalid Content-Type');
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be application/json',
      });
    }
  }
  
  console.log('✅ Content-Type validation passed');
  next();
};

// Prevent parameter pollution
const preventParameterPollution = hpp({
  whitelist: ['price', 'rating', 'category', 'fabricType'],
});

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// IP-based request tracking
const requestLogger = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
  next();
};

module.exports = {
  loginLimiter,
  apiLimiter,
  passwordResetLimiter,
  sanitizeInput,
  validateContentType,
  preventParameterPollution,
  securityHeaders,
  requestLogger,
  mongoSanitize: mongoSanitize(),
  xss: xss(),
};