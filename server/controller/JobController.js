'use strict';

const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');
const JobPhoto = require('../models/JobPhoto');

/**
 * Create a new job
 */
exports.createJob = async (req, res, next) => {
  try {
    console.log('🔍 Creating job with data:', req.body);
    console.log('👤 Authenticated user:', req.user.id, req.user.email);

    const {
      title,
      description,
      location,
      companyId,
      jobType = 'full-time',
      type, // Handle both jobType and type for compatibility
      experienceLevel,
      experience,
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
      salary,
      salaryCurrency = 'INR',
      salaryPeriod = 'yearly',
      isSalaryVisible = true,
      department,
      category,
      skills = [],
      benefits = [],
      remoteWork = 'on-site',
      travelRequired = false,
      shiftTiming = 'day',
      noticePeriod,
      education,
      certifications = [],
      languages = [],
      status = 'draft',
      isUrgent = false,
      isFeatured = false,
      isPremium = false,
      validTill,
      publishedAt,
      tags = [],
      metadata = {},
      city,
      state,
      country = 'India',
      latitude,
      longitude,
      requirements,
      responsibilities
    } = req.body || {};

    // Basic validation - only require fields for active jobs, not drafts
    const errors = [];
    if (status === 'active') {
      // For active jobs, require all essential fields
      if (!title || String(title).trim() === '') errors.push('Job title is required');
      if (!description || String(description).trim() === '') errors.push('Job description is required');
      if (!location || String(location).trim() === '') errors.push('Job location is required');
      if (!requirements || String(requirements).trim() === '') errors.push('Job requirements are required');
      if (!department || String(department).trim() === '') errors.push('Department is required');
      if (!type && !jobType) errors.push('Job type is required');
      if (!experience && !experienceLevel) errors.push('Experience level is required');
      if (!salary && !salaryMin && !salaryMax) errors.push('Salary information is required');
    } else {
      // For drafts, only require title (can be "Untitled Job")
      if (!title || String(title).trim() === '') {
        title = 'Untitled Job'; // Set default title for drafts
      }
    }
    
    if (errors.length) {
      console.error('❌ Validation errors:', errors);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors 
      });
    }

    // Get the authenticated user's company
    let userCompany = null;
    try {
      // First try to get company directly from user's company_id
      const user = await User.findByPk(req.user.id);
      
      if (user && user.company_id) {
        userCompany = await Company.findByPk(user.company_id);
        if (userCompany) {
          console.log('✅ Found user company:', userCompany.id, userCompany.name);
        }
      } else {
        console.log('⚠️ User has no associated company');
      }
    } catch (companyError) {
      console.error('❌ Error fetching user company:', companyError);
    }

    // Use provided companyId or user's company ID
    const finalCompanyId = companyId || (userCompany ? userCompany.id : null);
    
    if (!finalCompanyId) {
      console.error('❌ No company ID available for job creation');
      return res.status(400).json({
        success: false,
        message: 'Company association required. Please ensure your account is linked to a company.',
        error: 'MISSING_COMPANY_ASSOCIATION'
      });
    }

    // Parse salary if provided as string
    let parsedSalaryMin = salaryMin;
    let parsedSalaryMax = salaryMax;

    if (salary && typeof salary === 'string') {
      // Handle salary ranges like "₹8-15 LPA" or "800000-1500000"
      const salaryMatch = salary.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      if (salaryMatch) {
        parsedSalaryMin = parseFloat(salaryMatch[1]) * 100000; // Convert LPA to actual amount
        parsedSalaryMax = parseFloat(salaryMatch[2]) * 100000;
      } else {
        // Single salary value
        const singleSalary = parseFloat(salary.replace(/[^\d.]/g, ''));
        if (!isNaN(singleSalary)) {
          parsedSalaryMin = singleSalary * 100000;
        }
      }
    }

    // Sanitize numeric fields to avoid DECIMAL(10,2) overflow in DB
    const MAX_DECIMAL_10_2_ABS = 99999999.99; // absolute max allowed
    const coerceNumberOrNull = (value) => {
      if (value === undefined || value === null || value === '') return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };
    let safeSalaryMin = coerceNumberOrNull(parsedSalaryMin);
    let safeSalaryMax = coerceNumberOrNull(parsedSalaryMax);
    if (safeSalaryMin !== null) {
      safeSalaryMin = Math.max(0, Math.min(safeSalaryMin, MAX_DECIMAL_10_2_ABS));
    }
    if (safeSalaryMax !== null) {
      safeSalaryMax = Math.max(0, Math.min(safeSalaryMax, MAX_DECIMAL_10_2_ABS));
    }

    // Map experience level
    let mappedExperienceLevel = experienceLevel;
    if (experience && !experienceLevel) {
      const experienceMap = {
        'fresher': 'entry',
        'junior': 'junior', 
        'mid': 'mid',
        'senior': 'senior'
      };
      mappedExperienceLevel = experienceMap[experience] || 'entry';
    }

    // Use authenticated user's ID as employerId (matching the association)
    const employerId = req.user.id;
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();
    
    // Create record
    const jobData = {
      slug,
      title: String(title).trim(),
      description: String(description).trim(),
      location: String(location).trim(),
      companyId: finalCompanyId,
      employerId, // Use employerId to match the association
      jobType: type || jobType, // Handle both field names
      experienceLevel: mappedExperienceLevel,
      experienceMin: experienceMin || null,
      experienceMax: experienceMax || null,
      salary: salary && salary.trim() ? salary.trim() : null,
      salaryMin: safeSalaryMin,
      salaryMax: safeSalaryMax,
      salaryCurrency,
      salaryPeriod,
      isSalaryVisible,
      department: department && department.trim() ? department : null,
      category,
      skills: Array.isArray(skills) ? skills : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      remoteWork: remoteWork && remoteWork.trim() ? remoteWork : 'on-site',
      travelRequired: Boolean(travelRequired),
      shiftTiming: shiftTiming && shiftTiming.trim() ? shiftTiming : 'day',
      noticePeriod,
      education,
      certifications: Array.isArray(certifications) ? certifications : [],
      languages: Array.isArray(languages) ? languages : [],
      status,
      isUrgent: Boolean(isUrgent),
      isFeatured: Boolean(isFeatured),
      isPremium: Boolean(isPremium),
      validTill,
      publishedAt,
      tags: Array.isArray(tags) ? tags : [],
      metadata,
      city,
      state,
      country,
      latitude,
      longitude,
      requirements: requirements && requirements.trim() ? requirements : null,
      responsibilities: responsibilities && responsibilities.trim() ? responsibilities : null
    };

    console.log('📝 Creating job with data:', {
      title: jobData.title,
      companyId: jobData.companyId,
      employerId: jobData.employerId,
      jobType: jobData.jobType,
      location: jobData.location,
      status: jobData.status
    });

    const job = await Job.create(jobData);

    console.log('✅ Job created successfully:', job.id);

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('❌ Job creation error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'A job with this title already exists',
        error: 'DUPLICATE_JOB_TITLE'
      });
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid company or user reference',
        error: 'INVALID_FOREIGN_KEY'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionTimedOutError') {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please try again later.',
        error: 'DATABASE_CONNECTION_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create job. Please try again later.',
      error: error.message,
      details: error.name
    });
  }
};

