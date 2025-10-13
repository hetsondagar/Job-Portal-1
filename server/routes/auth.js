const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const { sequelize } = require('../config/sequelize');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

const router = express.Router();

// Test endpoint to verify auth routes are working
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

// Validation middleware
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      gmail_convert_googlemaildotcom: false
    })
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
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      gmail_convert_googlemaildotcom: false
    })
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
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Industry must be between 2 and 100 characters'),
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
    .withMessage('Please enter a valid email address')
    .bail()
    .customSanitizer((value) => typeof value === 'string' ? value.trim().toLowerCase() : value),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      gmail_convert_googlemaildotcom: false
    })
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
  console.log('🔍 [LOGIN] Generating JWT token for user:', user.email);
  console.log('🔍 [LOGIN] Using JWT secret:', process.env.JWT_SECRET ? 'Present' : 'Using default');
  
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      userType: user.user_type 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  console.log('✅ [LOGIN] JWT token generated successfully');
  return token;
};

// Helper function to determine redirect URL based on user type and region
const getRedirectUrl = (userType, region) => {
  if (userType === 'superadmin') {
    return '/admin/dashboard';
  } else if (userType === 'employer' || userType === 'admin') {
    return region === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard';
  } else if (userType === 'jobseeker') {
    if (region === 'gulf') {
      return '/jobseeker-gulf-dashboard';
    } else {
      return '/dashboard';
    }
  }
  return '/dashboard'; // Default fallback
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

    const { email, password, fullName, companyName, companyId, phone, companySize, industry, website, region, role, companyAccountType } = req.body;

    // Check if user already exists and handle re-registration for rejected accounts
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // Check if the user's company is rejected OR user account is rejected - allow re-registration
      const existingCompany = await Company.findByPk(existingUser.companyId);
      
      // Allow re-registration if:
      // 1. Company verification is rejected
      // 2. User account is rejected  
      // 3. User account is pending verification (in case of incomplete registration)
      // 4. Company verification is pending (incomplete registration)
      const allowReRegistration = (
        (existingCompany && existingCompany.verificationStatus === 'rejected') || 
        existingUser.account_status === 'rejected' ||
        existingUser.account_status === 'pending_verification' ||
        (existingCompany && existingCompany.verificationStatus === 'pending')
      );
      
      if (allowReRegistration) {
        console.log('🔄 Allowing re-registration for user:', email, 'Status:', existingUser.account_status, 'Company status:', existingCompany?.verificationStatus);
        // Continue with registration - will update existing company
      } else {
        console.log('❌ User already exists with active account:', email);
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
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
        
        // Check if company is unclaimed (created by agency)
        if (!company.isClaimed && company.createdByAgencyId) {
          console.log('🔓 Claiming unclaimed company:', company.name);
          
          // Update company as claimed
          company.isClaimed = true;
          company.claimedAt = new Date();
          company.contactPerson = fullName;
          company.contactEmail = email;
          company.contactPhone = phone;
          company.email = email;
          company.phone = phone;
          
          // Note: Don't set claimedByUserId yet - will be set after user creation
          await company.save({ transaction });
          
          console.log('✅ Company claimed successfully by actual owner');
        } else {
          console.log('✅ Joining existing company:', company.id);
        }
      } else {
        // Handle new company creation or re-registration
        
        if (existingUser && existingUser.companyId) {
          // Update existing company for re-registration
          company = await Company.findByPk(existingUser.companyId, { transaction });
          if (company && company.verificationStatus === 'rejected') {
            console.log('🔄 Updating rejected company for re-registration:', company.name);
            await company.update({
              name: companyName,
              industry: industry || company.industry,
              companySize: companySize || company.companySize,
              website: website || company.website,
              email: email,
              phone: phone,
              contactPerson: fullName,
              contactEmail: email,
              contactPhone: phone,
              companyStatus: 'pending_approval',
              verificationStatus: 'pending',
              companyAccountType: companyAccountType || 'direct'
            }, { transaction });
          }
        }
        
        if (!company) {
          // Create new company record
          const companySlug = await generateSlug(companyName);
          console.log('📝 Creating company record:', { name: companyName, industry, companySize, website, slug: companySlug, companyAccountType });
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
            isActive: true,
            companyAccountType: companyAccountType || 'direct',
            verificationStatus: 'pending', // All new registrations need verification
            isClaimed: true,
            claimedAt: new Date()
          }, { transaction });
        }
        
        console.log('✅ Company created/updated successfully:', company?.id);
      }

      // Ensure company exists before proceeding
      if (!company) {
        throw new Error('Company creation/retrieval failed');
      }

      // Determine user type and designation based on whether they're creating a new company or joining existing one
      const userType = companyId ? 'employer' : 'admin'; // New company = admin, existing company = employer
      const designation = companyId ? 'Recruiter' : 'Hiring Manager'; // Set proper designation
      
      // Create or update employer user
      let user;
      
      const allowUserUpdate = (
        (existingUser && existingCompany?.verificationStatus === 'rejected') || 
        (existingUser && existingUser.account_status === 'rejected') ||
        (existingUser && existingUser.account_status === 'pending_verification') ||
        (existingUser && existingCompany?.verificationStatus === 'pending')
      );
      
      if (existingUser && allowUserUpdate) {
        // Update existing user for re-registration
        console.log('🔄 Updating existing user for re-registration:', email);
        await existingUser.update({
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
          user_type: userType,
          designation: designation,
          account_status: 'active', // Set to active initially, will be updated by verification system
          company_id: company.id,
          preferences: {
            employerRole: companyId ? (role || 'recruiter') : 'admin',
            ...req.body.preferences
          }
        }, { transaction });
        user = existingUser;
      } else {
        // Create new employer user
        console.log('📝 Creating employer user with data:', {
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          user_type: userType,
          account_status: 'active',
          company_id: company.id
        });
        
        user = await User.create({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
          user_type: userType,
          designation: designation,
          account_status: 'active', // Set to active initially, will be updated by verification system
          is_email_verified: false,
          company_id: company.id,
          oauth_provider: 'local',
          preferences: {
            employerRole: companyId ? (role || 'recruiter') : 'admin',
            ...req.body.preferences
          }
        }, { transaction });
      }
      
      console.log('✅ Employer user created successfully:', user.id);

      // If this was a company claiming (unclaimed company joined), update claimedByUserId
      if (companyId && company && !company.claimedByUserId && company.claimedAt) {
        company.claimedByUserId = user.id;
        await company.save({ transaction });
        console.log('✅ Updated company claimedByUserId:', user.id);
      }

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
            region: company.region,
            companyAccountType: company.companyAccountType,
            verificationStatus: company.verificationStatus
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

    const { email, password, loginType } = req.body;
    console.log('🧪 Login debug: rawEmail=', req.body?.email, 'sanitizedEmail=', email, 'loginType=', loginType);

    // Find user by email (exact match first)
    let user = await User.findOne({ where: { email } });
    console.log('🧪 Login debug: exact match found? ', !!user);

    // Gmail-specific fallback: if not found and looks like gmail, try matching ignoring dots
    if (!user) {
      const lowerEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
      const looksLikeGmail = lowerEmail.endsWith('@gmail.com') || lowerEmail.endsWith('@googlemail.com');
      console.log('🧪 Login debug: looksLikeGmail=', looksLikeGmail, 'lowerEmail=', lowerEmail);
      if (looksLikeGmail) {
        const { sequelize } = require('../config/sequelize');
        const strippedInput = lowerEmail.replace(/\./g, '');
        console.log('🧪 Login debug: strippedInputForFallback=', strippedInput);
        user = await User.findOne({
          where: sequelize.where(
            sequelize.fn('replace', sequelize.fn('lower', sequelize.col('email')), '.', ''),
            strippedInput
          )
        });
        console.log('🧪 Login debug: fallback match found? ', !!user);
      }
    }

    if (!user) {
      console.log('❌ User not found after exact+fallback:', email);
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

    // Validate login type if specified
    if (loginType) {
      console.log('🔍 Validating login type:', { loginType, userType: user.user_type });
      
      if (loginType === 'employer' && user.user_type === 'jobseeker') {
        console.log('❌ Jobseeker trying to login through employer login');
        return res.status(403).json({
          success: false,
          message: 'This account is registered as a jobseeker. Please use the jobseeker login page.',
          redirectTo: '/login'
        });
      }
      
      if (loginType === 'jobseeker' && (user.user_type === 'employer' || user.user_type === 'admin' || user.user_type === 'superadmin')) {
        console.log('❌ Employer/Admin/Superadmin trying to login through jobseeker login');
        return res.status(403).json({
          success: false,
          message: 'This account is registered as an employer. Please use the employer login page.',
          redirectTo: '/employer-login'
        });
      }
      
      if (loginType === 'employer' && user.user_type === 'superadmin') {
        console.log('❌ Superadmin trying to login through employer login');
        return res.status(403).json({
          success: false,
          message: 'This account is registered as a system administrator. Please use the admin login page.',
          redirectTo: '/admin-login'
        });
      }
      
      // Validate admin login - only allow admin and superadmin users
      if (loginType === 'admin'  && user.user_type !== 'superadmin') {
        console.log('❌ Non-admin user trying to login through admin login:', user.user_type);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
          redirectTo: '/login'
        });
      }
    }

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
        companyId: user.company_id,
        region: user.region,
        currentLocation: user.current_location,
        profileCompletion: user.profile_completion
      },
      token,
      redirectTo: getRedirectUrl(user.user_type, user.region)
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
          email: company.contactEmail,
          phone: company.contactPhone
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
      profileCompletion: user.profile_completion,
      designation: user.designation,
      region: user.region
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

    // Send password reset email asynchronously to avoid blocking the response
    try {
      const userName = user.first_name || user.email.split('@')[0];
      console.log(`📧 Scheduling password reset email for: ${user.email}`);
      
      // Fire-and-forget: do not await to prevent UI hanging on slow SMTP
      Promise.resolve()
        .then(() => {
          console.log(`📧 Attempting to send password reset email to: ${user.email}`);
          return emailService.sendPasswordResetEmail(user.email, resetToken, userName);
        })
        .then((result) => {
          console.log('✅ Password reset email sent successfully to:', user.email);
          console.log('📧 Email result:', result);
        })
        .catch((emailError) => {
          console.error('❌ Failed to send password reset email to:', user.email);
          console.error('❌ Email error details:', emailError);
        });
    } catch (emailScheduleError) {
      console.error('❌ Failed to schedule password reset email:', emailScheduleError);
    }

    // Always respond immediately for security and UX
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

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
        password_reset_expires: { [Op.gt]: new Date() }
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
        password_reset_expires: { [Op.gt]: new Date() }
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

// Test email endpoint for debugging
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    const testEmail = email || 'test@example.com';
    
    console.log(`🧪 Testing email service with: ${testEmail}`);
    
    const result = await emailService.sendPasswordResetEmail(
      testEmail, 
      'test-token-' + Date.now(), 
      'Test User'
    );
    
    console.log('📧 Test email result:', result);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully', 
      result,
      testEmail 
    });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Test email failed', 
      error: error.message 
    });
  }
});

module.exports = router;
