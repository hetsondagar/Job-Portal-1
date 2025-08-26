const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');

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

    if (user.account_status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
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

// Middleware to ensure user is an employer
const requireEmployer = (req, res, next) => {
  if (req.user.user_type !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Only employers can perform this action'
    });
  }
  next();
};

// Validation for job posting
const validateJobPost = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Job title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Job description must be between 20 and 5000 characters'),
  body('requirements')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Job requirements must be between 10 and 2000 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('type')
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Invalid job type'),
  body('experience')
    .isIn(['fresher', 'junior', 'mid', 'senior'])
    .withMessage('Invalid experience level'),
  body('salary')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Salary must be between 3 and 50 characters')
];

// Post a new job
router.post('/', authenticateToken, requireEmployer, validateJobPost, async (req, res) => {
  try {
    console.log('🔍 Job posting request received from employer:', req.user.email);
    
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

    const {
      title,
      description,
      requirements,
      location,
      type,
      experience,
      salary,
      benefits,
      skills,
      department
    } = req.body;

    // Get company information
    const company = await Company.findByPk(req.user.company_id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Create job posting
    const job = await Job.create({
      title,
      description,
      requirements,
      location,
      type,
      experience,
      salary,
      benefits: benefits || '',
      skills: skills || [],
      department: department || '',
      companyId: req.user.company_id,
      employerId: req.user.id,
      status: 'active',
      isActive: true,
      publishedAt: new Date(),
      validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      metadata: {
        postedBy: req.user.email,
        companyName: company.name
      }
    });

    // Update company's job count
    await company.update({
      totalJobsPosted: company.totalJobsPosted + 1,
      activeJobsCount: company.activeJobsCount + 1
    });

    console.log('✅ Job posted successfully:', job.id);

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: {
        job: {
          id: job.id,
          title: job.title,
          company: company.name,
          location: job.location,
          type: job.type,
          experience: job.experience,
          salary: job.salary,
          status: job.status,
          publishedAt: job.publishedAt,
          validTill: job.validTill
        }
      }
    });

  } catch (error) {
    console.error('❌ Job posting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get jobs posted by the employer
router.get('/my-jobs', authenticateToken, requireEmployer, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: {
        employerId: req.user.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name', 'logo']
      }]
    });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

module.exports = router;
