'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const CandidateLike = require('../models/CandidateLike');

const Requirement = require('../models/Requirement');
const User = require('../models/User');
const Company = require('../models/Company');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Resume = require('../models/Resume');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('🔍 authenticateToken - Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('🔍 authenticateToken - Token:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('❌ authenticateToken - No token found');
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ authenticateToken - Token decoded for user:', decoded.id);
    
    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.log('❌ authenticateToken - User not found:', decoded.id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.is_active) {
      console.log('❌ authenticateToken - User account is inactive');
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Check account status for suspended users
    if (user.account_status === 'suspended') {
      console.log('❌ authenticateToken - User account is suspended');
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been suspended. Please contact support for assistance.',
        status: 'suspended'
      });
    }

    if (user.account_status === 'deleted') {
      console.log('❌ authenticateToken - User account is deleted');
      return res.status(403).json({ 
        success: false, 
        message: 'Account not found or has been deleted.',
        status: 'deleted'
      });
    }

    if (user.account_status === 'inactive') {
      console.log('❌ authenticateToken - User account is inactive due to inactivity');
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been marked as inactive due to prolonged inactivity. Please log in to reactivate your account.',
        status: 'inactive'
      });
    }

    console.log('✅ authenticateToken - User authenticated:', user.email, user.user_type);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ authenticateToken - Token verification error:', error);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Create Requirement
router.post('/', authenticateToken, async (req, res) => {
  try {
    const body = req.body || {};
    console.log('📝 Create Requirement request by user:', req.user?.id, 'companyId:', req.user?.companyId);
    console.log('📝 Payload:', JSON.stringify(body));

    // Only employers/admins can create requirements
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only employers can create requirements' });
    }

    const errors = [];
    if (!body.title || String(body.title).trim() === '') errors.push('title is required');
    if (!body.description || String(body.description).trim() === '') errors.push('description is required');
    if (!body.location || String(body.location).trim() === '') errors.push('location is required');

    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    // Normalize enums to backend values with safe fallbacks
    const jobTypeAllowed = new Set(['full-time', 'part-time', 'contract', 'internship', 'freelance']);
    let normalizedJobType = (body.jobType || 'full-time')
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-');
    if (!jobTypeAllowed.has(normalizedJobType)) normalizedJobType = 'full-time';

    const remoteWorkAllowed = new Set(['on-site', 'remote', 'hybrid']);
    let normalizedRemoteWork = (body.remoteWork || '')
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-');
    if (!remoteWorkAllowed.has(normalizedRemoteWork)) normalizedRemoteWork = null;

    const shiftTimingAllowed = new Set(['day', 'night', 'rotational', 'flexible']);
    let normalizedShiftTiming = (body.shiftTiming || '')
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-');
    if (!shiftTimingAllowed.has(normalizedShiftTiming)) normalizedShiftTiming = null;

    // Normalize travelRequired (UI may send 'No' | 'Occasionally' | 'Frequently')
    let normalizedTravelRequired = undefined;
    if (typeof body.travelRequired === 'string') {
      const v = body.travelRequired.toString().toLowerCase();
      if (v === 'no') normalizedTravelRequired = false; else normalizedTravelRequired = true;
    } else if (typeof body.travelRequired === 'boolean') {
      normalizedTravelRequired = body.travelRequired;
    }

    // Resolve companyId: admins can specify any companyId; employers default to their own
    let companyId = body.companyId || req.user.companyId;
    if (!companyId) {
      try {
        // Try from provided companyName
        let companyRecord = null;
        const providedCompanyName = (body.companyName || '').toString().trim();

        const generateSlug = async (name) => {
          let baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .substring(0, 50);
          if (!baseSlug) baseSlug = `company-${Date.now()}`;
          let slug = baseSlug;
          let counter = 1;
          // Ensure uniqueness
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const existing = await Company.findOne({ where: { slug } });
            if (!existing) break;
            slug = `${baseSlug}-${counter++}`;
          }
          return slug;
        };

        if (providedCompanyName) {
          const slug = await generateSlug(providedCompanyName);
          companyRecord = await Company.create({
            name: providedCompanyName,
            slug,
            industries: body.industries || ['Other'],
            companySize: body.companySize || '1-50',
            email: req.user.email,
            region: body.region || 'india',
            contactPerson: `${req.user.first_name} ${req.user.last_name}`.trim(),
            contactEmail: req.user.email,
            companyStatus: 'pending_approval',
            isActive: true
          });
        } else {
          // Derive from email domain as a fallback
          const emailDomain = (req.user.email || '').split('@')[1] || '';
          const domainBase = emailDomain.replace(/\..*$/, '').replace(/[^a-zA-Z0-9]+/g, ' ');
          const derivedName = domainBase ? domainBase.charAt(0).toUpperCase() + domainBase.slice(1) : 'New Company';
          const slug = await generateSlug(derivedName);
          companyRecord = await Company.create({
            name: derivedName,
            slug,
            industry: 'Other',
            companySize: '1-50',
            email: req.user.email,
            region: body.region || 'india',
            contactPerson: `${req.user.first_name} ${req.user.last_name}`.trim(),
            contactEmail: req.user.email,
            companyStatus: 'pending_approval',
            isActive: true
          });
        }

        // Attach to user for future requests and set as admin with Hiring Manager designation
        await req.user.update({ 
          companyId: companyRecord.id,
          user_type: 'admin', // User becomes admin when they create a company
          designation: 'Hiring Manager' // Set proper designation for company creators
        });
        companyId = companyRecord.id;
        console.log('🏢 Created and attached company to employer:', companyId);
      } catch (companyErr) {
        console.error('❌ Failed to resolve company for requirement creation:', companyErr);
        return res.status(400).json({ success: false, message: 'Unable to determine or create company for employer' });
      }
    }

    const requirement = await Requirement.create({
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      location: String(body.location).trim(),
      companyId: companyId,
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
      metadata: {
        ...(body.metadata || {}),
        // Store virtual fields in metadata so they persist
        jobType: normalizedJobType,
        education: body.education || null,
        noticePeriod: body.noticePeriod || null,
        travelRequired: normalizedTravelRequired,
        shiftTiming: normalizedShiftTiming,
        benefits: Array.isArray(body.benefits) ? body.benefits : [],
        candidateLocations: Array.isArray(body.candidateLocations) ? body.candidateLocations : [],
        candidateDesignations: Array.isArray(body.candidateDesignations) ? body.candidateDesignations : [],
        includeWillingToRelocate: !!body.includeWillingToRelocate,
        includeNotMentioned: !!body.includeNotMentioned,
        industry: body.industry || null,
        department: body.department || null,
        institute: body.institute || null,
        resumeFreshness: body.resumeFreshness ? new Date(body.resumeFreshness) : null,
        currentCompany: body.currentCompany || null,
        location: String(body.location).trim(), // Also store in metadata for redundancy
        experience: body.experience ? String(body.experience).trim() : null,
        salary: body.salary ? String(body.salary).trim() : null
      }
    });

    console.log('✅ Requirement created with id:', requirement.id);

    // Send notification to employer about requirement creation
    try {
      const { Notification } = require('../config/index');
      const { Company } = require('../config/index');
      
      // Check if notification already exists for this requirement (prevent duplicates)
      const existingNotification = await Notification.findOne({
        where: {
          userId: req.user.id,
          type: 'company_update',
          'metadata.requirementId': requirement.id,
          'metadata.action': 'requirement_created'
        }
      });

      if (!existingNotification) {
      // Get company info for notification
      const company = await Company.findByPk(requirement.companyId);
      const companyName = company?.name || 'Your Company';
      
      await Notification.create({
        userId: req.user.id,
        type: 'company_update',
        title: `✅ Requirement Posted Successfully!`,
        message: `Your requirement "${requirement.title}" has been posted. Start searching for candidates now!`,
        shortMessage: `Requirement posted: ${requirement.title}`,
        priority: 'low',
        actionUrl: `/employer-dashboard/candidate-requirement/${requirement.id}`,
        actionText: 'View Requirement',
        icon: 'briefcase',
        metadata: {
          requirementId: requirement.id,
          requirementTitle: requirement.title,
          companyId: requirement.companyId,
          companyName: companyName,
          action: 'requirement_created'
        }
      });
      console.log(`✅ Requirement creation notification sent to employer ${req.user.id}`);
      } else {
        console.log(`ℹ️ Notification already exists for requirement ${requirement.id}, skipping duplicate`);
      }
    } catch (notificationError) {
      console.error('❌ Failed to send requirement creation notification:', notificationError);
      // Don't fail the requirement creation if notification fails
    }

    // Check and consume quota for requirement posting
    try {
      const EmployerQuotaService = require('../services/employerQuotaService');
      await EmployerQuotaService.checkAndConsume(
        req.user.id,
        EmployerQuotaService.QUOTA_TYPES.REQUIREMENTS_POSTED,
        {
          activityType: 'requirement_posted',
          details: {
            requirementId: requirement.id,
            title: requirement.title,
            location: requirement.location,
            jobType: requirement.jobType,
            companyId: requirement.companyId
          },
          defaultLimit: 30
        }
      );
    } catch (quotaError) {
      console.error('Quota check failed for requirement posting:', quotaError);
      if (quotaError.code === 'QUOTA_LIMIT_EXCEEDED') {
        // Delete the requirement that was just created since quota exceeded
        await requirement.destroy();
        return res.status(429).json({
          success: false,
          message: 'Requirements posting quota exceeded. Please contact your administrator.'
        });
      }
      // For other quota errors, continue but log the issue
    }

    // Log requirement posting activity
    try {
      const EmployerActivityService = require('../services/employerActivityService');
      await EmployerActivityService.logActivity(
        req.user.id,
        'requirement_posted',
        {
          details: {
            requirementId: requirement.id,
            title: requirement.title,
            location: requirement.location,
            jobType: requirement.jobType,
            companyId: requirement.companyId,
            companyName: req.user.company?.name || 'Unknown Company'
          }
        }
      );
    } catch (activityError) {
      console.error('Failed to log requirement posting activity:', activityError);
      // Don't fail the creation if activity logging fails
    }

    return res.status(201).json({ success: true, message: 'Requirement created successfully', data: requirement });
  } catch (error) {
    console.error('❌ Requirement creation error:', error);
    console.error('❌ Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      errors: error?.errors
    });
    const statusCode = error?.name === 'SequelizeUniqueConstraintError' ? 409 : 500;
    return res.status(statusCode).json({ 
      success: false, 
      message: 'Failed to create requirement', 
      error: { 
        name: error?.name, 
        message: error?.message,
        details: error?.errors || error?.stack
      } 
    });
  }
});

// List Requirements for authenticated employer's company
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Requirements API - User:', {
      id: req.user?.id,
      user_type: req.user?.user_type,
      companyId: req.user?.companyId
    });
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      console.log('❌ Requirements API - User is not an employer or admin:', req.user.user_type);
      return res.status(403).json({ success: false, message: 'Access denied. Only employers and admins can view requirements.' });
    }
    
    // Admins can view another company's requirements via query.companyId
    const requestedCompanyId = req.query.companyId;
    const companyId = req.user.user_type === 'admin' ? (requestedCompanyId || req.user.companyId) : req.user.companyId;
    console.log('🔍 Requirements API - Company ID:', companyId);
    
    if (!companyId) {
      console.log('⚠️ Requirements API - No company ID, returning empty array');
      return res.status(200).json({ success: true, data: [] });
    }
    
    console.log('🔍 Requirements API - Fetching requirements for company:', companyId);
    
    // Build where clause
    const whereClause = { companyId: companyId };
    
    console.log('🔍 Requirements API - Where clause:', whereClause);
    const rows = await Requirement.findAll({ 
      where: whereClause, 
      order: [['created_at', 'DESC']] 
    });
    
    console.log('✅ Requirements API - Found requirements:', rows.length);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ List requirements error:', error);
    console.error('❌ Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch requirements',
      error: { name: error.name, message: error.message }
    });
  }
});

// Get single requirement by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only employers and admins can view requirements.' 
      });
    }
    
    // Query requirement with raw SQL to get all fields
    // First try to get the requirement normally, then check for metadata
    const requirement = await Requirement.findOne({
      where: { id }
    });
    
    if (!requirement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Requirement not found' 
      });
    }
    
    // Check ownership
    if (req.user.user_type !== 'admin' && String(requirement.companyId) !== String(req.user.companyId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. This requirement belongs to another company.' 
      });
    }
    
    // Get raw data to extract metadata if it exists
    const [results] = await sequelize.query(`
      SELECT * FROM requirements WHERE id = :id
    `, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    // results is an array of rows, get the first row
    const rawRequirement = Array.isArray(results) && results.length > 0 ? results[0] : (results || null);
    
    // Parse metadata if it exists
    let metadata = {};
    if (rawRequirement && rawRequirement.metadata) {
      try {
        if (typeof rawRequirement.metadata === 'string') {
          // Try parsing as JSON string
          metadata = JSON.parse(rawRequirement.metadata);
        } else if (typeof rawRequirement.metadata === 'object') {
          // Already an object (JSONB from PostgreSQL)
          metadata = rawRequirement.metadata;
        } else {
          console.warn('Unexpected metadata type:', typeof rawRequirement.metadata);
          metadata = {};
        }
        // Ensure metadata is an object
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
          console.warn('Invalid metadata format, resetting to empty object');
          metadata = {};
        }
      } catch (e) {
        console.error('Failed to parse metadata:', e);
        console.error('Raw metadata value:', rawRequirement.metadata);
        metadata = {};
      }
    }
    
    console.log('📦 Raw requirement from DB:', {
      hasMetadata: !!rawRequirement?.metadata,
      metadataType: typeof rawRequirement?.metadata,
      location: rawRequirement?.location,
      location_type: rawRequirement?.location_type
    });
    console.log('📦 Parsed metadata:', JSON.stringify(metadata, null, 2));
    console.log('📦 Metadata fields extracted:', {
      industry: metadata?.industry,
      department: metadata?.department,
      location: metadata?.location,
      jobType: metadata?.jobType,
      education: metadata?.education,
      noticePeriod: metadata?.noticePeriod
    });
    
    // Transform requirement to include all fields, extracting from metadata where needed
    const requirementData = requirement.toJSON();
    const transformedRequirement = {
      ...requirementData,
      // Location: try metadata first, then rawRequirement location, then requirementData location
      location: (metadata?.location && metadata.location.trim() !== '') ? metadata.location : (rawRequirement?.location || requirementData.location || null),
      // Experience: try metadata first, then requirementData, then rawRequirement
      experience: (metadata?.experience && metadata.experience.trim() !== '') ? metadata.experience : (requirementData.experience || rawRequirement?.experience || null),
      // Salary: try metadata first, then requirementData, then rawRequirement
      salary: (metadata?.salary && metadata.salary.trim() !== '') ? metadata.salary : (requirementData.salary || rawRequirement?.salary || null),
      // JobType: from metadata (normalized format like "full-time") - convert to display format
      jobType: metadata?.jobType || metadata?.job_type || requirementData.jobType || null,
      // Education: from metadata
      education: (metadata?.education && metadata.education.trim() !== '') ? metadata.education : (requirementData.education || null),
      // Industry: from metadata only (virtual field)
      industry: (metadata?.industry && metadata.industry.trim() !== '') ? metadata.industry : null,
      // Department: from metadata only (virtual field)
      department: (metadata?.department && metadata.department.trim() !== '') ? metadata.department : null,
      // RemoteWork: map from location_type column or metadata
      remoteWork: (() => {
        if (metadata?.remoteWork) return metadata.remoteWork;
        if (rawRequirement?.location_type) {
          // Convert database values to display format
          const locationType = rawRequirement.location_type.toLowerCase();
          if (locationType === 'remote') return 'remote';
          if (locationType === 'on-site' || locationType === 'onsite') return 'on-site';
          if (locationType === 'hybrid') return 'hybrid';
          return rawRequirement.location_type;
        }
        return requirementData.remoteWork || requirementData.location_type || null;
      })(),
      noticePeriod: metadata?.noticePeriod || metadata?.notice_period || requirementData.noticePeriod || null,
      travelRequired: metadata?.travelRequired !== undefined ? metadata.travelRequired : (metadata?.travel_required !== undefined ? metadata.travel_required : (requirementData.travelRequired !== undefined ? requirementData.travelRequired : null)),
      shiftTiming: metadata?.shiftTiming || metadata?.shift_timing || requirementData.shiftTiming || null,
      benefits: metadata?.benefits || requirementData.benefits || [],
      candidateDesignations: metadata?.candidateDesignations || metadata?.candidate_designations || requirementData.candidateDesignations || [],
      candidateLocations: metadata?.candidateLocations || metadata?.candidate_locations || requirementData.candidateLocations || [],
      includeWillingToRelocate: metadata?.includeWillingToRelocate !== undefined ? metadata.includeWillingToRelocate : (metadata?.include_willing_to_relocate !== undefined ? metadata.include_willing_to_relocate : (requirementData.includeWillingToRelocate !== undefined ? requirementData.includeWillingToRelocate : false)),
      includeNotMentioned: metadata?.includeNotMentioned !== undefined ? metadata.includeNotMentioned : (metadata?.include_not_mentioned !== undefined ? metadata.include_not_mentioned : (requirementData.includeNotMentioned !== undefined ? requirementData.includeNotMentioned : false)),
      institute: metadata?.institute || null,
      resumeFreshness: metadata?.resumeFreshness || metadata?.resume_freshness ? new Date(metadata.resumeFreshness || metadata.resume_freshness) : null,
      currentCompany: metadata?.currentCompany || metadata?.current_company || null
    };
    
    console.log('📤 Transformed requirement fields:', {
      industry: transformedRequirement.industry,
      department: transformedRequirement.department,
      location: transformedRequirement.location,
      jobType: transformedRequirement.jobType,
      education: transformedRequirement.education
    });
    
    return res.status(200).json({ success: true, data: transformedRequirement });
  } catch (error) {
    console.error('❌ Get requirement error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve requirement',
      details: error?.message || error?.stack
    });
  }
});

