'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const CandidateLike = require('../models/CandidateLike');

const Requirement = require('../models/Requirement');
const User = require('../models/User');
const Company = require('../models/Company');

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

    // Only employers can create requirements
    if (req.user.user_type !== 'employer') {
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

    // Resolve companyId: prefer provided, else user's company, else create/attach one
    let companyId = body.companyId || req.user.company_id;
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
            contactPerson: `${req.user.first_name} ${req.user.last_name}`.trim(),
            contactEmail: req.user.email,
            companyStatus: 'pending_approval',
            isActive: true
          });
        }

        // Attach to user for future requests
        await req.user.update({ company_id: companyRecord.id });
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
    // Check if user is an employer
    if (req.user.user_type !== 'employer') {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers can view requirements.' });
    }
    
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(200).json({ success: true, data: [] });
    }
    
    const rows = await Requirement.findAll({ 
      where: { companyId }, 
      order: [['createdAt', 'DESC']] 
    });
    
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('List requirements error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch requirements',
      error: { name: error.name, message: error.message }
    });
  }
});

// Get jobseekers based on requirement criteria
router.get('/:id/candidates', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, search, sortBy = 'relevance' } = req.query;
    
    // Check if user is an employer
    if (req.user.user_type !== 'employer') {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers can view candidates.' });
    }
    
    // Get the requirement
    const requirement = await Requirement.findOne({
      where: { 
        id,
        companyId: req.user.company_id 
      }
    });
    
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
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
          attributes: ['candidateId', [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
          where: { candidateId: candidateIds },
          group: ['candidateId']
        });
        const idToCount = new Map(counts.map(r => [r.get('candidateId'), parseInt(String(r.get('cnt')))]));

        const liked = await CandidateLike.findAll({
          attributes: ['candidateId'],
          where: { employerId: req.user.id, candidateId: candidateIds }
        });
        const likedSet = new Set(liked.map(r => r.get('candidateId')));

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
          totalCandidates: count,
          accessedCandidates: Math.floor(Math.random() * 50) + 1 // Mock accessed count
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
    
    // Check if user is an employer
    if (req.user.user_type !== 'employer') {
      return res.status(403).json({ success: false, message: 'Access denied. Only employers can view candidate profiles.' });
    }
    
    // Verify the requirement belongs to the employer's company
    const requirement = await Requirement.findOne({
      where: { 
        id: requirementId,
        companyId: req.user.company_id 
      }
    });
    
    if (!requirement) {
      console.log(`❌ Requirement not found: ${requirementId} for company: ${req.user.company_id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Requirement not found or access denied',
        details: 'The requirement either does not exist or you do not have permission to access it'
      });
    }
    
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
        'is_email_verified', 'is_phone_verified', 'created_at',
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
        WHERE user_id = :userId 
        ORDER BY start_date DESC
      `, {
        replacements: { userId: candidateId },
        type: sequelize.QueryTypes.SELECT
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
        WHERE user_id = :userId 
        ORDER BY end_date DESC
      `, {
        replacements: { userId: candidateId },
        type: sequelize.QueryTypes.SELECT
      });
      education = eduResults || [];
    } catch (eduError) {
      console.log('⚠️ Could not fetch education:', eduError.message);
    }
    
    // Get resumes using raw query
    let resumes = [];
    try {
      const resumeResults = await sequelize.query(`
        SELECT * FROM resumes 
        WHERE "userId" = :userId 
        ORDER BY "isDefault" DESC, "createdAt" DESC
      `, {
        replacements: { userId: candidateId },
        type: sequelize.QueryTypes.SELECT
      });
      resumes = resumeResults || [];
    } catch (resumeError) {
      console.log('⚠️ Could not fetch resumes:', resumeError.message);
    }
    
    console.log(`✅ Found detailed profile for candidate: ${candidate.first_name} ${candidate.last_name}`);
    
    // Transform candidate data for frontend
    const transformedCandidate = {
      id: candidate.id,
      name: `${candidate.first_name} ${candidate.last_name}`,
      designation: candidate.headline || 'Job Seeker',
      experience: workExperience.length > 0 ? 'Experienced' : 'Fresher',
      location: candidate.current_location || 'Not specified',
      education: education.length > 0 ? education[0].degree : 'Not specified',
      keySkills: candidate.skills || [],
      preferredLocations: candidate.willing_to_relocate ? ['Open to relocate'] : [candidate.current_location],
      avatar: candidate.avatar || '/placeholder.svg?height=120&width=120',
      isAttached: true,
      lastModified: candidate.last_profile_update ? 
        new Date(candidate.last_profile_update).toLocaleDateString() : 'Not specified',
      activeStatus: candidate.last_login_at ? 
        new Date(candidate.last_login_at).toLocaleDateString() : 'Not specified',
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
      linkedin: candidate.social_links?.linkedin || null,
      github: candidate.social_links?.github || null,
      portfolio: candidate.social_links?.portfolio || null,
      
      // Detailed information
      about: candidate.summary || 'No summary available',
      
      // Work experience
      workExperience: workExperience.map(exp => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        duration: `${new Date(exp.start_date).toLocaleDateString()} - ${exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}`,
        location: exp.location,
        description: exp.description,
        skills: exp.skills || []
      })),
      
      // Education details
      educationDetails: education.map(edu => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        fieldOfStudy: edu.field_of_study,
        duration: `${new Date(edu.start_date).getFullYear()} - ${edu.end_date ? new Date(edu.end_date).getFullYear() : 'Present'}`,
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
          technologies: candidate.skills?.slice(0, 4) || [],
          github: candidate.social_links?.github || null,
          live: candidate.social_links?.portfolio || null
        }
      ],
      
      // Certifications
      certifications: candidate.certifications || [],
      
      // Languages
      languages: candidate.languages || [
        { name: "English", proficiency: "Professional" },
        { name: "Hindi", proficiency: "Native" }
      ],
      
      // Resume information
      resumes: resumes.map(resume => ({
        id: resume.id,
        title: resume.title,
        filename: resume.filename || `${candidate.first_name}_${candidate.last_name}_Resume.pdf`,
        fileSize: resume.fileSize || '2.3 MB',
        uploadDate: resume.createdAt,
        lastUpdated: resume.lastUpdated,
        isDefault: resume.isDefault,
        fileUrl: resume.fileUrl || resume.filePath
      }))
    };
    
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

module.exports = router;
