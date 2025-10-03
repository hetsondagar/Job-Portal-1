const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 [AUTH] Starting authentication for:', req.path);
    
    const authHeader = req.headers['authorization'];
    console.log('🔍 [AUTH] Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log('🔍 [AUTH] Token extracted:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('❌ [AUTH] No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    console.log('🔍 [AUTH] Verifying token with secret:', process.env.JWT_SECRET ? 'Present' : 'Using default');
    
    let decoded;
    try {
      // Try with environment JWT secret first
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      console.log('🔍 [AUTH] Primary JWT verification failed, trying fallback secret');
      // Fallback to default secret if environment secret fails
      try {
        decoded = jwt.verify(token, 'your-secret-key');
        console.log('✅ [AUTH] Token verified with fallback secret');
      } catch (fallbackError) {
        console.log('❌ [AUTH] Both JWT verification attempts failed');
        throw jwtError; // Throw original error
      }
    }
    console.log('🔍 [AUTH] Token decoded successfully:', { 
      id: decoded.id, 
      email: decoded.email, 
      userType: decoded.userType 
    });
    
    // Fetch user from database to ensure they still exist and are active
    console.log('🔍 [AUTH] Looking up user by ID:', decoded.id);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      console.log('❌ [AUTH] User not found in database for ID:', decoded.id);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('🔍 [AUTH] User found:', { 
      id: user.id, 
      email: user.email, 
      user_type: user.user_type, 
      is_active: user.is_active 
    });

    if (!user.is_active) {
      console.log('❌ [AUTH] User account is inactive');
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      region: user.region
    };

    console.log('✅ [AUTH] Authentication successful for user:', user.email);
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