// Update requirement
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    
    console.log('📝 Update Requirement request by user:', req.user?.id, 'requirementId:', id);
    console.log('📝 Payload:', JSON.stringify(body, null, 2));
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only employers can update requirements' });
    }
    
    // Find requirement
    const requirement = await Requirement.findOne({ where: { id } });
    
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }
    
    // If not admin, enforce ownership
    if (req.user.user_type !== 'admin' && String(requirement.companyId) !== String(req.user.companyId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. This requirement belongs to another company.' 
      });
    }
    
    // Get raw requirement to check existing metadata
    const [rawResults] = await sequelize.query(`
      SELECT * FROM requirements WHERE id = :id
    `, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    const rawRequirement = rawResults && rawResults.length > 0 ? rawResults[0] : null;
    
    // Parse existing metadata
    let existingMetadata = {};
    if (rawRequirement && rawRequirement.metadata) {
      try {
        if (typeof rawRequirement.metadata === 'string') {
          existingMetadata = JSON.parse(rawRequirement.metadata);
        } else {
          existingMetadata = rawRequirement.metadata;
        }
      } catch (e) {
        console.warn('Failed to parse existing metadata:', e);
      }
    }
    
    // Normalize enums to backend values with safe fallbacks (same as create)
    const jobTypeAllowed = new Set(['full-time', 'part-time', 'contract', 'internship', 'freelance']);
    // Get existing jobType from metadata or requirement
    const existingJobType = existingMetadata.jobType || existingMetadata.job_type || null;
    let normalizedJobType = body.jobType ? body.jobType.toString().toLowerCase().replace(/\s+/g, '-') : existingJobType;
    if (normalizedJobType && !jobTypeAllowed.has(normalizedJobType)) {
      normalizedJobType = existingJobType || 'full-time';
    }
    
    const remoteWorkAllowed = new Set(['on-site', 'remote', 'hybrid']);
    // Get existing remoteWork from requirement (it's stored as location_type in DB)
    const existingRemoteWork = requirement.remoteWork || null;
    let normalizedRemoteWork = body.remoteWork ? body.remoteWork.toString().toLowerCase().replace(/\s+/g, '-') : existingRemoteWork;
    if (normalizedRemoteWork && !remoteWorkAllowed.has(normalizedRemoteWork)) {
      normalizedRemoteWork = existingRemoteWork || null;
    }
    
    const shiftTimingAllowed = new Set(['day', 'night', 'rotational', 'flexible']);
    const existingShiftTiming = existingMetadata.shiftTiming || existingMetadata.shift_timing || null;
    let normalizedShiftTiming = body.shiftTiming ? body.shiftTiming.toString().toLowerCase().replace(/\s+/g, '-') : existingShiftTiming;
    if (normalizedShiftTiming && !shiftTimingAllowed.has(normalizedShiftTiming)) {
      normalizedShiftTiming = existingShiftTiming || null;
    }
    
    // Normalize travelRequired
    const existingTravelRequired = existingMetadata.travelRequired !== undefined ? existingMetadata.travelRequired : (existingMetadata.travel_required !== undefined ? existingMetadata.travel_required : null);
    let normalizedTravelRequired = body.travelRequired;
    if (normalizedTravelRequired !== undefined && normalizedTravelRequired !== null) {
      if (typeof normalizedTravelRequired === 'string') {
        const lower = normalizedTravelRequired.toLowerCase();
        if (lower === 'no' || lower === 'false') normalizedTravelRequired = false;
        else if (lower === 'occasionally' || lower === 'sometimes') normalizedTravelRequired = true;
        else if (lower === 'frequently' || lower === 'often' || lower === 'yes' || lower === 'true') normalizedTravelRequired = true;
      }
    } else {
      normalizedTravelRequired = existingTravelRequired;
    }
    
    // Build update data
    const updateData = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.location !== undefined) updateData.location = String(body.location).trim();
    if (body.experience !== undefined) updateData.experience = body.experience || null;
    if (body.workExperienceMin !== undefined || body.experienceMin !== undefined) {
      updateData.experienceMin = body.workExperienceMin || body.experienceMin || null;
    }
    if (body.workExperienceMax !== undefined || body.experienceMax !== undefined) {
      updateData.experienceMax = body.workExperienceMax || body.experienceMax || null;
    }
    if (body.salary !== undefined) updateData.salary = body.salary || null;
    if (body.currentSalaryMin !== undefined || body.salaryMin !== undefined) {
      updateData.salaryMin = body.currentSalaryMin || body.salaryMin || null;
    }
    if (body.currentSalaryMax !== undefined || body.salaryMax !== undefined) {
      updateData.salaryMax = body.currentSalaryMax || body.salaryMax || null;
    }
    if (body.currency !== undefined) updateData.currency = body.currency || 'INR';
    // Don't update virtual fields directly - they're stored in metadata
    // if (normalizedJobType) updateData.jobType = normalizedJobType; // VIRTUAL - store in metadata
    if (body.skills !== undefined) updateData.skills = Array.isArray(body.skills) ? body.skills : [];
    if (body.keySkills !== undefined) updateData.keySkills = Array.isArray(body.keySkills) ? body.keySkills : [];
    // Don't update virtual fields directly - they're stored in metadata
    // if (body.education !== undefined) updateData.education = body.education || null; // VIRTUAL - store in metadata
    if (body.validTill !== undefined) updateData.validTill = body.validTill ? new Date(body.validTill) : null;
    // Don't update virtual fields directly - they're stored in metadata
    // if (body.noticePeriod !== undefined) updateData.noticePeriod = body.noticePeriod || null; // VIRTUAL - store in metadata
    if (normalizedRemoteWork) updateData.remoteWork = normalizedRemoteWork; // This is stored as location_type in DB
    // Don't update virtual fields directly - they're stored in metadata
    // if (normalizedTravelRequired !== undefined) updateData.travelRequired = normalizedTravelRequired; // VIRTUAL - store in metadata
    // if (normalizedShiftTiming) updateData.shiftTiming = normalizedShiftTiming; // VIRTUAL - store in metadata
    // if (body.candidateLocations !== undefined) updateData.candidateLocations = Array.isArray(body.candidateLocations) ? body.candidateLocations : []; // VIRTUAL - store in metadata
    // if (body.candidateDesignations !== undefined) updateData.candidateDesignations = Array.isArray(body.candidateDesignations) ? body.candidateDesignations : []; // VIRTUAL - store in metadata
    // if (body.includeWillingToRelocate !== undefined) updateData.includeWillingToRelocate = !!body.includeWillingToRelocate; // VIRTUAL - store in metadata
    // if (body.includeNotMentioned !== undefined) updateData.includeNotMentioned = !!body.includeNotMentioned; // VIRTUAL - store in metadata
    // if (body.benefits !== undefined) updateData.benefits = Array.isArray(body.benefits) ? body.benefits : []; // VIRTUAL - store in metadata
    
    // Update metadata with virtual fields that need to persist
    // IMPORTANT: Always update metadata with the latest values, even if body field is undefined
    // This ensures that when user explicitly clears a field, it gets cleared in metadata too
    const updatedMetadata = {
      ...existingMetadata,
      // Store virtual fields in metadata so they persist
      jobType: normalizedJobType !== undefined && normalizedJobType !== null ? normalizedJobType : (existingMetadata.jobType || null),
      education: body.education !== undefined ? (body.education || null) : (existingMetadata.education || null),
      noticePeriod: body.noticePeriod !== undefined ? (body.noticePeriod || null) : (existingMetadata.noticePeriod || null),
      travelRequired: normalizedTravelRequired !== undefined ? normalizedTravelRequired : (existingMetadata.travelRequired !== undefined ? existingMetadata.travelRequired : null),
      shiftTiming: normalizedShiftTiming !== undefined && normalizedShiftTiming !== null ? normalizedShiftTiming : (existingMetadata.shiftTiming || null),
      benefits: body.benefits !== undefined ? (Array.isArray(body.benefits) ? body.benefits : []) : (Array.isArray(existingMetadata.benefits) ? existingMetadata.benefits : []),
      candidateLocations: body.candidateLocations !== undefined ? (Array.isArray(body.candidateLocations) ? body.candidateLocations : []) : (Array.isArray(existingMetadata.candidateLocations) ? existingMetadata.candidateLocations : []),
      candidateDesignations: body.candidateDesignations !== undefined ? (Array.isArray(body.candidateDesignations) ? body.candidateDesignations : []) : (Array.isArray(existingMetadata.candidateDesignations) ? existingMetadata.candidateDesignations : []),
      includeWillingToRelocate: body.includeWillingToRelocate !== undefined ? !!body.includeWillingToRelocate : (existingMetadata.includeWillingToRelocate !== undefined ? existingMetadata.includeWillingToRelocate : false),
      includeNotMentioned: body.includeNotMentioned !== undefined ? !!body.includeNotMentioned : (existingMetadata.includeNotMentioned !== undefined ? existingMetadata.includeNotMentioned : false),
      industry: body.industry !== undefined ? (body.industry ? String(body.industry).trim() : null) : (existingMetadata.industry || null),
      department: body.department !== undefined ? (body.department ? String(body.department).trim() : null) : (existingMetadata.department || null),
      institute: body.institute !== undefined ? (body.institute ? String(body.institute).trim() : null) : (existingMetadata.institute || null),
      resumeFreshness: body.resumeFreshness !== undefined ? (body.resumeFreshness ? new Date(body.resumeFreshness).toISOString() : null) : (existingMetadata.resumeFreshness ? existingMetadata.resumeFreshness : null),
      currentCompany: body.currentCompany !== undefined ? (body.currentCompany ? String(body.currentCompany).trim() : null) : (existingMetadata.currentCompany || null),
      location: body.location !== undefined ? String(body.location).trim() : (existingMetadata.location || rawRequirement?.location || null),
      experience: body.experience !== undefined ? (body.experience ? String(body.experience).trim() : null) : (existingMetadata.experience || rawRequirement?.experience || null),
      salary: body.salary !== undefined ? (body.salary ? String(body.salary).trim() : null) : (existingMetadata.salary || rawRequirement?.salary || null)
    };
    
    updateData.metadata = updatedMetadata;
    
    console.log('📝 Update data metadata:', JSON.stringify(updatedMetadata, null, 2));
    console.log('📝 Update data:', JSON.stringify(updateData, null, 2));
    
    // Update requirement
    await requirement.update(updateData);
    
    console.log('✅ Requirement updated with id:', requirement.id);
    console.log('✅ Requirement metadata after update:', JSON.stringify(requirement.metadata, null, 2));
    
    // Log activity
    try {
      const EmployerActivityService = require('../services/employerActivityService');
      await EmployerActivityService.logActivity(
        req.user.id,
        'requirement_updated',
        {
          details: {
            requirementId: requirement.id,
            title: requirement.title,
            location: requirement.location,
            jobType: requirement.jobType,
            companyId: requirement.companyId
          }
        }
      );
    } catch (activityError) {
      console.error('Failed to log requirement update activity:', activityError);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Requirement updated successfully',
      data: requirement
    });
  } catch (error) {
    console.error('❌ Update requirement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update requirement',
      details: error?.message || error?.stack
    });
  }
});

// Delete requirement
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Delete Requirement request by user:', req.user?.id, 'requirementId:', id);
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only employers can delete requirements' });
    }
    
    // Find requirement
    const requirement = await Requirement.findOne({ where: { id } });
    
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }
    
    // If not admin, enforce ownership
    if (req.user.user_type !== 'admin' && String(requirement.companyId) !== String(req.user.companyId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. This requirement belongs to another company.' 
      });
    }
    
    // Store requirement details for logging
    const requirementDetails = {
      id: requirement.id,
      title: requirement.title,
      location: requirement.location,
      jobType: requirement.jobType,
      companyId: requirement.companyId
    };
    
    // Delete requirement
    await requirement.destroy();
    
    console.log('✅ Requirement deleted:', id);
    
    // Log activity
    try {
      const EmployerActivityService = require('../services/employerActivityService');
      await EmployerActivityService.logActivity(
        req.user.id,
        'requirement_deleted',
        {
          details: requirementDetails
        }
      );
    } catch (activityError) {
      console.error('Failed to log requirement deletion activity:', activityError);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Requirement deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete requirement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete requirement',
      details: error?.message || error?.stack
    });
  }
});

