const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Resume = require('../models/Resume');
const CoverLetter = require('../models/CoverLetter');
const { sequelize } = require('../config/sequelize');
const { Op } = require('sequelize');

const router = express.Router();

// Utility function to find resume file
function findResumeFile(filename, metadata) {
  const possiblePaths = [
    // Production paths (Render.com)
    path.join('/opt/render/project/src/uploads/resumes', filename),
    path.join('/opt/render/project/src/server/uploads/resumes', filename),
    path.join('/tmp/uploads/resumes', filename),
    // Development paths
    path.join(__dirname, '../uploads/resumes', filename),
    path.join(process.cwd(), 'server', 'uploads', 'resumes', filename),
    path.join(process.cwd(), 'uploads', 'resumes', filename),
    path.join('/tmp', 'uploads', 'resumes', filename),
    path.join('/var', 'tmp', 'uploads', 'resumes', filename),
    // Metadata-based paths
    metadata?.filePath ? path.join(process.cwd(), metadata.filePath.replace(/^\//, '')) : null,
    metadata?.filePath ? path.join('/', metadata.filePath.replace(/^\//, '')) : null,
    // Direct metadata filePath
    metadata?.filePath ? metadata.filePath : null,
    // Public URL based on our static mount
    metadata?.filename ? `/uploads/resumes/${metadata.filename}` : null
  ].filter(Boolean);

  console.log('🔍 Trying possible file paths:', possiblePaths);
  
  // Find the first existing file
  let filePath = possiblePaths.find(p => fs.existsSync(p));
  
  if (!filePath) {
    console.log('❌ File does not exist in any of the expected locations');
    console.log('🔍 Checked paths:', possiblePaths);
    
    // Try to find the file by searching common directories
  const searchDirs = [
      path.join(__dirname, '../uploads'),
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd(), 'server', 'uploads'),
      '/tmp/uploads',
      '/var/tmp/uploads',
      '/opt/render/project/src/uploads',
    '/opt/render/project/src/server/uploads'
    ];
    
    for (const searchDir of searchDirs) {
      try {
        if (fs.existsSync(searchDir)) {
          console.log(`🔍 Searching in directory: ${searchDir}`);
          const files = fs.readdirSync(searchDir, { recursive: true });
          console.log(`🔍 Found ${files.length} items in ${searchDir}`);
          
          // Look for the specific filename
          const found = files.find(f => typeof f === 'string' && f.includes(filename));
          if (found) {
            filePath = path.join(searchDir, found);
            console.log(`✅ Found file at: ${filePath}`);
            break;
          }
        }
      } catch (error) {
        console.log(`🔍 Could not search in ${searchDir}:`, error.message);
      }
    }
    
    // If still not found, check if this is a production environment issue
    if (!filePath && process.env.NODE_ENV === 'production') {
      console.log('⚠️ Production environment detected - files may have been lost during server restart');
      console.log('💡 Consider implementing cloud storage (S3, Cloudinary) for production');
    }
  }
  
  if (filePath) {
    console.log('✅ File found at:', filePath);
  }
  
  return filePath;
}

// Utility function to find cover letter file
function findCoverLetterFile(filename, metadata) {
  const possiblePaths = [
    // Production paths (Render.com)
    path.join('/opt/render/project/src/uploads/cover-letters', filename),
    path.join('/opt/render/project/src/server/uploads/cover-letters', filename),
    path.join('/tmp/uploads/cover-letters', filename),
    // Development paths
    path.join(__dirname, '../uploads/cover-letters', filename),
    path.join(process.cwd(), 'server', 'uploads', 'cover-letters', filename),
    path.join(process.cwd(), 'uploads', 'cover-letters', filename),
    path.join('/tmp', 'uploads', 'cover-letters', filename),
    path.join('/var', 'tmp', 'uploads', 'cover-letters', filename),
    // Metadata-based paths
    metadata?.filePath ? path.join(process.cwd(), metadata.filePath.replace(/^\//, '')) : null,
    metadata?.filePath ? path.join('/', metadata.filePath.replace(/^\//, '')) : null,
    metadata?.filePath ? metadata.filePath : null
  ].filter(Boolean);

  let filePath = possiblePaths.find(p => fs.existsSync(p));

  if (!filePath) {
    const searchDirs = [
      path.join(__dirname, '../uploads'),
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd(), 'server', 'uploads'),
      '/tmp/uploads',
      '/var/tmp/uploads',
      '/opt/render/project/src/uploads',
      '/opt/render/project/src/server/uploads'
    ];
    for (const dir of searchDirs) {
      try {
        if (fs.existsSync(dir)) {
          const items = fs.readdirSync(dir, { recursive: true });
          const found = items.find(f => f.includes(filename));
          if (found) {
            filePath = path.join(dir, found);
            break;
          }
        }
      } catch (_) {}
    }
  }
  return filePath;
}

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Configure multer for cover letter uploads
const coverLetterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/cover-letters');
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

const coverLetterUpload = multer({
  storage: coverLetterStorage,
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

// Configure multer for job photo uploads
const jobPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/job-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created uploads/job-photos directory');
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = 'job-photo-' + uniqueSuffix + extension;
    console.log('📄 Generated job photo filename:', filename);
    cb(null, filename);
  }
});

const jobPhotoUpload = multer({
  storage: jobPhotoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for job photos
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    console.log('🔍 Job photo file type check:', ext, 'Allowed:', allowedTypes);
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, GIF, and WebP files are allowed for job photos'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 Authenticating token...');
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    console.log('🔍 Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ JWT token verified, user ID:', decoded.id);
    
    console.log('🔍 Fetching user from database...');
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User authenticated successfully:', { id: user.id, type: user.user_type });
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Invalid JWT token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('❌ JWT token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('❌ Unexpected authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
      hasPassword: !!(req.user.password && String(req.user.password).trim().length > 0),
      passwordSkipped: Boolean(req.user.password_skipped),
      requiresPasswordSetup: !(req.user.password && String(req.user.password).trim().length > 0) && req.user.oauth_provider && req.user.oauth_provider !== 'local' && !req.user.password_skipped,
      profileCompleted: Boolean(req.user.first_name && req.user.last_name && req.user.phone) && ((req.user.profile_completion || 0) >= 60),
      region: req.user.region,
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

// Get candidate profile for employers (general candidate profile)
router.get('/candidates/:candidateId', authenticateToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only employers and admins can view candidate profiles.' 
      });
    }
    
    console.log('🔍 Fetching general candidate profile for:', candidateId);
    
    // Get candidate details
    const candidate = await User.findOne({
      where: { 
        id: candidateId,
        user_type: 'jobseeker',
        is_active: true,
        account_status: 'active'
      },
      attributes: [
        'id', 'first_name', 'last_name', 'email', 'phone', 'avatar',
        'current_location', 'headline', 'summary', 'skills', 'languages',
        'expected_salary', 'notice_period', 'willing_to_relocate',
        'profile_completion', 'last_login_at', 'last_profile_update',
        'is_email_verified', 'is_phone_verified', 'createdAt',
        'date_of_birth', 'gender', 'social_links', 'certifications'
      ]
    });
    
    if (!candidate) {
      console.log(`❌ Candidate not found: ${candidateId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Candidate not found' 
      });
    }
    
    // Fetch resumes for the candidate
    let resumes = [];
    try {
      console.log(`📄 Fetching resumes for candidate ${candidateId}`);
      const { Resume } = require('../config/index');
      
      const resumeResults = await Resume.findAll({
        where: { userId: candidateId },
        order: [['isDefault', 'DESC'], ['lastUpdated', 'DESC']]
      });
      
      resumes = resumeResults || [];
      console.log(`📄 Found ${resumes.length} resumes for candidate ${candidateId}`);
    } catch (resumeError) {
      console.log('⚠️ Could not fetch resumes:', resumeError.message);
    }
    
    // Fetch cover letters for the candidate
    let coverLetters = [];
    try {
      console.log(`📝 Fetching cover letters for candidate ${candidateId}`);
      const { CoverLetter } = require('../config/index');
      
      const coverLetterResults = await CoverLetter.findAll({
        where: { userId: candidateId },
        order: [['isDefault', 'DESC'], ['lastUpdated', 'DESC']]
      });
      
      coverLetters = coverLetterResults || [];
      console.log(`📝 Found ${coverLetters.length} cover letters for candidate ${candidateId}`);
    } catch (coverLetterError) {
      console.log('⚠️ Could not fetch cover letters:', coverLetterError.message);
    }
    
    // Build absolute URL helper for files served from /uploads
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const toAbsoluteUrl = (maybePath) => {
      if (!maybePath) return null;
      if (typeof maybePath === 'string' && /^https?:\/\//i.test(maybePath)) {
        return maybePath;
      }
      const pathStr = String(maybePath).startsWith('/') ? String(maybePath) : `/${String(maybePath)}`;
      return `${baseUrl}${pathStr}`;
    };
    
    // Transform candidate data for frontend
    const transformedCandidate = {
      id: candidate.id,
      name: `${candidate.first_name} ${candidate.last_name}`,
      designation: candidate.headline || 'Job Seeker',
      experience: 'Not specified', // Would need work experience data
      location: candidate.current_location || 'Not specified',
      currentSalary: 'Not specified',
      expectedSalary: candidate.expected_salary ? `${candidate.expected_salary} LPA` : 'Not specified',
      noticePeriod: candidate.notice_period ? `${candidate.notice_period} days` : 'Not specified',
      avatar: candidate.avatar || '/placeholder.svg?height=120&width=120',
      email: candidate.email,
      phone: candidate.phone,
      education: 'Not specified', // Would need education data
      preferredLocations: candidate.willing_to_relocate ? ['Open to relocate'] : [candidate.current_location || 'Not specified'],
      keySkills: candidate.skills ? (Array.isArray(candidate.skills) ? candidate.skills : JSON.parse(candidate.skills || '[]')) : [],
      about: candidate.summary || 'No summary available',
      phoneVerified: candidate.is_phone_verified || false,
      emailVerified: candidate.is_email_verified || false,
      profileCompletion: candidate.profile_completion || 0,
      lastModified: candidate.last_profile_update ? new Date(candidate.last_profile_update).toLocaleDateString() : 'Not specified',
      activeStatus: candidate.last_login_at ? new Date(candidate.last_login_at).toLocaleDateString() : 'Not specified',
      
      // Resumes
      resumes: resumes.map(resume => {
        const metadata = resume.metadata || {};
        const filename = metadata.originalName || metadata.filename || `${candidate.first_name}_${candidate.last_name}_Resume.pdf`;
        const fileSize = metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size';
        const filePath = metadata.filePath || `/uploads/resumes/${metadata.filename}`;
        
        return {
          id: resume.id,
          title: resume.title || 'Resume',
          filename: filename,
          fileSize: fileSize,
          uploadDate: resume.createdAt || resume.createdAt,
          lastUpdated: resume.lastUpdated || resume.last_updated,
          isDefault: resume.isDefault ?? resume.is_default ?? false,
          fileUrl: toAbsoluteUrl(filePath),
          metadata: metadata
        };
      }),
      
      // Cover Letters
      coverLetters: coverLetters.map(coverLetter => {
        const metadata = coverLetter.metadata || {};
        const filename = metadata.originalName || metadata.filename || `${candidate.first_name}_${candidate.last_name}_CoverLetter.pdf`;
        const fileSize = metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size';
        const filePath = metadata.filePath || `/uploads/cover-letters/${metadata.filename}`;
        
        return {
          id: coverLetter.id,
          title: coverLetter.title || 'Cover Letter',
          content: coverLetter.content || '',
          summary: coverLetter.summary || '',
          filename: filename,
          fileSize: fileSize,
          uploadDate: coverLetter.createdAt || coverLetter.createdAt,
          lastUpdated: coverLetter.lastUpdated || coverLetter.last_updated,
          isDefault: coverLetter.isDefault ?? coverLetter.is_default ?? false,
          isPublic: coverLetter.isPublic ?? coverLetter.is_public ?? true,
          fileUrl: toAbsoluteUrl(filePath),
          metadata: metadata
        };
      })
    };
    
    console.log(`✅ Found general candidate profile: ${candidate.first_name} ${candidate.last_name}`);
    console.log(`📄 Resumes: ${resumes.length}, 📝 Cover letters: ${coverLetters.length}`);
    
    return res.status(200).json({
      success: true,
      data: transformedCandidate
    });
    
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate profile'
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
      'region': 'region',
      'passwordSkipped': 'password_skipped',
      'currentLocation': 'current_location',
      'headline': 'headline',
      'summary': 'summary',
      'currentSalary': 'current_salary',
      'expectedSalary': 'expected_salary',
      'experienceYears': 'experience_years',
      'noticePeriod': 'notice_period',
      'willingToRelocate': 'willing_to_relocate',
      'gender': 'gender',
      'profileVisibility': 'profile_visibility',
      'contactVisibility': 'contact_visibility',
      'skills': 'skills',
      'keySkills': 'key_skills',
      'languages': 'languages',
      'certifications': 'certifications',
      'education': 'education',
      'preferredLocations': 'preferred_locations',
      'designation': 'designation',
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

    // Normalize numeric fields: convert empty strings to null, and valid strings to numbers
    if (Object.prototype.hasOwnProperty.call(updateData, 'expected_salary')) {
      const v = updateData.expected_salary;
      if (v === '' || v === undefined) {
        updateData.expected_salary = null;
      } else if (typeof v === 'string') {
        const num = parseFloat(v);
        updateData.expected_salary = isNaN(num) ? null : num;
      }
    }
    if (Object.prototype.hasOwnProperty.call(updateData, 'notice_period')) {
      const v = updateData.notice_period;
      if (v === '' || v === undefined) {
        updateData.notice_period = null;
      } else if (typeof v === 'string') {
        const num = parseInt(v);
        updateData.notice_period = isNaN(num) ? null : num;
      }
    }

    // Update last profile update timestamp
    updateData.lastProfileUpdate = new Date();
    
    // For first-time OAuth users completing profile setup, update last_login_at
    if (!req.user.last_login_at && req.user.oauth_provider && req.user.oauth_provider !== 'local') {
      updateData.last_login_at = new Date();
      console.log('✅ First-time OAuth user completed profile setup, updating last_login_at');
    }

    // Calculate profile completion percentage
    const profileFields = [
      'first_name', 'last_name', 'email', 'phone', 'current_location',
      'headline', 'summary', 'skills', 'key_skills', 'languages', 'education',
      'experience_years', 'current_salary', 'expected_salary', 'designation'
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
      currentSalary: updatedUser.current_salary,
      expectedSalary: updatedUser.expected_salary,
      experienceYears: updatedUser.experience_years,
      noticePeriod: updatedUser.notice_period,
      willingToRelocate: updatedUser.willing_to_relocate,
      gender: updatedUser.gender,
      designation: updatedUser.designation,
      skills: updatedUser.skills,
      keySkills: updatedUser.key_skills,
      languages: updatedUser.languages,
      education: updatedUser.education,
      preferredLocations: updatedUser.preferred_locations,
      certifications: updatedUser.certifications,
      socialLinks: updatedUser.social_links,
      profileVisibility: updatedUser.profile_visibility,
      contactVisibility: updatedUser.contact_visibility,
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

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { Notification } = require('../config/index');
    
    // Correct field mapping: model uses camelCase userId
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50 // Limit to recent 50 notifications
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get employer notifications (filtered for employer-specific types)
router.get('/employer/notifications', authenticateToken, async (req, res) => {
  try {
    const { Notification } = require('../config/index');
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get employer-specific notification types
    const employerNotificationTypes = [
      'job_application',
      'application_status', 
      'job_recommendation',
      'company_update',
      'system',
      'marketing'
    ];

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { 
        userId: req.user.id,
        type: employerNotificationTypes
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Employer notifications retrieved successfully',
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employer notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employer notifications'
    });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { Notification } = require('../config/index');
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      where: { 
        id: id,
        userId: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.patch('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const { Notification } = require('../config/index');
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { Notification } = require('../config/index');
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      where: { 
        id: id,
        userId: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Create a test notification for the authenticated user (secured)
router.post('/notifications/test', authenticateToken, async (req, res) => {
  try {
    const { Notification } = require('../config/index');
    const { title, message, priority } = req.body || {};
    const data = await Notification.create({
      userId: req.user.id,
      type: 'system',
      title: title || 'Test notification',
      message: message || 'This is a test notification to verify delivery.',
      priority: priority || 'medium',
      actionUrl: '/notifications',
      actionText: 'Open notifications',
      icon: 'bell'
    });
    res.json({ success: true, message: 'Notification created', data });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ success: false, message: 'Failed to create test notification' });
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
    const { JobApplication, Job, Company, User, Resume } = require('../config/index');
    
    const applications = await JobApplication.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: Company,
              as: 'company',
              attributes: ['id', 'name', 'industry', 'companySize', 'website', 'contactEmail', 'contactPhone']
            },
            {
              model: User,
              as: 'employer',
                             attributes: ['id', 'first_name', 'last_name', 'email']
            }
          ]
        },
        {
          model: Resume,
          as: 'jobResume',
          attributes: ['id', 'title', 'summary', 'isDefault', 'views', 'downloads']
        }
      ],
      order: [['applied_at', 'DESC']]
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

// Create job application
router.post('/applications', authenticateToken, async (req, res) => {
  try {
    const { JobApplication, Job, User } = require('../config/index');
    const { jobId, coverLetter, expectedSalary, noticePeriod, availableFrom, isWillingToRelocate, preferredLocations, resumeId } = req.body;
    
    // Validate required fields
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Check if job exists and get employer info
    const job = await Job.findByPk(jobId, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user already applied for this job
    const existingApplication = await JobApplication.findOne({
      where: { 
        job_id: jobId, 
        user_id: req.user.id 
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const applicationData = {
      jobId: jobId,
      userId: req.user.id,
      employerId: job.employerId, // Add the employer ID from the job
      coverLetter,
      expectedSalary,
      noticePeriod,
      availableFrom,
      isWillingToRelocate,
      preferredLocations,
      resumeId,
      source: 'website',
      appliedAt: new Date(),
      lastUpdatedAt: new Date()
    };

    const application = await JobApplication.create(applicationData);

    // Send email notification to employer
    try {
      const emailService = require('../services/emailService');
      const employer = await User.findByPk(job.employer.id);
      const applicant = await User.findByPk(req.user.id);
      
      if (employer && applicant) {
        await emailService.sendApplicationNotification(
          employer.email,
          `${employer.firstName} ${employer.lastName}`,
          job.title,
          `${applicant.firstName} ${applicant.lastName}`,
          applicant.email
        );
        console.log('✅ Application notification sent to employer:', employer.email);
      }
    } catch (emailError) {
      console.error('❌ Failed to send application notification:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error creating job application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
});

// Debug endpoint to check applications
router.get('/debug/applications', authenticateToken, async (req, res) => {
  try {
    const { JobApplication, Job, User } = require('../config/index');
    
    // Get all applications with basic info
    const allApps = await JobApplication.findAll({
      attributes: ['id', 'job_id', 'user_id', 'status', 'applied_at'],
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'created_by']
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      limit: 20
    });
    
    res.json({
      success: true,
      data: allApps,
      message: `Found ${allApps.length} applications total`
    });
  } catch (error) {
    console.error('Debug applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
});

// Simple test endpoint for employer applications
router.get('/employer/applications/test', authenticateToken, async (req, res) => {
  try {
    console.log('🧪 Testing employer applications endpoint...');
    console.log('🧪 User:', { id: req.user.id, type: req.user.user_type });
    
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers and admins can view job applications.'
      });
    }
    
    const { JobApplication } = require('../config/index');
    
    // Validate that employerId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.user.id)) {
      console.error('❌ Invalid UUID format for employerId:', req.user.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Simple count query first
    const count = await JobApplication.count({
      where: { employer_id: req.user.id }
    });
    
    console.log('🧪 Found', count, 'applications for employer');
    
    res.json({
      success: true,
      data: { count },
      message: `Found ${count} applications for employer`
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Get applications for employer's jobs
router.get('/employer/applications', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching employer applications for user:', req.user?.id, 'type:', req.user?.user_type);
    console.log('🔍 Full user object:', req.user);
    
    // Check if user object exists
    if (!req.user) {
      console.error('❌ No user object found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    console.log('🔍 Importing models...');
    let JobApplication, Job, Company, User, Resume, CoverLetter, WorkExperience, Education;
    
    try {
      const models = require('../config/index');
      JobApplication = models.JobApplication;
      Job = models.Job;
      Company = models.Company;
      User = models.User;
      Resume = models.Resume;
      CoverLetter = models.CoverLetter;
      WorkExperience = models.WorkExperience;
      Education = models.Education;
      console.log('✅ Models imported successfully');
    } catch (importError) {
      console.error('❌ Model import error:', importError);
      throw new Error(`Failed to import models: ${importError.message}`);
    }
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      console.log('❌ Access denied - user is not an employer or admin:', req.user.user_type);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers and admins can view job applications.'
      });
    }
    
    console.log('🔍 Querying applications for employerId:', req.user.id);
    
    // Validate that employerId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.user.id)) {
      console.error('❌ Invalid UUID format for employerId:', req.user.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Test database connection first
    try {
      console.log('🔍 Testing database connection...');
      await JobApplication.sequelize.authenticate();
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      throw new Error(`Database connection failed: ${dbError.message}`);
    }
    
    // First, let's check if there are any applications at all
    console.log('🔍 Fetching all applications...');
    const allApplications = await JobApplication.findAll({
      attributes: ['id', 'job_id', 'user_id', 'status', 'applied_at'],
      limit: 10
    });
    console.log('📊 All applications in database (first 10):', allApplications.map(app => ({
      id: app.id,
      jobId: app.jobId,
      userId: app.userId,
      employerId: app.employerId,
      status: app.status
    })));
    
    console.log('🔍 Starting Sequelize query for applications...');
    
    let applications;
    try {
      applications = await JobApplication.findAll({
        where: { employerId: req.user.id },
        include: [
          {
            model: Job,
            as: 'job',
            include: [
              {
                model: Company,
                as: 'company',
                attributes: ['id', 'name', 'industry', 'companySize', 'website', 'email', 'phone']
              }
            ]
          },
          {
            model: User,
            as: 'applicant',
            attributes: [
              'id', 'first_name', 'last_name', 'email', 'phone', 'avatar',
              'headline', 'summary', 'skills', 'languages', 'certifications',
              'current_location', 'willing_to_relocate', 'expected_salary',
              'notice_period', 'date_of_birth', 'gender', 'social_links',
              'profile_completion', 'verification_level', 'last_profile_update'
            ]
          },
          {
            model: Resume,
            as: 'jobResume',
            attributes: [
              'id', 'title', 'summary', 'objective', 'skills', 'languages',
              'certifications', 'projects', 'achievements', 'isDefault',
              'isPublic', 'views', 'downloads', 'lastUpdated', 'metadata'
            ]
          },
          {
            model: CoverLetter,
            as: 'jobCoverLetter',
            attributes: [
              'id', 'title', 'content', 'summary', 'isDefault',
              'isPublic', 'views', 'downloads', 'lastUpdated', 'metadata'
            ]
          }
        ],
        order: [['appliedAt', 'DESC']]
      });
      console.log('✅ Sequelize query completed successfully');
    } catch (queryError) {
      console.error('❌ Sequelize query failed:', queryError);
      console.error('❌ Query error details:', {
        message: queryError.message,
        name: queryError.name,
        original: queryError.original,
        sql: queryError.sql
      });
      throw queryError; // Re-throw to be caught by outer catch block
    }

    console.log('📋 Found applications:', applications.length);
    console.log('📋 Applications data:', applications.map(app => ({ 
      id: app.id, 
      jobId: app.jobId, 
      userId: app.userId, 
      employerId: app.employerId,
      status: app.status,
      appliedAt: app.appliedAt
    })));

    // If no applications found, return empty array
    if (!applications || applications.length === 0) {
      console.log('📋 No applications found for employer');
      return res.json({
        success: true,
        data: [],
        message: 'No applications found'
      });
    }

    // Fetch experiences and education separately to avoid nested SQL JSON path issues
    const applicantIds = Array.from(new Set(applications.map(a => a.applicant?.id).filter(Boolean)));
    let experiencesByUser = new Map();
    let educationsByUser = new Map();
    if (applicantIds.length > 0) {
      // Use raw queries to avoid column name casing issues
      const [wxRows] = await sequelize.query(
        'SELECT * FROM work_experiences WHERE "userId" IN (:ids)',
        { replacements: { ids: applicantIds }, raw: true }
      );
      wxRows.forEach(row => {
        const arr = experiencesByUser.get(row.userId) || [];
        arr.push(WorkExperience.build(row, { isNewRecord: false }));
        experiencesByUser.set(row.userId, arr);
      });
      const [edRows] = await sequelize.query(
        'SELECT * FROM educations WHERE "userId" IN (:ids)',
        { replacements: { ids: applicantIds }, raw: true }
      );
      edRows.forEach(row => {
        const arr = educationsByUser.get(row.userId) || [];
        arr.push(Education.build(row, { isNewRecord: false }));
        educationsByUser.set(row.userId, arr);
      });
    }

    // Transform the data to include comprehensive jobseeker profile information
    const enrichedApplications = applications.map(application => {
      const applicant = application.applicant;
      const jobResume = application.jobResume;
      const applicantWorkExperiences = experiencesByUser.get(applicant?.id) || [];
      const applicantEducations = educationsByUser.get(applicant?.id) || [];
      
      // Calculate total work experience
      const totalExperience = applicantWorkExperiences.reduce((total, exp) => {
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const diffInMs = end - start;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        return total + diffInDays;
      }, 0) || 0;

      const experienceYears = Math.floor(totalExperience / 365);
      const experienceMonths = Math.floor((totalExperience % 365) / 30);

      // Get highest education
      const highestEducation = applicantEducations.sort((a, b) => {
        const levelOrder = { 'phd': 6, 'master': 5, 'bachelor': 4, 'diploma': 3, 'high-school': 2, 'certification': 1, 'other': 0 };
        return (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
      })[0];

      // Combine all skills from profile, work experience, and resume
      const allSkills = new Set();
      if (applicant.skills) applicant.skills.forEach(skill => allSkills.add(skill));
      if (applicantWorkExperiences) {
        applicantWorkExperiences.forEach(exp => {
          if (exp.skills) exp.skills.forEach(skill => allSkills.add(skill));
          if (exp.technologies) exp.technologies.forEach(tech => allSkills.add(tech));
        });
      }
      if (jobResume?.skills) jobResume.skills.forEach(skill => allSkills.add(skill));

      return {
        ...application.toJSON(),
        applicant: {
          ...applicant.toJSON(),
          fullName: `${applicant.first_name} ${applicant.last_name}`,
          totalExperienceYears: experienceYears,
          totalExperienceMonths: experienceMonths,
          totalExperienceDisplay: experienceYears > 0 
            ? `${experienceYears} year${experienceYears > 1 ? 's' : ''} ${experienceMonths} month${experienceMonths > 1 ? 's' : ''}`
            : `${experienceMonths} month${experienceMonths > 1 ? 's' : ''}`,
          highestEducation: highestEducation ? {
            ...highestEducation.toJSON(),
            fullDegree: `${highestEducation.degree} in ${highestEducation.fieldOfStudy}`,
            gradeDisplay: highestEducation.getGradeDisplay(),
            formattedPeriod: highestEducation.getFormattedPeriod()
          } : null,
          allSkills: Array.from(allSkills),
          workExperiences: applicantWorkExperiences.map(exp => ({
            ...exp.toJSON(),
            duration: exp.getDuration(),
            formattedPeriod: exp.getFormattedPeriod(),
            skillsString: exp.getSkillsString(),
            technologiesString: exp.getTechnologiesString()
          })),
          educations: applicantEducations.map(edu => ({
            ...edu.toJSON(),
            duration: edu.getDuration(),
            formattedPeriod: edu.getFormattedPeriod(),
            gradeDisplay: edu.getGradeDisplay(),
            fullDegree: edu.getFullDegree()
          })),
          resumes: applicant.resumes?.map(resume => ({
            ...resume.toJSON(),
            skillsString: resume.getSkillsString(),
            languagesString: resume.getLanguagesString(),
            certificationsString: resume.getCertificationsString()
          })) || []
        },
        jobResume: jobResume ? {
          ...jobResume.toJSON(),
          skillsString: jobResume.getSkillsString(),
          languagesString: jobResume.getLanguagesString(),
          certificationsString: jobResume.getCertificationsString()
        } : null
      };
    });

    res.json({
      success: true,
      data: enrichedApplications
    });
  } catch (error) {
    console.error('❌ Error fetching employer applications:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error name:', error.name);
    
    // Check if it's a Sequelize error
    if (error.name === 'SequelizeError') {
      console.error('❌ Sequelize error details:', {
        original: error.original,
        sql: error.sql,
        parameters: error.parameters
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get detailed application information for employer
router.get('/employer/applications/:id', authenticateToken, async (req, res) => {
  try {
    const { JobApplication, Job, Company, User, Resume, CoverLetter, WorkExperience, Education } = require('../config/index');
    const { id } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers and admins can view job applications.'
      });
    }
    
    const application = await JobApplication.findOne({
      where: { 
        id: id,
        employerId: req.user.id 
      },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: Company,
              as: 'company',
              attributes: ['id', 'name', 'industry', 'companySize', 'website', 'contactEmail', 'contactPhone']
            }
          ]
        },
        {
          model: User,
          as: 'applicant',
          attributes: [
            'id', 'first_name', 'last_name', 'email', 'phone', 'avatar',
            'headline', 'summary', 'skills', 'languages', 'certifications',
            'current_location', 'willing_to_relocate', 'expected_salary',
            'notice_period', 'date_of_birth', 'gender', 'social_links',
            'profile_completion', 'verification_level', 'last_profile_update'
          ],
          include: [
            {
              model: WorkExperience,
              as: 'workExperiences',
              attributes: [
                'id', 'jobTitle', 'location', 'startDate', 'endDate', 'isCurrent',
                'achievements', 'skills', 'salary', 'salaryCurrency'
              ]
            },
            {
              model: Education,
              as: 'educations',
              attributes: [
                'id', 'institution', 'degree', 'fieldOfStudy', 'startDate',
                'endDate', 'isCurrent', 'grade', 'percentage', 'cgpa',
                'description', 'activities', 'achievements', 'location',
                'educationType', 'isVerified', 'verificationDate'
              ]
            },
            {
              model: Resume,
              as: 'resumes',
              attributes: [
                'id', 'title', 'summary', 'objective', 'skills', 'languages',
                'certifications', 'projects', 'achievements', 'isDefault',
                'isPublic', 'views', 'downloads', 'lastUpdated', 'metadata'
              ],
              order: [['isDefault', 'DESC'], ['lastUpdated', 'DESC']]
            }
          ]
        },
        {
          model: Resume,
          as: 'jobResume',
          attributes: [
            'id', 'title', 'summary', 'objective', 'skills', 'languages',
            'certifications', 'projects', 'achievements', 'isDefault',
            'isPublic', 'views', 'downloads', 'lastUpdated', 'metadata'
          ]
        },
        {
          model: CoverLetter,
          as: 'jobCoverLetter',
          attributes: [
            'id', 'title', 'content', 'summary', 'isDefault',
            'isPublic', 'views', 'downloads', 'lastUpdated', 'metadata'
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or access denied'
      });
    }

    // Transform the data to include comprehensive jobseeker profile information
    const applicant = application.applicant;
    const jobResume = application.jobResume;
    const jobCoverLetter = application.jobCoverLetter;
    
    // Calculate total work experience
    const totalExperience = applicant.workExperiences?.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const diffInMs = end - start;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      return total + diffInDays;
    }, 0) || 0;

    const experienceYears = Math.floor(totalExperience / 365);
    const experienceMonths = Math.floor((totalExperience % 365) / 30);

    // Get highest education
    const highestEducation = applicant.educations?.sort((a, b) => {
      const levelOrder = { 'phd': 6, 'master': 5, 'bachelor': 4, 'diploma': 3, 'high-school': 2, 'certification': 1, 'other': 0 };
      return (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
    })[0];

    // Combine all skills from profile, work experience, and resume
    const allSkills = new Set();
    if (applicant.skills) applicant.skills.forEach(skill => allSkills.add(skill));
    if (applicant.workExperiences) {
      applicant.workExperiences.forEach(exp => {
        if (exp.skills) exp.skills.forEach(skill => allSkills.add(skill));
        if (exp.technologies) exp.technologies.forEach(tech => allSkills.add(tech));
      });
    }
    if (jobResume?.skills) jobResume.skills.forEach(skill => allSkills.add(skill));

    const enrichedApplication = {
      ...application.toJSON(),
      applicant: {
        ...applicant.toJSON(),
        fullName: `${applicant.first_name} ${applicant.last_name}`,
        totalExperienceYears: experienceYears,
        totalExperienceMonths: experienceMonths,
        totalExperienceDisplay: experienceYears > 0 
          ? `${experienceYears} year${experienceYears > 1 ? 's' : ''} ${experienceMonths} month${experienceMonths > 1 ? 's' : ''}`
          : `${experienceMonths} month${experienceMonths > 1 ? 's' : ''}`,
        highestEducation: highestEducation ? {
          ...highestEducation.toJSON(),
          fullDegree: `${highestEducation.degree} in ${highestEducation.fieldOfStudy}`,
          gradeDisplay: highestEducation.getGradeDisplay(),
          formattedPeriod: highestEducation.getFormattedPeriod()
        } : null,
        allSkills: Array.from(allSkills),
        workExperiences: applicant.workExperiences?.map(exp => ({
          ...exp.toJSON(),
          duration: exp.getDuration(),
          formattedPeriod: exp.getFormattedPeriod(),
          skillsString: exp.getSkillsString(),
          technologiesString: exp.getTechnologiesString()
        })) || [],
        educations: applicant.educations?.map(edu => ({
          ...edu.toJSON(),
          duration: edu.getDuration(),
          formattedPeriod: edu.getFormattedPeriod(),
          gradeDisplay: edu.getGradeDisplay(),
          fullDegree: edu.getFullDegree()
        })) || [],
        resumes: applicant.resumes?.map(resume => ({
          ...resume.toJSON(),
          skillsString: resume.getSkillsString(),
          languagesString: resume.getLanguagesString(),
          certificationsString: resume.getCertificationsString()
        })) || []
      },
      jobResume: jobResume ? {
        ...jobResume.toJSON(),
        skillsString: jobResume.getSkillsString(),
        languagesString: jobResume.getLanguagesString(),
        certificationsString: jobResume.getCertificationsString()
      } : null,
      jobCoverLetter: jobCoverLetter ? {
        ...jobCoverLetter.toJSON()
      } : null
    };

    res.json({
      success: true,
      data: enrichedApplication
    });
  } catch (error) {
    console.error('Error fetching detailed application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details'
    });
  }
});

// Update application status (for employers)
router.put('/employer/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Employer application status update request:', {
      applicationId: req.params.id,
      status: req.body.status,
      userId: req.user?.id,
      userType: req.user?.user_type
    });
    
    const { JobApplication } = require('../config/index');
    const { status } = req.body;
    const { id } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers and admins can update application status.'
      });
    }
    
    // Find the application and verify ownership
    const application = await JobApplication.findOne({
      where: { 
        id: id, 
        employerId: req.user.id 
      }
    });

    console.log('🔍 Application lookup result:', {
      applicationId: id,
      employerId: req.user.id,
      found: !!application,
      applicationData: application ? {
        id: application.id,
        jobId: application.jobId,
        userId: application.userId,
        employerId: application.employerId,
        status: application.status
      } : null
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or access denied'
      });
    }

    // Validate status
    const validStatuses = ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    // Store old status for logging
    const oldStatus = application.status;

    // Update the application status
    await application.update({ status });

    // Log application status change activity
    try {
      const EmployerActivityService = require('../services/employerActivityService');
      await EmployerActivityService.logApplicationStatusChange(
        req.user.id,
        application.id,
        oldStatus,
        status,
        {
          candidateId: application.userId,
          jobId: application.jobId,
          reason: req.body.reason || null,
          notes: req.body.notes || null,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      );
    } catch (activityError) {
      console.error('Failed to log application status change activity:', activityError);
      // Don't fail the status update if activity logging fails
    }

    res.json({
      success: true,
      data: application,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating application status for employer:', {
      error: error.message,
      stack: error.stack,
      applicationId: req.params.id,
      status: req.body.status,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});

// Update application status (for withdrawing applications)
router.put('/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Jobseeker application status update request:', {
      applicationId: req.params.id,
      status: req.body.status,
      userId: req.user?.id,
      userType: req.user?.user_type,
      body: req.body
    });

    const { JobApplication } = require('../config/index');
    const { status } = req.body;
    
    // Validate status parameter
    if (!status) {
      console.log('❌ Status validation failed: status is required');
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      console.log('❌ Status validation failed: invalid status value:', status);
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    console.log('🔍 Looking up application:', {
      applicationId: req.params.id,
      userId: req.user.id
    });

    const application = await JobApplication.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    console.log('🔍 Application lookup result:', {
      found: !!application,
      applicationData: application ? {
        id: application.id,
        jobId: application.jobId,
        userId: application.userId,
        status: application.status
      } : null
    });

    if (!application) {
      console.log('❌ Application not found');
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if the status change is allowed
    if (status === 'withdrawn') {
      // Idempotent: if already withdrawn, return success
      if (application.status === 'withdrawn') {
        return res.json({
          success: true,
          data: application,
          message: 'Application already withdrawn'
        });
      }

      const blockedStatuses = ['hired', 'rejected'];
      const canWithdrawNow = !blockedStatuses.includes(application.status);
      console.log('🔍 Checking if application can be withdrawn:', {
        currentStatus: application.status,
        allowed: canWithdrawNow
      });
      if (!canWithdrawNow) {
        return res.status(400).json({
          success: false,
          message: `Cannot withdraw application when status is '${application.status}'`
        });
      }
    }

    // Update the application status and lastUpdatedAt
    await application.update({ 
      status,
      lastUpdatedAt: new Date()
    });

    res.json({
      success: true,
      data: application,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});

// Job Alerts endpoints
router.get('/job-alerts', authenticateToken, async (req, res) => {
  try {
    const { JobAlert } = require('../config/index');
    
    const alerts = await JobAlert.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']]
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
      where: { user_id: req.user.id },
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
      order: [['created_at', 'DESC']]
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

    // Create bookmark while being tolerant to missing optional columns on older schemas
    const bookmark = await JobBookmark.create(bookmarkData, {
      fields: ['userId', 'jobId', 'folder', 'priority', 'reminderDate', 'notes'].filter((f) => f in bookmarkData)
    });

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

// Job At Pace: activate premium visibility features without payment (logged-in users only)
router.post('/job-at-pace/activate', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    // Only jobseekers can activate Job at Pace
    if (user.user_type !== 'jobseeker') {
      return res.status(403).json({ success: false, message: 'Only jobseekers can activate Job at Pace' });
    }

    // Merge preferences safely
    const currentPrefs = user.preferences || {};
    const tags = Array.isArray(currentPrefs.tags) ? currentPrefs.tags : [];
    const mergedPrefs = {
      ...currentPrefs,
      premium: true,
      visibility: {
        ...(currentPrefs.visibility || {}),
        profileBoost: true,
        premiumBadge: true,
        featuredPlacement: true
      },
      tags: Array.from(new Set([ ...tags, 'premium' ]))
    };

    // Update user record
    await user.update({
      preferences: mergedPrefs,
      verification_level: 'premium'
    });

    // Optional: record activity (best-effort)
    try {
      const EmployerActivityService = require('../services/employerActivityService');
      if (EmployerActivityService?.recordUserActivity) {
        await EmployerActivityService.recordUserActivity(user.id, 'job_at_pace_activate', { planId: req.body?.planId || 'premium' });
      }
    } catch (_) {}

    return res.json({ success: true, message: 'Job at Pace premium activated', data: { userId: user.id, preferences: mergedPrefs } });
  } catch (error) {
    console.error('Error activating Job at Pace:', error);
    return res.status(500).json({ success: false, message: 'Failed to activate Job at Pace' });
  }
});

// Search History endpoints
router.get('/search-history', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    
    const searchHistory = await DashboardService.getSearchHistory(req.user.id, 20);
    
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

// Enhanced Search History endpoints using SearchHistory model
router.get('/search-history/enhanced', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    
    const searchHistory = await DashboardService.getSearchHistory(req.user.id, 50);
    
    res.json({
      success: true,
      data: searchHistory
    });
  } catch (error) {
    console.error('Error fetching enhanced search history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enhanced search history'
    });
  }
});

// Save search as favorite
router.post('/search-history/:id/save', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    const { id } = req.params;
    
    const savedSearch = await DashboardService.saveSearch(req.user.id, id);
    
    res.json({
      success: true,
      data: savedSearch,
      message: 'Search saved successfully'
    });
  } catch (error) {
    console.error('Error saving search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save search'
    });
  }
});

// Remove saved search
router.delete('/search-history/:id/save', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    const { id } = req.params;
    
    const removedSearch = await DashboardService.removeSavedSearch(req.user.id, id);
    
    res.json({
      success: true,
      data: removedSearch,
      message: 'Search removed from favorites'
    });
  } catch (error) {
    console.error('Error removing saved search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved search'
    });
  }
});

// Record new search
router.post('/search-history', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    const { searchQuery, filters, resultsCount, searchType } = req.body;
    
    const searchData = {
      userId: req.user.id,
      searchQuery,
      filters,
      resultsCount,
      searchType,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    };
    
    const recordedSearch = await DashboardService.recordSearch(searchData);
    
    res.status(201).json({
      success: true,
      data: recordedSearch,
      message: 'Search recorded successfully'
    });
  } catch (error) {
    console.error('Error recording search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record search'
    });
  }
});

// Dashboard Stats endpoint
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    
    console.log('📊 Fetching comprehensive dashboard data for user:', req.user.id);
    
    // Get comprehensive dashboard data
    const dashboardData = await DashboardService.getDashboardData(req.user.id);
    
    console.log('✅ Dashboard data fetched successfully');
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Employer Dashboard Stats endpoint
router.get('/employer/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const { Job, JobApplication, Company, User } = require('../config/index');
    
    console.log('📊 Fetching employer dashboard data for user:', req.user.id, 'type:', req.user.user_type);
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      console.log('❌ Access denied - user is not an employer:', req.user.user_type);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can access this endpoint.'
      });
    }
    
    // Get employer's jobs - filter by user's region to ensure Gulf employers only see Gulf jobs
    console.log('🔍 Querying jobs for employerId:', req.user.id, 'region:', req.user.region);
    const whereClause = { employerId: req.user.id };
    
    // Add region filtering to ensure Gulf employers only see Gulf jobs in normal dashboard
    if (req.user.region === 'gulf') {
      whereClause.region = 'gulf';
    } else if (req.user.region === 'india') {
      whereClause.region = 'india';
    } else if (req.user.region === 'other') {
      whereClause.region = 'other';
    }
    // If user has no region set, show all jobs (backward compatibility)
    
    const jobs = await Job.findAll({
      where: whereClause
    });
    console.log('✅ Found jobs:', jobs.length);
    
    // Get applications for employer's jobs using raw query
    console.log('🔍 Querying applications for employer jobs:', req.user.id);
    const applications = await sequelize.query(`
      SELECT ja.*, j.title as job_title, j.location as job_location,
             u.first_name, u.last_name, u.email, u.headline, u.current_location, u.skills
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN users u ON ja.user_id = u.id
      WHERE j."employerId" = :userId
    `, {
      replacements: { userId: req.user.id },
      type: sequelize.QueryTypes.SELECT
    });
    console.log('✅ Found applications:', applications.length);
    
    // Get hot vacancies for employer
    const { HotVacancy } = require('../config/index');
    const hotVacancies = await HotVacancy.findAll({
      where: { employerId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    console.log('✅ Found hot vacancies:', hotVacancies.length);
    
    // Calculate stats
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = applications.length;
    const hiredCandidates = applications.filter(app => app.status === 'hired').length;
    const reviewingApplications = applications.filter(app => app.status === 'reviewing').length;
    const shortlistedApplications = applications.filter(app => app.status === 'shortlisted').length;
    const interviewScheduledApplications = applications.filter(app => app.status === 'interview_scheduled').length;
    
    // Get profile/job views from view tracking
    let profileViews = 0;
    try {
    const { ViewTracking } = require('../config/index');
    const { Op } = require('sequelize');
      profileViews = await ViewTracking.count({
      where: { 
        viewedUserId: req.user.id,
        viewType: { [Op.in]: ['job_view', 'profile_view'] }
      }
    });
    } catch (viewError) {
      console.log('⚠️ Could not fetch profile views:', viewError.message);
      profileViews = 0;
    }
    
    const employerStats = {
      activeJobs,
      totalApplications,
      hiredCandidates,
      reviewingApplications,
      shortlistedApplications,
      interviewScheduledApplications,
      profileViews,
      totalJobs: jobs.length,
      recentApplications: applications.slice(0, 5),
      recentJobs: jobs.slice(0, 5),
      recentHotVacancies: hotVacancies
    };
    
    console.log('✅ Employer dashboard data fetched successfully:', {
      activeJobs,
      totalApplications,
      hiredCandidates,
      reviewingApplications,
      shortlistedApplications,
      interviewScheduledApplications,
      profileViews,
      totalJobs: jobs.length
    });
    
    res.json({
      success: true,
      data: employerStats
    });
  } catch (error) {
    console.error('❌ Error fetching employer dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employer dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Employer Analytics endpoint
router.get('/employer/analytics', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    const range = (req.query.range || '30d').toString();

    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers and admins can access this endpoint.' });
    }

    const analytics = await DashboardService.getEmployerAnalytics(req.user.id, { range });
    return res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('❌ Error fetching employer analytics:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch employer analytics' });
  }
});

// Employer Analytics Export endpoint
router.get('/employer/analytics/export', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    const range = (req.query.range || '30d').toString();
    const format = (req.query.format || 'csv').toString();

    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers and admins can access this endpoint.' });
    }

    const analytics = await DashboardService.getEmployerAnalytics(req.user.id, { range });
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${range}.json"`);
      return res.json(analytics);
    } else {
      // CSV format
      const csv = DashboardService.convertAnalyticsToCSV(analytics, range);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${range}.csv"`);
      return res.send(csv);
    }
  } catch (error) {
    console.error('❌ Error exporting employer analytics:', error);
    return res.status(500).json({ success: false, message: 'Failed to export analytics' });
  }
});

// Track profile view
router.post('/track-profile-view/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const ViewTrackingService = require('../services/viewTrackingService');
    
    // Check and consume quota for profile view (only for authenticated users)
    if (req.user && req.user.user_type === 'employer') {
      try {
        console.log('🔍 Consuming profile view quota for employer:', req.user.id, 'viewing user:', userId);
        const EmployerQuotaService = require('../services/employerQuotaService');
        const quotaResult = await EmployerQuotaService.checkAndConsume(
          req.user.id,
          EmployerQuotaService.QUOTA_TYPES.PROFILE_VISITS,
          {
            activityType: 'profile_viewed',
            details: {
              viewedUserId: userId,
              source: 'profile_page'
            },
            defaultLimit: 500
          }
        );
        console.log('✅ Profile view quota consumed successfully:', quotaResult);
      } catch (quotaError) {
        console.error('Quota check failed for profile view:', quotaError);
        if (quotaError.code === 'QUOTA_LIMIT_EXCEEDED') {
          return res.status(429).json({
            success: false,
            message: 'Profile view quota exceeded. Please contact your administrator.'
          });
        }
        // For other quota errors, continue with view but log the issue
      }
    }
    
    const result = await ViewTrackingService.trackView({
      viewerId: req.user?.id || null,
      viewedUserId: userId,
      viewType: 'profile_view',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      referrer: req.get('Referer'),
      metadata: {
        source: 'profile_page'
      }
    });
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Profile view tracked successfully'
      });
    } else {
      res.json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error tracking profile view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track profile view'
    });
  }
});

