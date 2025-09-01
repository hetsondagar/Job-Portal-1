const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Resume = require('../models/Resume');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created uploads/avatars directory');
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = 'avatar-' + uniqueSuffix + extension;
    console.log('📄 Generated filename:', filename);
    cb(null, filename);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for avatars
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    console.log('🔍 File type check:', ext, 'Allowed:', allowedTypes);
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, GIF, and WebP files are allowed for avatars'));
    }
  }
});

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
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow empty/null values
      }
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue >= 0;
    })
    .withMessage('Expected salary must be a valid number'),
  body('noticePeriod')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow empty/null values
      }
      const numValue = parseInt(value);
      return !isNaN(numValue) && numValue >= 0 && numValue <= 365;
    })
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
    // Transform user data to camelCase format to match frontend expectations
    const userData = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      userType: req.user.user_type,
      isEmailVerified: req.user.is_email_verified,
      accountStatus: req.user.account_status,
      lastLoginAt: req.user.last_login_at,
      companyId: req.user.company_id,
      phone: req.user.phone,
      avatar: req.user.avatar,
      currentLocation: req.user.current_location,
      headline: req.user.headline,
      summary: req.user.summary,
      profileCompletion: req.user.profile_completion,
      oauthProvider: req.user.oauth_provider,
      oauthId: req.user.oauth_id,
      skills: req.user.skills,
      languages: req.user.languages,
      expectedSalary: req.user.expected_salary,
      noticePeriod: req.user.notice_period,
      willingToRelocate: req.user.willing_to_relocate,
      gender: req.user.gender,
      profileVisibility: req.user.profile_visibility,
      contactVisibility: req.user.contact_visibility,
      certifications: req.user.certifications,
      socialLinks: req.user.social_links,
      preferences: req.user.preferences,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: { user: userData }
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

    // Map frontend field names to database field names
    const fieldMapping = {
      'firstName': 'first_name',
      'lastName': 'last_name',
      'phone': 'phone',
      'currentLocation': 'current_location',
      'headline': 'headline',
      'summary': 'summary',
      'expectedSalary': 'expected_salary',
      'noticePeriod': 'notice_period',
      'willingToRelocate': 'willing_to_relocate',
      'gender': 'gender',
      'profileVisibility': 'profile_visibility',
      'contactVisibility': 'contact_visibility',
      'skills': 'skills',
      'languages': 'languages',
      'certifications': 'certifications',
      'socialLinks': 'social_links',
      'preferences': 'preferences'
    };

    const updateData = {};
    Object.keys(fieldMapping).forEach(frontendField => {
      if (req.body[frontendField] !== undefined) {
        const dbField = fieldMapping[frontendField];
        updateData[dbField] = req.body[frontendField];
      }
    });

    // Update last profile update timestamp
    updateData.lastProfileUpdate = new Date();

    // Calculate profile completion percentage
    const profileFields = [
      'first_name', 'last_name', 'email', 'phone', 'current_location',
      'headline', 'summary', 'skills', 'languages'
    ];
    
    let completedFields = 0;
    profileFields.forEach(field => {
      const fieldValue = req.user[field] || (req.body[fieldMapping[field]] && req.body[fieldMapping[field]].length > 0);
      if (fieldValue) {
        completedFields++;
      }
    });
    
    updateData.profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    await req.user.update(updateData);

    // Fetch updated user data and transform to camelCase format
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    // Transform user data to camelCase format to match frontend expectations
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      userType: updatedUser.user_type,
      isEmailVerified: updatedUser.is_email_verified,
      accountStatus: updatedUser.account_status,
      lastLoginAt: updatedUser.last_login_at,
      companyId: updatedUser.company_id,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      currentLocation: updatedUser.current_location,
      headline: updatedUser.headline,
      summary: updatedUser.summary,
      profileCompletion: updatedUser.profile_completion,
      oauthProvider: updatedUser.oauth_provider,
      oauthId: updatedUser.oauth_id,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userData }
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