// Get requirement statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only employers and admins can view requirement statistics.' 
      });
    }
    
    // Check if requirement exists and belongs to employer's company
    const requirement = await Requirement.findOne({
      where: { 
        id: id
      }
    });
    
    if (!requirement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Requirement not found' 
      });
    }
    // If not admin, enforce ownership
    if (req.user.user_type !== 'admin' && String(requirement.companyId) !== String(req.user.companyId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Use the SAME candidate matching logic as the /requirements/:id/candidates endpoint
    // This ensures consistency between the stats count and the actual candidates shown
    const { User } = require('../config/index');
    const { sequelize } = require('../config/sequelize');
    
    console.log(`📊 Fetching stats for requirement: ${requirement.id} (${requirement.title})`);
    
    // Extract experience from metadata if experienceMin/Max are not set
    let experienceMin = requirement.experienceMin;
    let experienceMax = requirement.experienceMax;
    
    if ((experienceMin === null || experienceMin === undefined) && 
        (experienceMax === null || experienceMax === undefined)) {
      // Try to parse experience from metadata
      const metadata = typeof requirement.metadata === 'string' 
        ? JSON.parse(requirement.metadata) 
        : (requirement.metadata || {});
      
      if (metadata.experience) {
        const expStr = String(metadata.experience).trim();
        // Parse formats like "3", "3-5", "3 years", etc.
        const expMatch = expStr.match(/(\d+)(?:\s*-\s*(\d+))?/);
        if (expMatch) {
          experienceMin = parseInt(expMatch[1]);
          if (expMatch[2]) {
            experienceMax = parseInt(expMatch[2]);
          }
          console.log(`📊 Extracted experience from metadata: ${experienceMin}${experienceMax ? '-' + experienceMax : '+'} years`);
        }
      }
    }
    
    // Build the SAME matching logic as used in the candidates endpoint
    const whereClause = {
      user_type: 'jobseeker',
      is_active: true,
      account_status: 'active'
    };
    
    const matchingConditions = [];
    
    // 1. EXPERIENCE RANGE MATCHING (apply directly to whereClause as AND condition)
    // Use workExperienceMin/Max if available, otherwise fallback to experienceMin/Max
    let workExperienceMin = requirement.workExperienceMin || experienceMin;
    let workExperienceMax = requirement.workExperienceMax || experienceMax;
    
    if (workExperienceMin !== null && workExperienceMin !== undefined) {
      const minExp = Number(workExperienceMin);
      const maxExp = workExperienceMax !== null && workExperienceMax !== undefined 
        ? Number(workExperienceMax) : 50;
      
      whereClause.experience_years = {
        [Op.and]: [
          { [Op.gte]: minExp },
          { [Op.lte]: maxExp }
        ]
      };
    }
    
    // 2. SALARY RANGE MATCHING (apply directly to whereClause as AND condition)
    // Use currentSalaryMin/Max if available, otherwise fallback to salaryMin/Max
    if (requirement.currentSalaryMin !== null && requirement.currentSalaryMin !== undefined) {
      const minSalary = Number(requirement.currentSalaryMin);
      const maxSalary = requirement.currentSalaryMax !== null && requirement.currentSalaryMax !== undefined
        ? Number(requirement.currentSalaryMax) : 200; // Max 200 LPA
      
      whereClause.current_salary = {
        [Op.and]: [
          { [Op.gte]: minSalary },
          { [Op.lte]: maxSalary }
        ]
      };
    }
    
    // 3. LOCATION MATCHING
    if (requirement.candidateLocations && requirement.candidateLocations.length > 0) {
      const locationConditions = requirement.candidateLocations.flatMap(location => ([
        { current_location: { [Op.iLike]: `%${location}%` } },
        sequelize.where(
          sequelize.cast(sequelize.col('preferred_locations'), 'text'), 
          { [Op.iLike]: `%${location}%` }
        )
      ]));
      
      if (requirement.includeWillingToRelocate) {
        locationConditions.push({ willing_to_relocate: true });
      }
      
      matchingConditions.push({ [Op.or]: locationConditions });
    }
    
    // 4. SKILLS & KEY SKILLS MATCHING
    const allRequiredSkills = [
      ...(requirement.skills || []),
      ...(requirement.keySkills || [])
    ].filter(Boolean);
    
    if (allRequiredSkills.length > 0) {
      const skillConditions = allRequiredSkills.flatMap(skill => ([
        { skills: { [Op.contains]: [skill] } },
        sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        { key_skills: { [Op.contains]: [skill] } },
        sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        { headline: { [Op.iLike]: `%${skill}%` } },
        { summary: { [Op.iLike]: `%${skill}%` } }
      ]));
      
      matchingConditions.push({ [Op.or]: skillConditions });
    }
    
    // 5. REQUIREMENT TITLE MATCHING (high priority for job title relevance)
    if (requirement.title && requirement.title.trim().length > 3) {
      const titleWords = requirement.title
        .split(/\s+/)
        .filter(word => word.length > 3)
        .map(word => word.toLowerCase());
      
      if (titleWords.length > 0) {
        const titleConditions = titleWords.flatMap(word => [
          { headline: { [Op.iLike]: `%${word}%` } },
          { designation: { [Op.iLike]: `%${word}%` } },
          sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${word}%` }),
          sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${word}%` })
        ]);
        
        matchingConditions.push({ [Op.or]: titleConditions });
      }
    }
    
    // 6. DESIGNATION MATCHING
    if (requirement.candidateDesignations && requirement.candidateDesignations.length > 0) {
      const designationConditions = requirement.candidateDesignations.flatMap(designation => ([
        { designation: { [Op.iLike]: `%${designation}%` } },
        { headline: { [Op.iLike]: `%${designation}%` } },
        { summary: { [Op.iLike]: `%${designation}%` } }
      ]));
      
      matchingConditions.push({ [Op.or]: designationConditions });
    }
    
    // 7. EDUCATION MATCHING
    if (requirement.education || requirement.institute) {
      const educationConditions = [];
      
      if (requirement.education) {
        educationConditions.push(
          sequelize.where(
            sequelize.cast(sequelize.col('education'), 'text'),
            { [Op.iLike]: `%${requirement.education}%` }
          ),
          { headline: { [Op.iLike]: `%${requirement.education}%` } },
          { summary: { [Op.iLike]: `%${requirement.education}%` } }
        );
      }
      
      if (requirement.institute) {
        educationConditions.push(
          sequelize.where(
            sequelize.cast(sequelize.col('education'), 'text'),
            { [Op.iLike]: `%${requirement.institute}%` }
          ),
          { summary: { [Op.iLike]: `%${requirement.institute}%` } }
        );
      }
      
      if (educationConditions.length > 0) {
        matchingConditions.push({ [Op.or]: educationConditions });
      }
    }
    
    // 8. NOTICE PERIOD MATCHING
    if (requirement.noticePeriod && requirement.noticePeriod !== 'Any') {
      const noticePeriodMap = {
        'Immediately': 0,
        'Immediate': 0,
        '15 days': 15,
        '30 days': 30,
        '60 days': 60,
        '90 days': 90
      };
      
      const maxNoticeDays = noticePeriodMap[requirement.noticePeriod];
      if (maxNoticeDays !== undefined) {
        whereClause.notice_period = {
          [Op.lte]: maxNoticeDays
        };
      }
    }
    
    // 9. RESUME FRESHNESS
    if (requirement.resumeFreshness) {
      const freshnessDate = new Date(requirement.resumeFreshness);
      whereClause.last_profile_update = {
        [Op.gte]: freshnessDate
      };
    }
    
    // Apply matching conditions with OR logic (same as candidates endpoint)
    // BUT experience and salary are AND conditions (already applied to whereClause)
    if (matchingConditions.length > 0) {
      whereClause[Op.or] = matchingConditions;
    }
    
    // Get the actual candidate IDs that match this requirement
    const matchingCandidates = await User.findAll({
      where: whereClause,
      attributes: ['id'],
      limit: 10000 // Reasonable limit to get all matching candidates
    });
    
    const matchingCandidateIds = matchingCandidates.map(c => c.id);
    
    // Apply title filtering if requirement has a specific title (same logic as candidates endpoint)
    let finalCandidateIds = matchingCandidateIds;
    
    if (requirement.title && requirement.title.trim().length > 3 && matchingCandidateIds.length > 0) {
      const titleWords = requirement.title
        .split(/\s+/)
        .filter(word => word.length > 3)
        .map(word => word.toLowerCase());
      
      if (titleWords.length > 0) {
        // Get candidates with matching headlines
        const titleMatchedCandidates = await User.findAll({
          where: {
            id: { [Op.in]: matchingCandidateIds },
            [Op.or]: titleWords.map(keyword => ({
              headline: { [Op.iLike]: `%${keyword}%` }
            }))
          },
          attributes: ['id']
        });
        
        if (titleMatchedCandidates.length > 0) {
          finalCandidateIds = titleMatchedCandidates.map(c => c.id);
          console.log(`📊 Filtered to ${finalCandidateIds.length} candidates with title match (from ${matchingCandidateIds.length} total matches)`);
        }
      }
    }
    
    const totalCandidates = finalCandidateIds.length;
    
    console.log(`✅ Total candidates matching requirement: ${totalCandidates}`);
    
    // Get accessed candidates count - only count UNIQUE candidates that match this requirement
    const { ViewTracking } = require('../config/index');
    
    // Initialize to 0 - will only increment if valid views are found
    let accessedCandidates = 0;
    
    // CRITICAL: Only count if there are matching candidates
    if (finalCandidateIds.length === 0) {
      accessedCandidates = 0;
      console.log(`✅ No matching candidates for requirement ${requirement.id}, accessed count = 0`);
    } else {
      try {
        // Count DISTINCT profile views where:
        // 1. The viewed candidate matches this requirement (in finalCandidateIds)
        // 2. The viewer is this employer
        // 3. View type is profile_view
        // IMPORTANT: Only count views of candidates that actually match this requirement
        
        // Convert finalCandidateIds to strings for consistent comparison
        const matchingIdsStr = finalCandidateIds.map(id => String(id).trim()).filter(Boolean);
        
        if (matchingIdsStr.length === 0) {
          accessedCandidates = 0;
          console.log(`✅ No valid candidate IDs to check, accessed count = 0`);
        } else {
          // PRIMARY METHOD: Count distinct accessed candidates
          // CRITICAL: Only count views that happened AFTER requirement was created
          // This prevents counting views from before the requirement existed
          console.log(`🔍 Stats Debug for requirement "${requirement.title}" (${requirement.id}):`);
          console.log(`   - Requirement created: ${requirement.created_at}`);
          console.log(`   - Matching candidate IDs: ${matchingIdsStr.length}`);
          console.log(`   - Checking for profile views by employer ${req.user.id}...`);
          
          try {
            // Get requirement creation date
            // Use >= (not >) to count views from requirement creation onwards
            // But add 1 second buffer to exclude views that might have been created during redirect
            const requirementCreatedDate = new Date(requirement.created_at);
            const minViewDate = new Date(requirementCreatedDate.getTime() + 1000); // Add 1 second buffer to exclude redirect views
            
            console.log(`   - Requirement created at: ${requirementCreatedDate.toISOString()}`);
            console.log(`   - Counting views AFTER: ${minViewDate.toISOString()} (1 second buffer to exclude redirect views)`);
            
            // Get ALL views for this employer viewing matching candidates
            // Count views that happened AFTER requirement creation (with small buffer to exclude redirect views)
            // IMPORTANT: Use snake_case column names since we're using raw: true
            const verifyViews = await ViewTracking.findAll({
      where: {
                viewer_id: req.user.id,
                viewed_user_id: { [Op.in]: finalCandidateIds },
                view_type: 'profile_view',
                created_at: { [Op.gt]: minViewDate } // Use > with 1 second buffer - excludes redirect views but includes actual profile views
              },
              attributes: ['viewed_user_id', 'created_at'],
              raw: true,
              order: [['created_at', 'DESC']]
            });
            
            console.log(`   - Total views found (after requirement creation + 1s buffer): ${verifyViews.length}`);
            if (verifyViews.length > 0) {
              console.log(`   - Sample view dates: ${verifyViews.slice(0, 3).map(v => v.created_at || v.createdAt).join(', ')}`);
            }
            
            // Count unique IDs manually - THIS IS THE FINAL ANSWER
            const manualCount = new Set();
            const finalCandidateIdsStr = finalCandidateIds.map(id => String(id).trim());
            
            if (Array.isArray(verifyViews) && verifyViews.length > 0) {
              verifyViews.forEach((view, idx) => {
                // Use snake_case since raw: true returns database column names
                const id = view.viewed_user_id;
                if (id) {
                  const idStr = String(id).trim();
                  // Check if this viewed ID matches any of our matching candidate IDs
                  const matches = finalCandidateIdsStr.some(candidateId => 
                    candidateId === idStr
                  );
                  if (matches) {
                    manualCount.add(idStr);
                    const viewDate = new Date(view.created_at);
                    const timeDiff = viewDate.getTime() - requirementCreatedDate.getTime();
                    const isAfterCreation = viewDate > minViewDate;
                    console.log(`   ${isAfterCreation ? '✅' : '⚠️'} View ${idx + 1}: Counting candidate ${idStr.substring(0, 8)}... (viewed: ${view.created_at || 'N/A'}, time diff from creation: ${timeDiff}ms)`);
                  } else {
                    console.log(`   ❌ View ${idx + 1}: Candidate ${idStr.substring(0, 8)}... NOT in matching list`);
                  }
                } else {
                  console.log(`   ❌ View ${idx + 1}: No valid ID found`);
                }
              });
            }
            
            const manualCountSize = manualCount.size;
            console.log(`   - Manual count result: ${manualCountSize} unique candidates accessed`);
            
            // Use manual count as final answer
            accessedCandidates = manualCountSize;
            
          } catch (countError) {
            console.error('❌ Error in COUNT query:', countError);
            accessedCandidates = 0;
          }
          
          console.log(`   - ✅ FINAL accessed count: ${accessedCandidates}`);
        }
      } catch (queryError) {
        console.error('❌ Error querying accessed candidates:', queryError);
        // On any error, default to 0 (safer than trying fallback)
        accessedCandidates = 0;
        console.log(`✅ Error occurred, setting accessed count to 0 for safety`);
      }
    }
    
    // ABSOLUTE FINAL VALIDATION - Force to 0 if ANY doubt
    // Convert to integer and validate - MULTIPLE SAFETY CHECKS
    let finalAccessedCount = 0;
    
    // Convert to number first
    const numValue = Number(accessedCandidates);
    
    // Only accept if:
    // 1. It's a valid integer
    // 2. It's >= 0
    // 3. It's not NaN or Infinity
    // 4. We have matching candidates to check against
    if (Number.isInteger(numValue) && 
        numValue >= 0 && 
        isFinite(numValue) &&
        finalCandidateIds.length > 0) {
      finalAccessedCount = numValue;
    } else {
      finalAccessedCount = 0;
      if (numValue !== 0) {
        console.log(`⚠️ Invalid accessed count value: ${accessedCandidates}, forcing to 0`);
      }
    }
    
    // CRITICAL SAFETY: If no matching candidates, accessed MUST be 0
    if (finalCandidateIds.length === 0) {
      finalAccessedCount = 0;
      console.log(`⚠️ Safety check: No matching candidates, forcing accessed count to 0`);
    }
    
    // DOUBLE SAFETY: If count > 0 but no matching candidates, force to 0
    if (finalAccessedCount > 0 && finalCandidateIds.length === 0) {
      console.log(`⚠️ CRITICAL: Found ${finalAccessedCount} accesses but no matching candidates - FORCING TO 0`);
      finalAccessedCount = 0;
    }
    
    // TRIPLE SAFETY: Ensure it's never anything other than 0 for new requirements
    // If accessedCandidates is not explicitly a verified positive integer, it's 0
    if (!Number.isInteger(finalAccessedCount) || finalAccessedCount < 0) {
      finalAccessedCount = 0;
      console.log(`⚠️ Final safety: Invalid count ${finalAccessedCount}, forcing to 0`);
    }
    
    accessedCandidates = finalAccessedCount;
    
    // Log final result with full context
    console.log(`✅✅✅ FINAL accessed count for requirement "${requirement.title}" (${requirement.id}): ${accessedCandidates}`);
    console.log(`   - Matching candidates: ${finalCandidateIds.length}`);
    console.log(`   - Valid views found: ${accessedCandidates}`);
    console.log(`   - Employer ID: ${req.user.id}`);
    console.log(`   - Status: ${accessedCandidates === 0 ? 'NO ACCESSES (Correct for new requirements)' : accessedCandidates + ' candidates accessed'}`);
    
    // Get CV access left (this would come from subscription/usage data)
    // For now, we'll use a placeholder - in real implementation this would be from subscription service
    const cvAccessLeft = 100; // This should be fetched from subscription/usage service
    
    res.json({
      success: true,
      data: {
        totalCandidates: Number(totalCandidates) || 0,
        accessedCandidates: Number(accessedCandidates) || 0,
        cvAccessLeft,
        requirement: {
          id: requirement.id,
          title: requirement.title,
          status: requirement.status
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching requirement statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requirement statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get jobseekers based on requirement criteria
router.get('/:id/candidates', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, search, sortBy = 'relevance' } = req.query;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers and admins can view candidates.' });
    }
    
    // Get the requirement
    const requirement = await Requirement.findOne({
      where: { 
        id
      }
    });
    
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }
    if (req.user.user_type !== 'admin' && String(requirement.companyId) !== String(req.user.companyId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    console.log('🔍 Searching candidates for requirement:', requirement.title);
    console.log('🔍 Requirement criteria:', {
      skills: requirement.skills,
      keySkills: requirement.keySkills,
      experienceMin: requirement.experienceMin,
      experienceMax: requirement.experienceMax,
      education: requirement.education,
      jobType: requirement.jobType,
      candidateLocations: requirement.candidateLocations
    });
    
    // ========== IMPROVED CANDIDATE MATCHING ALGORITHM ==========
    // Build comprehensive search criteria based on ALL requirement fields
    
    // Extract experience from metadata if experienceMin/Max are not set
    let workExperienceMin = requirement.workExperienceMin || requirement.experienceMin;
    let workExperienceMax = requirement.workExperienceMax || requirement.experienceMax;
    
    if ((workExperienceMin === null || workExperienceMin === undefined) && 
        (workExperienceMax === null || workExperienceMax === undefined)) {
      // Try to parse experience from metadata
      const metadata = typeof requirement.metadata === 'string' 
        ? JSON.parse(requirement.metadata) 
        : (requirement.metadata || {});
      
      if (metadata.experience) {
        const expStr = String(metadata.experience).trim();
        // Parse formats like "3", "3-5", "3 years", etc.
        const expMatch = expStr.match(/(\d+)(?:\s*-\s*(\d+))?/);
        if (expMatch) {
          workExperienceMin = parseInt(expMatch[1]);
          if (expMatch[2]) {
            workExperienceMax = parseInt(expMatch[2]);
          }
          console.log(`📊 Extracted experience from metadata: ${workExperienceMin}${workExperienceMax ? '-' + workExperienceMax : '+'} years`);
        }
      }
    }
    
    const whereClause = {
      user_type: 'jobseeker',
      is_active: true,
      account_status: 'active'
    };
    
    // Track which filters are applied for better logging
    const appliedFilters = [];
    
    // Build matching conditions - use OR for flexibility (candidates matching ANY criteria)
    const matchingConditions = [];
    
    // 1. EXPERIENCE RANGE MATCHING (workExperienceMin/Max)
    if (workExperienceMin !== null && workExperienceMin !== undefined) {
      const minExp = Number(workExperienceMin);
      const maxExp = workExperienceMax !== null && workExperienceMax !== undefined 
        ? Number(workExperienceMax) : 50;
      
      whereClause.experience_years = {
        [Op.and]: [
          { [Op.gte]: minExp },
          { [Op.lte]: maxExp }
        ]
      };
      appliedFilters.push(`Experience: ${minExp}-${maxExp} years`);
    }
    
    // 2. SALARY RANGE MATCHING (currentSalaryMin/Max)
    if (requirement.currentSalaryMin !== null && requirement.currentSalaryMin !== undefined) {
      const minSalary = Number(requirement.currentSalaryMin);
      const maxSalary = requirement.currentSalaryMax !== null && requirement.currentSalaryMax !== undefined
        ? Number(requirement.currentSalaryMax) : 200; // Max 200 LPA
      
      whereClause.current_salary = {
        [Op.and]: [
          { [Op.gte]: minSalary },
          { [Op.lte]: maxSalary }
        ]
      };
      appliedFilters.push(`Salary: ${minSalary}-${maxSalary} LPA`);
    }
    
    // 3. LOCATION MATCHING (candidateLocations + willing to relocate)
    if (requirement.candidateLocations && requirement.candidateLocations.length > 0) {
      const locationConditions = requirement.candidateLocations.flatMap(location => ([
        // Match current location
        { current_location: { [Op.iLike]: `%${location}%` } },
        // Match preferred locations (JSONB array)
        sequelize.where(
          sequelize.cast(sequelize.col('preferred_locations'), 'text'), 
          { [Op.iLike]: `%${location}%` }
        )
      ]));
      
      // Include candidates willing to relocate if requirement allows
      if (requirement.includeWillingToRelocate) {
        locationConditions.push({ willing_to_relocate: true });
      }
      
      matchingConditions.push({ [Op.or]: locationConditions });
      appliedFilters.push(`Location: ${requirement.candidateLocations.join(', ')}`);
    }
    
    // 4. SKILLS & KEY SKILLS MATCHING (comprehensive)
    const allRequiredSkills = [
      ...(requirement.skills || []),
      ...(requirement.keySkills || [])
    ].filter(Boolean);
    
    if (allRequiredSkills.length > 0) {
      const skillConditions = allRequiredSkills.flatMap(skill => ([
        // Match in skills array (exact and case-insensitive)
        { skills: { [Op.contains]: [skill] } },
        sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        // Match in key_skills array
        { key_skills: { [Op.contains]: [skill] } },
        sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        // Match in headline (job title often mentions key skills)
        { headline: { [Op.iLike]: `%${skill}%` } },
        // Match in summary
        { summary: { [Op.iLike]: `%${skill}%` } }
      ]));
      
      matchingConditions.push({ [Op.or]: skillConditions });
      appliedFilters.push(`Skills: ${allRequiredSkills.slice(0, 3).join(', ')}${allRequiredSkills.length > 3 ? '...' : ''}`);
    }
    
    // 4.5. REQUIREMENT TITLE MATCHING (high priority for job title relevance)
    // If requirement has a specific title, prioritize candidates with matching headlines/designations
    if (requirement.title && requirement.title.trim().length > 3) {
      const titleWords = requirement.title
        .split(/\s+/)
        .filter(word => word.length > 3) // Only meaningful words
        .map(word => word.toLowerCase());
      
      if (titleWords.length > 0) {
        // Match requirement title in candidate headline (highest relevance)
        const titleConditions = titleWords.flatMap(word => [
          { headline: { [Op.iLike]: `%${word}%` } },
          { designation: { [Op.iLike]: `%${word}%` } },
          sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${word}%` }),
          sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${word}%` })
        ]);
        
        // Add title matching as a condition (will be combined with OR logic)
        matchingConditions.push({ [Op.or]: titleConditions });
        appliedFilters.push(`Title Match: "${requirement.title}"`);
      }
    }
    
    // 5. DESIGNATION MATCHING (candidateDesignations)
    if (requirement.candidateDesignations && requirement.candidateDesignations.length > 0) {
      const designationConditions = requirement.candidateDesignations.flatMap(designation => ([
        { designation: { [Op.iLike]: `%${designation}%` } },
        { headline: { [Op.iLike]: `%${designation}%` } },
        { summary: { [Op.iLike]: `%${designation}%` } }
      ]));
      
      matchingConditions.push({ [Op.or]: designationConditions });
      appliedFilters.push(`Designation: ${requirement.candidateDesignations.join(', ')}`);
    }
    
    // 6. EDUCATION MATCHING (education field + institute)
    if (requirement.education || requirement.institute) {
      const educationConditions = [];
      
      if (requirement.education) {
        educationConditions.push(
          // Search in education JSONB array
          sequelize.where(
            sequelize.cast(sequelize.col('education'), 'text'),
            { [Op.iLike]: `%${requirement.education}%` }
          ),
          // Search in headline and summary
          { headline: { [Op.iLike]: `%${requirement.education}%` } },
          { summary: { [Op.iLike]: `%${requirement.education}%` } }
        );
      }
      
      if (requirement.institute) {
        educationConditions.push(
          // Search for institute name in education JSONB
          sequelize.where(
            sequelize.cast(sequelize.col('education'), 'text'),
            { [Op.iLike]: `%${requirement.institute}%` }
          ),
          // Search in summary (people often mention their university)
          { summary: { [Op.iLike]: `%${requirement.institute}%` } }
        );
      }
      
      if (educationConditions.length > 0) {
        matchingConditions.push({ [Op.or]: educationConditions });
        appliedFilters.push(`Education: ${requirement.education || ''} ${requirement.institute || ''}`);
      }
    }
    
    // 7. CURRENT COMPANY MATCHING
    if (requirement.currentCompany) {
      matchingConditions.push({
        [Op.or]: [
          // Search in current_company field
          { current_company: { [Op.iLike]: `%${requirement.currentCompany}%` } },
          { headline: { [Op.iLike]: `%${requirement.currentCompany}%` } },
          { summary: { [Op.iLike]: `%${requirement.currentCompany}%` } }
        ]
      });
      appliedFilters.push(`Company: ${requirement.currentCompany}`);
    }
    
    // 8. NOTICE PERIOD MATCHING
    if (requirement.noticePeriod && requirement.noticePeriod !== 'Any') {
      // Convert notice period to days for comparison
      const noticePeriodMap = {
        'Immediately': 0,
        'Immediate': 0,
        '15 days': 15,
        '30 days': 30,
        '60 days': 60,
        '90 days': 90
      };
      
      const maxNoticeDays = noticePeriodMap[requirement.noticePeriod];
      if (maxNoticeDays !== undefined) {
        whereClause.notice_period = {
          [Op.lte]: maxNoticeDays
        };
        appliedFilters.push(`Notice Period: ≤${requirement.noticePeriod}`);
      }
    }
    
    // 9. RESUME FRESHNESS (if specified)
    if (requirement.resumeFreshness) {
      const freshnessDate = new Date(requirement.resumeFreshness);
      whereClause.last_profile_update = {
        [Op.gte]: freshnessDate
      };
      appliedFilters.push(`Resume Updated After: ${freshnessDate.toLocaleDateString()}`);
    }
    
    // 10. REMOTE WORK PREFERENCE
    if (requirement.remoteWork && requirement.remoteWork !== 'Any') {
      matchingConditions.push({
        [Op.or]: [
          sequelize.where(
            sequelize.cast(sequelize.col('preferences'), 'text'),
            { [Op.iLike]: `%${requirement.remoteWork}%` }
          ),
          { headline: { [Op.iLike]: `%${requirement.remoteWork}%` } }
        ]
      });
      appliedFilters.push(`Remote Work: ${requirement.remoteWork}`);
    }
    
    console.log('🎯 Applied Filters:', appliedFilters.join(' | '));
    
    // CRITICAL FIX: Use AND logic to combine matching conditions
    // This ensures candidates must match at least SOME of the specified criteria
    // If skills are specified, candidate MUST have at least one of those skills
    // If locations are specified, candidate MUST match at least one location
    // These are combined with AND logic for stricter matching
    if (matchingConditions.length > 0) {
      // Use AND logic to combine all matching conditions
      // This ensures candidates must satisfy ALL specified criteria groups
      // Example: (has skill1 OR skill2) AND (in location1 OR location2)
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push(...matchingConditions);
      
      console.log(`✅ Applied ${matchingConditions.length} matching condition groups with AND logic`);
    }
    
    // Add search query if provided (narrows down results further)
    // Search should be combined with AND logic to further filter results
    if (search) {
      const searchConditions = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { headline: { [Op.iLike]: `%${search}%` } },
        { designation: { [Op.iLike]: `%${search}%` } },
        { summary: { [Op.iLike]: `%${search}%` } },
        sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${search}%` }),
        sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${search}%` })
      ];
      
      // Add search as an AND condition
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({ [Op.or]: searchConditions });
      appliedFilters.push(`Search: "${search}"`);
    }
    
    console.log('🔍 Final where clause (simplified):', {
      baseFilters: {
        user_type: whereClause.user_type,
        is_active: whereClause.is_active,
        account_status: whereClause.account_status
      },
      experienceRange: whereClause.experience_years,
      salaryRange: whereClause.current_salary,
      noticePeriodMax: whereClause.notice_period,
      resumeUpdatedAfter: whereClause.last_profile_update,
      matchingConditionsCount: whereClause[Op.or] ? whereClause[Op.or].length : 0,
      searchApplied: whereClause[Op.and] ? true : false
    });
    
    // Determine sort order - simplified
    let orderClause = [['last_profile_update', 'DESC']]; // Prioritize recent profiles
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (isNaN(pageNum) ? 0 : (pageNum - 1)) * (isNaN(limitNum) ? 50 : limitNum);
    
    // Fetch candidates with comprehensive attributes
    const { count, rows: candidates } = await User.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: limitNum,
      offset,
      attributes: [
        'id', 'first_name', 'last_name', 'email', 'phone', 'avatar',
        'current_location', 'headline', 'summary', 'skills', 'key_skills', 'languages',
        'current_salary', 'expected_salary', 'notice_period', 'willing_to_relocate',
        'experience_years', 'preferred_locations', 'education', 'designation',
        'profile_completion', 'last_login_at', 'last_profile_update',
        'is_email_verified', 'is_phone_verified', 'created_at',
        'preferences', 'certifications', 'highest_education', 'field_of_study'
      ]
    });
    
    console.log(`✅ Found ${count} candidates matching requirement criteria`);

    // Send notification to employer if new candidates are found
    if (count > 0) {
      try {
        const { Notification } = require('../config/index');
        const { Company } = require('../config/index');
        
        // Get company info for notification
        const company = await Company.findByPk(requirement.companyId);
        const companyName = company?.name || 'Your Company';
        
        // Check if we already sent a notification for this requirement recently (within 24 hours)
        const recentNotification = await Notification.findOne({
          where: {
            userId: req.user.id,
            type: 'company_update',
            metadata: {
              requirementId: requirement.id
            },
            created_at: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
            }
          }
        });
        
        if (!recentNotification) {
          await Notification.create({
            userId: req.user.id,
            type: 'company_update',
            title: `🎯 New Candidates Found for Your Requirement!`,
            message: `Found ${count} matching candidates for "${requirement.title}" position. Review and contact them now!`,
            shortMessage: `${count} new candidates for ${requirement.title}`,
            priority: 'medium',
            actionUrl: `/employer-dashboard/candidate-requirement/${requirement.id}`,
            actionText: 'View Candidates',
            icon: 'users',
            metadata: {
              requirementId: requirement.id,
              requirementTitle: requirement.title,
              candidateCount: count,
              companyId: requirement.companyId,
              companyName: companyName
            }
          });
          console.log(`✅ Candidate recommendation notification sent to employer ${req.user.id}`);
        } else {
          console.log(`ℹ️ Skipping notification - already sent recently for requirement ${requirement.id}`);
        }
      } catch (notificationError) {
        console.error('❌ Failed to send candidate recommendation notification:', notificationError);
        // Don't fail the candidate search if notification fails
      }
    }

    // Smart fallback: if too few candidates, progressively relax filters
    let finalCandidates = candidates;
    let finalCount = count;
    let fallbackApplied = false;
    
    if (finalCount === 0) {
      // If NO candidates found, try smart fallback strategies
      console.warn(`⚠️ No candidates matched strict filters. Applying smart fallback...`);
      
      // Strategy 1: Prioritize requirement title matching in headlines (most relevant)
      const titleKeywords = requirement.title
        ? requirement.title.split(/\s+/).filter(word => word.length > 3).map(word => word.toLowerCase())
        : [];
      
      // Strategy 2: Relaxed skill matching with fuzzy search
      const relaxedSkills = [
        ...(requirement.skills || []),
        ...(requirement.keySkills || [])
      ].filter(Boolean);
      
      // Build relaxed criteria prioritizing title matches
      const relaxedWhereClause = {
        user_type: 'jobseeker',
        is_active: true,
        account_status: 'active'
      };
      
      const relaxedConditions = [];
      
      // PRIORITY 1: Match requirement title in headlines (most relevant for job matching)
      if (titleKeywords.length > 0) {
        // Try to match at least one significant word from title in headline
        // This ensures candidates with relevant job titles are found
        const titleMatchConditions = titleKeywords.map(keyword => ({
          headline: { [Op.iLike]: `%${keyword}%` }
        }));
        
        // Require at least one title keyword to match in headline for relevance
        if (titleMatchConditions.length > 0) {
          relaxedConditions.push({ [Op.or]: titleMatchConditions });
        }
      }
      
      // PRIORITY 2: Match individual skill words in profiles
      if (relaxedSkills.length > 0) {
        relaxedSkills.forEach(skill => {
          // Split compound skills (e.g., "Machine Analysis" -> ["Machine", "Analysis"])
          const skillWords = skill.split(/\s+/).filter(word => word.length > 3);
          skillWords.forEach(word => {
            relaxedConditions.push(
              sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${word}%` }),
              sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${word}%` }),
              { headline: { [Op.iLike]: `%${word}%` } }
            );
          });
        });
      }
      
      // Apply relaxed conditions - candidates must match at least one condition
      if (relaxedConditions.length > 0) {
        relaxedWhereClause[Op.or] = relaxedConditions;
      }
      
      const relaxed = await User.findAndCountAll({
        where: relaxedWhereClause,
        order: [
          // Prioritize candidates with title matches in headline
          [sequelize.literal(`CASE WHEN "User"."headline" ILIKE '%${titleKeywords[0] || ''}%' THEN 0 ELSE 1 END`), 'ASC'],
          ['profile_completion', 'DESC'],
          ['last_profile_update', 'DESC']
        ],
        limit: limitNum,
        offset,
        attributes: [
          'id', 'first_name', 'last_name', 'email', 'phone', 'avatar',
          'current_location', 'headline', 'summary', 'skills', 'key_skills', 'languages',
          'current_salary', 'expected_salary', 'notice_period', 'willing_to_relocate',
          'experience_years', 'preferred_locations', 'education', 'designation',
          'profile_completion', 'last_login_at', 'last_profile_update',
          'is_email_verified', 'is_phone_verified', 'created_at',
          'preferences', 'certifications'
        ]
      });
      
      console.log(`✅ Relaxed search found ${relaxed.count} candidates`);
      
      if (relaxed.count > 0) {
        // Filter results to prioritize relevance
        // IMPORTANT: If requirement has a specific title, ONLY show candidates with title matches in headline
        let filteredCandidates = relaxed.rows;
        
        if (titleKeywords.length > 0 && requirement.title) {
          // For requirements with specific titles (like "Instrumentation engineer"),
          // ONLY show candidates whose headline contains the title keywords
          const titleMatched = relaxed.rows.filter(c => {
            const headline = (c.headline || '').toLowerCase();
            // Candidate headline must contain at least one significant keyword from requirement title
            return titleKeywords.some(keyword => headline.includes(keyword));
          });
          
          if (titleMatched.length > 0) {
            // Only show candidates with title matches
            filteredCandidates = titleMatched;
            console.log(`✅ Filtered to ${titleMatched.length} candidates with title match (excluded ${relaxed.rows.length - titleMatched.length} irrelevant candidates)`);
          } else {
            // If no title matches found, check for skill-related matches as secondary option
            console.warn(`⚠️ No candidates with title match found. Checking for skill-related matches...`);
            filteredCandidates = relaxed.rows; // Fall back to all relaxed matches
          }
        }
        
        finalCandidates = filteredCandidates.slice(0, limitNum);
        finalCount = filteredCandidates.length;
      fallbackApplied = true;
        console.log(`✅ Using ${finalCount} candidates from relaxed search (filtered by relevance)`);
      } else {
        console.warn(`⚠️ No candidates matched even relaxed criteria. No fallback candidates to show.`);
      }
    }
    
    // ========== IMPROVED RELEVANCE SCORING ALGORITHM ==========
    // Calculate comprehensive relevance score for each candidate (max 100 points)
    const calculateRelevanceScore = (candidate, requirement) => {
      let score = 0;
      let matchReasons = [];
      
      // Helper function for case-insensitive array matching
      const matchSkill = (requiredSkill, candidateSkills = []) => {
        return candidateSkills.some(cs => 
          cs.toLowerCase() === requiredSkill.toLowerCase() ||
          cs.toLowerCase().includes(requiredSkill.toLowerCase()) ||
          requiredSkill.toLowerCase().includes(cs.toLowerCase())
        );
      };
      
      // 1. SKILLS MATCHING (35 points max - high priority, but lower than title match)
      const allRequiredSkills = [
        ...(requirement.skills || []),
        ...(requirement.keySkills || [])
      ].filter(Boolean);
      
      if (allRequiredSkills.length > 0) {
        const candidateSkills = [
          ...(candidate.skills || []),
          ...(candidate.key_skills || [])
        ];
        
        const matchingSkills = allRequiredSkills.filter(skill => 
          matchSkill(skill, candidateSkills)
        );
        
        if (matchingSkills.length > 0) {
          const matchPercentage = (matchingSkills.length / allRequiredSkills.length) * 100;
          const skillScore = Math.min(35, (matchPercentage / 100) * 35);
          score += skillScore;
          matchReasons.push(`${matchingSkills.length}/${allRequiredSkills.length} skills match (${Math.round(matchPercentage)}%)`);
        }
      }
      
      // 2. LOCATION MATCHING (15 points)
      if (requirement.candidateLocations && requirement.candidateLocations.length > 0) {
        const candidateLocation = (candidate.current_location || '').toLowerCase();
        const preferredLocs = (candidate.preferred_locations || []).map(l => l.toLowerCase());
        
        const hasExactLocationMatch = requirement.candidateLocations.some(loc => 
          candidateLocation.includes(loc.toLowerCase()) ||
          preferredLocs.some(pl => pl.includes(loc.toLowerCase()))
        );
        
        if (hasExactLocationMatch) {
          score += 15;
          matchReasons.push('Preferred location');
        } else if (candidate.willing_to_relocate) {
          score += 8;
          matchReasons.push('Open to relocate');
        }
      }
      
      // 3. EXPERIENCE MATCHING (15 points)
      if (requirement.workExperienceMin !== null && requirement.workExperienceMin !== undefined) {
        const minExp = Number(requirement.workExperienceMin);
        const maxExp = requirement.workExperienceMax !== null && requirement.workExperienceMax !== undefined
          ? Number(requirement.workExperienceMax) : 50;
        const candidateExp = Number(candidate.experience_years) || 0;
        
        if (candidateExp >= minExp && candidateExp <= maxExp) {
          // Perfect match - within range
          score += 15;
          matchReasons.push(`Experience: ${candidateExp} yrs (fits ${minExp}-${maxExp} yrs)`);
        } else if (candidateExp > maxExp && candidateExp <= maxExp + 2) {
          // Slightly over-qualified (within 2 years)
          score += 10;
          matchReasons.push(`Experience: ${candidateExp} yrs (slightly over)`);
        } else if (candidateExp < minExp && candidateExp >= minExp - 2) {
          // Slightly under-qualified (within 2 years)
          score += 8;
          matchReasons.push(`Experience: ${candidateExp} yrs (slightly under)`);
        }
      }
      
      // 4. SALARY EXPECTATION MATCHING (10 points)
      if (requirement.currentSalaryMin !== null && requirement.currentSalaryMin !== undefined) {
        const minSalary = Number(requirement.currentSalaryMin);
        const maxSalary = requirement.currentSalaryMax || 200;
        const candidateSalary = Number(candidate.current_salary) || 0;
        
        if (candidateSalary >= minSalary && candidateSalary <= maxSalary) {
          score += 10;
          matchReasons.push(`Salary: ${candidateSalary} LPA (fits ${minSalary}-${maxSalary} LPA)`);
        } else if (candidateSalary > 0) {
          // Partial points if salary is specified but outside range
          score += 3;
        }
      }
      
      // 5. EDUCATION MATCHING (10 points)
      if (requirement.education || requirement.institute) {
        const candidateEducation = JSON.stringify(candidate.education || []).toLowerCase();
        const candidateText = `${candidate.headline || ''} ${candidate.summary || ''}`.toLowerCase();
        let educationMatch = false;
        
        if (requirement.education && 
            (candidateEducation.includes(requirement.education.toLowerCase()) ||
             candidateText.includes(requirement.education.toLowerCase()))) {
          educationMatch = true;
        }
        
        if (requirement.institute && 
            (candidateEducation.includes(requirement.institute.toLowerCase()) ||
             candidateText.includes(requirement.institute.toLowerCase()))) {
          score += 10;
          matchReasons.push(`Institute: ${requirement.institute}`);
          educationMatch = true;
        }
        
        if (educationMatch && !matchReasons.some(r => r.includes('Institute'))) {
          score += 8;
          matchReasons.push('Education qualification match');
        }
      }
      
      // 6. DESIGNATION MATCHING (8 points)
      if (requirement.candidateDesignations && requirement.candidateDesignations.length > 0) {
        const candidateTitle = `${candidate.designation || ''} ${candidate.headline || ''}`.toLowerCase();
        const hasDesignationMatch = requirement.candidateDesignations.some(des => 
          candidateTitle.includes(des.toLowerCase())
        );
        
        if (hasDesignationMatch) {
          score += 8;
          matchReasons.push('Designation match');
        }
      }
      
      // 7. CURRENT COMPANY MATCHING (5 points - bonus for target company exp)
      if (requirement.currentCompany) {
        const candidateExperience = JSON.stringify(candidate.experience || []).toLowerCase();
        const candidateText = `${candidate.headline || ''}`.toLowerCase();
        
        if (candidateExperience.includes(requirement.currentCompany.toLowerCase()) ||
            candidateText.includes(requirement.currentCompany.toLowerCase())) {
          score += 5;
          matchReasons.push(`Worked at: ${requirement.currentCompany}`);
        }
      }
      
      // 8. NOTICE PERIOD MATCHING (4 points)
      if (requirement.noticePeriod && requirement.noticePeriod !== 'Any') {
        const noticePeriodMap = {
          'Immediately': 0,
          'Immediate': 0,
          '15 days': 15,
          '30 days': 30,
          '60 days': 60,
          '90 days': 90
        };
        
        const maxNoticeDays = noticePeriodMap[requirement.noticePeriod];
        const candidateNoticeDays = Number(candidate.notice_period) || 90;
        
        if (maxNoticeDays !== undefined && candidateNoticeDays <= maxNoticeDays) {
          score += 4;
          matchReasons.push(`Notice: ${candidateNoticeDays} days (≤${maxNoticeDays})`);
        }
      }
      
      // 9. PROFILE QUALITY BONUSES (8 points max)
      // Profile completion
      if (candidate.profile_completion >= 90) {
        score += 4;
        matchReasons.push('Complete profile (90%+)');
      } else if (candidate.profile_completion >= 70) {
        score += 2;
      }
      
      // Verification status
      if (candidate.is_email_verified && candidate.is_phone_verified) {
        score += 3;
        matchReasons.push('Verified contact');
      }
      
      // Recent activity
      const daysSinceUpdate = candidate.last_profile_update 
        ? Math.floor((Date.now() - new Date(candidate.last_profile_update).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (daysSinceUpdate <= 30) {
        score += 1;
        matchReasons.push('Recently active');
      }
      
      return { score: Math.min(100, Math.round(score)), matchReasons };
    };
    
    // Fetch ATS scores for candidates
    const candidateIds = finalCandidates.map(c => c.id);
    let atsScoresMap = {};
    
    if (candidateIds.length > 0) {
      try {
        console.log('🔍 Fetching ATS scores for requirement:', id);
        console.log('🔍 Candidate IDs:', candidateIds);
        
        const atsScores = await sequelize.query(`
          SELECT 
            user_id as "userId",
            requirement_id as "requirementId",
            ats_score as "atsScore",
            last_calculated as "lastCalculated"
          FROM candidate_analytics
          WHERE user_id IN (:candidateIds) AND requirement_id = :requirementId
        `, {
          replacements: { candidateIds, requirementId: id },
          type: QueryTypes.SELECT
        });
        
        // Create a map for quick lookup
        atsScores.forEach(score => {
          atsScoresMap[score.userId] = {
            score: score.atsScore,
            lastCalculated: score.lastCalculated,
            requirementId: score.requirementId
          };
        });
        
        console.log('🔍 ATS scores fetched for requirement', id, ':', {
          totalCandidates: candidateIds.length,
          atsScoresFound: atsScores.length,
          atsScoresMap: Object.keys(atsScoresMap).length
        });
        
        // Debug: Log specific ATS scores for known candidates
        console.log('🔍 ATS scores details for debugging:');
        atsScores.forEach(score => {
          console.log(`  - User ${score.userId}: Score ${score.atsScore} for requirement ${score.requirementId} (${score.lastCalculated})`);
        });
        
        // Verify all scores match the current requirement
        const mismatchedScores = atsScores.filter(score => score.requirementId !== id);
        if (mismatchedScores.length > 0) {
          console.log('⚠️ Found ATS scores for different requirements:', mismatchedScores);
        }
        
      } catch (atsError) {
        console.log('⚠️ Could not fetch ATS scores:', atsError.message);
        console.log('🔍 ATS Error details:', atsError);
      }
    }
    
    // Filter candidates to ensure relevance when requirement has specific title
    // IMPORTANT: For requirements with titles like "Instrumentation engineer",
    // only show candidates whose headline matches the requirement title
    let filteredFinalCandidates = finalCandidates;
    
    if (requirement.title && requirement.title.trim().length > 3) {
      const titleWords = requirement.title
        .split(/\s+/)
        .filter(word => word.length > 3)
        .map(word => word.toLowerCase());
      
      if (titleWords.length > 0) {
        // Filter to only candidates whose headline contains requirement title keywords
        const titleMatched = finalCandidates.filter(candidate => {
          const headline = (candidate.headline || '').toLowerCase();
          // Candidate headline must contain at least one significant keyword from requirement title
          return titleWords.some(keyword => headline.includes(keyword));
        });
        
        if (titleMatched.length > 0) {
          filteredFinalCandidates = titleMatched;
          console.log(`🎯 Filtered results: ${titleMatched.length} candidates with title match "${requirement.title}" (removed ${finalCandidates.length - titleMatched.length} irrelevant)`);
        } else {
          // If no title matches, keep all candidates but log warning
          console.warn(`⚠️ No candidates with title match found. Showing all ${finalCandidates.length} candidates`);
        }
      }
    }
    
    // Helper function to convert values to arrays
    const toArray = (value, fallback = []) => {
      if (Array.isArray(value)) return value;
      if (!value) return fallback;
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed : fallback;
      } catch (_) {
        return fallback;
      }
    };
    
    // Fetch education details and work experience for all candidates
    const allCandidateIds = filteredFinalCandidates.map(c => c.id);
    const { Education } = require('../config/index');
    let educationMap = new Map();
    let workExperienceMap = new Map(); // Map of userId -> work experiences
    
    if (allCandidateIds.length > 0) {
      try {
        // Fetch education using raw query with snake_case column names
        const educationResults = await sequelize.query(`
          SELECT 
            id,
            user_id,
            degree,
            institution,
            field_of_study,
            start_date,
            end_date,
            is_current,
            location,
            gpa as cgpa,
            percentage,
            grade,
            relevant_courses
          FROM educations 
          WHERE user_id IN (:allCandidateIds)
          ORDER BY user_id, is_current DESC, end_date DESC NULLS LAST
        `, {
          replacements: { allCandidateIds },
          type: QueryTypes.SELECT
        });
        
        // Group education by user_id
        educationResults.forEach((edu) => {
          const userId = edu.user_id;
          if (!educationMap.has(userId)) {
            educationMap.set(userId, []);
          }
          // Parse relevant_courses if it's a JSON string
          let relevantCourses = [];
          if (edu.relevant_courses) {
            if (typeof edu.relevant_courses === 'string') {
              try {
                relevantCourses = JSON.parse(edu.relevant_courses);
              } catch (e) {
                relevantCourses = [];
              }
            } else if (Array.isArray(edu.relevant_courses)) {
              relevantCourses = edu.relevant_courses;
            }
          }
          
          educationMap.get(userId).push({
            id: edu.id,
            degree: edu.degree,
            institution: edu.institution,
            fieldOfStudy: edu.field_of_study,
            startDate: edu.start_date,
            endDate: edu.end_date,
            isCurrent: edu.is_current || false,
            location: edu.location,
            cgpa: edu.cgpa,
            percentage: edu.percentage,
            grade: edu.grade,
            relevantCourses: relevantCourses
          });
        });
      } catch (eduError) {
        console.warn('⚠️ Could not fetch education details:', eduError?.message || eduError);
      }
      
      // Fetch work experience for all candidates to get current/previous company info
      try {
        const workExpResults = await sequelize.query(`
          SELECT 
            id,
            user_id,
            title,
            company,
            is_current,
            start_date
          FROM work_experiences 
          WHERE user_id IN (:allCandidateIds)
          ORDER BY is_current DESC, start_date DESC
        `, {
          replacements: { allCandidateIds },
          type: QueryTypes.SELECT
        });
        
        // Group work experience by user_id
        workExpResults.forEach((exp) => {
          const userId = exp.user_id;
          if (!workExperienceMap.has(userId)) {
            workExperienceMap.set(userId, []);
          }
          workExperienceMap.get(userId).push(exp);
        });
      } catch (weError) {
        console.warn('⚠️ Could not fetch work experience for company info:', weError?.message || weError);
      }
    }
    
    // Helper function to format education
    const formatEducation = (candidate) => {
      const educations = educationMap.get(candidate.id) || [];
      if (educations.length > 0) {
        const firstEdu = educations[0];
        const parts = [];
        if (firstEdu.degree) parts.push(firstEdu.degree);
        if (firstEdu.institution && firstEdu.institution !== 'Not specified') parts.push(firstEdu.institution);
        return parts.length > 0 ? parts.join(' - ') : 'Not specified';
      }
      if (candidate.highest_education) {
        return candidate.highest_education;
      }
      if (candidate.education && Array.isArray(candidate.education) && candidate.education.length > 0) {
        return candidate.education.map((edu) => edu.degree || edu.course).join(', ');
      }
      return 'Not specified';
    };
    
    // Helper function to combine skills
    const combineSkills = (candidate) => {
      const skills = toArray(candidate.skills, []);
      const keySkills = toArray(candidate.key_skills, []);
      const allSkills = [...new Set([...skills, ...keySkills])];
      return allSkills.filter(s => s && String(s).trim() !== '');
    };
    
    // Transform candidates data for frontend with relevance scoring and ATS scores
    const transformedCandidates = filteredFinalCandidates.map(candidate => {
      const { score, matchReasons } = calculateRelevanceScore(candidate, requirement);
      const atsData = atsScoresMap[candidate.id];
      
      // Only include ATS score if it matches the current requirement
      const validAtsData = atsData && atsData.requirementId === id ? atsData : null;
      
      // Debug: Log ATS data for specific candidates
      if (candidate.id === '4200f403-25dc-4aa6-bcc9-1363adf0ee7b' || candidate.id === '10994ba4-1e33-45c3-b522-2f56a873e1e2') {
        console.log(`🔍 Candidate ${candidate.id} (${candidate.first_name} ${candidate.last_name}) ATS data:`, {
          atsData: atsData,
          validAtsData: validAtsData,
          currentRequirementId: id,
          atsRequirementId: atsData ? atsData.requirementId : 'none',
          atsScore: validAtsData ? validAtsData.score : null,
          atsCalculatedAt: validAtsData ? validAtsData.lastCalculated : null
        });
      }
      
      // Get current and previous company from work experience
      const candidateWorkExps = workExperienceMap.get(candidate.id) || [];
      let currentCompany = candidate.current_company || null;
      let currentDesignation = candidate.current_role || candidate.designation || candidate.headline || null;
      let previousCompany = null;
      
      // Extract from work experience if available
      if (candidateWorkExps.length > 0) {
        const currentExp = candidateWorkExps.find(exp => exp.is_current) || candidateWorkExps[0];
        if (currentExp) {
          if (!currentCompany) currentCompany = currentExp.company;
          if (!currentDesignation) currentDesignation = currentExp.title;
        }
        
        // Get previous company (first non-current experience)
        const previousExp = candidateWorkExps.find(exp => !exp.is_current);
        if (previousExp) {
          previousCompany = previousExp.company;
        }
      }
      
      return {
        id: candidate.id,
        name: `${candidate.first_name} ${candidate.last_name}`,
        designation: candidate.designation || candidate.headline || 'Job Seeker',
        currentDesignation: currentDesignation,
        experience: candidate.experience_years ? `${candidate.experience_years} years` : 'Not specified',
        experienceYears: candidate.experience_years ? Number(candidate.experience_years) : null,
        location: candidate.current_location || 'Not specified',
        education: formatEducation(candidate),
        educationDetails: educationMap.get(candidate.id) || [],
        keySkills: combineSkills(candidate),
        preferredLocations: candidate.preferred_locations && candidate.preferred_locations.length > 0 ? 
          candidate.preferred_locations : 
          (candidate.willing_to_relocate ? ['Open to relocate'] : [candidate.current_location]),
        avatar: candidate.avatar || '/placeholder.svg?height=80&width=80',
        isAttached: true,
        lastModified: candidate.last_profile_update ? 
          new Date(candidate.last_profile_update).toLocaleDateString() : 'Not specified',
        activeStatus: candidate.last_login_at ? 
          new Date(candidate.last_login_at).toLocaleDateString() : 'Not specified',
        additionalInfo: candidate.summary || 'No summary available',
        phoneVerified: candidate.is_phone_verified || false,
        emailVerified: candidate.is_email_verified || false,
        currentSalary: candidate.current_salary ? `${candidate.current_salary} LPA` : 'Not specified',
        expectedSalary: candidate.expected_salary ? `${candidate.expected_salary} LPA` : 'Not specified',
        noticePeriod: candidate.notice_period ? `${candidate.notice_period} days` : 'Not specified',
        profileCompletion: candidate.profile_completion || 0,
        currentCompany: currentCompany,
        previousCompany: previousCompany,
        relevanceScore: score,
        matchReasons: matchReasons,
        atsScore: validAtsData ? validAtsData.score : null,
        atsCalculatedAt: validAtsData ? validAtsData.lastCalculated : null
      };
    });
    
    // Debug: Log final transformed candidates with ATS scores
    console.log('🔍 Final transformed candidates with ATS scores:');
    transformedCandidates.forEach(candidate => {
      if (candidate.id === '4200f403-25dc-4aa6-bcc9-1363adf0ee7b' || candidate.id === '10994ba4-1e33-45c3-b522-2f56a873e1e2') {
        console.log(`  - ${candidate.name} (${candidate.id}): ATS Score ${candidate.atsScore} (${candidate.atsCalculatedAt})`);
      }
    });

    // Enrich transformed candidates with like counts, current employer like status, and viewed status
    try {
      const candidateIds = transformedCandidates.map(c => c.id);
      if (candidateIds.length > 0) {
        const counts = await CandidateLike.findAll({
          attributes: ['candidate_id', [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
          where: { candidate_id: candidateIds },
          group: ['candidate_id']
        });
        const idToCount = new Map(counts.map(r => [r.get('candidate_id'), parseInt(String(r.get('cnt')))]));

        const liked = await CandidateLike.findAll({
          attributes: ['candidate_id'],
          where: { employer_id: req.user.id, candidate_id: candidateIds }
        });
        const likedSet = new Set(liked.map(r => r.get('candidate_id')));

        // Check which candidates have been viewed by this employer
        const { ViewTracking } = require('../config/index');
        const viewedCandidates = await ViewTracking.findAll({
          attributes: ['viewed_user_id'],
          where: {
            viewer_id: req.user.id,
            viewed_user_id: candidateIds,
            view_type: 'profile_view'
          },
          raw: true
        });
        const viewedSet = new Set(viewedCandidates.map(v => v.viewed_user_id));

        transformedCandidates.forEach(c => {
          c.likeCount = idToCount.get(c.id) || 0;
          c.likedByCurrent = likedSet.has(c.id);
          c.isSaved = likedSet.has(c.id); // Alias for consistency
          c.isViewed = viewedSet.has(c.id); // Mark as viewed if profile was viewed
        });
      }
    } catch (likeErr) {
      console.warn('Failed to enrich candidates with like/viewed data:', likeErr?.message || likeErr);
    }
    
    // Sort candidates based on sortBy parameter from query
    const sortByOption = sortBy || 'relevance';
    
    if (sortByOption === 'ats' || sortByOption === 'ats:desc') {
      // Sort by ATS score (highest first), nulls last
      console.log('🔄 Sorting by ATS score (descending)');
      console.log('📊 Candidates before ATS sort:', transformedCandidates.map(c => ({ name: c.name, atsScore: c.atsScore })));
      
      transformedCandidates.sort((a, b) => {
        if (a.atsScore === null && b.atsScore === null) return 0;
        if (a.atsScore === null) return 1;
        if (b.atsScore === null) return -1;
        return b.atsScore - a.atsScore;
      });
      
      console.log('📊 Candidates after ATS sort:', transformedCandidates.map(c => ({ name: c.name, atsScore: c.atsScore })));
    } else if (sortByOption === 'ats:asc') {
      // Sort by ATS score (lowest first), nulls last
      transformedCandidates.sort((a, b) => {
        if (a.atsScore === null && b.atsScore === null) return 0;
        if (a.atsScore === null) return 1;
        if (b.atsScore === null) return -1;
        return a.atsScore - b.atsScore;
      });
    } else {
      // Default: Sort by relevance score (highest first)
    transformedCandidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    
    // Log final results summary
    console.log('\n📊 ========== CANDIDATE MATCHING SUMMARY ==========');
    console.log(`📌 Requirement: ${requirement.title} (ID: ${requirement.id})`);
    console.log(`📌 Applied Filters: ${appliedFilters.length > 0 ? appliedFilters.join(' | ') : 'None (showing all active jobseekers)'}`);
    console.log(`📌 Total Candidates Found: ${finalCount}`);
    console.log(`📌 Page ${pageNum} of ${Math.ceil(finalCount / limitNum)}`);
    console.log(`📌 Showing: ${transformedCandidates.length} candidates`);
    console.log(`📌 Fallback Applied: ${fallbackApplied ? 'Yes (relaxed filters)' : 'No (strict matching)'}`);
    console.log(`📌 Top 5 Candidates by Relevance:`);
    transformedCandidates.slice(0, 5).forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} - Relevance: ${c.relevanceScore}% - ATS: ${c.atsScore || 'N/A'}`);
    });
    console.log('==================================================\n');
    
    return res.status(200).json({
      success: true,
      data: {
        candidates: transformedCandidates,
        requirement: {
          id: requirement.id,
          title: requirement.title,
          totalCandidates: transformedCandidates.length, // Use filtered count
          appliedFilters: appliedFilters,
          fallbackApplied: fallbackApplied
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: transformedCandidates.length, // Use filtered count
          pages: Math.ceil(transformedCandidates.length / limitNum),
          showing: transformedCandidates.length
        },
        metadata: {
          sortBy: sortByOption,
          filtersApplied: appliedFilters.length,
          strictMatches: candidates.length,
          relaxedMatches: fallbackApplied ? (finalCandidates.length - candidates.length) : 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching candidates for requirement:', error);
    console.error('❌ Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      errors: error?.errors
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates',
      error: { 
        name: error?.name, 
        message: error?.message,
        details: error?.errors || error?.stack
      }
    });
  }
});

// Get detailed candidate profile
router.get('/:requirementId/candidates/:candidateId', authenticateToken, async (req, res) => {
  try {
    const { requirementId, candidateId } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers and admins can view candidate profiles.' });
    }
    
    // Check if requirement exists (more flexible check)
    console.log(`🔍 Looking for requirement ${requirementId}`);
    const requirement = await Requirement.findOne({
      where: { id: requirementId }
    });
    
    if (!requirement) {
      console.log(`❌ Requirement not found: ${requirementId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Requirement not found'
      });
    }
    
    // Log requirement details for debugging
    console.log(`✅ Requirement found: ${requirement.title} (Company: ${requirement.companyId})`);
    
    console.log('🔍 Fetching detailed profile for candidate:', candidateId);
    
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
        'current_location', 'headline', 'summary', 'skills', 'key_skills', 'languages',
        'current_salary', 'expected_salary', 'notice_period', 'willing_to_relocate',
        'profile_completion', 'last_login_at', 'last_profile_update',
        'is_email_verified', 'is_phone_verified', 'created_at',
        'date_of_birth', 'gender', 'social_links', 'certifications',
        'highest_education', 'field_of_study', 'experience_years',
        'current_company', 'current_role', 'designation'
      ]
    });
    
    if (!candidate) {
      console.log(`❌ Candidate not found: ${candidateId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Candidate not found',
        details: 'The candidate either does not exist or is not active'
      });
    }
    
    // Get work experience using raw query with correct column names
    let workExperience = [];
    try {
      // Use snake_case column names (actual database columns)
      const workExpResults = await sequelize.query(`
        SELECT 
          id,
          user_id,
          title,
          company,
          description,
          start_date,
          end_date,
          is_current,
          location,
          employment_type,
          skills,
          achievements,
          salary,
          salary_currency
        FROM work_experiences 
        WHERE user_id = :userId 
        ORDER BY is_current DESC, start_date DESC
      `, {
        replacements: { userId: candidateId },
        type: QueryTypes.SELECT
      });
      workExperience = workExpResults || [];
      
      console.log(`💼 Found ${workExperience.length} work experience entries for candidate ${candidateId}`);
      if (workExperience.length > 0) {
        console.log('💼 Sample work experience:', JSON.stringify(workExperience[0], null, 2));
      }
    } catch (expError) {
      console.error('⚠️ Could not fetch work experience:', expError);
      console.error('⚠️ Work experience error details:', expError.message, expError.stack);
      workExperience = [];
    }
    
    // Get education details using raw query with correct column names
    let education = [];
    try {
      // Use snake_case column names (actual database columns)
      const eduResults = await sequelize.query(`
        SELECT 
          id,
          user_id,
          degree,
          institution,
          field_of_study,
          start_date,
          end_date,
          is_current,
          location,
          grade,
          percentage,
          gpa as cgpa,
          description,
          relevant_courses,
          achievements,
          education_type
        FROM educations 
        WHERE user_id = :userId 
        ORDER BY is_current DESC, end_date DESC
      `, {
        replacements: { userId: candidateId },
        type: QueryTypes.SELECT
      });
      education = eduResults || [];
      
      console.log(`🎓 Found ${education.length} education entries for candidate ${candidateId}`);
      if (education.length > 0) {
        console.log('🎓 Sample education:', JSON.stringify(education[0], null, 2));
      }
    } catch (eduError) {
      console.error('⚠️ Could not fetch education:', eduError);
      console.error('⚠️ Education error details:', eduError.message, eduError.stack);
      education = [];
    }
    
    // Get resumes using raw query with correct column names
    let resumes = [];
    try {
      const resumeResults = await sequelize.query(`
            SELECT 
              id,
              user_id as "userId",
              title,
              summary,
          is_primary as "isDefault",
          is_public as "isPublic",
          view_count as "views",
          download_count as "downloads",
          updated_at as "lastUpdated",
          created_at as "createdAt",
          metadata,
          file_url as "fileUrl",
          file_type as "fileType",
          file_size as "fileSize",
          skills
            FROM resumes 
            WHERE user_id = :userId 
        ORDER BY is_primary DESC, created_at DESC
          `, {
            replacements: { userId: candidateId },
            type: QueryTypes.SELECT
          });
      
      resumes = resumeResults || [];
      console.log(`📄 Found ${resumes.length} resumes for candidate ${candidateId}`);
      if (resumes.length > 0) {
        console.log('📄 Sample resume data:', JSON.stringify(resumes[0], null, 2));
      }
    } catch (resumeError) {
      console.log('⚠️ Could not fetch resumes:', resumeError.message);
      resumes = [];
    }
    
    // Fetch cover letters for the candidate
    let coverLetters = [];
    try {
      console.log(`📝 Fetching cover letters for candidate ${candidateId}`);
      const { CoverLetter } = require('../config/index');
      
      // Use raw queries to be resilient to column naming differences
      let coverLetterResults = await sequelize.query(`
        SELECT 
          id,
          "userId",
          title,
          content,
          summary,
          "isDefault",
          "isPublic",
          views,
          downloads,
          "lastUpdated",
          metadata,
          "createdAt",
          "updatedAt"
        FROM cover_letters 
        WHERE "userId" = :userId 
        ORDER BY "isDefault" DESC, "lastUpdated" DESC
      `, {
        replacements: { userId: candidateId },
        type: QueryTypes.SELECT
      });
      if (!coverLetterResults || coverLetterResults.length === 0) {
        const alt = await sequelize.query(`
          SELECT 
            id,
            user_id as "userId",
            title,
            content,
            summary,
            "isDefault",
            "isPublic",
            views,
            downloads,
            last_updated as "lastUpdated",
            metadata,
            createdAt as "createdAt",
            updatedAt as "updatedAt"
          FROM cover_letters 
          WHERE user_id = :userId 
          ORDER BY "isDefault" DESC, "lastUpdated" DESC
        `, {
          replacements: { userId: candidateId },
          type: QueryTypes.SELECT
        });
        coverLetterResults = alt || [];
      }
      coverLetters = coverLetterResults || [];
      console.log(`📝 Found ${coverLetters.length} cover letters for candidate ${candidateId}`);
      if (coverLetters.length > 0) {
        console.log(`📝 First cover letter metadata:`, JSON.stringify(coverLetters[0].metadata, null, 2));
      }
    } catch (coverLetterError) {
      console.log('⚠️ Could not fetch cover letters (primary query):', coverLetterError.message);
      try {
        const coverLetterResults = await sequelize.query(`
          SELECT 
            id,
            user_id as "userId",
            title,
            content,
            summary,
            "isDefault",
            "isPublic",
            views,
            downloads,
            last_updated as "lastUpdated",
            createdAt as "createdAt",
            metadata
          FROM cover_letters 
          WHERE user_id = :userId 
          ORDER BY "isDefault" DESC, "lastUpdated" DESC
        `, {
          replacements: { userId: candidateId },
          type: QueryTypes.SELECT
        });
        coverLetters = coverLetterResults || [];
        console.log(`📝 Found ${coverLetters.length} cover letters for candidate ${candidateId} (fallback)`);
      } catch (altError) {
        console.log('⚠️ Could not fetch cover letters (fallback query):', altError.message);
      }
    }
    
    console.log(`✅ Found detailed profile for candidate: ${candidate.first_name} ${candidate.last_name}`);
    console.log(`📄 Resumes found: ${resumes.length}`);
    console.log(`📝 Cover letters found: ${coverLetters.length}`);
    if (resumes.length > 0) {
      console.log(`📄 First resume metadata:`, JSON.stringify(resumes[0].metadata, null, 2));
      console.log(`📄 First resume full data:`, JSON.stringify(resumes[0], null, 2));
    }
    if (coverLetters.length > 0) {
      console.log(`📝 First cover letter metadata:`, JSON.stringify(coverLetters[0].metadata, null, 2));
    }
    
    // Build absolute URL helper for files served from /uploads
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const toAbsoluteUrl = (maybePath) => {
      if (!maybePath) return null;
      // If it's already an absolute URL, return as is
      if (typeof maybePath === 'string' && /^https?:\/\//i.test(maybePath)) {
        return maybePath;
      }
      // Ensure leading slash
      const pathStr = String(maybePath).startsWith('/') ? String(maybePath) : `/${String(maybePath)}`;
      return `${baseUrl}${pathStr}`;
    };

    // Helpers to make transformations resilient
    const toArray = (value, fallback = []) => {
      if (Array.isArray(value)) return value;
      if (!value) return fallback;
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed : fallback;
      } catch (_) {
        return fallback;
      }
    };
    const safeDateString = (value, defaultLabel = 'Not specified') => {
      if (!value) return defaultLabel;
      const d = new Date(value);
      return isNaN(d.getTime()) ? defaultLabel : d.toLocaleDateString();
    };
    const getProp = (obj, key, defaultVal = null) => (obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultVal);

    // Transform candidate data for frontend
    let transformedCandidate;
    try {
      console.log(`🔄 Starting candidate transformation for ${candidate.first_name} ${candidate.last_name}`);
      console.log(`🔄 Resumes to transform: ${resumes.length}`);
      // Calculate total experience from workExperience array or use experience_years
      const calculateTotalExperience = () => {
        // First try to use experience_years from database
        if (candidate.experience_years !== null && candidate.experience_years !== undefined) {
          const expYears = Number(candidate.experience_years);
          if (!isNaN(expYears) && expYears >= 0) {
            return expYears;
          }
        }
        
        // Fallback: Calculate from workExperience array
        if (Array.isArray(workExperience) && workExperience.length > 0) {
          let totalMonths = 0;
          workExperience.forEach((exp) => {
            const startDate = exp.start_date;
            const endDate = exp.end_date;
            const isCurrent = exp.is_current || false;
            
            if (startDate) {
              try {
                const start = new Date(startDate);
                const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date());
                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                  totalMonths += Math.max(0, months);
                }
              } catch (e) {
                // Ignore invalid dates
              }
            }
          });
          return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal place
        }
        
        return 0;
      };
      
      const totalExperienceYears = calculateTotalExperience();
      const experienceDisplay = totalExperienceYears > 0 
        ? `${totalExperienceYears} ${totalExperienceYears === 1 ? 'year' : 'years'}`
        : 'Fresher';
      
      // Format current salary properly
      const formatCurrentSalary = () => {
        if (candidate.current_salary !== null && candidate.current_salary !== undefined) {
          const salary = Number(candidate.current_salary);
          if (!isNaN(salary) && salary > 0) {
            return `${salary} LPA`;
          }
        }
        return 'Not specified';
      };
      
      transformedCandidate = {
      id: candidate.id,
      name: `${candidate.first_name} ${candidate.last_name}`,
      designation: candidate.headline || candidate.designation || 'Job Seeker',
      experience: experienceDisplay,
      experienceYears: totalExperienceYears, // Add numeric value for calculations and display
      location: candidate.current_location || 'Not specified',
      education: (() => {
        // Get education from education array or highest_education field
        if (Array.isArray(education) && education.length > 0) {
          const firstEdu = education[0];
          return firstEdu.degree || firstEdu.course || firstEdu.fieldOfStudy || 'Not specified';
        }
        if (candidate.highest_education) {
          return candidate.highest_education;
        }
        return 'Not specified';
      })(),
      keySkills: (() => {
        // Combine skills and key_skills arrays
        const skills = toArray(candidate.skills, []);
        const keySkills = toArray(candidate.key_skills, []);
        // Merge and remove duplicates
        const allSkills = [...new Set([...skills, ...keySkills])];
        return allSkills.filter(s => s && String(s).trim() !== '');
      })(),
      preferredLocations: (() => {
        const prefLocs = toArray(candidate.preferred_locations, []);
        if (prefLocs.length > 0) return prefLocs;
        if (candidate.willing_to_relocate) return ['Open to relocate'];
        return [candidate.current_location || 'Not specified'];
      })(),
      avatar: candidate.avatar || '/placeholder.svg?height=120&width=120',
      isAttached: true,
      lastModified: safeDateString(candidate.last_profile_update),
      activeStatus: safeDateString(candidate.last_login_at),
      additionalInfo: candidate.summary || 'No summary available',
      phoneVerified: candidate.is_phone_verified || false,
      emailVerified: candidate.is_email_verified || false,
      currentSalary: formatCurrentSalary(),
      expectedSalary: candidate.expected_salary ? `${candidate.expected_salary} LPA` : 'Not specified',
      noticePeriod: candidate.notice_period ? `${candidate.notice_period} days` : 'Not specified',
      profileCompletion: candidate.profile_completion || 0,
      
      // Contact information
      email: candidate.email,
      phone: candidate.phone,
      linkedin: getProp(candidate.social_links || {}, 'linkedin', null),
      github: getProp(candidate.social_links || {}, 'github', null),
      portfolio: getProp(candidate.social_links || {}, 'portfolio', null),
      
      // Detailed information
      about: candidate.summary || 'No summary available',
      
      // Work experience - use actual database column names from query
      workExperience: toArray(workExperience, []).map(exp => {
        const startDate = exp.start_date;
        const endDate = exp.end_date;
        const isCurrent = exp.is_current || false;
        const startDateStr = startDate ? safeDateString(startDate) : 'Not specified';
        const endDateStr = isCurrent ? 'Present' : (endDate ? safeDateString(endDate) : 'Not specified');
        
        // Parse skills if it's a JSON string
        let skillsArray = [];
        if (exp.skills) {
          if (typeof exp.skills === 'string') {
            try {
              skillsArray = JSON.parse(exp.skills);
            } catch (e) {
              skillsArray = [exp.skills];
            }
          } else if (Array.isArray(exp.skills)) {
            skillsArray = exp.skills;
          }
        }
        
        // Parse achievements if it's a JSON string
        let achievementsArray = [];
        if (exp.achievements) {
          if (typeof exp.achievements === 'string') {
            try {
              achievementsArray = JSON.parse(exp.achievements);
            } catch (e) {
              achievementsArray = [];
            }
          } else if (Array.isArray(exp.achievements)) {
            achievementsArray = exp.achievements;
          }
        }
        
        return {
          id: exp.id || `exp_${Math.random()}`,
          title: exp.title || 'Not specified',
          company: exp.company || 'Not specified',
          duration: `${startDateStr} - ${endDateStr}`,
          startDate: startDate,
          endDate: endDate,
          isCurrent: isCurrent,
          location: exp.location || 'Not specified',
          description: exp.description || '',
          skills: toArray(skillsArray, []),
          employmentType: exp.employment_type || 'full-time',
          salary: exp.salary ? `${exp.salary} ${exp.salary_currency || 'INR'}` : null,
          achievements: toArray(achievementsArray, [])
        };
      }),
      
      // Education details - include highest_education and field_of_study from user profile
      educationDetails: (() => {
        const eduArray = toArray(education, []);
        // If no education details from educations table but user has highest_education/field_of_study, create entry
        if (eduArray.length === 0 && (candidate.highest_education || candidate.field_of_study)) {
          return [{
            id: 'profile_education',
            degree: candidate.highest_education || 'Not specified',
            institution: 'Not specified',
            fieldOfStudy: candidate.field_of_study || 'Not specified',
            duration: 'Not specified',
            location: 'Not specified',
            grade: null,
            percentage: null,
            cgpa: null
          }];
        }
        return eduArray.map(edu => {
          // Format degree name properly
          const formatDegree = (degreeStr) => {
            if (!degreeStr || degreeStr.toLowerCase() === 'not specified') return '';
            const deg = String(degreeStr).trim();
            const degLower = deg.toLowerCase();
            
            // Map common variations
            const degreeMappings = {
              'bachelor': "Bachelor's Degree",
              'bachelors': "Bachelor's Degree",
              'btech': 'B.Tech',
              'b.tech': 'B.Tech',
              'be': 'B.E.',
              'b.e.': 'B.E.',
              'bsc': 'B.Sc',
              'b.sc': 'B.Sc',
              'ba': 'B.A.',
              'b.a.': 'B.A.',
              'master': "Master's Degree",
              'masters': "Master's Degree",
              'mtech': 'M.Tech',
              'm.tech': 'M.Tech',
              'me': 'M.E.',
              'm.e.': 'M.E.',
              'msc': 'M.Sc',
              'm.sc': 'M.Sc',
              'ma': 'M.A.',
              'm.a.': 'M.A.',
              'mba': 'MBA',
              'phd': 'Ph.D',
              'ph.d': 'Ph.D',
              'diploma': 'Diploma',
              'certification': 'Certification'
            };
            
            // Check exact match
            if (degreeMappings[degLower]) {
              return degreeMappings[degLower];
            }
            
            // Check if contains any key
            for (const [key, value] of Object.entries(degreeMappings)) {
              if (degLower.includes(key)) {
                return value;
              }
            }
            
            // Capitalize properly
            return deg.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
          };
          
          const degreeValue = edu.degree || candidate.highest_education || '';
          const formattedDegree = formatDegree(degreeValue);
          const institutionValue = edu.institution || '';
          const fieldOfStudyValue = edu.field_of_study || candidate.field_of_study || '';
          const locationValue = edu.location || '';
          
          // Build duration string
          let startYear = '';
          let endYear = '';
          if (edu.start_date) {
            try {
              const startDate = new Date(edu.start_date);
              if (!isNaN(startDate.getTime())) {
                startYear = startDate.getFullYear();
              }
            } catch (e) {
              // Ignore invalid dates
            }
          }
          if (edu.end_date) {
            try {
              const endDate = new Date(edu.end_date);
              if (!isNaN(endDate.getTime())) {
                endYear = endDate.getFullYear();
              }
            } catch (e) {
              // Ignore invalid dates
            }
          } else if (edu.is_current) {
            endYear = 'Present';
          }
          const durationStr = startYear && endYear ? `${startYear} - ${endYear}` : (startYear ? `${startYear} - Present` : '');
          
          // Parse relevant courses if it's a JSON string
          let relevantCourses = [];
          if (edu.relevant_courses) {
            if (typeof edu.relevant_courses === 'string') {
              try {
                relevantCourses = JSON.parse(edu.relevant_courses);
              } catch (e) {
                relevantCourses = [];
              }
            } else if (Array.isArray(edu.relevant_courses)) {
              relevantCourses = edu.relevant_courses;
            }
          }
          
          return {
            id: edu.id || `edu_${Math.random()}`,
            degree: formattedDegree,
            institution: institutionValue,
            fieldOfStudy: fieldOfStudyValue,
            duration: durationStr,
            location: locationValue,
            grade: edu.grade || null,
            percentage: edu.percentage || null,
            cgpa: edu.cgpa || null,
            relevantCourses: relevantCourses
          };
        });
      })(),
      
      // Certifications
      certifications: toArray(candidate.certifications, []),
      
      // Languages
      languages: toArray(candidate.languages, [
        { name: "English", proficiency: "Professional" },
        { name: "Hindi", proficiency: "Native" }
      ]),
      
      // Resume information - return API endpoints instead of absolute file paths
      resumes: (() => {
        try {
          const resumeArray = toArray(resumes, []);
          console.log(`🔄 Transforming ${resumeArray.length} resumes`);
          console.log(`🔄 First resume before transform - isDefault: ${resumeArray[0]?.isDefault}, is_primary: ${resumeArray[0]?.is_primary}`);
          return resumeArray.map((resume, index) => {
            const metadata = resume.metadata || {};
            const filename = metadata.originalName || metadata.filename || `${candidate.first_name}_${candidate.last_name}_Resume.pdf`;
            const fileSize = metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size';
            const viewUrl = `/api/requirements/${requirement.id}/candidates/${candidate.id}/resume/${resume.id}/view`;
            const downloadUrl = `/api/requirements/${requirement.id}/candidates/${candidate.id}/resume/${resume.id}/download`;
            
            // Determine if this is the default resume - check multiple possible field names
            // Backend orders by is_primary DESC, so first resume (index 0) should be default
            const isDefaultResume = resume.isDefault === true || 
                                    resume.isDefault === 'true' || 
                                    resume.is_primary === true || 
                                    resume.is_primary === 'true' ||
                                    (index === 0 && resume.is_primary !== false && resume.is_primary !== 'false'); // First resume if ordered by is_primary DESC
            
            const transformedResume = {
              id: resume.id,
              title: resume.title || 'Resume',
              filename: filename,
              fileSize: fileSize,
              uploadDate: resume.createdAt || resume.created_at,
              lastUpdated: resume.lastUpdated || resume.updated_at,
              isDefault: isDefaultResume, // Use camelCase for frontend
              is_default: isDefaultResume, // Also include snake_case for backward compatibility
              isPublic: resume.isPublic ?? resume.is_public ?? true,
              views: resume.views || resume.view_count || 0,
              downloads: resume.downloads || resume.download_count || 0,
              summary: resume.summary || '',
              skills: resume.skills || [],
              viewUrl,
              downloadUrl,
              fileUrl: downloadUrl,
              metadata: resume.metadata || {}
            };
            
            console.log(`📄 Transformed resume [${index}]:`, transformedResume.id, 'isDefault:', transformedResume.isDefault);
            return transformedResume;
          });
        } catch (resumeErr) {
          console.error('❌ Resume transformation error:', resumeErr);
          return [];
        }
      })(),
      
      // Cover letter information - return API endpoints instead of absolute file paths
      coverLetters: (() => {
        try {
          const coverLetterArray = toArray(coverLetters, []);
          console.log(`🔄 Transforming ${coverLetterArray.length} cover letters`);
          return coverLetterArray.map(coverLetter => {
            const metadata = coverLetter.metadata || {};
            const filename = metadata.originalName || metadata.filename || `${candidate.first_name}_${candidate.last_name}_CoverLetter.pdf`;
            const fileSize = metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size';
            const downloadUrl = `/api/cover-letters/${coverLetter.id}/download`;
            
            const transformedCoverLetter = {
              id: coverLetter.id,
              title: coverLetter.title || 'Cover Letter',
              content: coverLetter.content || '',
              summary: coverLetter.summary || '',
              filename: filename,
              fileSize: fileSize,
              uploadDate: coverLetter.createdAt || coverLetter.createdAt,
              lastUpdated: coverLetter.lastUpdated || coverLetter.last_updated,
              is_default: coverLetter.isDefault ?? coverLetter.is_default ?? false,
              isPublic: coverLetter.isPublic ?? coverLetter.is_public ?? true,
              downloadUrl,
              fileUrl: downloadUrl,
              metadata: metadata
            };
            
            console.log(`📝 Transformed cover letter:`, transformedCoverLetter);
            return transformedCoverLetter;
          });
        } catch (coverLetterErr) {
          console.error('❌ Cover letter transformation error:', coverLetterErr);
          return [];
        }
      })()
      };
      
      console.log(`📄 Transformed candidate resumes:`, JSON.stringify(transformedCandidate.resumes, null, 2));
      console.log(`📝 Transformed candidate cover letters:`, JSON.stringify(transformedCandidate.coverLetters, null, 2));
    } catch (transformErr) {
      console.warn('⚠️ Candidate transform failed, returning minimal profile:', transformErr?.message || transformErr);
      transformedCandidate = {
        id: candidate.id,
        name: `${candidate.first_name} ${candidate.last_name}`,
        designation: candidate.headline || 'Job Seeker',
        avatar: candidate.avatar || '/placeholder.svg?height=120&width=120',
        email: candidate.email,
        phone: candidate.phone,
        keySkills: [],
        preferredLocations: [candidate.current_location || 'Not specified'],
        location: candidate.current_location || 'Not specified',
        experience: 'Not specified',
        education: 'Not specified',
        about: candidate.summary || 'No summary available',
        workExperience: [],
        educationDetails: [],
        certifications: [],
        languages: [
          { name: 'English', proficiency: 'Professional' }
        ],
        resumes: (() => {
          try {
            const resumeArray = toArray(resumes, []);
            return resumeArray.map((resume, index) => {
              const metadata = resume.metadata || {};
              const filename = metadata.originalName || metadata.filename || `${candidate.first_name}_${candidate.last_name}_Resume.pdf`;
              const fileSize = metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size';
              const viewUrl = `/api/requirements/${requirement.id}/candidates/${candidate.id}/resume/${resume.id}/view`;
              const downloadUrl = `/api/requirements/${requirement.id}/candidates/${candidate.id}/resume/${resume.id}/download`;
              
              // Determine if this is the default resume - check multiple possible field names
              // Backend orders by is_primary DESC, so first resume (index 0) should be default
              const isDefaultResume = resume.isDefault === true || 
                                      resume.isDefault === 'true' || 
                                      resume.is_primary === true || 
                                      resume.is_primary === 'true' ||
                                      (index === 0 && resume.is_primary !== false && resume.is_primary !== 'false'); // First resume if ordered by is_primary DESC
              
              return {
                id: resume.id,
                title: resume.title || 'Resume',
                filename: filename,
                fileSize: fileSize,
                uploadDate: resume.createdAt || resume.created_at,
                lastUpdated: resume.lastUpdated || resume.updated_at,
                isDefault: isDefaultResume, // Use camelCase for frontend
                is_default: isDefaultResume, // Also include snake_case for backward compatibility
                isPublic: resume.isPublic ?? resume.is_public ?? true,
                views: resume.views || resume.view_count || 0,
                downloads: resume.downloads || resume.download_count || 0,
                summary: resume.summary || '',
                skills: resume.skills || [],
                viewUrl,
                downloadUrl,
                fileUrl: downloadUrl,
                metadata: resume.metadata || {}
              };
            });
          } catch (resumeErr) {
            console.error('❌ Fallback resume transformation error:', resumeErr);
            return [];
          }
        })(),
        coverLetters: (() => {
          try {
            const coverLetterArray = toArray(coverLetters, []);
            return coverLetterArray.map(coverLetter => {
              const metadata = coverLetter.metadata || {};
              const filename = metadata.originalName || metadata.filename || `${candidate.first_name}_${candidate.last_name}_CoverLetter.pdf`;
              const fileSize = metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size';
              const downloadUrl = `/api/cover-letters/${coverLetter.id}/download`;
              
              return {
                id: coverLetter.id,
                title: coverLetter.title || 'Cover Letter',
                content: coverLetter.content || '',
                summary: coverLetter.summary || '',
                filename: filename,
                fileSize: fileSize,
                uploadDate: coverLetter.createdAt || coverLetter.createdAt,
                lastUpdated: coverLetter.lastUpdated || coverLetter.last_updated,
                is_default: coverLetter.isDefault ?? coverLetter.is_default ?? false,
                isPublic: coverLetter.isPublic ?? coverLetter.is_public ?? true,
                downloadUrl,
                fileUrl: downloadUrl,
                metadata: metadata
              };
            });
          } catch (coverLetterErr) {
            console.error('❌ Fallback cover letter transformation error:', coverLetterErr);
            return [];
          }
        })()
      };
    }
    
    // Check if candidate is already shortlisted for this requirement
    let isShortlisted = false;
    try {
      const { JobApplication } = require('../config/index');
      const existingShortlist = await JobApplication.findOne({
        where: {
          user_id: candidateId,
          employer_id: req.user.id,
          source: 'requirement_shortlist'
        }
      });
      
      if (existingShortlist && existingShortlist.metadata) {
        try {
          const metadata = typeof existingShortlist.metadata === 'string' 
            ? JSON.parse(existingShortlist.metadata) 
            : existingShortlist.metadata;
          isShortlisted = metadata.requirementId === requirementId && existingShortlist.status === 'shortlisted';
        } catch (parseError) {
          console.warn('⚠️ Could not parse metadata for shortlist check:', parseError.message);
        }
      }
    } catch (shortlistError) {
      console.warn('⚠️ Could not check shortlist status:', shortlistError.message);
    }
    
    // Add shortlist status to candidate data
    transformedCandidate.isShortlisted = isShortlisted;
    
    // Track profile view for this requirement (if not already tracked)
    try {
      const ViewTrackingService = require('../services/viewTrackingService');
      await ViewTrackingService.trackView({
        viewerId: req.user.id,
        viewedUserId: candidateId,
        jobId: requirementId, // Store requirementId in jobId field for tracking
        viewType: 'profile_view',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID,
        referrer: req.get('Referer'),
        metadata: {
          source: 'requirement_candidate_profile',
          requirementId: requirementId,
          requirementTitle: requirement.title
        }
      });
      console.log(`✅ Profile view tracked for candidate ${candidateId} from requirement ${requirementId}`);
    } catch (viewError) {
      console.warn('⚠️ Failed to track profile view:', viewError?.message || viewError);
      // Don't fail the request if view tracking fails
    }
    
    return res.status(200).json({
      success: true,
      data: {
        candidate: transformedCandidate,
        requirement: {
          id: requirement.id,
          title: requirement.title
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching candidate profile:', error);
    console.error('❌ Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      errors: error?.errors
    });

    // Fallback: try to return a minimal candidate profile to avoid blocking the UI
    try {
      const { requirementId, candidateId } = req.params || {};
      let requirement = null;
      try {
        requirement = await Requirement.findByPk(requirementId);
      } catch (_) {}

      let candidate = null;
      try {
        candidate = await User.findByPk(candidateId, {
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'avatar', 'current_location', 'headline', 'summary']
        });
      } catch (_) {}

      if (candidate) {
        return res.status(200).json({
          success: true,
          data: {
            candidate: {
              id: candidate.id,
              name: `${candidate.first_name} ${candidate.last_name}`,
              designation: candidate.headline || 'Job Seeker',
              avatar: candidate.avatar || '/placeholder.svg?height=120&width=120',
              email: candidate.email,
              phone: candidate.phone,
              location: candidate.current_location || 'Not specified',
              about: candidate.summary || 'No summary available',
              keySkills: [],
              preferredLocations: [candidate.current_location || 'Not specified'],
              workExperience: [],
              educationDetails: [],
              projects: [],
              certifications: [],
              languages: [
                { name: 'English', proficiency: 'Professional' }
              ],
              resumes: []
            },
            requirement: requirement ? { id: requirement.id, title: requirement.title } : null
          }
        });
      }
    } catch (fallbackErr) {
      console.warn('⚠️ Minimal fallback also failed:', fallbackErr?.message || fallbackErr);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate profile',
      error: { 
        name: error?.name, 
        message: error?.message,
        details: error?.errors || error?.stack
      }
    });
  }
});

// Shortlist/Unshortlist candidate
router.post('/:requirementId/candidates/:candidateId/shortlist', authenticateToken, async (req, res) => {
  try {
    const { requirementId, candidateId } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers and admins can shortlist candidates.' });
    }
    
    // Verify the requirement belongs to the employer's company
    const requirement = await Requirement.findOne({
      where: { 
        id: requirementId,
        companyId: req.user.companyId || req.user.companyId
      }
    });
    
    if (!requirement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Requirement not found or access denied'
      });
    }
    
    // Verify candidate exists
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
    
    // Create a virtual job application for this requirement shortlisting
    // This allows the candidate to appear in the shortlisted page
    const { JobApplication, Job } = require('../config/index');
    
    // Check if there's already a shortlist entry for this candidate and requirement
    // Use raw query for metadata search since Sequelize doesn't handle nested JSON queries well
    const existingShortlist = await JobApplication.findOne({
      where: {
        user_id: candidateId,
        employer_id: req.user.id,
        source: 'requirement_shortlist'
      }
    });
    
    // Check if the metadata contains the requirementId
    let isExistingForRequirement = false;
    if (existingShortlist && existingShortlist.metadata) {
      try {
        const metadata = typeof existingShortlist.metadata === 'string' 
          ? JSON.parse(existingShortlist.metadata) 
          : existingShortlist.metadata;
        isExistingForRequirement = metadata.requirementId === requirementId;
      } catch (parseError) {
        console.warn('⚠️ Could not parse metadata:', parseError.message);
      }
    }
    
    if (existingShortlist && isExistingForRequirement) {
      // Toggle shortlist status
      const previousStatus = existingShortlist.status;
      const newStatus = previousStatus === 'shortlisted' ? 'applied' : 'shortlisted';
      await existingShortlist.update({ 
        status: newStatus,
        updated_at: new Date()
      });
      
      console.log(`✅ Candidate ${candidateId} ${newStatus === 'shortlisted' ? 'shortlisted' : 'unshortlisted'} by employer ${req.user.id} for requirement ${requirementId}`);
      
      // Handle notifications based on status change
      try {
        const NotificationService = require('../services/notificationService');
        
        if (newStatus === 'shortlisted') {
          // Send notification when shortlisting
          await NotificationService.sendShortlistingNotification(
            candidateId,
            req.user.id,
            null, // jobId (not applicable for requirements)
            requirementId,
            {
              applicationId: existingShortlist.id,
              requirementTitle: requirement.title,
              companyName: req.user.company?.name || 'Unknown Company'
            }
          );
          console.log(`✅ Shortlisting notification sent to candidate ${candidateId}`);
        } else if (newStatus === 'applied' && previousStatus === 'shortlisted') {
          // Remove notification when unshortlisting
          await NotificationService.removeShortlistingNotification(
            candidateId,
            req.user.id,
            null, // jobId (not applicable for requirements)
            requirementId,
            {
              applicationId: existingShortlist.id,
              requirementTitle: requirement.title,
              companyName: req.user.company?.name || 'Unknown Company'
            }
          );
          console.log(`✅ Shortlisting notification removed for candidate ${candidateId}`);
        }
      } catch (notificationError) {
        console.error('Failed to handle shortlisting notification:', notificationError);
        // Don't fail the shortlisting if notification fails
      }
      
      return res.status(200).json({
        success: true,
        message: newStatus === 'shortlisted' ? 'Candidate shortlisted successfully' : 'Candidate removed from shortlist',
        data: {
          candidateId,
          requirementId,
          shortlisted: newStatus === 'shortlisted',
          status: newStatus
        }
      });
    } else {
      // Find or create a placeholder job for requirement-based shortlisting
      let placeholderJob = await Job.findOne({
        where: {
          companyId: req.user.companyId || req.user.companyId,
          title: 'Requirement Shortlist'
        }
      });

      if (!placeholderJob) {
        // Create a placeholder job for requirement-based shortlisting
        placeholderJob = await Job.create({
          title: 'Requirement Shortlist',
          slug: 'requirement-shortlist-' + Date.now(),
          description: 'Placeholder job for requirement-based candidate shortlisting',
          companyId: req.user.companyId || req.user.companyId,
          employerId: req.user.id,
          location: 'Remote',
          status: 'draft',
          isPlaceholder: true
        });
      }

      // Check if application already exists, if so update it, otherwise create new one
      const [shortlistApplication, created] = await JobApplication.findOrCreate({
        where: {
          userId: candidateId,
          jobId: placeholderJob.id
        },
        defaults: {
          employerId: req.user.id,
          status: 'shortlisted',
          source: 'requirement_shortlist',
          appliedAt: new Date(),
          lastUpdatedAt: new Date(),
          metadata: {
            requirementId: requirementId,
            requirementTitle: requirement.title,
            shortlistedFrom: 'requirements'
          }
        }
      });

      // If application already existed, update its status to shortlisted
      if (!created) {
        await shortlistApplication.update({
          status: 'shortlisted',
          lastUpdatedAt: new Date(),
          metadata: {
            ...shortlistApplication.metadata,
            requirementId: requirementId,
            requirementTitle: requirement.title,
            shortlistedFrom: 'requirements'
          }
        });
      }
      
      console.log(`✅ Candidate ${candidateId} shortlisted by employer ${req.user.id} for requirement ${requirementId}`);

      // Log candidate shortlisting activity
      try {
        const EmployerActivityService = require('../services/employerActivityService');
        await EmployerActivityService.logCandidateShortlist(
          req.user.id,
          candidateId,
          {
            requirementId: requirementId,
            applicationId: shortlistApplication.id,
            jobId: placeholderJob.id,
            requirementTitle: requirement.title,
            candidateName: candidate.first_name + ' ' + candidate.last_name,
            companyName: req.user.company?.name || 'Unknown Company'
          }
        );
      } catch (activityError) {
        console.error('Failed to log candidate shortlisting activity:', activityError);
        // Don't fail the shortlisting if activity logging fails
      }

      // Send notification to candidate
      try {
        const NotificationService = require('../services/notificationService');
        await NotificationService.sendShortlistingNotification(
          candidateId,
          req.user.id,
          null, // jobId (not applicable for requirements)
          requirementId,
          {
            applicationId: shortlistApplication.id,
            requirementTitle: requirement.title,
            companyName: req.user.company?.name || 'Unknown Company'
          }
        );
        console.log(`✅ Shortlisting notification sent to candidate ${candidateId}`);
      } catch (notificationError) {
        console.error('Failed to send shortlisting notification:', notificationError);
        // Don't fail the shortlisting if notification fails
      }
      
      return res.status(200).json({
        success: true,
        message: 'Candidate shortlisted successfully',
        data: {
          candidateId,
          requirementId,
          shortlisted: true,
          applicationId: shortlistApplication.id
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error shortlisting candidate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to shortlist candidate',
      error: { 
        name: error?.name, 
        message: error?.message
      }
    });
  }
});

// Contact candidate
router.post('/:requirementId/candidates/:candidateId/contact', authenticateToken, async (req, res) => {
  try {
    const { requirementId, candidateId } = req.params;
    const { message, subject } = req.body;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers and admins can contact candidates.' });
    }
    
    // Verify the requirement belongs to the employer's company
    const requirement = await Requirement.findOne({
      where: { 
        id: requirementId,
        companyId: req.user.companyId 
      }
    });
    
    if (!requirement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Requirement not found or access denied'
      });
    }
    
    // Verify candidate exists
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
    
    // Create or find conversation between employer and candidate
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant1Id: req.user.id, participant2Id: candidateId },
          { participant1Id: candidateId, participant2Id: req.user.id }
        ],
        conversationType: 'general'
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participant1Id: req.user.id,
        participant2Id: candidateId,
        conversationType: 'general',
        title: `Job Opportunity: ${requirement.title}`,
        metadata: {
          requirementId: requirementId,
          jobTitle: requirement.title,
          companyName: requirement.company?.name || 'Company'
        }
      });
    }

    // Create the message
    const messageContent = `Subject: ${subject || 'Job Opportunity'}\n\n${message || 'No message provided'}`;
    
    const newMessage = await Message.create({
      conversationId: conversation.id,
      senderId: req.user.id,
      receiverId: candidateId,
      messageType: 'text',
      content: messageContent,
      metadata: {
        requirementId: requirementId,
        jobTitle: requirement.title,
        companyName: requirement.company?.name || 'Company',
        originalSubject: subject || 'Job Opportunity'
      }
    });

    // Update conversation with last message info
    await conversation.update({
      lastMessageId: newMessage.id,
      lastMessageAt: new Date(),
      unreadCount: sequelize.literal('unread_count + 1')
    });

    console.log(`✅ Message sent to candidate ${candidateId} by employer ${req.user.id} for requirement ${requirementId}`);
    console.log(`📧 Subject: ${subject || 'Job Opportunity'}`);
    console.log(`📧 Message: ${message || 'No message provided'}`);
    console.log(`💬 Conversation ID: ${conversation.id}, Message ID: ${newMessage.id}`);
    
    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        conversationId: conversation.id,
        messageId: newMessage.id,
        candidateId,
        requirementId,
        employer_id: req.user.id,
        subject: subject || 'Job Opportunity',
        message: message || 'No message provided'
      }
    });
    
  } catch (error) {
    console.error('❌ Error contacting candidate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send contact request',
      error: { 
        name: error?.name, 
        message: error?.message
      }
    });
  }
});

// View candidate resume (for employers) - increment view count and log activity
router.get('/:requirementId/candidates/:candidateId/resume/:resumeId/view', attachTokenFromQuery, authenticateToken, async (req, res) => {
  try {
    const { requirementId, candidateId, resumeId } = req.params;
    
    // Check if user is an employer
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only employers can view candidate resumes.' 
      });
    }
    
    // Verify requirement: admins can access any requirement; employers must own it
    const requirement = await Requirement.findOne({
      where: req.user.user_type === 'admin' 
        ? { id: requirementId }
        : { id: requirementId, companyId: req.user.companyId }
    });
    
    if (!requirement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Requirement not found or access denied'
      });
    }
    
    // Get the resume
    const resume = await Resume.findOne({
      where: { 
        id: resumeId,
        userId: candidateId
      }
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    // Increment view count
    await resume.update({
      views: resume.views + 1
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
            candidateId: candidateId,
            requirementId: requirementId
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
        candidateId,
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requirementId: requirementId
        }
      );
    } catch (activityError) {
      console.error('Failed to log resume view activity:', activityError);
      // Don't fail the view if activity logging fails
    }
    
    // Get file path for serving the PDF
    const metadata = resume.metadata || {};
    const filename = metadata.filename || metadata.originalName || `resume-${resume.id}.pdf`;
    const originalName = metadata.originalName || filename;
    
    console.log('🔍 Resume metadata:', JSON.stringify(metadata, null, 2));
    console.log('🔍 Filename from metadata:', filename);
    
    // Try to find the file
    let filePath = null;
    const possiblePaths = [
      metadata.filePath,
      metadata.fileUrl,
      path.join(__dirname, '../uploads/resumes', filename),
      path.join(__dirname, '../uploads', filename),
      path.join(process.cwd(), 'uploads/resumes', filename),
      path.join(process.cwd(), 'uploads', filename),
      path.join(process.cwd(), 'server/uploads/resumes', filename),
      path.join(process.cwd(), 'server/uploads', filename),
      `/tmp/uploads/resumes/${filename}`,
      `/tmp/uploads/${filename}`,
      `/var/tmp/uploads/resumes/${filename}`,
      `/var/tmp/uploads/${filename}`
    ];
    
    // Check each possible path
    for (const testPath of possiblePaths) {
      if (testPath && fs.existsSync(testPath)) {
        filePath = testPath;
        break;
      }
    }
    
    if (!filePath) {
      console.log('❌ File does not exist in any of the expected locations');
      console.log('🔍 Checked paths:', possiblePaths);
      // Fallback: redirect to stored public path if present
      if (metadata.filePath) {
        return res.redirect(metadata.filePath);
      }
      // Try to find the file by searching common directories
      const searchDirs = [
        path.join(__dirname, '../uploads'),
        path.join(process.cwd(), 'uploads'),
        path.join(process.cwd(), 'server', 'uploads'),
        '/tmp/uploads',
        '/var/tmp/uploads'
      ];
      for (const searchDir of searchDirs) {
        try {
          if (fs.existsSync(searchDir)) {
            const files = fs.readdirSync(searchDir, { recursive: true });
            const found = files.find(f => typeof f === 'string' && f.includes(filename));
            if (found) {
              filePath = path.join(searchDir, found);
              break;
            }
          }
        } catch (error) {
          console.log(`🔍 Could not search in ${searchDir}:`, error.message);
        }
      }
      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: 'Resume file not found on server. The file may have been lost during server restart. Please ask the candidate to re-upload their resume.',
          code: 'FILE_NOT_FOUND'
        });
      }
    }
    
    console.log('✅ File found at:', filePath);
    
    // Set headers for PDF viewing (inline display)
    res.setHeader('Content-Disposition', `inline; filename="${originalName || filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send file
    console.log('📤 Sending file for view:', filePath);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error viewing resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to view resume',
      error: error.message
    });
  }
});

