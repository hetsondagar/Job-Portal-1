const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to require admin privileges
const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (from authenticateToken middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is admin
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }

    // Verify user still exists and is active
    const user = await User.findByPk(req.user.id);
    if (!user || !user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account not found or inactive'
      });
    }

    // Add admin user to request
    req.admin = user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin authentication failed',
      error: error.message
    });
  }
};

module.exports = { requireAdmin };