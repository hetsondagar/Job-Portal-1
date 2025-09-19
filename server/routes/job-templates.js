'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JobTemplate = require('../models/JobTemplate');

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

// Get all templates (public + user's private templates)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, search, isPublic } = req.query;
    
    const { Op } = require('sequelize');
    
    let whereClause = {};

    if (category && category !== 'all') {
      whereClause.categoryId = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const templates = await JobTemplate.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
});

// Get template by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await JobTemplate.findOne({
      where: {
        id
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template'
    });
  }
});

// Create new template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, categoryId, companyId } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const template = await JobTemplate.create({
      name: title,
      description,
      category: categoryId,
      companyId: companyId || req.user.companyId
    });

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template'
    });
  }
});

// Update template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId } = req.body;

    const template = await JobTemplate.findOne({
      where: {
        id,
        companyId: req.user.companyId
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await template.update({
      name: title || template.name,
      description: description !== undefined ? description : template.description,
      category: categoryId || template.category
    });

    res.json({
      success: true,
      data: template,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template'
    });
  }
});

// Delete template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const template = await JobTemplate.findOne({
      where: {
        id
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await template.destroy();

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template'
    });
  }
});

// Create job from template
router.post('/:id/create-job', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const Job = require('../models/Job');
    const Company = require('../models/Company');

    // Find the template
    const template = await JobTemplate.findOne({
      where: {
        id
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Get user's company
    const user = await require('../models/User').findByPk(req.user.id);
    let company = null;
    
    if (user && user.company_id) {
      company = await Company.findByPk(user.company_id);
    }

    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company association required. Please ensure your account is linked to a company.'
      });
    }

    // Create job from template
    const jobData = {
      title: template.name || 'Untitled Job',
      description: template.description || '',
      companyId: company.id,
      employerId: req.user.id,
      status: 'draft' // Start as draft
    };

    const job = await Job.create(jobData);

    // Consume job posting quota
    try {
      const EmployerQuotaService = require('../services/employerQuotaService');
      await EmployerQuotaService.checkAndConsume(req.user.id, EmployerQuotaService.QUOTA_TYPES.JOB_POSTINGS, {
        activityType: 'job_post',
        details: { title: job.title, status: job.status, source: 'template' },
        jobId: job.id,
        defaultLimit: 50
      });
    } catch (e) {
      console.error('⚠️ Failed to consume job posting quota from template:', e?.message || e);
      // Don't fail the job creation if quota check fails
    }

    // Log employer activity: job posted from template
    try {
      const EmployerActivityService = require('../services/employerActivityService');
      await EmployerActivityService.logJobPost(req.user.id, job.id, { 
        title: job.title, 
        status: job.status,
        source: 'template',
        templateId: id
      });
    } catch (e) {
      console.error('⚠️ Failed to log job_post activity from template:', e?.message || e);
    }

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job created from template successfully'
    });
  } catch (error) {
    console.error('Error creating job from template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job from template'
    });
  }
});

module.exports = router;
