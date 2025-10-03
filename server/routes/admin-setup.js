/**
 * Admin setup routes for ensuring admin user exists
 */

const express = require('express');
const router = express.Router();
const { ensureAdminUser } = require('../scripts/ensureAdminUser');

// Endpoint to ensure admin user exists (no auth required for setup)
router.post('/ensure-admin', async (req, res) => {
  try {
    console.log('🔧 Admin setup request received');
    
    const adminUser = await ensureAdminUser();
    
    res.json({
      success: true,
      message: 'Admin user ensured successfully',
      data: {
        email: adminUser.email,
        userType: adminUser.user_type,
        isActive: adminUser.is_active,
        id: adminUser.id
      }
    });
  } catch (error) {
    console.error('❌ Admin setup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ensure admin user',
      error: error.message
    });
  }
});

// Health check for admin setup
router.get('/admin-health', async (req, res) => {
  try {
    const { User } = require('../models');
    
    const adminUser = await User.findOne({
      where: { email: 'admin@campus.com' }
    });
    
    if (adminUser && adminUser.user_type === 'admin' && adminUser.is_active) {
      res.json({
        success: true,
        message: 'Admin user is ready',
        data: {
          email: adminUser.email,
          userType: adminUser.user_type,
          isActive: adminUser.is_active
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Admin user not found or inactive',
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Admin health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Admin health check failed',
      error: error.message
    });
  }
});

module.exports = router;