/**
 * Get all jobs (with optional filtering)
 */
exports.getAllJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      companyId,
      location,
      jobType,
      experienceLevel,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (companyId) whereClause.companyId = companyId;
    if (location) whereClause.location = { [Job.sequelize.Op.iLike]: `%${location}%` };
    if (jobType) whereClause.jobType = jobType;
    if (experienceLevel) whereClause.experienceLevel = experienceLevel;
    if (search) {
      whereClause[Job.sequelize.Op.or] = [
        { title: { [Job.sequelize.Op.iLike]: `%${search}%` } },
        { description: { [Job.sequelize.Op.iLike]: `%${search}%` } },
        { location: { [Job.sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry', 'companySize', 'website', 'email', 'phone'],
          required: false
        },
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        },
        {
          model: JobPhoto,
          as: 'photos',
          attributes: ['id', 'filename', 'fileUrl', 'altText', 'caption', 'displayOrder', 'isPrimary', 'isActive'],
          where: { isActive: true },
          required: false
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs',
      error: error.message
    });
  }
};

/**
 * Get job by ID
 */
exports.getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry', 'companySize', 'website', 'email', 'phone'],
          required: false // Make it optional since companyId can be NULL
        },
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: JobPhoto,
          as: 'photos',
          attributes: ['id', 'filename', 'fileUrl', 'altText', 'caption', 'displayOrder', 'isPrimary', 'isActive'],
          where: { isActive: true },
          required: false,
          order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']]
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job retrieved successfully',
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job',
      error: error.message
    });
  }
};

/**
 * Get job by ID for editing (with employer verification)
 */
exports.getJobForEdit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Verify that the job belongs to the authenticated employer
    if (job.employerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own jobs'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job retrieved successfully for editing',
      data: job
    });
  } catch (error) {
    console.error('Get job for edit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job for editing',
      error: error.message
    });
  }
};

/**
 * Update job
 */
exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.update(updateData);

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
};

/**
 * Delete job
 */
exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.destroy();

    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

/**
 * Get jobs by employer (authenticated user)
 */
exports.getJobsByEmployer = async (req, res, next) => {
  try {
    console.log('🔍 Fetching jobs for employer:', req.user.id, req.user.email);
    console.log('🔍 Query parameters:', req.query);
    
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = { employerId: req.user.id };
    
    // Add filters
    if (status && status !== 'all') {
      if (status === 'draft') {
        // For drafts, only show jobs with explicit 'draft' status
        whereClause.status = 'draft';
      } else if (status === 'active') {
        // For active jobs, show jobs with 'active' status OR null/undefined status (legacy jobs)
        whereClause[Job.sequelize.Op.or] = [
          { status: 'active' },
          { status: null },
          { status: undefined }
        ];
      } else {
        // For other statuses, use exact match
        whereClause.status = status;
      }
      console.log('🔍 Filtering by status:', status);
    }
    
    console.log('🔍 Final where clause:', whereClause);
    if (search) {
      whereClause[Job.sequelize.Op.or] = [
        { title: { [Job.sequelize.Op.iLike]: `%${search}%` } },
        { description: { [Job.sequelize.Op.iLike]: `%${search}%` } },
        { location: { [Job.sequelize.Op.iLike]: `%${search}%` } },
        { department: { [Job.sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`✅ Found ${count} jobs for employer ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Employer jobs retrieved successfully',
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    }); 
  } catch (error) {
    console.error('❌ Get employer jobs error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Handle specific database errors
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionTimedOutError') {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please try again later.',
        error: 'DATABASE_CONNECTION_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employer jobs',
      error: error.message
    });
  }
};

/**
 * Get jobs by company
 */
exports.getJobsByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { companyId };

    if (status) whereClause.status = status;

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry', 'companySize'],
          required: false // Make it optional since companyId can be NULL
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      message: 'Company jobs retrieved successfully',
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get company jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve company jobs',
      error: error.message
    });
  }
};

/**
 * Update job status
 */
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.update({ status });

    return res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job status',
      error: error.message
    });
  }
};
