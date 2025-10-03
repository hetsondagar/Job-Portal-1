const express = require('express');
const Company = require('../models/Company');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
// (moved list and join company routes below middleware definition)

// Middleware to verify JWT token (must be defined before use)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Storage for company gallery photos
const companyPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/company-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, 'company-photo-' + uniqueSuffix + extension);
  }
});

// Define upload middlewares BEFORE routes that use them
const companyPhotoUpload = multer({
  storage: companyPhotoStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Only JPG, PNG, GIF, and WebP files are allowed'));
  }
});

// Storage for company logo uploads
const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/company-logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, 'company-logo-' + uniqueSuffix + extension);
  }
});

const companyLogoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Only JPG, PNG, and WebP files are allowed'));
  }
});

// Upload a company gallery photo
router.post('/:id/photos', authenticateToken, companyPhotoUpload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { altText, caption, displayOrder, isPrimary } = req.body || {};
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided' });
    }

    // Only company owner/admin can add photos
    if (req.user.user_type !== 'admin' && String(req.user.company_id) !== String(id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { CompanyPhoto } = require('../config');

    const filename = req.file.filename;
    const filePath = `/uploads/company-photos/${filename}`;
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}${filePath}`;

    // If marking as primary, unset others for this company
    if (isPrimary === 'true' || isPrimary === true) {
      try {
        await CompanyPhoto.update({ isPrimary: false }, { where: { companyId: id } });
      } catch (_) {}
    }

    const photo = await CompanyPhoto.create({
      companyId: id,
      filename,
      filePath,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      altText: altText || null,
      caption: caption || null,
      displayOrder: parseInt(displayOrder) || 0,
      isPrimary: isPrimary === 'true' || isPrimary === true || false,
      uploadedBy: req.user.id
    });

    return res.status(201).json({ success: true, message: 'Company photo uploaded', data: photo });
  } catch (error) {
    console.error('Company photo upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
});

// List company photos (public)
router.get('/:id/photos', async (req, res) => {
  try {
    const { id } = req.params;
    const { CompanyPhoto } = require('../config');
    const photos = await CompanyPhoto.findAll({
      where: { companyId: id, isActive: true },
      order: [['display_order', 'ASC'], ['createdAt', 'ASC']]
    });
    return res.status(200).json({ success: true, data: photos });
  } catch (error) {
    console.error('List company photos error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list photos' });
  }
});

// Delete a company photo
router.delete('/photos/:photoId', authenticateToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    const { CompanyPhoto, Company } = require('../config');
    const photo = await CompanyPhoto.findByPk(photoId, { include: [{ model: Company, as: 'company' }] });
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });

    // Must be admin or owner of company
    if (req.user.user_type !== 'admin' && String(req.user.company_id) !== String(photo.companyId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Delete file from disk (best-effort)
    try {
      const absPath = path.join(__dirname, '..', photo.filePath);
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
    } catch (_) {}

    await photo.destroy();
    return res.status(200).json({ success: true, message: 'Company photo deleted' });
  } catch (error) {
    console.error('Delete company photo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete photo' });
  }
});

// Upload/replace company logo
router.post('/:id/logo', authenticateToken, companyLogoUpload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo file provided' });
    }

    // Only company owner/admin can update
    if (req.user.user_type !== 'admin' && String(req.user.company_id) !== String(id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const company = await Company.findByPk(id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const filename = req.file.filename;
    const filePath = `/uploads/company-logos/${filename}`;
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}${filePath}`;

    await company.update({ logo: fileUrl });

    return res.status(200).json({ success: true, message: 'Company logo updated', data: { logo: fileUrl } });
  } catch (error) {
    console.error('Company logo upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload logo' });
  }
});

