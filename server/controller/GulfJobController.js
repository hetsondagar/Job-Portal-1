const { Op } = require('sequelize');
const Job = require('../models/Job');
const Company = require('../models/Company');
const JobApplication = require('../models/JobApplication');
const JobBookmark = require('../models/JobBookmark');
const JobAlert = require('../models/JobAlert');
const User = require('../models/User');

// Gulf region countries and cities
const GULF_LOCATIONS = [
  'dubai', 'uae', 'united arab emirates', 'abu dhabi', 'sharjah', 'ajman',
  'doha', 'qatar', 'riyadh', 'saudi arabia', 'jeddah', 'mecca', 'medina',
  'kuwait', 'kuwait city', 'bahrain', 'manama', 'oman', 'muscat',
  'gulf', 'middle east', 'gcc', 'gulf cooperation council'
];

// Helper function to check if location is in Gulf region
const isGulfLocation = (location) => {
  if (!location) return false;
  const locationLower = location.toLowerCase();
  return GULF_LOCATIONS.some(gulfLocation => locationLower.includes(gulfLocation));
};

// Get all Gulf jobs with filtering
const getGulfJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      companyId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      status: 'active',
      [Op.or]: [
        { region: 'gulf' },
        { 
          location: {
            [Op.iLike]: {
              [Op.any]: GULF_LOCATIONS.map(loc => `%${loc}%`)
            }
          }
        }
      ]
    };

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { requirements: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Add location filter
    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }

    // Add job type filter
    if (jobType) {
      whereClause.jobType = jobType;
    }

    // Add experience level filter
    if (experienceLevel) {
      whereClause.experienceLevel = experienceLevel;
    }

    // Add salary filters
    if (salaryMin) {
      whereClause.salaryMin = { [Op.gte]: parseFloat(salaryMin) };
    }
    if (salaryMax) {
      whereClause.salaryMax = { [Op.lte]: parseFloat(salaryMax) };
    }

    // Add company filter
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo', 'industry', 'region']
        },
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching Gulf jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gulf jobs',
      error: error.message
    });
  }
};

// Get Gulf job by ID
const getGulfJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({
      where: {
        id,
        [Op.or]: [
          { region: 'gulf' },
          { 
            location: {
              [Op.iLike]: {
                [Op.any]: GULF_LOCATIONS.map(loc => `%${loc}%`)
              }
            }
          }
        ]
      },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo', 'description', 'industry', 'region', 'website']
        },
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Gulf job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching Gulf job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gulf job',
      error: error.message
    });
  }
};

// Get similar Gulf jobs
const getSimilarGulfJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const currentJob = await Job.findByPk(id);
    if (!currentJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const similarJobs = await Job.findAll({
      where: {
        id: { [Op.ne]: id },
        status: 'active',
        [Op.or]: [
          { region: 'gulf' },
          { 
            location: {
              [Op.iLike]: {
                [Op.any]: GULF_LOCATIONS.map(loc => `%${loc}%`)
              }
            }
          }
        ],
        [Op.or]: [
          { jobType: currentJob.jobType },
          { experienceLevel: currentJob.experienceLevel },
          { companyId: currentJob.companyId }
        ]
      },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo', 'industry']
        }
      ],
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: similarJobs
    });
  } catch (error) {
    console.error('Error fetching similar Gulf jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch similar Gulf jobs',
      error: error.message
    });
  }
};

// Get Gulf companies
const getGulfCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      industry,
      companySize,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      region: 'gulf'
    };

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { industry: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Add industry filter
    if (industry) {
      whereClause.industry = { [Op.iLike]: `%${industry}%` };
    }

    // Add company size filter
    if (companySize) {
      whereClause.companySize = companySize;
    }

    const { count, rows: companies } = await Company.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'jobs',
          where: { status: 'active' },
          required: false,
          attributes: ['id', 'title', 'location', 'jobType', 'experienceLevel']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching Gulf companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gulf companies',
      error: error.message
    });
  }
};