// Enhanced Dashboard endpoint with search history
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    
    console.log('📊 Fetching full dashboard for user:', req.user.id);
    
    // Get comprehensive dashboard data including search history
    const dashboardData = await DashboardService.getDashboardData(req.user.id);
    
    // Record dashboard view activity
    await DashboardService.recordActivity(req.user.id, 'dashboard_view', {
      timestamp: new Date(),
      userAgent: req.headers['user-agent']
    });
    
    console.log('✅ Full dashboard data fetched successfully');
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('❌ Error fetching full dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update dashboard stats endpoint
router.put('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const DashboardService = require('../services/dashboardService');
    const updates = req.body;
    
    console.log('📊 Updating dashboard stats for user:', req.user.id, updates);
    
    // Update dashboard stats
    const updatedDashboard = await DashboardService.updateDashboardStats(req.user.id, updates);
    
    console.log('✅ Dashboard stats updated successfully');
    
    res.json({
      success: true,
      data: updatedDashboard,
      message: 'Dashboard stats updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Resume endpoints
router.get('/resumes', authenticateToken, async (req, res) => {
  try {
    const resumes = await Resume.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
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
      order: [['createdAt', 'DESC']],
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
      isPublic: true,
      lastUpdated: new Date() // Explicitly set lastUpdated
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

    // If referenced by applications, detach it first by nulling resumeId
    try {
      const { JobApplication } = require('../config/index');
      await JobApplication.update(
        { resumeId: null },
        { where: { resumeId: req.params.id } }
      );
    } catch (refErr) {
      console.log('Resume reference detach failed (continuing):', refErr.message);
    }

    // Attempt to remove the underlying file
    try {
      const metadata = resume.metadata || {};
      const filename = metadata.filename;
      if (filename) {
        const possible = [
          path.join('/opt/render/project/src/uploads/resumes', filename),
          path.join('/opt/render/project/src/server/uploads/resumes', filename),
          path.join('/tmp/uploads/resumes', filename),
          path.join(__dirname, '../uploads/resumes', filename),
          path.join(process.cwd(), 'server', 'uploads', 'resumes', filename),
          path.join(process.cwd(), 'uploads', 'resumes', filename)
        ];
        const filePath = possible.find(p => fs.existsSync(p));
        if (filePath) {
          fs.unlink(filePath, (err) => {
            if (err) console.log('Failed to delete resume file:', err.message);
          });
        }
      }
    } catch (fileErr) {
      console.log('Resume file delete skipped:', fileErr.message);
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
      lastUpdated: new Date(), // Explicitly set lastUpdated
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
    console.log('🔍 Resume download request:', { resumeId: req.params.id, userId: req.user.id });
    
    const resume = await Resume.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!resume) {
      console.log('❌ Resume not found in database');
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    console.log('✅ Resume found:', { 
      id: resume.id, 
      title: resume.title, 
      metadata: resume.metadata 
    });

    const metadata = resume.metadata || {};
    const filename = metadata.filename;
    // Support both camelCase and snake_case
    const originalName = metadata.originalName || metadata.original_name || `resume-${resume.id}.pdf`;

    console.log('🔍 Resume metadata:', { filename, originalName, metadata });

    if (!filename) {
      console.log('❌ No filename in resume metadata');
      return res.status(404).json({
        success: false,
        message: 'Resume file not found - no filename in metadata'
      });
    }

    // Use utility function to find the file
    const filePath = findResumeFile(filename, metadata);
    
    if (!filePath) {
      // Fallback: try redirecting to the stored public path if present
      if (metadata.filePath) {
        return res.redirect(metadata.filePath);
      }
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server. The file may have been lost during server restart. Please re-upload your resume.',
        code: 'FILE_NOT_FOUND'
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

// Cover Letter endpoints

// Get all cover letters for a user
router.get('/cover-letters', authenticateToken, async (req, res) => {
  try {
    const coverLetters = await CoverLetter.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: coverLetters
    });
  } catch (error) {
    console.error('Error fetching cover letters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cover letters'
    });
  }
});

// Get cover letter stats
router.get('/cover-letters/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await CoverLetter.findAll({
      where: { userId: req.user.id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCoverLetters'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "isDefault" = true THEN 1 END')), 'hasDefaultCoverLetter'],
        [sequelize.fn('MAX', sequelize.col('lastUpdated')), 'lastCoverLetterUpdate']
      ],
      raw: true
    });

    const result = stats[0] || {
      totalCoverLetters: 0,
      hasDefaultCoverLetter: 0,
      lastCoverLetterUpdate: null
    };

    res.json({
      success: true,
      data: {
        totalCoverLetters: parseInt(result.totalCoverLetters) || 0,
        hasDefaultCoverLetter: parseInt(result.hasDefaultCoverLetter) > 0,
        lastCoverLetterUpdate: result.lastCoverLetterUpdate
      }
    });
  } catch (error) {
    console.error('Error fetching cover letter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cover letter stats'
    });
  }
});

