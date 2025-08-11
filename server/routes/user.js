const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validation middleware for profile updates
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  body('currentLocation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('headline')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Headline must be less than 200 characters'),
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Summary must be less than 1000 characters'),
  body('expectedSalary')
    .optional()
    .isNumeric()
    .withMessage('Expected salary must be a valid number'),
  body('noticePeriod')
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage('Notice period must be between 0 and 365 days'),
  body('willingToRelocate')
    .optional()
    .isBoolean()
    .withMessage('Willing to relocate must be a boolean value'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('profileVisibility')
    .optional()
    .isIn(['public', 'private', 'connections_only'])
    .withMessage('Profile visibility must be public, private, or connections_only'),
  body('contactVisibility')
    .optional()
    .isIn(['public', 'private', 'connections_only'])
    .withMessage('Contact visibility must be public, private, or connections_only')
];

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'currentLocation', 'headline', 
      'summary', 'expectedSalary', 'noticePeriod', 'willingToRelocate',
      'gender', 'profileVisibility', 'contactVisibility', 'skills',
      'languages', 'certifications', 'socialLinks', 'preferences'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Update last profile update timestamp
    updateData.lastProfileUpdate = new Date();

    // Calculate profile completion percentage
    const profileFields = [
      'firstName', 'lastName', 'email', 'phone', 'currentLocation',
      'headline', 'summary', 'skills', 'languages'
    ];
    
    let completedFields = 0;
    profileFields.forEach(field => {
      if (req.user[field] || (req.body[field] && req.body[field].length > 0)) {
        completedFields++;
      }
    });
    
    updateData.profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    await req.user.update(updateData);

    // Fetch updated user data
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await req.user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update notification preferences
router.put('/notifications', authenticateToken, [
  body('emailNotifications')
    .optional()
    .isObject()
    .withMessage('Email notifications must be an object'),
  body('pushNotifications')
    .optional()
    .isObject()
    .withMessage('Push notifications must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = {};
    
    if (req.body.emailNotifications) {
      updateData.emailNotifications = {
        ...req.user.emailNotifications,
        ...req.body.emailNotifications
      };
    }
    
    if (req.body.pushNotifications) {
      updateData.pushNotifications = {
        ...req.user.pushNotifications,
        ...req.body.pushNotifications
      };
    }

    await req.user.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully'
    });

  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { password } = req.body;

    // Verify password
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Soft delete - update account status
    await req.user.update({ 
      accountStatus: 'deactivated',
      isActive: false
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
