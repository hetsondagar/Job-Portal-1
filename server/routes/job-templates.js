'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { JobTemplate, Job, Company, User } = require('../config/index');

// Auth middleware (basic JWT like other routes)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Access token required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// List templates (own + public)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    const list = await JobTemplate.findAll({
      where: {
        ...where,
        [Op.or]: [
          { createdBy: req.user.id },
          { isPublic: true }
        ]
      },
      order: [['updatedAt', 'DESC']]
    });
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Error listing job templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job templates' });
  }
});

// Create template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const payload = req.body || {};
    const name = payload.name || payload.title;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Template name is required' });
    }
    const template = await JobTemplate.create({
      name,
      description: payload.description || '',
      category: payload.category || null,
      templateData: payload.templateData || {},
      tags: payload.tags || [],
      isPublic: !!payload.isPublic,
      createdBy: req.user.id,
      companyId: req.user.company_id || req.user.companyId || null
    }, { fields: ['name','description','category','templateData','tags','isPublic','createdBy','companyId']});
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    console.error('Error creating job template:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

// Update template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const t = await JobTemplate.findOne({ where: { id: req.params.id, createdBy: req.user.id } });
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    const payload = req.body || {};
    await t.update({
      name: payload.name ?? t.name,
      description: payload.description ?? t.description,
      category: payload.category ?? t.category,
      templateData: payload.templateData ?? t.templateData,
      tags: payload.tags ?? t.tags,
      isPublic: payload.isPublic ?? t.isPublic
    });
    res.json({ success: true, data: t });
  } catch (error) {
    console.error('Error updating job template:', error);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const t = await JobTemplate.findOne({ where: { id: req.params.id, createdBy: req.user.id } });
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    await t.destroy();
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting job template:', error);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

// Toggle public
router.patch('/:id/toggle-public', authenticateToken, async (req, res) => {
  try {
    const t = await JobTemplate.findOne({ where: { id: req.params.id, createdBy: req.user.id } });
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    await t.update({ isPublic: !t.isPublic });
    res.json({ success: true, data: t, message: `Template is now ${t.isPublic ? 'public' : 'private'}` });
  } catch (error) {
    console.error('Error toggling template public:', error);
    res.status(500).json({ success: false, message: 'Failed to update template visibility' });
  }
});

// Use template (increment usage)
router.post('/:id/use', authenticateToken, async (req, res) => {
  try {
    const t = await JobTemplate.findOne({ where: { id: req.params.id } });
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    await t.update({ usageCount: (t.usageCount || 0) + 1, lastUsedAt: new Date() });
    res.json({ success: true, data: t, message: 'Template usage recorded' });
  } catch (error) {
    console.error('Error using template:', error);
    res.status(500).json({ success: false, message: 'Failed to record template usage' });
  }
});

// Create job from template (basic draft)
router.post('/:id/create-job', authenticateToken, async (req, res) => {
  try {
    const t = await JobTemplate.findOne({ where: { id: req.params.id } });
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    const payload = t.templateData || {};
    const title = payload.title || t.name || 'Untitled Job';
    const description = (payload.description || t.description || '').toString();
    const location = payload.location || payload.city || 'Remote';
    const jobType = payload.jobType || payload.type || 'full-time';
    const experienceLevel = payload.experienceLevel || payload.experience || null;
    const slugBase = title
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;
    const draft = await Job.create({
      title,
      slug,
      description: description === '' ? 'To be updated' : description,
      location,
      city: payload.city || null,
      state: payload.state || null,
      country: payload.country || 'India',
      jobType,
      experienceLevel,
      experienceMin: payload.experienceMin ?? null,
      experienceMax: payload.experienceMax ?? null,
      salaryMin: payload.salaryMin ?? null,
      salaryMax: payload.salaryMax ?? null,
      salaryCurrency: payload.salaryCurrency || 'INR',
      salaryPeriod: payload.salaryPeriod || 'yearly',
      department: payload.department || null,
      category: payload.category || null,
      skills: payload.skills || [],
      remoteWork: payload.remoteWork || (payload.workMode === 'remote' ? 'remote' : (payload.workMode === 'hybrid' ? 'hybrid' : 'on-site')),
      shiftTiming: payload.shiftTiming || 'day',
      noticePeriod: payload.noticePeriod ?? null,
      education: payload.education || null,
      certifications: payload.certifications || [],
      languages: payload.languages || [],
      isUrgent: !!payload.isUrgent,
      isFeatured: !!payload.isFeatured,
      salary: payload.salary || null,
      employerId: req.user.id,
      companyId: req.user.company_id || req.user.companyId || null,
      status: 'draft',
      region: req.user.region || 'india',
      templateId: t.id
    }, { fields: [
      'title','slug','description','location','city','state','country','jobType','experienceLevel','experienceMin','experienceMax',
      'salaryMin','salaryMax','salaryCurrency','salaryPeriod','department','category','skills','remoteWork','shiftTiming','noticePeriod',
      'education','certifications','languages','isUrgent','isFeatured','salary','employerId','companyId','status','region','templateId'
    ]});
    res.status(201).json({ success: true, data: draft });
  } catch (error) {
    console.error('Error creating job from template:', error);
    res.status(500).json({ success: false, message: 'Failed to create job from template' });
  }
});

module.exports = router;