// Create a new cover letter
router.post('/cover-letters', authenticateToken, async (req, res) => {
  try {
    const { title, content, summary } = req.body;

    // Check if this is the first cover letter (make it default)
    const existingCoverLetters = await CoverLetter.count({
      where: { userId: req.user.id }
    });

    const isDefault = existingCoverLetters === 0;

    const coverLetter = await CoverLetter.create({
      userId: req.user.id,
      title: title || 'Untitled Cover Letter',
      content: content || '',
      summary: summary || '',
      isDefault: isDefault,
      isPublic: true,
      lastUpdated: new Date() // Explicitly set lastUpdated
    });

    res.status(201).json({
      success: true,
      data: coverLetter
    });
  } catch (error) {
    console.error('Error creating cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create cover letter'
    });
  }
});

// Update a cover letter
router.put('/cover-letters/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, summary } = req.body;

    const coverLetter = await CoverLetter.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    await coverLetter.update({
      title: title || coverLetter.title,
      content: content !== undefined ? content : coverLetter.content,
      summary: summary !== undefined ? summary : coverLetter.summary
    });

    res.json({
      success: true,
      data: coverLetter
    });
  } catch (error) {
    console.error('Error updating cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cover letter'
    });
  }
});

// Delete a cover letter
router.delete('/cover-letters/:id', authenticateToken, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    // Detach from any job applications first
    try {
      const { JobApplication } = require('../config/index');
      await JobApplication.update(
        { coverLetterId: null },
        { where: { coverLetterId: req.params.id } }
      );
    } catch (refErr) {
      console.log('Cover letter reference detach failed (continuing):', refErr.message);
    }

    // If this was the default cover letter, make another one default
    if (coverLetter.isDefault) {
      const otherCoverLetter = await CoverLetter.findOne({
        where: { 
          userId: req.user.id,
          id: { [sequelize.Op.ne]: req.params.id }
        },
        order: [['lastUpdated', 'DESC']]
      });

      if (otherCoverLetter) {
        await otherCoverLetter.update({ isDefault: true });
      }
    }

    // Attempt to remove the underlying file
    try {
      const metadata = coverLetter.metadata || {};
      const filename = metadata.filename;
      if (filename) {
        const possible = [
          path.join('/opt/render/project/src/uploads/cover-letters', filename),
          path.join('/opt/render/project/src/server/uploads/cover-letters', filename),
          path.join('/tmp/uploads/cover-letters', filename),
          path.join(__dirname, '../uploads/cover-letters', filename),
          path.join(process.cwd(), 'server', 'uploads', 'cover-letters', filename),
          path.join(process.cwd(), 'uploads', 'cover-letters', filename)
        ];
        const filePath = possible.find(p => fs.existsSync(p));
        if (filePath) {
          fs.unlink(filePath, (err) => {
            if (err) console.log('Failed to delete cover letter file:', err.message);
          });
        }
      }
    } catch (fileErr) {
      console.log('Cover letter file delete skipped:', fileErr.message);
    }

    await coverLetter.destroy();

    res.json({
      success: true,
      message: 'Cover letter deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cover letter'
    });
  }
});