// Middleware to verify JWT token
const authenticateToken2 = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// List companies (public)
router.get('/', async (req, res) => {
  try {
    const { search, limit = 20, offset = 0 } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    if (search && String(search).trim().length > 0) {
      const q = String(search).trim();
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { slug: { [Op.iLike]: `%${q}%` } }
      ];
    }
    const companies = await Company.findAll({
      where,
      attributes: ['id', 'name', 'slug', 'logo', 'industry', 'companySize', 'website', 'city', 'state', 'country', 'region'],
      order: [['name', 'ASC']],
      limit: Math.min(parseInt(limit, 10) || 20, 100),
      offset: parseInt(offset, 10) || 0
    });

    // Add active jobs count for each company
    const companiesWithStats = await Promise.all(companies.map(async (company) => {
      let activeJobsCount = 0;
      try {
        const Job = require('../models/Job');
        activeJobsCount = await Job.count({ where: { companyId: company.id, status: 'active' } });
      } catch (e) {
        console.warn('Could not compute activeJobsCount for company', company.id, e?.message);
      }

      const profileViews = Math.floor(Math.random() * 50) + 1;
      console.log(`🔍 Company ${company.name}: activeJobs=${activeJobsCount}, profileViews=${profileViews}`);

      return {
        ...company.toJSON(),
        activeJobsCount,
        profileViews // Generate some realistic view counts for demo
      };
    }));

    return res.json({ success: true, data: companiesWithStats });
  } catch (error) {
    console.error('List companies error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Join existing company (job seekers become employers, existing employers without company)
router.post('/join', authenticateToken, async (req, res) => {
  try {
    // Allow job seekers to become employers by joining a company
    if (req.user.user_type !== 'jobseeker' && req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Invalid user type for joining company' });
    }
    if (req.user.company_id) {
      return res.status(400).json({ success: false, message: 'User already associated with a company' });
    }
    const { companyId, role } = req.body || {};
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required' });
    }
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    // Persist role into user preferences (non-breaking)
    const prefs = req.user.preferences || {};
    prefs.employerRole = (role && typeof role === 'string') ? role : (prefs.employerRole || 'recruiter');
    
    // Update user: job seekers become employers, existing employers stay employers
    const newUserType = req.user.user_type === 'jobseeker' ? 'employer' : req.user.user_type;
    
    await req.user.update({ 
      user_type: newUserType, // ✅ Job seekers become employers when joining company
      company_id: company.id, 
      preferences: prefs 
    });
    
    console.log(`✅ User ${req.user.id} joined company ${company.id} as ${newUserType}`);
    
    return res.json({ 
      success: true, 
      message: 'Joined company successfully', 
      data: { 
        companyId: company.id, 
        role: prefs.employerRole,
        userType: newUserType
      } 
    });
  } catch (error) {
    console.error('Join company error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
// Create a new company
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, industry, companySize, website, description, address, city, state, country, email, phone, region } = req.body;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only employers and admins can create companies'
      });
    }

    // Check if user already has a company
    if (req.user.company_id) {
      return res.status(400).json({
        success: false,
        message: 'User already has a company registered'
      });
    }

    // Generate unique slug from company name
    const generateSlug = async (companyName) => {
      let baseSlug = companyName
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

    const companySlug = await generateSlug(name);
    
    // Create company record
    const company = await Company.create({
      name,
      slug: companySlug,
      industry: industry || 'Other',
      companySize: companySize || '1-50',
      website,
      email: email || req.user.email,
      phone: phone || req.user.phone,
      description,
      address,
      city,
      state,
      country: country || 'India',
      region: region || 'india',
      contactPerson: `${req.user.first_name} ${req.user.last_name}`,
      contactEmail: req.user.email,
      contactPhone: req.user.phone,
      companyStatus: 'pending_approval',
      isActive: true
    });

    // Update user with company_id and set as admin (since they created the company)
    await req.user.update({ 
      company_id: company.id,
      user_type: 'admin' // User becomes admin when they create a company
    });

    // Fetch the updated user data
    const updatedUser = await User.findByPk(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: {
        company: {
          id: company.id,
          name: company.name,
          industry: company.industry,
          companySize: company.companySize,
          website: company.website,
          email: company.email,
          phone: company.phone,
          description: company.description,
          address: company.address,
          city: company.city,
          state: company.state,
          country: company.country,
          region: company.region
        },
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          user_type: updatedUser.user_type,
          company_id: updatedUser.company_id,
          // Add other user fields as needed
        }
      }
    });

  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's followed companies (MUST be before /:id route)
router.get('/followed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a jobseeker
    if (req.user.user_type !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        message: 'Only job seekers can view followed companies'
      });
    }

    const CompanyFollow = require('../models/CompanyFollow');
    const followedCompanies = await CompanyFollow.findAll({
      where: { userId },
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name', 'slug', 'industry', 'logo']
      }],
      order: [['followedAt', 'DESC']]
    });

    return res.json({
      success: true,
      data: followedCompanies.map(follow => ({
        id: follow.id,
        companyId: follow.companyId,
        followedAt: follow.followedAt,
        company: follow.company
      }))
    });

  } catch (error) {
    console.error('Get followed companies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get company information by ID (public access for job seekers, protected for employers)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to authenticate if token is provided
    let user = null;
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        user = await User.findByPk(decoded.id);
      }
    } catch (authError) {
      // Continue without authentication for public access
      console.log('No valid token provided, allowing public access to company info');
    }
    
    // Check if the user has access to this company (only for employers)
    if (user && user.user_type === 'employer' && user.company_id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const company = await Company.findByPk(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Compute active jobs count
    let activeJobsCount = 0;
    try {
      const Job = require('../models/Job');
      activeJobsCount = await Job.count({ where: { companyId: id, status: 'active' } });
    } catch (e) {
      console.warn('Could not compute activeJobsCount for company', id, e?.message);
    }

    // Set cache control headers to prevent 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        companySize: company.companySize,
        website: company.website,
        email: company.email,
        phone: company.phone,
        description: company.description,
        address: company.address,
        city: company.city,
        state: company.state,
        country: company.country,
        // Extras to improve frontend display
        activeJobsCount,
        profileViews: Math.floor(Math.random() * 50) + 1 // Generate some realistic view counts for demo
      }
    });

  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get company jobs (public access)