// Job Applications endpoints
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const { JobApplication, Job, Company } = require('../config/index');
    
    const applications = await JobApplication.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: Company,
              as: 'company'
            }
          ]
        }
      ],
      order: [['appliedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// Job Alerts endpoints
router.get('/job-alerts', authenticateToken, async (req, res) => {
  try {
    const { JobAlert } = require('../config/index');
    
    const alerts = await JobAlert.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching job alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job alerts'
    });
  }
});

router.post('/job-alerts', authenticateToken, async (req, res) => {
  try {
    const { JobAlert } = require('../config/index');
    
    const alertData = {
      ...req.body,
      userId: req.user.id
    };

    const alert = await JobAlert.create(alertData);

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error creating job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job alert'
    });
  }
});

router.put('/job-alerts/:id', authenticateToken, async (req, res) => {
  try {
    const { JobAlert } = require('../config/index');
    
    const alert = await JobAlert.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    await alert.update(req.body);

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error updating job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job alert'
    });
  }
});

router.delete('/job-alerts/:id', authenticateToken, async (req, res) => {
  try {
    const { JobAlert } = require('../config/index');
    
    const alert = await JobAlert.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    await alert.destroy();

    res.json({
      success: true,
      message: 'Job alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job alert'
    });
  }
});

// Job Bookmarks endpoints
router.get('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { JobBookmark, Job, Company } = require('../config/index');
    
    const bookmarks = await JobBookmark.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: Company,
              as: 'company'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: bookmarks
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks'
    });
  }
});

router.post('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { JobBookmark } = require('../config/index');
    
    const bookmarkData = {
      ...req.body,
      userId: req.user.id
    };

    const bookmark = await JobBookmark.create(bookmarkData);

    res.json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bookmark'
    });
  }
});

router.put('/bookmarks/:id', authenticateToken, async (req, res) => {
  try {
    const { JobBookmark } = require('../config/index');
    
    const bookmark = await JobBookmark.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    await bookmark.update(req.body);

    res.json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bookmark'
    });
  }
});

router.delete('/bookmarks/:id', authenticateToken, async (req, res) => {
  try {
    const { JobBookmark } = require('../config/index');
    
    const bookmark = await JobBookmark.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    await bookmark.destroy();

    res.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bookmark'
    });
  }
});

// Search History endpoints
router.get('/search-history', authenticateToken, async (req, res) => {
  try {
    const { Analytics } = require('../config/index');
    
    const searchHistory = await Analytics.findAll({
      where: { 
        userId: req.user.id,
        eventType: 'search_performed'
      },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      success: true,
      data: searchHistory
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search history'
    });
  }
});