// Get Gulf job applications for a user
const getGulfJobApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      userId: userId
    };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: applications } = await JobApplication.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'job',
          where: {
            [Op.or]: [
              { region: 'gulf' },
              { 
                location: {
                  [Op.iLike]: {
                    [Op.any]: GULF_LOCATIONS.map(loc => `%${loc}%`)
                  }
                }
              }
            ]
          },
          required: true, // Use INNER JOIN to ensure we only get applications with Gulf jobs
          include: [
            {
              model: Company,
              as: 'company',
              attributes: ['id', 'name', 'logo', 'industry'],
              required: false // Use LEFT JOIN for company
            }
          ]
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching Gulf job applications:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      query: req.query
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gulf job applications',
      error: error.message
    });
  }
};

// Get Gulf job bookmarks for a user
const getGulfJobBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: bookmarks } = await JobBookmark.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: 'job',
          where: {
            [Op.or]: [
              { region: 'gulf' },
              { 
                location: {
                  [Op.iLike]: {
                    [Op.any]: GULF_LOCATIONS.map(loc => `%${loc}%`)
                  }
                }
              }
            ]
          },
          include: [
            {
              model: Company,
              as: 'company',
              attributes: ['id', 'name', 'logo', 'industry']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        bookmarks,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching Gulf job bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gulf job bookmarks',
      error: error.message
    });
  }
};

// Get Gulf job alerts for a user
const getGulfJobAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, isActive } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId };

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: alerts } = await JobAlert.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Filter alerts to only include Gulf-related ones
    const GULF_LOCATIONS = ['dubai', 'uae', 'qatar', 'saudi', 'kuwait', 'bahrain', 'oman', 'gulf'];
    const gulfAlerts = alerts.filter(alert => {
      const kw = Array.isArray(alert.keywords) ? alert.keywords.join(' ') : (alert.keywords || '');
      const locArr = (alert.locations || alert.location);
      const loc = Array.isArray(locArr) ? locArr.join(' ') : (locArr || '');
      const keywords = String(kw).toLowerCase();
      const location = String(loc).toLowerCase();
      return GULF_LOCATIONS.some(gulfLocation =>
        keywords.includes(gulfLocation) || location.includes(gulfLocation)
      );
    });

    res.json({
      success: true,
      data: {
        alerts: gulfAlerts,
        pagination: {
          total: gulfAlerts.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(gulfAlerts.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching Gulf job alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gulf job alerts',
      error: error.message
    });
  }
};

// Get Gulf dashboard stats
const getGulfDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get Gulf job applications count
    const gulfApplications = await JobApplication.count({
      include: [
        {
          model: Job,
          as: 'job',
          where: {
            [Op.or]: [
              { region: 'gulf' },
              { 
                location: {
                  [Op.iLike]: {
                    [Op.any]: GULF_LOCATIONS.map(loc => `%${loc}%`)
                  }
                }
              }
            ]
          }
        }
      ],
      where: { userId: userId }
    });

    // Get Gulf job bookmarks count
    const gulfBookmarks = await JobBookmark.count({
      include: [
        {
          model: Job,
          as: 'job',
          where: {
            [Op.or]: [
              { region: 'gulf' },
              { 
                location: {
                  [Op.iLike]: {
                    [Op.any]: GULF_LOCATIONS.map(loc => `%${loc}%`)
                  }
                }
              }
            ]
          }
        }
      ],
      where: { userId }
    });

    // Get Gulf job alerts count
    const gulfAlerts = await JobAlert.count({
      where: { 
        userId,
        isActive: true
      }
    });

    // Get total Gulf jobs count
    const totalGulfJobs = await Job.count({
      where: {
        status: 'active',
        [Op.or]: [
          { region: 'gulf' },
          { 
            location: {
              [Op.iLike]: {
                [Op.any]: GULF_LOCATIONS.map(loc => `%${loc}%`)
              }
            }
          }
        ]
      }
    });

    res.json({
      success: true,
      data: {
        gulfApplications,
        gulfBookmarks,
        gulfAlerts,
        totalGulfJobs,
        stats: {
          totalApplications: gulfApplications,
          totalBookmarks: gulfBookmarks,
          totalAlerts: gulfAlerts,
          totalJobs: totalGulfJobs
        }
      }
    });
  } catch (error) {
    console.error('Error fetching Gulf dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gulf dashboard stats',
      error: error.message
    });
  }
};

module.exports = {
  getGulfJobs,
  getGulfJobById,
  getSimilarGulfJobs,
  getGulfCompanies,
  getGulfJobApplications,
  getGulfJobBookmarks,
  getGulfJobAlerts,
  getGulfDashboardStats
};