router.get('/:id/jobs', async (req, res) => {
  try {
    const { id } = req.params;
    const { department, location, experience, salary } = req.query;
    const Job = require('../models/Job');
    const { Op } = require('sequelize');
    
    // Build where clause with filters
    const where = { 
      companyId: id,
      status: { [Op.in]: ['active', 'expired'] }
    };

    // Add department filter
    if (department && department !== 'all') {
      where[Op.or] = [
        { department: { [Op.iLike]: `%${department}%` } },
        { category: { [Op.iLike]: `%${department}%` } }
      ];
    }

    // Add location filter
    if (location && location !== 'all') {
      where[Op.or] = [
        ...(where[Op.or] || []),
        { location: { [Op.iLike]: `%${location}%` } },
        { city: { [Op.iLike]: `%${location}%` } },
        { state: { [Op.iLike]: `%${location}%` } },
        { country: { [Op.iLike]: `%${location}%` } }
      ];
    }

    // Add experience filter
    if (experience && experience !== 'all') {
      const experienceMap = {
        'entry': { experienceMin: { [Op.lte]: 1 } },
        'mid': { experienceMin: { [Op.gte]: 2, [Op.lte]: 5 } },
        'senior': { experienceMin: { [Op.gte]: 6 } }
      };
      
      if (experienceMap[experience]) {
        Object.assign(where, experienceMap[experience]);
      }
    }

    // Add salary filter
    if (salary && salary !== 'all') {
      const salaryMap = {
        'low': { salaryMin: { [Op.lte]: 500000 } },
        'medium': { salaryMin: { [Op.gte]: 500001, [Op.lte]: 1500000 } },
        'high': { salaryMin: { [Op.gte]: 1500001 } }
      };
      
      if (salaryMap[salary]) {
        Object.assign(where, salaryMap[salary]);
      }
    }
    
    const jobs = await Job.findAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'title', 'location', 'jobType', 'experienceLevel', 
        'salaryMin', 'salaryMax', 'description', 'requirements',
        'createdAt', 'isUrgent', 'department', 'category', 'city', 
        'state', 'country', 'salary', 'skills', 'applications',
        'updatedAt', 'status', 'remoteWork', 'experienceMin', 'experienceMax', 'validTill'
      ]
    });

    // Set cache control headers to prevent 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: jobs
    });

  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update company information
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry, companySize, website, description, address, city, state, country } = req.body;
    
    // Check if the user has access to this company
    if (req.user.user_type !== 'admin') {
      if (req.user.user_type !== 'employer' || String(req.user.company_id) !== String(id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const company = await Company.findByPk(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update company information
    await company.update({
      name: name || company.name,
      industry: industry || company.industry,
      companySize: companySize || company.companySize,
      website: website || company.website,
      description: description || company.description,
      address: address || company.address,
      city: city || company.city,
      state: state || company.state,
      country: country || company.country
    });

    res.json({
      success: true,
      message: 'Company information updated successfully',
      data: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        companySize: company.companySize,
        website: company.website,
        email: company.email,
        phone: company.phone,
        description: company.description,
        address: company.address,
        city: company.city,
        state: company.state,
        country: company.country
      }
    });

  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Follow/Unfollow company endpoints
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const { id: companyId } = req.params;
    const userId = req.user.id;

    // Check if user is a jobseeker
    if (req.user.user_type !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        message: 'Only job seekers can follow companies'
      });
    }

    // Check if company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if already following
    const CompanyFollow = require('../models/CompanyFollow');
    const existingFollow = await CompanyFollow.findOne({
      where: { userId, companyId }
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this company'
      });
    }

    // Create follow record
    const follow = await CompanyFollow.create({
      userId,
      companyId,
      notificationPreferences: {
        newJobs: true,
        companyUpdates: true,
        jobAlerts: true,
        email: true,
        push: true,
        sms: false
      }
    });

    console.log(`✅ User ${userId} started following company ${companyId}`);

    return res.json({
      success: true,
      message: 'Successfully followed company',
      data: { followId: follow.id }
    });

  } catch (error) {
    console.error('Follow company error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.delete('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const { id: companyId } = req.params;
    const userId = req.user.id;

    // Check if user is a jobseeker
    if (req.user.user_type !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        message: 'Only job seekers can unfollow companies'
      });
    }

    // Find and delete follow record
    const CompanyFollow = require('../models/CompanyFollow');
    const follow = await CompanyFollow.findOne({
      where: { userId, companyId }
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Not following this company'
      });
    }

    await follow.destroy();

    console.log(`✅ User ${userId} stopped following company ${companyId}`);

    return res.json({
      success: true,
      message: 'Successfully unfollowed company'
    });

  } catch (error) {
    console.error('Unfollow company error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Removed duplicate /followed route - moved to before /:id route

// Check if user is following a specific company
router.get('/:id/follow-status', authenticateToken, async (req, res) => {
  try {
    const { id: companyId } = req.params;
    const userId = req.user.id;

    const CompanyFollow = require('../models/CompanyFollow');
    const follow = await CompanyFollow.findOne({
      where: { userId, companyId }
    });

    return res.json({
      success: true,
      data: {
        isFollowing: !!follow,
        followedAt: follow?.followedAt || null
      }
    });

  } catch (error) {
    console.error('Get follow status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