// Upload cover letter file
router.post('/cover-letters/upload', authenticateToken, coverLetterUpload.single('coverLetter'), async (req, res) => {
  try {
    console.log('🔍 Cover letter upload request received');
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

    // Check if this is the first cover letter (make it default)
    const existingCoverLetters = await CoverLetter.count({
      where: { userId: req.user.id }
    });

    const isDefault = existingCoverLetters === 0;

    // Create cover letter record
    const coverLetter = await CoverLetter.create({
      userId: req.user.id,
      title: title || `Cover Letter - ${originalName.replace(/\.[^/.]+$/, '')}`,
      summary: description || `Cover letter uploaded on ${new Date().toLocaleDateString()}`,
      isDefault: isDefault,
      isPublic: true,
      lastUpdated: new Date(), // Explicitly set lastUpdated
      metadata: {
        filename,
        originalName,
        fileSize,
        mimeType,
        uploadDate: new Date().toISOString(),
        filePath: `/uploads/cover-letters/${filename}`
      }
    });

    console.log('✅ Cover letter created successfully:', coverLetter.id);

    // If this is the first cover letter, ensure it's set as default
    if (isDefault) {
      console.log('✅ Setting as default cover letter (first upload)');
    }

    res.status(201).json({
      success: true,
      data: {
        coverLetterId: coverLetter.id,
        filename,
        title: coverLetter.title,
        isDefault: coverLetter.isDefault,
        fileSize: fileSize,
        originalName: originalName
      }
    });
  } catch (error) {
    console.error('❌ Error uploading cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload cover letter: ' + error.message
    });
  }
});