// Helper to attach token from query when Authorization header is missing
function attachTokenFromQuery(req, _res, next) {
  try {
    const qToken = req.query && (req.query.token || req.query.access_token);
    console.log('🔍 attachTokenFromQuery - Query token:', qToken ? 'Present' : 'Missing');
    console.log('🔍 attachTokenFromQuery - Existing auth header:', req.headers?.authorization ? 'Present' : 'Missing');
    
    if (!req.headers?.authorization && qToken) {
      req.headers.authorization = `Bearer ${qToken}`;
      console.log('✅ attachTokenFromQuery - Added token to headers');
    }
  } catch (error) {
    console.error('❌ attachTokenFromQuery error:', error);
  }
  next();
}

// Download candidate resume (for employers)
router.get('/:requirementId/candidates/:candidateId/resume/:resumeId/download', attachTokenFromQuery, authenticateToken, async (req, res) => {
  try {
    const { requirementId, candidateId, resumeId } = req.params;
    console.log('🔍 Download request - requirementId:', requirementId, 'candidateId:', candidateId, 'resumeId:', resumeId);
    console.log('🔍 Download request - user:', req.user?.email, req.user?.user_type);
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      console.log('❌ Download request - Access denied for user type:', req.user.user_type);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only employers and admins can download candidate resumes.' 
      });
    }
    
    // Verify requirement: admins can access any requirement; employers must own it
    const requirement = await Requirement.findOne({
      where: req.user.user_type === 'admin' 
        ? { id: requirementId }
        : { id: requirementId, companyId: req.user.companyId }
    });
    
    if (!requirement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Requirement not found or access denied'
      });
    }
    
    // Get the resume
    console.log('🔍 Looking for resume with ID:', resumeId, 'for candidate:', candidateId);
    const resume = await Resume.findOne({
      where: { 
        id: resumeId,
        userId: candidateId
      }
    });
    
    if (!resume) {
      console.log('❌ Resume not found for ID:', resumeId, 'candidate:', candidateId);
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    console.log('✅ Resume found:', resume.id, 'filename:', resume.metadata?.filename);
    console.log('🔍 Full resume data:', JSON.stringify(resume.dataValues, null, 2));
    const metadata = resume.metadata || {};
    console.log('🔍 Resume metadata:', JSON.stringify(metadata, null, 2));
    const filename = metadata.filename || metadata.originalName || metadata.original_name || `resume-${resume.id}.pdf`;
    const originalName = metadata.originalName || metadata.original_name || filename;
    
    console.log('🔍 Filename resolved:', filename);
    console.log('🔍 Original name resolved:', originalName);
    
    // Try multiple possible file paths
    let filePath;
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
      metadata.filePath ? path.join(process.cwd(), metadata.filePath.replace(/^\//, '')) : null,
      metadata.filePath ? path.join('/', metadata.filePath.replace(/^\//, '')) : null,
      // Direct metadata filePath
      metadata.filePath ? metadata.filePath : null,
      // Public URL path
      metadata.filename ? `/uploads/resumes/${metadata.filename}` : null
    ].filter(Boolean);

    console.log('🔍 Trying possible file paths:', possiblePaths);
    
    // Find the first existing file
    filePath = possiblePaths.find(p => fs.existsSync(p));
    
    if (!filePath) {
      console.log('❌ File does not exist in any of the expected locations');
      console.log('🔍 Checked paths:', possiblePaths);
      // Fallback: redirect to stored public path if present
      if (metadata.filePath) {
        return res.redirect(metadata.filePath);
      }
      // Try to find the file by searching common directories
      const searchDirs = [
        path.join(__dirname, '../uploads'),
        path.join(process.cwd(), 'uploads'),
        path.join(process.cwd(), 'server', 'uploads'),
        '/tmp/uploads',
        '/var/tmp/uploads'
      ];
      for (const searchDir of searchDirs) {
        try {
          if (fs.existsSync(searchDir)) {
            const files = fs.readdirSync(searchDir, { recursive: true });
            const found = files.find(f => typeof f === 'string' && f.includes(filename));
            if (found) {
              filePath = path.join(searchDir, found);
              break;
            }
          }
        } catch (error) {
          console.log(`🔍 Could not search in ${searchDir}:`, error.message);
        }
      }
      if (!filePath) {
        console.log('⚠️ IMPORTANT: File not found - Render free tier ephemeral storage issue');
        console.log('📋 Filename sought:', filename);
        console.log('💡 Solution: Re-upload resume OR migrate to cloud storage');
        return res.status(404).json({
          success: false,
          message: 'Resume file not found. On Render free tier, uploaded files are stored in ephemeral storage and are deleted when the server restarts. Please re-upload the resume or migrate to cloud storage (AWS S3, Cloudinary) for production.',
          code: 'FILE_NOT_FOUND',
          filename: filename,
          technicalNote: 'Render free tier uses ephemeral filesystem'
        });
      }
    }
    
    console.log('✅ File found at:', filePath);
    
    // Increment download count
    await resume.update({
      downloads: resume.downloads + 1
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
            candidateId: candidateId,
            requirementId: requirementId
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
        candidateId,
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requirementId: requirementId
        }
      );
    } catch (activityError) {
      console.error('Failed to log resume download activity:', activityError);
      // Don't fail the download if activity logging fails
    }
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName || filename}"`);
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
    
    // Send file
    console.log('📤 Sending file:', filePath);
    res.sendFile(filePath);
  } catch (error) {
    console.error('❌ Error downloading candidate resume:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to download resume',
      error: error.message
    });
  }
});

