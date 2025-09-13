const express = require('express');
const Company = require('../models/Company');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

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

// Create a new company
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, industry, companySize, website, description, address, city, state, country, email, phone } = req.body;
    
    // Check if user is an employer
    if (req.user.user_type !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Only employers can create companies'
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
      contactPerson: `${req.user.first_name} ${req.user.last_name}`,
      contactEmail: req.user.email,
      contactPhone: req.user.phone,
      companyStatus: 'pending_approval',
      isActive: true
    });

    // Update user with company_id
    await req.user.update({ company_id: company.id });

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
          country: company.country
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

// Get company information by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user has access to this company
    if (req.user.user_type === 'employer' && req.user.company_id !== id) {
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
        country: company.country
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

// Get company jobs
router.get('/:id/jobs', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const Job = require('../models/Job');
    
    const jobs = await Job.findAll({
      where: { 
        company_id: id,
        status: 'active'
      },
      order: [['created_at', 'DESC']],
      attributes: [
        'id', 'title', 'location', 'jobType', 'experienceLevel', 
        'salaryMin', 'salaryMax', 'description', 'requirements',
        'created_at', 'is_urgent'
      ]
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
    if (req.user.user_type !== 'employer' || req.user.company_id !== id) {
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

module.exports = router;