// Set default cover letter
router.put('/cover-letters/:id/set-default', authenticateToken, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    // Remove default from all other cover letters
    await CoverLetter.update(
      { isDefault: false },
      { where: { userId: req.user.id } }
    );

    // Set this cover letter as default
    await coverLetter.update({ isDefault: true });

    res.json({
      success: true,
      data: coverLetter
    });
  } catch (error) {
    console.error('Error setting default cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default cover letter'
    });
  }
});

// Download cover letter file
router.get('/cover-letters/:id/download', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Cover letter download request:', { coverLetterId: req.params.id, userId: req.user.id });
    
    const coverLetter = await CoverLetter.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!coverLetter) {
      console.log('❌ Cover letter not found in database');
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    console.log('✅ Cover letter found:', { 
      id: coverLetter.id, 
      title: coverLetter.title, 
      metadata: coverLetter.metadata 
    });

    const metadata = coverLetter.metadata || {};
    const filename = metadata.filename;
    const originalName = metadata.originalName || metadata.original_name || `cover-letter-${coverLetter.id}.pdf`;

    console.log('🔍 Cover letter metadata:', { filename, originalName, metadata });

    if (!filename) {
      console.log('❌ No filename in cover letter metadata');
      return res.status(404).json({
        success: false,
        message: 'Cover letter file not found - no filename in metadata'
      });
    }

    const filePath = findCoverLetterFile(filename, metadata);
    if (!filePath) {
      if (metadata.filePath) {
        return res.redirect(metadata.filePath);
      }
      return res.status(404).json({
        success: false,
        message: 'Cover letter file not found on server',
        code: 'FILE_NOT_FOUND'
      });
    }

    // Increment download count
    await coverLetter.update({
      downloads: coverLetter.downloads + 1
    });

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName || filename}"`);
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download cover letter'
    });
  }
});