// ATS Calculate endpoint - STREAMING VERSION - Calculate ATS scores one by one
router.post('/:id/calculate-ats', authenticateToken, async (req, res) => {
  try {
    const requirementId = req.params.id;
    const { candidateIds, page = 1, limit = 50, processAll = false } = req.body;
    
    console.log(`🎯 ATS calculation requested for requirement ${requirementId}`);
    console.log(`📄 Pagination params: page=${page}, limit=${limit}, processAll=${processAll}`);
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can calculate ATS scores.'
      });
    }
    
    // Verify requirement ownership
    const requirement = await Requirement.findOne({
      where: req.user.user_type === 'admin' 
        ? { id: requirementId }
        : { id: requirementId, companyId: req.user.companyId }
    });
    
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found or access denied'
      });
    }
    
    // Get candidates for this requirement with proper filtering
    let targetCandidateIds = candidateIds;
    let totalCandidates = 0;
    let hasMorePages = false;
    
    if (!targetCandidateIds || targetCandidateIds.length === 0) {
      console.log('📋 Fetching candidates matching this specific requirement...');
      
      // Build comprehensive requirement matching criteria
      const whereConditions = {
        user_type: 'jobseeker',
        account_status: 'active',
        is_active: true
      };
      
      // Add skill matching if requirement has specific skills
      if (requirement.keySkills && requirement.keySkills.length > 0) {
        console.log('🎯 Matching candidates with required skills:', requirement.keySkills);
        whereConditions.skills = {
          [Op.overlap]: requirement.keySkills
        };
      }
      
      // Add location matching if requirement specifies locations
      if (requirement.candidateLocations && requirement.candidateLocations.length > 0) {
        console.log('📍 Matching candidates in locations:', requirement.candidateLocations);
        whereConditions[Op.or] = [
          { current_location: { [Op.iLike]: { [Op.any]: requirement.candidateLocations.map(loc => `%${loc}%`) } } },
          { willing_to_relocate: true }
        ];
      }
      
      // Add experience matching if specified
      if (requirement.experienceMin || requirement.experienceMax) {
        const expConditions = {};
        if (requirement.experienceMin) expConditions[Op.gte] = requirement.experienceMin;
        if (requirement.experienceMax) expConditions[Op.lte] = requirement.experienceMax;
        whereConditions.experience_years = expConditions;
      }
      
      console.log('🔍 Requirement matching criteria:', JSON.stringify(whereConditions, null, 2));
      
      // Get total count for pagination
      totalCandidates = await User.count({
        where: whereConditions
      });
      
      console.log(`📊 Total candidates matching requirement criteria: ${totalCandidates}`);
      
      if (totalCandidates === 0) {
        console.log('⚠️ No candidates match requirement criteria, using relaxed fallback...');
        // Relaxed fallback - remove strict skill matching
        const relaxedConditions = {
          user_type: 'jobseeker',
          account_status: 'active',
          is_active: true
        };
        
        totalCandidates = await User.count({
          where: relaxedConditions
        });
        
        const allCandidates = await User.findAll({
          where: relaxedConditions,
          attributes: ['id'],
          limit: parseInt(limit),
          offset: (page - 1) * limit,
          order: [['created_at', 'DESC']]
        });
        
        targetCandidateIds = allCandidates.map(c => c.id);
        hasMorePages = (page * limit) < totalCandidates;
        
        console.log(`📄 Using relaxed criteria: ${targetCandidateIds.length} candidates`);
      } else {
        if (processAll) {
          // Process all candidates with pagination
          const offset = (page - 1) * limit;
          const candidates = await User.findAll({
            where: whereConditions,
            attributes: ['id'],
            limit: parseInt(limit),
            offset: offset,
            order: [['created_at', 'DESC']]
          });
          
          targetCandidateIds = candidates.map(c => c.id);
          hasMorePages = offset + candidates.length < totalCandidates;
          
          console.log(`📄 Processing page ${page}: ${targetCandidateIds.length} candidates (${offset + 1}-${offset + targetCandidateIds.length} of ${totalCandidates})`);
        } else {
          // Process only current page
          const candidates = await User.findAll({
            where: whereConditions,
            attributes: ['id'],
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            order: [['created_at', 'DESC']]
          });
          
          targetCandidateIds = candidates.map(c => c.id);
          hasMorePages = (page * limit) < totalCandidates;
          
          console.log(`📄 Processing page ${page}: ${targetCandidateIds.length} candidates`);
        }
      }
    } else {
      // Specific candidates provided - validate they match requirement
      console.log('🎯 Validating provided candidates against requirement...');
      const validatedCandidates = await User.findAll({
        where: {
          id: { [Op.in]: candidateIds },
          user_type: 'jobseeker',
          account_status: 'active',
          is_active: true
        },
        attributes: ['id']
      });
      
      targetCandidateIds = validatedCandidates.map(c => c.id);
      totalCandidates = targetCandidateIds.length;
      
      console.log(`✅ Validated ${targetCandidateIds.length} candidates for ATS calculation`);
    }
    
    if (targetCandidateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No candidates found for this requirement'
      });
    }
    
    console.log(`📊 Starting STREAMING ATS calculation for ${targetCandidateIds.length} candidates`);
    
    // Return immediately with streaming configuration
    return res.status(200).json({
      success: true,
      message: 'ATS calculation started - streaming mode',
      data: {
        streaming: true,
        totalCandidates: targetCandidateIds.length,
        candidateIds: targetCandidateIds,
        requirementId: requirementId,
        status: 'started',
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          totalCandidates,
          hasMorePages,
          processed: targetCandidateIds.length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ ATS calculate error:', error);
    return res.status(500).json({
      success: false,
      message: 'ATS calculation failed',
      error: error.message
    });
  }
});

