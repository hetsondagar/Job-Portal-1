'use strict';

const { HotVacancy, Company, User, JobApplication, HotVacancyPhoto, Notification } = require('../config');

/**
 * Create a new hot vacancy
 */
exports.createHotVacancy = async (req, res, next) => {
  try {
    console.log('🔥 Creating hot vacancy with data:', req.body);
    console.log('👤 Authenticated user:', req.user.id, req.user.email);

    const {
      title,
      description,
      shortDescription,
      requirements,
      responsibilities,
      location,
      city,
      state,
      country = 'India',
      jobType = 'full-time',
      experienceLevel = 'mid',
      experienceMin = 0,
      experienceMax = 5,
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
      education = [],
      certifications = [],
      languages = [],
      tags = [],
      // Hot vacancy specific fields
      urgencyLevel = 'high',
      hiringTimeline = 'immediate',
      maxApplications = 50,
      applicationDeadline,
      // Premium pricing
      pricingTier = 'premium',
      price,
      currency = 'INR',
      // Premium features
      priorityListing = true,
      featuredBadge = true,
      unlimitedApplications = false,
      advancedAnalytics = true,
      candidateMatching = true,
      directContact = true,
      // SEO
      seoTitle,
      seoDescription,
      keywords = []
    } = req.body;

    // Validate required fields
    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location are required'
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required for hot vacancy'
      });
    }

    // Get company ID from user
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required. Please complete your company profile first.'
      });
    }

    // Sanitize salary fields to prevent numeric overflow
    const MAX_DECIMAL_VALUE = 99999999.99;
    let parsedSalaryMin = salaryMin ? parseFloat(salaryMin) : null;
    let parsedSalaryMax = salaryMax ? parseFloat(salaryMax) : null;

    if (parsedSalaryMin && parsedSalaryMin > MAX_DECIMAL_VALUE) {
      console.warn(`⚠️ salaryMin ${parsedSalaryMin} exceeds max, clamping to ${MAX_DECIMAL_VALUE}`);
      parsedSalaryMin = MAX_DECIMAL_VALUE;
    }
    if (parsedSalaryMax && parsedSalaryMax > MAX_DECIMAL_VALUE) {
      console.warn(`⚠️ salaryMax ${parsedSalaryMax} exceeds max, clamping to ${MAX_DECIMAL_VALUE}`);
      parsedSalaryMax = MAX_DECIMAL_VALUE;
    }

    // If salary is too large, set to null to avoid DB error
    if (parsedSalaryMin > MAX_DECIMAL_VALUE || parsedSalaryMax > MAX_DECIMAL_VALUE) {
      parsedSalaryMin = null;
      parsedSalaryMax = null;
      salary = null;
      console.error('❌ Salary values clamped or nullified due to overflow potential.');
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim() + '-' + Date.now(); // Add timestamp for uniqueness

    // Set validTill to 30 days from now
    const validTill = new Date();
    validTill.setDate(validTill.getDate() + 30);

    const hotVacancyData = {
      title,
      slug,
      description,
      shortDescription,
      requirements,
      responsibilities,
      location,
      city,
      state,
      country,
      companyId,
      created_by: req.user.id,
      jobType,
      experienceLevel,
      experienceMin,
      experienceMax,
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      salary,
      salaryCurrency,
      salaryPeriod,
      isSalaryVisible,
      department,
      category,
      skills,
      benefits,
      remoteWork,
      travelRequired,
      shiftTiming,
      noticePeriod,
      education,
      certifications,
      languages,
      tags,
      urgencyLevel,
      hiringTimeline,
      maxApplications,
      applicationDeadline,
      pricingTier,
      price: parseFloat(price),
      currency,
      priorityListing,
      featuredBadge,
      unlimitedApplications,
      advancedAnalytics,
      candidateMatching,
      directContact,
      seoTitle,
      seoDescription,
      keywords,
      validTill,
      status: 'draft' // Start as draft until payment is confirmed
    };

    const hotVacancy = await HotVacancy.create(hotVacancyData);

    console.log('✅ Hot vacancy created successfully:', hotVacancy.id);

    // Create notification for the employer about hot vacancy creation
    try {
      await Notification.create({
        userId: req.user.id,
        type: 'system',
        title: 'Hot Vacancy Created as Draft',
        message: `Your hot vacancy "${title}" has been created as a draft. Complete the payment to make it live and featured prominently.`,
        priority: 'medium',
        icon: 'fire',
        metadata: {
          event: 'hot_vacancy_created',
          hotVacancyId: hotVacancy.id,
          hotVacancyTitle: title,
          status: 'draft',
          action: 'Complete Payment'
        }
      });
      console.log('📢 Hot vacancy notification created for employer');
    } catch (notificationError) {
      console.error('❌ Error creating hot vacancy notification:', notificationError);
      // Don't fail the main request if notification creation fails
    }

    return res.status(201).json({
      success: true,
      message: 'Hot vacancy created successfully',
      data: hotVacancy
    });

  } catch (error) {
    console.error('❌ Create hot vacancy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create hot vacancy',
      error: error.message
    });
  }
};

/**
 * Get all hot vacancies for an employer
 */
exports.getHotVacanciesByEmployer = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, urgencyLevel } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      created_by: req.user.id
    };

    if (status) {
      whereClause.status = status;
    }

    if (urgencyLevel) {
      whereClause.urgencyLevel = urgencyLevel;
    }

    const { count, rows: hotVacancies } = await HotVacancy.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      message: 'Hot vacancies retrieved successfully',
      data: hotVacancies,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get hot vacancies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hot vacancies',
      error: error.message
    });
  }
};

/**
 * Get hot vacancy by ID
 */