// Dashboard Stats endpoint
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const JobApplication = require('../models/JobApplication');
    const Analytics = require('../models/Analytics');
    const Job = require('../models/Job');
    
    console.log('📊 Fetching dashboard stats for user:', req.user.id);
    
    // Get application count with error handling
    let applicationCount = 0;
    try {
      applicationCount = await JobApplication.count({
        where: { userId: req.user.id }
      });
      console.log('✅ Application count:', applicationCount);
    } catch (error) {
      console.error('❌ Error fetching application count:', error);
      applicationCount = 0;
    }

    // Get profile views with error handling
    let profileViews = 0;
    try {
      // Try to get profile views, but handle if the column doesn't exist
      profileViews = await Analytics.count({
        where: { 
          userId: req.user.id,
          eventType: 'profile_view'
        }
      });
      console.log('✅ Profile views:', profileViews);
    } catch (error) {
      console.error('❌ Error fetching profile views:', error);
      // If the query fails, try a simpler query without eventType
      try {
        profileViews = await Analytics.count({
          where: { userId: req.user.id }
        });
        console.log('✅ Fallback profile views (all events):', profileViews);
      } catch (fallbackError) {
        console.error('❌ Fallback profile views also failed:', fallbackError);
        profileViews = 0;
      }
    }

    // Get recent applications with error handling
    let recentApplications = [];
    try {
      recentApplications = await JobApplication.findAll({
        where: { userId: req.user.id },
        order: [['appliedAt', 'DESC']],
        limit: 5,
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'company', 'location', 'salary_min', 'salary_max']
          }
        ]
      });
      console.log('✅ Recent applications:', recentApplications.length);
    } catch (error) {
      console.error('❌ Error fetching recent applications:', error);
      // Try without the include if it fails
      try {
        recentApplications = await JobApplication.findAll({
          where: { userId: req.user.id },
          order: [['appliedAt', 'DESC']],
          limit: 5
        });
        console.log('✅ Recent applications (without job details):', recentApplications.length);
      } catch (fallbackError) {
        console.error('❌ Fallback recent applications also failed:', fallbackError);
        recentApplications = [];
      }
    }

    // For employers, also get job posting stats
    let jobStats = {};
    if (req.user.user_type === 'employer') {
      try {
        const activeJobs = await Job.count({
          where: { 
            employerId: req.user.id,
            status: 'active'
          }
        });
        
        const totalApplications = await JobApplication.count({
          include: [{
            model: Job,
            as: 'job',
            where: { employerId: req.user.id }
          }]
        });
        
        jobStats = {
          activeJobs,
          totalApplications
        };
        console.log('✅ Employer job stats:', jobStats);
      } catch (error) {
        console.error('❌ Error fetching employer job stats:', error);
        // Try simpler queries if the complex ones fail
        try {
          const activeJobs = await Job.count({
            where: { employerId: req.user.id }
          });
          
          const totalApplications = await JobApplication.count({
            where: { employerId: req.user.id }
          });
          
          jobStats = {
            activeJobs,
            totalApplications
          };
          console.log('✅ Employer job stats (simplified):', jobStats);
        } catch (fallbackError) {
          console.error('❌ Fallback employer job stats also failed:', fallbackError);
          jobStats = { activeJobs: 0, totalApplications: 0 };
        }
      }
    }

    const stats = {
      applicationCount,
      profileViews,
      recentApplications,
      ...jobStats
    };

    console.log('✅ Dashboard stats prepared successfully');
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Resume endpoints
router.get('/resumes', authenticateToken, async (req, res) => {
  try {
    const resumes = await Resume.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['lastUpdated', 'DESC']]
    });

    res.json({
      success: true,
      data: resumes
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes'
    });
  }
});

// Get resume statistics for dashboard
router.get('/resumes/stats', authenticateToken, async (req, res) => {
  try {
    const totalResumes = await Resume.count({
      where: { userId: req.user.id }
    });

    const defaultResume = await Resume.findOne({
      where: { userId: req.user.id, isDefault: true }
    });

    const recentResumes = await Resume.findAll({
      where: { userId: req.user.id },
      order: [['lastUpdated', 'DESC']],
      limit: 3
    });

    const totalViews = await Resume.sum('views', {
      where: { userId: req.user.id }
    }) || 0;

    const totalDownloads = await Resume.sum('downloads', {
      where: { userId: req.user.id }
    }) || 0;

    res.json({
      success: true,
      data: {
        totalResumes,
        hasDefaultResume: !!defaultResume,
        defaultResumeId: defaultResume?.id || null,
        recentResumes: recentResumes.map(resume => ({
          id: resume.id,
          title: resume.title,
          lastUpdated: resume.lastUpdated,
          isDefault: resume.isDefault,
          views: resume.views,
          downloads: resume.downloads
        })),
        totalViews,
        totalDownloads
      }
    });
  } catch (error) {
    console.error('Error fetching resume stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume statistics'
    });
  }
});

router.post('/resumes', authenticateToken, async (req, res) => {
  try {
    const { title, summary, objective, skills, languages, certifications, projects, achievements } = req.body;

    const resume = await Resume.create({
      userId: req.user.id,
      title,
      summary,
      objective,
      skills: skills || [],
      languages: languages || [],
      certifications: certifications || [],
      projects: projects || [],
      achievements: achievements || [],
      isDefault: false,
      isPublic: true
    });

    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resume'
    });
  }
});