// Download candidate cover letter (for employers)
router.get('/employer/candidates/:candidateId/cover-letters/:coverLetterId/download', authenticateToken, async (req, res) => {
  try {
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers and admins can download candidate cover letters.'
      });
    }

    const { candidateId, coverLetterId } = req.params;

    // Verify the candidate exists and is a jobseeker
    const candidate = await User.findOne({
      where: { 
        id: candidateId,
        user_type: 'jobseeker',
        is_active: true,
        account_status: 'active'
      }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Find the cover letter
    const coverLetter = await CoverLetter.findOne({
      where: { 
        id: coverLetterId, 
        userId: candidateId 
      }
    });

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    const metadata = coverLetter.metadata || {};
    const filename = metadata.filename;
    const originalName = metadata.originalName;

    if (!filename) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter file not found'
      });
    }

    const filePath = path.join(__dirname, '../uploads/cover-letters', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter file not found on server'
      });
    }

    // Increment download count
    await coverLetter.update({
      downloads: coverLetter.downloads + 1
    });

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName || filename}"`);
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading candidate cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download cover letter'
    });
  }
});

// Employer endpoint to download cover letter from application
router.get('/employer/applications/:applicationId/cover-letter/download', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers and admins can download cover letters.'
      });
    }

    // Find the application and verify ownership
    const application = await JobApplication.findOne({
      where: { 
        id: applicationId, 
        employerId: req.user.id 
      },
      include: [
        {
          model: CoverLetter,
          as: 'jobCoverLetter',
          attributes: ['id', 'title', 'metadata']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or access denied'
      });
    }

    if (!application.jobCoverLetter) {
      return res.status(404).json({
        success: false,
        message: 'No cover letter found for this application'
      });
    }

    const coverLetter = application.jobCoverLetter;
    const metadata = coverLetter.metadata || {};
    const filename = metadata.filename;
    const originalName = metadata.originalName;

    if (!filename) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter file not found'
      });
    }

    const filePath = path.join(__dirname, '../uploads/cover-letters', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter file not found on server'
      });
    }

    // Increment download count
    await coverLetter.update({
      downloads: coverLetter.downloads + 1
    });

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName || filename}"`);
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading cover letter for employer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download cover letter'
    });
  }
});

