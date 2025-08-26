'use strict';

const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');

/**
 * Create a new job
 */
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      companyId,
      jobType = 'full-time',
      experienceLevel,
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
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

    // Basic validation
    const errors = [];
    if (!title || String(title).trim() === '') errors.push('title is required');
    if (!description || String(description).trim() === '') errors.push('description is required');
    if (!location || String(location).trim() === '') errors.push('location is required');
    // For now, make companyId optional - TODO: Implement proper company association
    // if (!companyId) errors.push('companyId is required');
    
    // Use authenticated user's ID as postedBy
    const postedBy = req.user.id;
    
    if (errors.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors 
      });
    }

    // Create record
    const jobData = {
      title: String(title).trim(),
      description: String(description).trim(),
      location: String(location).trim(),
      postedBy,
      jobType,
      experienceLevel: experienceLevel && experienceLevel.trim() ? experienceLevel : null,
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      isSalaryVisible,
      department,
      category,
      skills,
      benefits,
      remoteWork: remoteWork && remoteWork.trim() ? remoteWork : null,
      travelRequired,
      shiftTiming: shiftTiming && shiftTiming.trim() ? shiftTiming : null,
      noticePeriod,
      education,
      certifications,
      languages,
      status,
      isUrgent,
      isFeatured,
      isPremium,
      validTill,
      publishedAt,
      tags,
      metadata,
      city,
      state,
      country,
      latitude,
      longitude,
      requirements,
      responsibilities
    };

    // Only add companyId if it's provided
    if (companyId) {
      jobData.companyId = companyId;
    }

    const job = await Job.create(jobData);

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Job creation error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    const statusCode = error?.name === 'SequelizeUniqueConstraintError' ? 409 : 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Failed to create job',
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
          as: 'postedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
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
