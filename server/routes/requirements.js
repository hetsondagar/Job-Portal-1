'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Requirement = require('../models/Requirement');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Create Requirement
router.post('/', authenticateToken, async (req, res) => {
  try {
    const body = req.body || {};
    console.log('📝 Create Requirement request by user:', req.user?.id, 'company_id:', req.user?.company_id);
    console.log('📝 Payload:', JSON.stringify(body));

    const errors = [];
    if (!body.title || String(body.title).trim() === '') errors.push('title is required');
    if (!body.description || String(body.description).trim() === '') errors.push('description is required');
    if (!body.location || String(body.location).trim() === '') errors.push('location is required');

    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    // Normalize enums to backend values
    const normalizedJobType = (body.jobType || 'full-time')
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-');
    const normalizedRemoteWork = (body.remoteWork || '')
      .toString()
      .toLowerCase()
      .replace('on-site', 'on-site'); // ensure exact match casing
    const normalizedShiftTiming = (body.shiftTiming || '')
      .toString()
      .toLowerCase();

    // Normalize travelRequired (UI may send 'No' | 'Occasionally' | 'Frequently')
    let normalizedTravelRequired = undefined;
    if (typeof body.travelRequired === 'string') {
      const v = body.travelRequired.toString().toLowerCase();
      if (v === 'no') normalizedTravelRequired = false; else normalizedTravelRequired = true;
    } else if (typeof body.travelRequired === 'boolean') {
      normalizedTravelRequired = body.travelRequired;
    }

    // Prefer provided companyId, otherwise derive from authenticated user
    const companyId = body.companyId || req.user.company_id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required for requirement creation' });
    }

    const requirement = await Requirement.create({
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      location: String(body.location).trim(),
      companyId,
      createdBy: req.user.id,
      experience: body.experience || null,
      experienceMin: body.workExperienceMin || body.experienceMin || null,
      experienceMax: body.workExperienceMax || body.experienceMax || null,
      salary: body.salary || null,
      salaryMin: body.currentSalaryMin || body.salaryMin || null,
      salaryMax: body.currentSalaryMax || body.salaryMax || null,
      currency: body.currency || 'INR',
      jobType: normalizedJobType,
      skills: Array.isArray(body.skills) ? body.skills : [],
      keySkills: Array.isArray(body.keySkills) ? body.keySkills : [],
      education: body.education || null,
      industry: body.industry || null,
      department: body.department || null,
      validTill: body.validTill ? new Date(body.validTill) : null,
      noticePeriod: body.noticePeriod || null,
      remoteWork: normalizedRemoteWork || null,
      travelRequired: normalizedTravelRequired !== undefined ? normalizedTravelRequired : null,
      shiftTiming: normalizedShiftTiming || null,
      candidateLocations: Array.isArray(body.candidateLocations) ? body.candidateLocations : [],
      candidateDesignations: Array.isArray(body.candidateDesignations) ? body.candidateDesignations : [],
      includeWillingToRelocate: !!body.includeWillingToRelocate,
      includeNotMentioned: !!body.includeNotMentioned,
      benefits: Array.isArray(body.benefits) ? body.benefits : [],
      metadata: body.metadata || {}
    });

    console.log('✅ Requirement created with id:', requirement.id);
    return res.status(201).json({ success: true, message: 'Requirement created successfully', data: requirement });
  } catch (error) {
    console.error('❌ Requirement creation error:', error);
    const statusCode = error?.name === 'SequelizeUniqueConstraintError' ? 409 : 500;
    return res.status(statusCode).json({ success: false, message: 'Failed to create requirement', error: error.message });
  }
});

module.exports = router;

// List Requirements for authenticated employer's company
router.get('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Authenticated user has no company associated' });
    }
    const rows = await Requirement.findAll({ where: { companyId }, order: [['createdAt', 'DESC']] });
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ List requirements error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch requirements' });
  }
});