// Employer endpoint to view resume from application (increment view count)
router.get('/employer/applications/:applicationId/resume/view', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Employer resume view request:', { applicationId: req.params.applicationId, userId: req.user?.id, userType: req.user?.user_type });
    
    const { JobApplication, Resume } = require('../config/index');
    const { applicationId } = req.params;
    
    // Check if user is an employer
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      console.log('❌ Access denied - user is not an employer:', req.user.user_type);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can view resumes.'
      });
    }

    // Find the application and verify ownership
    console.log('🔍 Looking for application:', { applicationId, employerId: req.user.id });
    
    const application = await JobApplication.findOne({
      where: { 
        id: applicationId, 
        employerId: req.user.id 
      },
      include: [
        {
          model: Resume,
          as: 'jobResume',
          attributes: ['id', 'title', 'metadata', 'views']
        }
      ]
    });

    console.log('🔍 Application found:', { 
      found: !!application, 
      hasResume: !!application?.jobResume,
      resumeId: application?.jobResume?.id,
      resumeTitle: application?.jobResume?.title
    });

    if (!application) {
      console.log('❌ Application not found or access denied');
      return res.status(404).json({
        success: false,
        message: 'Application not found or access denied'
      });
    }

    if (!application.jobResume) {
      console.log('❌ No resume found for this application');
      return res.status(404).json({
        success: false,
        message: 'No resume found for this application'
      });
    }

    const resume = application.jobResume;
    
    // Increment view count
    const currentViews = resume.views || 0;
    console.log('🔍 Current views:', currentViews);
    await resume.update({
      views: currentViews + 1
    });

    // Check and consume quota for resume view
    try {
      const EmployerQuotaService = require('../services/employerQuotaService');
      await EmployerQuotaService.checkAndConsume(
        req.user.id,
        EmployerQuotaService.QUOTA_TYPES.RESUME_VIEWS,
        {
          activityType: 'resume_view',
          details: {
            resumeId: resume.id,
            candidateId: application.userId,
            applicationId: application.id
          },
          defaultLimit: 100
        }
      );
    } catch (quotaError) {
      console.error('Quota check failed for resume view:', quotaError);
      if (quotaError.code === 'QUOTA_LIMIT_EXCEEDED') {
        return res.status(429).json({
          success: false,
          message: 'Resume view quota exceeded. Please contact your administrator.'
        });
      }
      // For other quota errors, continue with view but log the issue
    }

    // Log resume view activity
    try {
      const EmployerActivityService = require('../services/employerActivityService');
      await EmployerActivityService.logResumeView(
        req.user.id,
        resume.id,
        application.userId,
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          applicationId: application.id
        }
      );
    } catch (activityError) {
      console.error('Failed to log resume view activity:', activityError);
      // Don't fail the view if activity logging fails
    }

    console.log('✅ Resume view logged successfully');

    res.json({
      success: true,
      message: 'Resume view logged successfully',
      data: {
        resumeId: resume.id,
        views: currentViews + 1
      }
    });
  } catch (error) {
    console.error('❌ Error viewing resume for employer:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to view resume',
      error: error.message
    });
  }
});

