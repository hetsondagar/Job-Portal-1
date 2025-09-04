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
    
    let whereClause = {
      isActive: true,
      [Op.or]: [
        { isPublic: true },
        { createdBy: req.user.id }
      ]
    };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.and] = [
        whereClause,
        {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
          ]
        }
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
    const { Op } = require('sequelize');
    
    const template = await JobTemplate.findOne({
      where: {
        id,
        isActive: true,
        [Op.or]: [
          { isPublic: true },
          { createdBy: req.user.id }
        ]
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
    const { name, description, category, isPublic, templateData, tags } = req.body;

    if (!name || !category || !templateData) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and template data are required'
      });
    }

    const template = await JobTemplate.create({
      name,
      description,
      category,
      isPublic: isPublic || false,
      templateData,
      tags: tags || [],
      createdBy: req.user.id
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
    const { name, description, category, isPublic, templateData, tags } = req.body;

    const template = await JobTemplate.findOne({
      where: {
        id,
        createdBy: req.user.id,
        isActive: true
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    await template.update({
      name: name || template.name,
      description: description !== undefined ? description : template.description,
      category: category || template.category,
      isPublic: isPublic !== undefined ? isPublic : template.isPublic,
      templateData: templateData || template.templateData,
      tags: tags || template.tags
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
        id,
        createdBy: req.user.id,
        isActive: true
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    await template.update({ isActive: false });

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

// Toggle template public/private status
router.patch('/:id/toggle-public', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const template = await JobTemplate.findOne({
      where: {
        id,
        createdBy: req.user.id,
        isActive: true
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    await template.update({ isPublic: !template.isPublic });

    res.json({
      success: true,
      data: template,
      message: `Template ${template.isPublic ? 'made public' : 'made private'} successfully`
    });
  } catch (error) {
    console.error('Error toggling template visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle template visibility'
    });
  }
});

// Use template (increment usage count)
router.post('/:id/use', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { Op } = require('sequelize');

    const template = await JobTemplate.findOne({
      where: {
        id,
        isActive: true,
        [Op.or]: [
          { isPublic: true },
          { createdBy: req.user.id }
        ]
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await template.update({
      usageCount: template.usageCount + 1,
      lastUsedAt: new Date()
    });

    res.json({
      success: true,
      data: template,
      message: 'Template usage recorded'
    });
  } catch (error) {
    console.error('Error recording template usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record template usage'
    });
  }
});

// Create job from template
router.post('/:id/create-job', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { Op } = require('sequelize');
    const Job = require('../models/Job');
    const Company = require('../models/Company');

    // Find the template
    const template = await JobTemplate.findOne({
      where: {
        id,
        isActive: true,
        [Op.or]: [
          { isPublic: true },
          { createdBy: req.user.id }
        ]
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

    // Extract template data
    const templateData = template.templateData;
    
    // Generate slug from title
    const slug = templateData.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();

    // Create job from template
    const jobData = {
      slug,
      title: templateData.title || 'Untitled Job',
      description: templateData.description || '',
      location: templateData.location || '',
      companyId: company.id,
      employerId: req.user.id,
      jobType: templateData.type || 'full-time',
      experienceLevel: templateData.experience || 'entry',
      department: templateData.department || null,
      skills: Array.isArray(templateData.skills) ? templateData.skills : [],
      benefits: Array.isArray(templateData.benefits) ? templateData.benefits : [],
      requirements: templateData.requirements || null,
      responsibilities: templateData.responsibilities || null,
      status: 'draft', // Start as draft so user can review before publishing
      templateId: template.id, // Track which template was used
      tags: template.tags || [],
      metadata: {
        createdFromTemplate: true,
        templateName: template.name,
        templateVersion: template.version
      }
    };

    const job = await Job.create(jobData);

    // Update template usage count
    await template.update({
      usageCount: template.usageCount + 1,
      lastUsedAt: new Date()
    });

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
