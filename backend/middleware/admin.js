/**
 * Admin Middleware
 * Checks if authenticated user has admin role
 * Must be used AFTER protect middleware
 */

const isAdmin = (req, res, next) => {
  console.log('🔵 IS_ADMIN MIDDLEWARE CALLED');
  console.log('🔵 User:', req.user);
  
  try {
    // Check if user exists (set by auth middleware)
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user role is admin
    if (req.user.role !== 'admin') {
      console.log('❌ Access denied - User is not admin:', req.user.email);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // User is admin - allow access
    console.log('✅ Admin access granted:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = { isAdmin };