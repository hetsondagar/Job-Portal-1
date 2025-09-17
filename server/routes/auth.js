const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const { sequelize } = require('../config/sequelize');
const emailService = require('../services/simpleEmailService');

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  body('experience')
    .optional()
    .isIn(['fresher', 'junior', 'mid', 'senior', 'lead'])
    .withMessage('Experience level must be fresher, junior, mid, senior, or lead')
];

const validateEmployerSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('companyId')
    .optional()
    .isUUID()
    .withMessage('Invalid companyId'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),
  body('phone')
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone number must be between 8 and 20 characters')
    .matches(/^[\+]?[0-9\s\-\(\)\.]+$/)
    .withMessage('Please enter a valid phone number (digits, spaces, dashes, parentheses, and dots allowed)'),
  body('companySize')
    .optional({ checkFalsy: true })
    .isIn(['1-50', '51-200', '201-500', '500-1000', '1000+'])
    .withMessage('Invalid company size'),
  body('industry')
    .optional({ checkFalsy: true })
    .isIn(['technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing', 'consulting', 'other'])
    .withMessage('Invalid industry'),
  body('region')
    .optional()
    .isIn(['india', 'gulf', 'other'])
    .withMessage('Region must be india, gulf, or other'),
  body('agreeToTerms')
    .custom((value) => {
      // Handle both boolean and string values
      const boolValue = value === true || value === 'true' || value === 1;
      if (!boolValue) {
        throw new Error('You must agree to the terms and conditions');
      }
      return true;
    })
    .withMessage('You must agree to the terms and conditions')
  // Ensure either companyId or companyName is provided
  , (req, res, next) => {
    if (!req.body.companyId && !req.body.companyName) {
      return res.status(400).json({ success: false, message: 'Provide either companyId to join or companyName to create a new company' });
    }
    next();
  }
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
];