// Employer dashboard summary (parity with normal employer dashboard, Gulf-compatible)
router.get('/employer/dashboard', authenticateToken, async (req, res) => {
  try {
    const { Job, JobApplication, Company } = require('../config/index');

    if (!req.user || (req.user.user_type !== 'employer' && req.user.user_type !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers and admins can view dashboard.' });
    }

    const employerId = req.user.id;

    // Employer jobs - filter by user's region to ensure Gulf employers only see Gulf jobs
    const whereClause = { employerId };
    
    // Add region filtering to ensure Gulf employers only see Gulf jobs in normal dashboard
    if (req.user.region === 'gulf') {
      whereClause.region = 'gulf';
    } else if (req.user.region === 'india') {
      whereClause.region = 'india';
    } else if (req.user.region === 'other') {
      whereClause.region = 'other';
    }
    // If user has no region set, show all jobs (backward compatibility)
    
    const jobs = await Job.findAll({
      where: whereClause,
      attributes: ['id', 'title', 'status', 'region', 'createdAt'],
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'region'] }],
      order: [['createdAt', 'DESC']]
    });

    // Applications for employer jobs
    const applications = await JobApplication.findAll({
      where: { employerId },
      attributes: ['id', 'jobId', 'userId', 'status', 'appliedAt'],
      order: [['appliedAt', 'DESC']]
    });

    const activeJobs = jobs.filter(j => j.status === 'active' || !j.status).length;
    const totalApplications = applications.length;
    const reviewingApplications = applications.filter(a => a.status === 'reviewing').length;
    const shortlistedApplications = applications.filter(a => a.status === 'shortlisted').length;
    const hiredCandidates = applications.filter(a => a.status === 'hired').length;

    res.json({
      success: true,
      data: {
        activeJobs,
        totalJobs: jobs.length,
        totalApplications,
        reviewingApplications,
        shortlistedApplications,
        hiredCandidates,
        recentApplications: applications.slice(0, 5),
        recentJobs: jobs.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error generating employer dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employer dashboard', error: error.message });
  }
});

// Employer endpoint to download resume from application
function attachTokenFromQuery(req, _res, next) {
  try {
    const qToken = req.query && (req.query.token || req.query.access_token);
    if (!req.headers?.authorization && qToken) {
      req.headers.authorization = `Bearer ${qToken}`;
    }
  } catch (_) {}
  next();
}

router.get('/employer/applications/:applicationId/resume/download', attachTokenFromQuery, authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Employer resume download request:', { applicationId: req.params.applicationId, userId: req.user?.id, userType: req.user?.user_type });
    
    const { JobApplication, Resume } = require('../config/index');
    const { applicationId } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      console.log('❌ Access denied - user is not an employer or admin:', req.user.user_type);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers and admins can download resumes.'
      });
    }

    // Find the application and verify ownership
    console.log('🔍 Looking for application:', { applicationId, employerId: req.user.id });
    
    const application = await JobApplication.findOne({
      where: { 
        id: applicationId, 
        employerId: req.user.id 
      },
      include: [
        {
          model: Resume,
          as: 'jobResume',
          attributes: ['id', 'title', 'metadata']
        }
      ]
    });

    console.log('🔍 Application found:', { 
      found: !!application, 
      hasResume: !!application?.jobResume,
      resumeId: application?.jobResume?.id,
      resumeTitle: application?.jobResume?.title
    });

    if (!application) {
      console.log('❌ Application not found or access denied');
      return res.status(404).json({
        success: false,
        message: 'Application not found or access denied'
      });
    }

    if (!application.jobResume) {
      console.log('❌ No resume found for this application');
      return res.status(404).json({
        success: false,
        message: 'No resume found for this application'
      });
    }

    const resume = application.jobResume;
    const metadata = resume.metadata || {};
    const filename = metadata.filename;
    const originalName = metadata.originalName;

    console.log('🔍 Resume metadata:', { filename, originalName, metadata });

    if (!filename) {
      console.log('❌ No filename in resume metadata');
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }

    // Use utility function to find the file
    const filePath = findResumeFile(filename, metadata);
    
    if (!filePath) {
      // Fallback: try redirecting to stored public path if present
      if (metadata.filePath) {
        return res.redirect(metadata.filePath);
      }
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server. The file may have been lost during server restart. Please re-upload your resume.',
        code: 'FILE_NOT_FOUND'
      });
    }

    console.log('✅ File exists, proceeding with download');

    // Increment download count
    const currentDownloads = resume.downloads || 0;
    console.log('🔍 Current downloads:', currentDownloads);
    await resume.update({
      downloads: currentDownloads + 1
    });

    // Check and consume quota for resume download
    try {
      const EmployerQuotaService = require('../services/employerQuotaService');
      await EmployerQuotaService.checkAndConsume(
        req.user.id,
        EmployerQuotaService.QUOTA_TYPES.RESUME_VIEWS,
        {
          activityType: 'resume_download',
          details: {
            resumeId: resume.id,
            candidateId: application.userId,
            applicationId: application.id
          },
          defaultLimit: 100
        }
      );
    } catch (quotaError) {
      console.error('Quota check failed for resume download:', quotaError);
      if (quotaError.code === 'QUOTA_LIMIT_EXCEEDED') {
        return res.status(429).json({
          success: false,
          message: 'Resume download quota exceeded. Please contact your administrator.'
        });
      }
      // For other quota errors, continue with download but log the issue
    }

    // Log resume download activity
    try {
      const EmployerActivityService = require('../services/employerActivityService');
      await EmployerActivityService.logResumeDownload(
        req.user.id,
        resume.id,
        application.userId,
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          applicationId: application.id
        }
      );
    } catch (activityError) {
      console.error('Failed to log resume download activity:', activityError);
      // Don't fail the download if activity logging fails
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName || filename}"`);
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');

    console.log('🔍 Sending file:', filePath);
    console.log('🔍 Headers set:', {
      'Content-Disposition': res.getHeader('Content-Disposition'),
      'Content-Type': res.getHeader('Content-Type')
    });

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('❌ Error downloading resume for employer:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to download resume',
      error: error.message
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

// Job photo upload endpoint
router.post('/job-photos/upload', authenticateToken, jobPhotoUpload.single('photo'), async (req, res) => {
  try {
    console.log('🔍 Job photo upload request received');
    console.log('🔍 File:', req.file);
    console.log('🔍 User:', req.user.id);
    console.log('🔍 Body:', req.body);

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { jobId, altText, caption, isPrimary, displayOrder } = req.body;
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Check if user has permission to upload photos for this job
    const { Job } = require('../config/index');
    const job = await Job.findByPk(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the employer of this job
    if (job.employerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload photos for your own jobs'
      });
    }

    const filename = req.file.filename;
    const filePath = `/uploads/job-photos/${filename}`;
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}${filePath}`;
    
    console.log('🔍 Generated job photo URL:', fileUrl);

    // Create job photo record
    const { JobPhoto } = require('../config/index');
    const jobPhoto = await JobPhoto.create({
      jobId: jobId,
      filename: req.file.originalname,
      filePath: filePath,
      fileUrl: fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      altText: altText || `Job photo for ${job.title}`,
      caption: caption || '',
      displayOrder: parseInt(displayOrder) || 0,
      isPrimary: isPrimary === 'true' || isPrimary === true,
      isActive: true,
      uploadedBy: req.user.id,
      metadata: {
        originalName: req.file.originalname,
        uploadDate: new Date().toISOString(),
        uploaderId: req.user.id,
        uploaderEmail: req.user.email
      }
    });

    console.log('✅ Job photo created successfully:', jobPhoto.id);

    res.status(201).json({
      success: true,
      data: {
        id: jobPhoto.id,
        photoId: jobPhoto.id,
        filename: filename,
        fileUrl: fileUrl,
        fileSize: req.file.size,
        originalName: req.file.originalname,
        altText: jobPhoto.altText,
        caption: jobPhoto.caption,
        isPrimary: jobPhoto.isPrimary,
        displayOrder: jobPhoto.displayOrder
      },
      message: 'Job photo uploaded successfully'
    });
  } catch (error) {
    console.error('❌ Error uploading job photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload job photo: ' + error.message
    });
  }
});

// Get job photos endpoint
router.get('/jobs/:jobId/photos', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { JobPhoto } = require('../config/index');
    
    const photos = await JobPhoto.findAll({
      where: { 
        jobId: jobId,
        isActive: true 
      },
      order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error('Error fetching job photos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job photos'
    });
  }
});

// Delete job photo endpoint
router.delete('/job-photos/:photoId', authenticateToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    
    // Validate photoId
    if (!photoId || photoId === 'undefined' || photoId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo ID provided'
      });
    }
    
    const { JobPhoto, Job } = require('../config/index');
    
    // Find the photo
    const photo = await JobPhoto.findByPk(photoId, {
      include: [{
        model: Job,
        as: 'job',
        attributes: ['id', 'employerId', 'title']
      }]
    });
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Check if user has permission to delete this photo
    if (photo.job.employerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete photos from your own jobs'
      });
    }

    // Delete the photo file from filesystem
    const fullPath = path.join(__dirname, '..', photo.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('✅ Deleted photo file:', fullPath);
    }

    // Delete the photo record from database
    await photo.destroy();

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job photo'
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