exports.getHotVacancyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hotVacancy = await HotVacancy.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry', 'companySize', 'website', 'email', 'phone']
        },
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: HotVacancyPhoto,
          as: 'photos',
          attributes: ['id', 'filename', 'fileUrl', 'altText', 'caption', 'displayOrder', 'isPrimary', 'isActive'],
          where: { isActive: true },
          required: false,
          order: [['displayOrder', 'ASC'], ['created_at', 'ASC']]
        }
      ]
    });

    if (!hotVacancy) {
      return res.status(404).json({
        success: false,
        message: 'Hot vacancy not found'
      });
    }

    // Check if user has permission to view this hot vacancy
    if (hotVacancy.created_by !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Hot vacancy retrieved successfully',
      data: hotVacancy
    });

  } catch (error) {
    console.error('❌ Get hot vacancy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hot vacancy',
      error: error.message
    });
  }
};

/**
 * Update hot vacancy
 */
exports.updateHotVacancy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const hotVacancy = await HotVacancy.findByPk(id);

    if (!hotVacancy) {
      return res.status(404).json({
        success: false,
        message: 'Hot vacancy not found'
      });
    }

    // Check if user has permission to update this hot vacancy
    if (hotVacancy.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Don't allow updating certain fields after payment
    if (hotVacancy.paymentStatus === 'paid') {
      const restrictedFields = ['pricingTier', 'price', 'currency', 'urgencyLevel', 'hiringTimeline'];
      restrictedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          delete updateData[field];
        }
      });
    }

    // Check if status is changing from draft to active
    const wasDraft = hotVacancy.status === 'draft';
    const isBecomingActive = updateData.status === 'active';

    await hotVacancy.update(updateData);

    // Create notification if hot vacancy is being activated
    if (wasDraft && isBecomingActive) {
      try {
        await Notification.create({
          userId: req.user.id,
          type: 'system',
          title: 'Hot Vacancy Now Live!',
          message: `Your hot vacancy "${hotVacancy.title}" is now live and featured prominently to attract top candidates.`,
          priority: 'high',
          icon: 'fire',
          metadata: {
            event: 'hot_vacancy_activated',
            hotVacancyId: hotVacancy.id,
            hotVacancyTitle: hotVacancy.title,
            status: 'active',
            action: 'View Hot Vacancy'
          }
        });
        console.log('📢 Hot vacancy activation notification created for employer');
      } catch (notificationError) {
        console.error('❌ Error creating hot vacancy activation notification:', notificationError);
        // Don't fail the main request if notification creation fails
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Hot vacancy updated successfully',
      data: hotVacancy
    });

  } catch (error) {
    console.error('❌ Update hot vacancy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update hot vacancy',
      error: error.message
    });
  }
};

/**
 * Delete hot vacancy
 */
exports.deleteHotVacancy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hotVacancy = await HotVacancy.findByPk(id);

    if (!hotVacancy) {
      return res.status(404).json({
        success: false,
        message: 'Hot vacancy not found'
      });
    }

    // Check if user has permission to delete this hot vacancy
    if (hotVacancy.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await hotVacancy.destroy();

    return res.status(200).json({
      success: true,
      message: 'Hot vacancy deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete hot vacancy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete hot vacancy',
      error: error.message
    });
  }
};

/**
 * Get public hot vacancies (for jobseekers)
 */
exports.getPublicHotVacancies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, location, jobType, experienceLevel, urgencyLevel } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      status: 'active',
      paymentStatus: 'paid'
    };

    if (location) {
      whereClause.location = { [require('sequelize').Op.iLike]: `%${location}%` };
    }

    if (jobType) {
      whereClause.jobType = jobType;
    }

    if (experienceLevel) {
      whereClause.experienceLevel = experienceLevel;
    }

    if (urgencyLevel) {
      whereClause.urgencyLevel = urgencyLevel;
    }

    const { count, rows: hotVacancies } = await HotVacancy.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry', 'companySize', 'website']
        },
        {
          model: HotVacancyPhoto,
          as: 'photos',
          attributes: ['id', 'fileUrl', 'altText', 'isPrimary'],
          where: { isActive: true },
          required: false,
          limit: 1
        }
      ],
      order: [
        ['priorityListing', 'DESC'],
        ['urgencyLevel', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      message: 'Hot vacancies retrieved successfully',
      data: hotVacancies,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get public hot vacancies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hot vacancies',
      error: error.message
    });
  }
};

/**
 * Get hot vacancy pricing tiers
 */
exports.getPricingTiers = async (req, res, next) => {
  try {
    const pricingTiers = {
      basic: {
        name: 'Basic Hot Vacancy',
        price: 2999,
        currency: 'INR',
        features: [
          '7 days listing',
          'Up to 25 applications',
          'Basic analytics',
          'Standard visibility'
        ],
        duration: 7
      },
      premium: {
        name: 'Premium Hot Vacancy',
        price: 5999,
        currency: 'INR',
        features: [
          '14 days listing',
          'Up to 50 applications',
          'Advanced analytics',
          'Priority listing',
          'Featured badge',
          'Candidate matching'
        ],
        duration: 14
      },
      enterprise: {
        name: 'Enterprise Hot Vacancy',
        price: 9999,
        currency: 'INR',
        features: [
          '30 days listing',
          'Unlimited applications',
          'Advanced analytics',
          'Top priority listing',
          'Featured badge',
          'Candidate matching',
          'Direct contact access',
          'Custom branding'
        ],
        duration: 30
      }
    };

    return res.status(200).json({
      success: true,
      message: 'Pricing tiers retrieved successfully',
      data: pricingTiers
    });

  } catch (error) {
    console.error('❌ Get pricing tiers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve pricing tiers',
      error: error.message
    });
  }
};
