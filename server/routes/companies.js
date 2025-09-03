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
        companyId: id,
        status: 'active'
      },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'title', 'location', 'jobType', 'experienceLevel', 
        'salaryMin', 'salaryMax', 'description', 'requirements',
        'createdAt', 'isUrgent'
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
