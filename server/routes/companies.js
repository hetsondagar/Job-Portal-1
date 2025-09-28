const express = require('express');
const Company = require('../models/Company');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();
// (moved list and join company routes below middleware definition)

// Middleware to verify JWT token
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
      attributes: ['id', 'name', 'slug', 'industry', 'companySize', 'website', 'city', 'state', 'country', 'region'],
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
    const Job = require('../models/Job');
    
    const jobs = await Job.findAll({
      where: { 
        companyId: id,
        status: 'active'
      },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'title', 'location', 'jobType', 'experienceLevel', 
        'salaryMin', 'salaryMax', 'description', 'requirements',
        'createdAt', 'isUrgent', 'department', 'category', 'city', 
        'state', 'country', 'salary', 'skills', 'applications',
        'updatedAt', 'status', 'remoteWork', 'experienceMin', 'experienceMax'
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
