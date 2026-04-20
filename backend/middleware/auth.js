const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - JWT verification
const protect = async (req, res, next) => {
  console.log('🔵 PROTECT MIDDLEWARE CALLED');
  console.log('🔵 Request path:', req.path);
  console.log('🔵 Headers:', req.headers);
  
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies (if using cookie-based auth)
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    console.log('🔵 Auth middleware: Token received:', token ? 'Yes' : 'No');

    // Check if token exists
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-12345');
      
      console.log('🔵 Auth middleware: Token decoded:', decoded);

      // Find user by ID from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log('❌ Auth middleware: User not found');
        return res.status(401).json({
          success: false,
          message: 'User no longer exists',
        });
      }

      console.log('🔵 Auth middleware: User found:', user.email, 'Role:', user.role);

      // Check if user is active
      if (user.isActive !== undefined && !user.isActive) {
        console.log('❌ User account is deactivated');
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      // Attach user to request
      req.user = user;
      console.log('✅ User authenticated successfully, calling next()');
      next();
    } catch (error) {
      console.error('❌ Auth middleware: Token verification error:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired, please log in again',
          tokenExpired: true,
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token, please log in again',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token',
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware: Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};

// Admin role check
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required',
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-12345');
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && (user.isActive === undefined || user.isActive)) {
          req.user = user;
        }
      } catch (error) {
        console.log('Optional auth failed, treating as guest');
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Verify user owns the resource
const verifyOwnership = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    const resource = req.resource;
    
    if (!resource) {
      return res.status(404).json({ 
        success: false,
        message: 'Resource not found' 
      });
    }

    const resourceUserId = resource[resourceUserIdField]?.toString() || resource[resourceUserIdField];
    const requestUserId = req.user._id.toString();

    // Allow if admin or owner
    if (req.user.role === 'admin' || resourceUserId === requestUserId) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this resource',
      });
    }
  };
};

// Check specific permissions
const checkPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has required permission
    const hasPermission = permissions.some(permission => {
      return req.user.permissions && req.user.permissions.includes(permission);
    });

    if (hasPermission) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions',
      });
    }
  };
};

module.exports = {
  protect,
  admin,
  optionalAuth,
  verifyOwnership,
  checkPermission,
};