router.put('/resumes/:id', authenticateToken, async (req, res) => {
  try {
    const { title, summary, objective, skills, languages, certifications, projects, achievements, isPublic } = req.body;

    const resume = await Resume.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    await resume.update({
      title,
      summary,
      objective,
      skills: skills || resume.skills,
      languages: languages || resume.languages,
      certifications: certifications || resume.certifications,
      projects: projects || resume.projects,
      achievements: achievements || resume.achievements,
      isPublic: isPublic !== undefined ? isPublic : resume.isPublic
    });

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resume'
    });
  }
});

router.delete('/resumes/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    await resume.destroy();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume'
    });
  }
});

router.post('/resumes/upload', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    console.log('🔍 Resume upload request received');
    console.log('🔍 File:', req.file);
    console.log('🔍 User:', req.user.id);

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description } = req.body;
    const filename = req.file.filename;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    // Check if this is the first resume (make it default)
    const existingResumes = await Resume.count({
      where: { userId: req.user.id }
    });

    const isDefault = existingResumes === 0;

    // Create resume record
    const resume = await Resume.create({
      userId: req.user.id,
      title: title || `Resume - ${originalName.replace(/\.[^/.]+$/, '')}`,
      summary: description || `Resume uploaded on ${new Date().toLocaleDateString()}`,
      isDefault: isDefault,
      isPublic: true,
      metadata: {
        filename,
        originalName,
        fileSize,
        mimeType,
        uploadDate: new Date().toISOString(),
        filePath: `/uploads/resumes/${filename}`
      }
    });

    console.log('✅ Resume created successfully:', resume.id);

    // If this is the first resume, ensure it's set as default
    if (isDefault) {
      console.log('✅ Setting as default resume (first upload)');
    }

    res.status(201).json({
      success: true,
      data: {
        resumeId: resume.id,
        filename,
        title: resume.title,
        isDefault: resume.isDefault,
        fileSize: fileSize,
        originalName: originalName
      }
    });
  } catch (error) {
    console.error('❌ Error uploading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume: ' + error.message
    });
  }
});

router.put('/resumes/:id/set-default', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Remove default from all other resumes
    await Resume.update(
      { isDefault: false },
      { where: { userId: req.user.id } }
    );

    // Set this resume as default
    await resume.update({ isDefault: true });

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error setting default resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default resume'
    });
  }
});

// Download resume file
router.get('/resumes/:id/download', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const metadata = resume.metadata || {};
    const filename = metadata.filename;
    const originalName = metadata.originalName;

    if (!filename) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }

    const filePath = path.join(__dirname, '../uploads/resumes', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server'
      });
    }

    // Increment download count
    await resume.update({
      downloads: resume.downloads + 1
    });

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName || filename}"`);
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download resume'
    });
  }
});

// Avatar upload endpoint
router.post('/avatar', authenticateToken, avatarUpload.single('avatar'), async (req, res) => {
  try {
    console.log('🔍 Avatar upload request received');
    console.log('🔍 File:', req.file);
    console.log('🔍 User:', req.user.id);

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filename = req.file.filename;
    const avatarUrl = `/uploads/avatars/${filename}`;
    
    console.log('🔍 Generated avatar URL:', avatarUrl);

    // Update user's avatar in database
    const updateResult = await req.user.update({ 
      avatar: avatarUrl,
      updatedAt: new Date()
    });
    
    console.log('🔍 Database update result:', updateResult);

    // Fetch updated user data and transform to camelCase format
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    console.log('🔍 Updated user from database:', updatedUser.avatar);

    // Transform user data to camelCase format to match frontend expectations
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      userType: updatedUser.user_type,
      isEmailVerified: updatedUser.is_email_verified,
      accountStatus: updatedUser.account_status,
      lastLoginAt: updatedUser.last_login_at,
      companyId: updatedUser.company_id,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      currentLocation: updatedUser.current_location,
      headline: updatedUser.headline,
      summary: updatedUser.summary,
      profileCompletion: updatedUser.profile_completion,
      oauthProvider: updatedUser.oauth_provider,
      oauthId: updatedUser.oauth_id,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    console.log('🔍 Sending response with user data:', userData.avatar);

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { 
        avatarUrl, 
        user: userData 
      }
    });
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar: ' + error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 2MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    });
  }
  next(error);
});

module.exports = router;
