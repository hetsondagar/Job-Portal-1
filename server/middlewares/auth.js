const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 [AUTH] Starting authentication for:', req.path);
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ [AUTH] No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    console.log('🔍 [AUTH] Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ [AUTH] JWT token verified, user ID:', decoded.id);
    
    console.log('🔍 [AUTH] Fetching user from database...');
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('❌ [AUTH] User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_active) {
      console.log('❌ [AUTH] User account is inactive');
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    console.log('✅ [AUTH] User authenticated successfully:', { id: user.id, type: user.user_type });
    req.user = {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      region: user.region
    };
    next();
  } catch (error) {
    console.error('❌ [AUTH] Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ [AUTH] Invalid JWT token');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('❌ [AUTH] Token expired');
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    console.log('❌ [AUTH] General authentication failure');
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

module.exports = { authenticateToken };
