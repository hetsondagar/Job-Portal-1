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
const { Resume } = require('../config/index');

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
            industry: body.industry || 'Other',
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

        // Attach to user for future requests and set as admin (since they created the company)
        await req.user.update({ 
          companyId: companyRecord.id,
          user_type: 'admin' // User becomes admin when they create a company
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
      metadata: body.metadata || {}
    });

    console.log('✅ Requirement created with id:', requirement.id);

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
      order: [['createdAt', 'DESC']] 
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
    
    // Get total candidates count for this requirement
    const { User } = require('../config/index');
    const { sequelize } = require('../config/sequelize');
    
    // Build the same query as in candidates endpoint to get accurate count
    let whereClause = {
      user_type: 'jobseeker',
      is_active: true,
      account_status: 'active'
    };
    
    // Add location filter
    if (requirement.location && requirement.location.trim()) {
      whereClause.current_location = {
        [sequelize.Op.iLike]: `%${requirement.location.trim()}%`
      };
    }
    
    // Add experience filter
    if (requirement.experienceMin || requirement.experienceMax) {
      whereClause.experience_years = {};
      if (requirement.experienceMin) {
        whereClause.experience_years[sequelize.Op.gte] = requirement.experienceMin;
      }
      if (requirement.experienceMax) {
        whereClause.experience_years[sequelize.Op.lte] = requirement.experienceMax;
      }
    }
    
    // Add salary filter
    if (requirement.salaryMin || requirement.salaryMax) {
      whereClause.expected_salary = {};
      if (requirement.salaryMin) {
        whereClause.expected_salary[sequelize.Op.gte] = requirement.salaryMin;
      }
      if (requirement.salaryMax) {
        whereClause.expected_salary[sequelize.Op.lte] = requirement.salaryMax;
      }
    }
    
    // Get total candidates count
    const totalCandidates = await User.count({
      where: whereClause
    });
    
    // Get accessed candidates count from ViewTracking
    // For now, we'll get a simple count of all candidate views by this employer
    // In a more sophisticated implementation, this would filter by the same criteria as the requirement
    const { ViewTracking } = require('../config/index');
    const accessedCandidates = await ViewTracking.count({
      where: {
        viewerId: req.user.id,
        // ViewTracking.viewType enum allows: 'job_view', 'profile_view', 'company_view'
        // Use 'profile_view' to represent candidate profile views
        view_type: 'profile_view'
      }
    });
    
    // Get CV access left (this would come from subscription/usage data)
    // For now, we'll use a placeholder - in real implementation this would be from subscription service
    const cvAccessLeft = 100; // This should be fetched from subscription/usage service
    
    res.json({
      success: true,
      data: {
        totalCandidates,
        accessedCandidates,
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
    
    // Build search criteria based on requirement - intelligent matching
    const whereClause = {
      user_type: 'jobseeker',
      is_active: true,
      account_status: 'active'
    };
    
    // Build matching conditions - candidates must match at least one requirement field
    const matchingConditions = [];
    
    // 1. Location matching
    if (requirement.candidateLocations && requirement.candidateLocations.length > 0) {
      const locationConditions = requirement.candidateLocations.map(location => ({
        current_location: { [Op.iLike]: `%${location}%` }
      }));
      locationConditions.push({ willing_to_relocate: true }); // Include candidates willing to relocate
      matchingConditions.push({ [Op.or]: locationConditions });
    }
    
    // 2. Skills matching (if requirement has skills)
    if (requirement.skills && requirement.skills.length > 0) {
      // Match JSONB contains OR text search on JSONB columns to be more forgiving
      const skillConditions = requirement.skills.flatMap(skill => ([
        { skills: { [Op.contains]: [skill] } },
        { key_skills: { [Op.contains]: [skill] } },
        sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${skill}%` })
      ]));
      matchingConditions.push({ [Op.or]: skillConditions });
    }
    
    // 3. Key skills matching (higher priority)
    if (requirement.keySkills && requirement.keySkills.length > 0) {
      const keySkillConditions = requirement.keySkills.flatMap(skill => ([
        { key_skills: { [Op.contains]: [skill] } },
        { skills: { [Op.contains]: [skill] } },
        sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${skill}%` })
      ]));
      matchingConditions.push({ [Op.or]: keySkillConditions });
    }
    
    // 4. Education matching
    if (requirement.education) {
      matchingConditions.push({
        [Op.or]: [
          { headline: { [Op.iLike]: `%${requirement.education}%` } },
          { summary: { [Op.iLike]: `%${requirement.education}%` } }
        ]
      });
    }
    
    // 5. Job type matching (based on headline/summary)
    if (requirement.jobType) {
      matchingConditions.push({
        [Op.or]: [
          { headline: { [Op.iLike]: `%${requirement.jobType}%` } },
          { summary: { [Op.iLike]: `%${requirement.jobType}%` } }
        ]
      });
    }
    
    // If we have matching conditions, apply them
    if (matchingConditions.length > 0) {
      whereClause[Op.or] = matchingConditions;
    }
    
    // Add search query if provided (additional filtering)
    if (search) {
      const searchConditions = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { headline: { [Op.iLike]: `%${search}%` } },
        { summary: { [Op.iLike]: `%${search}%` } }
      ];
      
      if (whereClause[Op.or]) {
        whereClause[Op.and] = [
          { [Op.or]: whereClause[Op.or] },
          { [Op.or]: searchConditions }
        ];
        delete whereClause[Op.or];
      } else {
        whereClause[Op.or] = searchConditions;
      }
    }
    
    console.log('🔍 Final where clause:', JSON.stringify(whereClause, null, 2));
    
    // Determine sort order - simplified
    let orderClause = [['createdAt', 'DESC']]; // Default sort by creation date
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (isNaN(pageNum) ? 0 : (pageNum - 1)) * (isNaN(limitNum) ? 50 : limitNum);
    
    // Fetch candidates
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
        'is_email_verified', 'is_phone_verified', 'createdAt'
      ]
    });
    
    console.log(`✅ Found ${count} candidates matching requirement criteria`);

    // Fallback: if no candidates found, relax filters to show recent jobseekers to avoid empty UI
    let finalCandidates = candidates;
    let finalCount = count;
    if (finalCount === 0) {
      console.warn('⚠️ No candidates matched strict filters. Applying relaxed search fallback.');
      const relaxed = await User.findAndCountAll({
        where: { user_type: 'jobseeker', is_active: true, account_status: 'active' },
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset,
        attributes: [
          'id', 'first_name', 'last_name', 'email', 'phone', 'avatar',
          'current_location', 'headline', 'summary', 'skills', 'key_skills', 'languages',
          'current_salary', 'expected_salary', 'notice_period', 'willing_to_relocate',
          'experience_years', 'preferred_locations', 'education', 'designation',
          'profile_completion', 'last_login_at', 'last_profile_update',
          'is_email_verified', 'is_phone_verified', 'createdAt'
        ]
      });
      finalCandidates = relaxed.rows;
      finalCount = relaxed.count;
    }
    
    // Calculate relevance score for each candidate
    const calculateRelevanceScore = (candidate, requirement) => {
      let score = 0;
      let matchReasons = [];
      
      // Location matching (20 points)
      if (requirement.candidateLocations && requirement.candidateLocations.length > 0) {
        const candidateLocation = candidate.current_location?.toLowerCase() || '';
        const hasLocationMatch = requirement.candidateLocations.some(loc => 
          candidateLocation.includes(loc.toLowerCase())
        );
        if (hasLocationMatch) {
          score += 20;
          matchReasons.push('Location match');
        } else if (candidate.willing_to_relocate) {
          score += 10;
          matchReasons.push('Willing to relocate');
        }
      }
      
      // Skills matching (30 points)
      if (requirement.skills && requirement.skills.length > 0 && candidate.skills) {
        const candidateSkills = candidate.skills || [];
        const matchingSkills = requirement.skills.filter(skill => 
          candidateSkills.includes(skill)
        );
        if (matchingSkills.length > 0) {
          score += Math.min(30, matchingSkills.length * 10);
          matchReasons.push(`${matchingSkills.length} skill(s) match`);
        }
      }
      
      // Key skills matching (40 points - higher priority)
      if (requirement.keySkills && requirement.keySkills.length > 0 && candidate.skills) {
        const candidateSkills = candidate.skills || [];
        const matchingKeySkills = requirement.keySkills.filter(skill => 
          candidateSkills.includes(skill)
        );
        if (matchingKeySkills.length > 0) {
          score += Math.min(40, matchingKeySkills.length * 15);
          matchReasons.push(`${matchingKeySkills.length} key skill(s) match`);
        }
      }
      
      // Education matching (15 points)
      if (requirement.education) {
        const candidateText = `${candidate.headline || ''} ${candidate.summary || ''}`.toLowerCase();
        if (candidateText.includes(requirement.education.toLowerCase())) {
          score += 15;
          matchReasons.push('Education match');
        }
      }
      
      // Job type matching (10 points)
      if (requirement.jobType) {
        const candidateText = `${candidate.headline || ''} ${candidate.summary || ''}`.toLowerCase();
        if (candidateText.includes(requirement.jobType.toLowerCase())) {
          score += 10;
          matchReasons.push('Job type match');
        }
      }
      
      // Profile completion bonus (5 points)
      if (candidate.profile_completion > 80) {
        score += 5;
        matchReasons.push('Complete profile');
      }
      
      return { score, matchReasons };
    };
    
    // Transform candidates data for frontend with relevance scoring
    const transformedCandidates = finalCandidates.map(candidate => {
      const { score, matchReasons } = calculateRelevanceScore(candidate, requirement);
      
      return {
        id: candidate.id,
        name: `${candidate.first_name} ${candidate.last_name}`,
        designation: candidate.designation || candidate.headline || 'Job Seeker',
        experience: candidate.experience_years ? `${candidate.experience_years} years` : 'Not specified',
        location: candidate.current_location || 'Not specified',
        education: candidate.education && candidate.education.length > 0 ? 
          candidate.education.map(edu => edu.degree || edu.course).join(', ') : 'Not specified',
        keySkills: candidate.key_skills || candidate.skills || [],
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
        relevanceScore: score,
        matchReasons: matchReasons
      };
    });

    // Enrich transformed candidates with like counts and current employer like status
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

        transformedCandidates.forEach(c => {
          c.likeCount = idToCount.get(c.id) || 0;
          c.likedByCurrent = likedSet.has(c.id);
        });
      }
    } catch (likeErr) {
      console.warn('Failed to enrich candidates with like data:', likeErr?.message || likeErr);
    }
    
    // Sort candidates by relevance score (highest first)
    transformedCandidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return res.status(200).json({
      success: true,
      data: {
        candidates: transformedCandidates,
        requirement: {
          id: requirement.id,
          title: requirement.title,
          totalCandidates: count
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
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
        'current_location', 'headline', 'summary', 'skills', 'languages',
        'expected_salary', 'notice_period', 'willing_to_relocate',
        'profile_completion', 'last_login_at', 'last_profile_update',
        'is_email_verified', 'is_phone_verified', 'createdAt',
        'date_of_birth', 'gender', 'social_links', 'certifications'
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
    
    // Get work experience using raw query to avoid model field name issues
    let workExperience = [];
    try {
      const workExpResults = await sequelize.query(`
        SELECT * FROM work_experiences 
        WHERE "userId" = :userId 
        ORDER BY "startDate" DESC
      `, {
        replacements: { userId: candidateId },
        type: QueryTypes.SELECT
      });
      workExperience = workExpResults || [];
    } catch (expError) {
      console.log('⚠️ Could not fetch work experience:', expError.message);
    }
    
    // Get education details using raw query
    let education = [];
    try {
      const eduResults = await sequelize.query(`
        SELECT * FROM educations 
        WHERE "userId" = :userId 
        ORDER BY "endDate" DESC
      `, {
        replacements: { userId: candidateId },
        type: QueryTypes.SELECT
      });
      education = eduResults || [];
    } catch (eduError) {
      console.log('⚠️ Could not fetch education:', eduError.message);
    }
    
    // Get resumes using raw query; handle different column naming conventions (userId vs user_id)
    let resumes = [];
    try {
      let resumeResults = await sequelize.query(`
        SELECT 
          id,
          "userId",
          title,
          summary,
          "isDefault",
          "isPublic",
          views,
          downloads,
          "lastUpdated",
          "createdAt",
          metadata
        FROM resumes 
        WHERE "userId" = :userId 
        ORDER BY "isDefault" DESC, "createdAt" DESC
      `, {
        replacements: { userId: candidateId },
        type: QueryTypes.SELECT
      });
      
      // If no rows and perhaps column isn't camel-cased, try snake_case variant
      if (!resumeResults || resumeResults.length === 0) {
        try {
          resumeResults = await sequelize.query(`
            SELECT 
              id,
              user_id as "userId",
              title,
              summary,
              "isDefault",
              "isPublic",
              views,
              downloads,
              last_updated as "lastUpdated",
              createdAt as "createdAt",
              metadata
            FROM resumes 
            WHERE user_id = :userId 
            ORDER BY "isDefault" DESC, "createdAt" DESC
          `, {
            replacements: { userId: candidateId },
            type: QueryTypes.SELECT
          });
        } catch (altErr) {
          console.log('⚠️ Fallback resume query failed:', altErr.message);
        }
      }
      resumes = resumeResults || [];
      console.log(`📄 Found ${resumes.length} resumes for candidate ${candidateId}`);
      if (resumes.length > 0) {
        console.log('📄 Sample resume data:', JSON.stringify(resumes[0], null, 2));
      }
    } catch (resumeError) {
      console.log('⚠️ Could not fetch resumes (primary query):', resumeError.message);
      try {
        const resumeResults = await sequelize.query(`
          SELECT 
            id,
            user_id as "userId",
            title,
            summary,
            "isDefault",
            "isPublic",
            views,
            downloads,
            last_updated as "lastUpdated",
            createdAt as "createdAt",
            metadata
          FROM resumes 
          WHERE user_id = :userId 
          ORDER BY "isDefault" DESC, "createdAt" DESC
        `, {
          replacements: { userId: candidateId },
          type: QueryTypes.SELECT
        });
        resumes = resumeResults || [];
        console.log(`📄 Found ${resumes.length} resumes for candidate ${candidateId} (fallback)`);
      } catch (altError) {
        console.log('⚠️ Could not fetch resumes (fallback query):', altError.message);
      }
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
      transformedCandidate = {
      id: candidate.id,
      name: `${candidate.first_name} ${candidate.last_name}`,
      designation: candidate.headline || 'Job Seeker',
      experience: (Array.isArray(workExperience) && workExperience.length > 0) ? 'Experienced' : 'Fresher',
      location: candidate.current_location || 'Not specified',
      education: (Array.isArray(education) && education.length > 0) ? (education[0].degree || 'Not specified') : 'Not specified',
      keySkills: toArray(candidate.skills, []),
      preferredLocations: candidate.willing_to_relocate ? ['Open to relocate'] : [candidate.current_location || 'Not specified'],
      avatar: candidate.avatar || '/placeholder.svg?height=120&width=120',
      isAttached: true,
      lastModified: safeDateString(candidate.last_profile_update),
      activeStatus: safeDateString(candidate.last_login_at),
      additionalInfo: candidate.summary || 'No summary available',
      phoneVerified: candidate.is_phone_verified || false,
      emailVerified: candidate.is_email_verified || false,
      currentSalary: 'Not specified',
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
      
      // Work experience
      workExperience: toArray(workExperience, []).map(exp => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        duration: `${safeDateString(exp.start_date)} - ${exp.end_date ? safeDateString(exp.end_date) : 'Present'}`,
        location: exp.location,
        description: exp.description,
        skills: toArray(exp.skills, [])
      })),
      
      // Education details
      educationDetails: toArray(education, []).map(edu => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        fieldOfStudy: edu.field_of_study,
        duration: `${(new Date(edu.start_date)).getFullYear?.() ? new Date(edu.start_date).getFullYear() : ''} - ${edu.end_date ? (new Date(edu.end_date)).getFullYear?.() ? new Date(edu.end_date).getFullYear() : '' : 'Present'}`,
        location: edu.location || 'Not specified',
        grade: edu.grade,
        percentage: edu.percentage,
        cgpa: edu.gpa
      })),
      
      // Projects (mock for now - would need a projects table)
      projects: [
        {
          id: 1,
          title: "Sample Project",
          description: "This is a sample project. In a real implementation, this would come from a projects table in the database.",
          technologies: toArray(candidate.skills, []).slice(0, 4),
          github: getProp(candidate.social_links || {}, 'github', null),
          live: getProp(candidate.social_links || {}, 'portfolio', null)
        }
      ],
      
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
          return resumeArray.map(resume => {
            const metadata = resume.metadata || {};
            const filename = metadata.originalName || metadata.filename || `${candidate.first_name}_${candidate.last_name}_Resume.pdf`;
            const fileSize = metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size';
            const viewUrl = `/api/requirements/${requirement.id}/candidates/${candidate.id}/resume/${resume.id}/view`;
            const downloadUrl = `/api/requirements/${requirement.id}/candidates/${candidate.id}/resume/${resume.id}/download`;
            
            const transformedResume = {
              id: resume.id,
              title: resume.title || 'Resume',
              filename: filename,
              fileSize: fileSize,
              uploadDate: resume.createdAt || resume.createdAt,
              lastUpdated: resume.lastUpdated || resume.last_updated,
              is_default: resume.isDefault ?? resume.is_default ?? false,
              viewUrl,
              downloadUrl,
              fileUrl: downloadUrl
            };
            
            console.log(`📄 Transformed resume:`, transformedResume);
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
        projects: [],
        certifications: [],
        languages: [
          { name: 'English', proficiency: 'Professional' }
        ],
        resumes: (() => {
          try {
            const resumeArray = toArray(resumes, []);
            return resumeArray.map(resume => {
              const metadata = resume.metadata || {};
              const filename = metadata.originalName || metadata.filename || `${candidate.first_name}_${candidate.last_name}_Resume.pdf`;
              const fileSize = metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size';
              const viewUrl = `/api/requirements/${requirement.id}/candidates/${candidate.id}/resume/${resume.id}/view`;
              const downloadUrl = `/api/requirements/${requirement.id}/candidates/${candidate.id}/resume/${resume.id}/download`;
              
              return {
                id: resume.id,
                title: resume.title || 'Resume',
                filename: filename,
                fileSize: fileSize,
                uploadDate: resume.createdAt || resume.createdAt,
                lastUpdated: resume.lastUpdated || resume.last_updated,
                is_default: resume.isDefault ?? resume.is_default ?? false,
                viewUrl,
                downloadUrl,
                fileUrl: downloadUrl
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
      const newStatus = existingShortlist.status === 'shortlisted' ? 'applied' : 'shortlisted';
      await existingShortlist.update({ 
        status: newStatus,
        updated_at: new Date()
      });
      
      console.log(`✅ Candidate ${candidateId} ${newStatus === 'shortlisted' ? 'shortlisted' : 'unshortlisted'} by employer ${req.user.id} for requirement ${requirementId}`);
      
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
router.get('/:requirementId/candidates/:candidateId/resume/:resumeId/view', authenticateToken, async (req, res) => {
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
        [Op.or]: [
          { userId: candidateId },
          { user_id: candidateId }
        ]
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
    
    res.json({
      success: true,
      message: 'Resume view logged successfully',
      data: {
        resumeId: resume.id,
        views: resume.views
      }
    });
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
    if (!req.headers?.authorization && qToken) {
      req.headers.authorization = `Bearer ${qToken}`;
    }
  } catch (_) {}
  next();
}

// Download candidate resume (for employers)
router.get('/:requirementId/candidates/:candidateId/resume/:resumeId/download', attachTokenFromQuery, authenticateToken, async (req, res) => {
  try {
    const { requirementId, candidateId, resumeId } = req.params;
    
    // Check if user is an employer or admin
    if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
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
    const resume = await Resume.findOne({
      where: { 
        id: resumeId,
        [Op.or]: [
          { userId: candidateId },
          { user_id: candidateId }
        ]
      }
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    const metadata = resume.metadata || {};
    const filename = metadata.filename;
    const originalName = metadata.originalName || metadata.original_name || `resume-${resume.id}.pdf`;
    
    if (!filename) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }
    
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
        return res.status(404).json({
          success: false,
          message: 'Resume file not found on server. The file may have been lost during server restart. Please ask the candidate to re-upload their resume.',
          code: 'FILE_NOT_FOUND'
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
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading candidate resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download resume'
    });
  }
});

module.exports = router;