const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      userType: user.user_type 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Signup endpoint
router.post('/signup', validateSignup, async (req, res) => {
  try {
    console.log('🔍 Signup request received:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, fullName, phone, experience } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create new user
    console.log('📝 Creating user with data:', {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      user_type: 'jobseeker',
      account_status: 'active'
    });
    
    const user = await User.create({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone,
      user_type: 'jobseeker', // Default to jobseeker
      account_status: 'active',
      is_email_verified: false,
      oauth_provider: 'local', // Ensure this is set for regular registrations
      // Store experience level in preferences
      preferences: {
        experience: experience || 'fresher',
        ...req.body.preferences
      }
    });
    
    console.log('✅ User created successfully:', user.id);

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          isEmailVerified: user.is_email_verified,
          accountStatus: user.account_status
        },
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Employer signup endpoint
router.post('/employer-signup', validateEmployerSignup, async (req, res) => {
  try {
    console.log('🔍 Employer signup request received:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, fullName, companyName, companyId, phone, companySize, industry, website, region, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Start a transaction to create user and (optionally) company
    const transaction = await sequelize.transaction();

    try {
      // Generate unique slug from company name
      const generateSlug = async (name) => {
        let baseSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .substring(0, 50);
        
        let slug = baseSlug;
        let counter = 1;
        
        // Check if slug exists and generate unique one
        while (true) {
          const existingCompany = await Company.findOne({ where: { slug } });
          if (!existingCompany) {
            break;
          }
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        return slug;
      };

      let company = null;
      if (companyId) {
        // Join existing company
        company = await Company.findByPk(companyId, { transaction });
        if (!company) {
          throw new Error('Company not found');
        }
        console.log('✅ Joining existing company:', company.id);
      } else {
        const companySlug = await generateSlug(companyName);
        // Create company record
        console.log('📝 Creating company record:', { name: companyName, industry, companySize, website, slug: companySlug });
        company = await Company.create({
          name: companyName,
          slug: companySlug,
          industry: industry || 'Other',
          companySize: companySize || '1-50',
          website: website,
          email: email,
          phone: phone,
          region: region || 'india',
          contactPerson: fullName,
          contactEmail: email,
          contactPhone: phone,
          companyStatus: 'pending_approval',
          isActive: true
        }, { transaction });
        console.log('✅ Company created successfully:', company.id);
      }

      // Create new employer user
      console.log('📝 Creating employer user with data:', {
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        user_type: 'employer',
        account_status: 'active',
        company_id: company.id
      });
      
      const user = await User.create({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
        user_type: 'employer',
        account_status: 'active',
        is_email_verified: false,
        company_id: company.id,
        oauth_provider: 'local', // Ensure this is set for regular registrations
        // Store additional preferences
        preferences: {
          employerRole: companyId ? (role || 'recruiter') : 'admin',
          ...req.body.preferences
        }
      }, { transaction });
      
      console.log('✅ Employer user created successfully:', user.id);

      // Commit the transaction
      await transaction.commit();

      // Generate JWT token
      const token = generateToken(user);

      console.log('✅ Employer signup completed successfully for:', email);

      // Return success response with company information
      res.status(201).json({
        success: true,
        message: 'Employer account created successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            userType: user.user_type,
            isEmailVerified: user.is_email_verified,
            accountStatus: user.account_status,
            companyId: user.company_id
          },
          company: company ? {
            id: company.id,
            name: company.name,
            industry: company.industry,
            companySize: company.companySize,
            website: company.website,
            email: company.email,
            phone: company.phone,
            region: company.region
          } : undefined,
          token
        }
      });

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      console.error('❌ Transaction error during employer signup:', error);
      throw error;
    }

  } catch (error) {
    console.error('❌ Employer signup error:', error);
    
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      if (field === 'email') {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      } else if (field === 'slug') {
        return res.status(409).json({
          success: false,
          message: 'Company with this name already exists. Please choose a different company name.'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login endpoint
router.post('/login', validateLogin, async (req, res) => {
  try {
    console.log('🔍 Login request received:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ User found:', { id: user.id, email: user.email, userType: user.user_type });

    // Check if account is active
    if (user.account_status !== 'active') {
      console.log('❌ Account not active:', user.account_status);
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Password verified successfully');

    // Update last login
    await user.update({ last_login_at: new Date() });

    // Generate JWT token
    const token = generateToken(user);

    // Prepare response data
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        isEmailVerified: user.is_email_verified,
        accountStatus: user.account_status,
        lastLoginAt: user.last_login_at,
        companyId: user.company_id
      },
      token
    };

    // If user is an employer, include company information
    if (user.user_type === 'employer' && user.company_id) {
      const company = await Company.findByPk(user.company_id);
      if (company) {
        responseData.company = {
          id: company.id,
          name: company.name,
          industry: company.industry,
          companySize: company.companySize,
          website: company.website,
          email: company.email,
          phone: company.phone
        };
      }
    }

    console.log('✅ Login successful for user:', user.email);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
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

    // Map user data to frontend format (camelCase)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      isEmailVerified: user.is_email_verified,
      accountStatus: user.account_status,
      lastLoginAt: user.last_login_at,
      companyId: user.company_id,
      phone: user.phone,
      avatar: user.avatar,
      currentLocation: user.current_location,
      headline: user.headline,
      summary: user.summary,
      profileCompletion: user.profile_completion
    };

    res.status(200).json({
      success: true,
      data: { user: userData }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new token
    const newToken = generateToken(user);

    res.status(200).json({
      success: true,
      data: { token: newToken }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Forgot password endpoint
router.post('/forgot-password', validateForgotPassword, async (req, res) => {
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

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Check if account is active
    if (user.account_status !== 'active') {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: resetTokenExpiry
    });

    // Send password reset email
    try {
      const userName = user.first_name || user.email.split('@')[0];
      await emailService.sendPasswordResetEmail(user.email, resetToken, userName);
      
      console.log('✅ Password reset email sent successfully to:', user.email);
      
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      
      // Still return success to user for security (don't reveal if email exists)
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reset password endpoint
router.post('/reset-password', validateResetPassword, async (req, res) => {
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

    const { token, password } = req.body;

    // Find user by reset token
    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: { [sequelize.Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    await user.update({
      password: password,
      password_reset_token: null,
      password_reset_expires: null
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify reset token endpoint
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by reset token
    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: { [sequelize.Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reset token is valid'
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