// Individual Candidate ATS Calculation Endpoint - For Streaming
router.post('/:requirementId/calculate-candidate-ats/:candidateId', authenticateToken, async (req, res) => {
  try {
    const { requirementId, candidateId } = req.params;
    
    console.log(`🎯 Individual ATS calculation: ${candidateId} for requirement ${requirementId}`);
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can calculate ATS scores.'
      });
    }
    
    // Verify requirement ownership
    const requirement = await Requirement.findOne({
      where: req.user.user_type === 'admin' 
        ? { id: requirementId }
        : { id: requirementId, companyId: req.user.companyId }
    });
    
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found or access denied'
      });
    }
    
    // Verify candidate exists and is active
    const candidate = await User.findOne({
      where: {
        id: candidateId,
        user_type: 'jobseeker',
        account_status: 'active',
        is_active: true
      }
    });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found or inactive'
      });
    }
    
    // Import ATS service
    const atsService = require('../services/atsService');
    
    // Calculate ATS score for this specific candidate
    console.log(`🚀 Calculating ATS score for candidate ${candidateId}...`);
    
    let atsResult;
    try {
      atsResult = await atsService.calculateATSScore(candidateId, requirementId);
      console.log(`📊 ATS service returned:`, {
        hasResult: !!atsResult,
        candidateId: atsResult?.candidateId,
        requirementId: atsResult?.requirementId,
        atsScore: atsResult?.atsScore,
        hasAnalysis: !!atsResult?.analysis
      });
    } catch (atsError) {
      console.error('❌ ATS service error:', atsError);
      throw atsError;
    }
    
    if (atsResult && atsResult.atsScore !== undefined) {
      console.log(`✅ ATS score calculated for ${candidateId}: ${atsResult.atsScore}`);
      
      return res.status(200).json({
        success: true,
        message: 'ATS score calculated successfully',
        data: {
          candidateId: candidateId,
          requirementId: requirementId,
          atsScore: atsResult.atsScore,
          atsAnalysis: atsResult.analysis,
          calculatedAt: atsResult.calculatedAt || new Date().toISOString(),
          candidate: {
            id: candidate.id,
            name: `${candidate.first_name} ${candidate.last_name}`,
            designation: candidate.designation || candidate.headline || 'Job Seeker'
          }
        }
      });
    } else {
      console.log(`❌ ATS calculation failed for ${candidateId}: Invalid result structure`);
      
      return res.status(500).json({
        success: false,
        message: 'ATS calculation failed for this candidate',
        data: {
          candidateId: candidateId,
          requirementId: requirementId,
          error: 'Invalid ATS calculation result'
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Individual ATS calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Individual ATS calculation failed',
      error: error.message
    });
  }
});

module.exports = router;
