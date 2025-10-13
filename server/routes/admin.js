const express = require('express');
const router = express.Router();
const { 
  User, 
  Company, 
  Job, 
  JobApplication, 
  JobBookmark,
  JobCategory,
  Resume,
  WorkExperience,
  Education,
  CompanyPhoto,
  CompanyReview,
  Subscription,
  SubscriptionPlan,
  Payment,
  UserActivityLog,
  UserSession,
  Analytics,
  Requirement
} = require('../config');
const { Op, Sequelize } = require('sequelize');
const { authenticateToken } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/adminAuth');

// Test endpoint to verify admin authentication (before middleware)
router.get('/test-auth', async (req, res) => {
  try {
    console.log('🔍 [ADMIN-TEST] Testing admin authentication endpoint');
    res.json({
      success: true,
      message: 'Admin test endpoint accessible',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [ADMIN-TEST] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message
    });
  }
});

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      userStats,
      companyStats,
      jobStats,
      applicationStats
    ] = await Promise.all([
      // User statistics
      Promise.all([
        User.count(),
        User.count({ where: { user_type: 'jobseeker' } }),
        User.count({ where: { user_type: 'employer' } }),
        User.count({ where: { user_type: 'admin' } }),
        User.count({ where: { is_active: true } }),
        User.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),
      // Company statistics
      Promise.all([
        Company.count(),
        Company.count({ where: { verificationStatus: 'verified' } }),
        Company.count({ where: { verificationStatus: 'unverified' } }),
        Company.count({ where: { isActive: true } }),
        Company.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),
      // Job statistics
      Promise.all([
        Job.count(),
        Job.count({ where: { status: 'active' } }),
        Job.count({ where: { status: 'inactive' } }),
        Job.count({ where: { region: 'india' } }),
        Job.count({ where: { region: 'gulf' } }),
        Job.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),
      // Application statistics
      JobApplication.count()
    ]);

    const stats = {
      users: {
        total: userStats[0],
        jobseekers: userStats[1],
        employers: userStats[2],
        admins: userStats[3],
        active: userStats[4],
        newLast30Days: userStats[5]
      },
      companies: {
        total: companyStats[0],
        verified: companyStats[1],
        unverified: companyStats[2],
        active: companyStats[3],
        newLast30Days: companyStats[4]
      },
      jobs: {
        total: jobStats[0],
        active: jobStats[1],
        inactive: jobStats[2],
        india: jobStats[3],
        gulf: jobStats[4],
        newLast30Days: jobStats[5]
      },
      applications: {
        total: applicationStats
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Get all users with filters
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      userType,
      status,
      region
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (userType && userType !== 'all') {
      whereClause.user_type = userType;
    }

    if (status && status !== 'all') {
      whereClause.is_active = status === 'active';
    }

    if (region && region !== 'all') {
      whereClause.region = region;
    }

    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        users,
        totalPages,
        currentPage: parseInt(page),
        totalCount: count
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get users by region
router.get('/users/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const {
      page = 1,
      limit = 20,
      search,
      userType,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { region };

    // Add filters
    if (userType && userType !== 'all') {
      whereClause.user_type = userType;
    }

    if (status && status !== 'all') {
      whereClause.is_active = status === 'active';
    }

    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        users,
        totalPages,
        currentPage: parseInt(page),
        totalCount: count
      }
    });
  } catch (error) {
    console.error('Error fetching users by region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get comprehensive user details for superadmin
router.get('/users/:userId/details', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'email', 'industry', 'sector', 'companySize', 'website', 'phone', 'address', 'city', 'state', 'country', 'region', 'isVerified', 'isActive', 'createdAt']
        },
        {
          model: JobApplication,
          as: 'jobApplications',
          attributes: ['id', 'status', 'created_at'],
          include: [{
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'companyId', 'location', 'salary', 'jobType', 'status', 'createdAt'],
            include: [{
              model: Company,
              as: 'company',
              attributes: ['id', 'name', 'industry']
            }]
          }],
          limit: 10,
          order: [['created_at', 'DESC']]
        },
        {
          model: JobBookmark,
          as: 'jobBookmarks',
          attributes: ['id', 'created_at'],
          include: [{
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'companyId', 'location', 'salary', 'jobType', 'status'],
            include: [{
              model: Company,
              as: 'company',
              attributes: ['id', 'name', 'industry']
            }]
          }],
          limit: 10,
          order: [['created_at', 'DESC']]
        },
        {
          model: Resume,
          as: 'resumes',
          attributes: ['id', 'title', 'summary', 'isDefault', 'isPublic', 'views', 'downloads', 'lastUpdated', 'createdAt']
        },
        {
          model: WorkExperience,
          as: 'workExperiences',
          attributes: ['id', 'companyName', 'jobTitle', 'startDate', 'endDate', 'description', 'isCurrent']
        },
        {
          model: Education,
          as: 'educations',
          attributes: ['id', 'institution', 'degree', 'fieldOfStudy', 'startDate', 'endDate', 'cgpa', 'percentage', 'description']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional statistics
    const totalApplications = await JobApplication.count({ where: { userId } });
    const totalBookmarks = await JobBookmark.count({ where: { userId } });
    const totalJobsPosted = user.user_type === 'employer' ? await Job.count({ where: { companyId: user.company?.id } }) : 0;
    
    // Get pricing/subscription information if available
    const subscription = await Subscription.findOne({
      where: { userId },
      include: [{
        model: SubscriptionPlan,
        as: 'plan',
        attributes: ['id', 'name', 'monthlyPrice', 'yearlyPrice', 'currency', 'features', 'planType']
      }],
      order: [['created_at', 'DESC']]
    });

    // Get payment history
    const payments = await Payment.findAll({
      where: { userId },
      attributes: ['id', 'amount', 'currency', 'status', 'paymentMethod', 'created_at', 'description'],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Get user activity logs
    const activityLogs = await UserActivityLog.findAll({
      where: { userId },
      attributes: ['id', 'activityType', 'details', 'timestamp'],
      order: [['timestamp', 'DESC']],
      limit: 20
    });

    // Get user sessions
    const sessions = await UserSession.findAll({
      where: { userId },
      attributes: ['id', 'ipAddress', 'userAgent', 'isActive', 'lastActivityAt', 'created_at'],
      order: [['lastActivityAt', 'DESC']],
      limit: 10
    });

    const userDetails = {
      ...user.toJSON(),
      statistics: {
        totalApplications,
        totalBookmarks,
        totalJobsPosted,
        totalResumes: user.resumes?.length || 0,
        totalWorkExperiences: user.workExperiences?.length || 0,
        totalEducations: user.educations?.length || 0
      },
      subscription: subscription || null,
      payments: payments || [],
      activityLogs: activityLogs || [],
      sessions: sessions || []
    };

    res.json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

// Get comprehensive company details for superadmin
router.get('/companies/:companyId/details', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const company = await Company.findByPk(companyId, {
      include: [
        {
          model: User,
          as: 'employees',
          attributes: ['id', 'first_name', 'last_name', 'email', 'user_type', 'is_active', 'createdAt']
        },
        {
          model: Job,
          as: 'jobs',
          attributes: ['id', 'title', 'location', 'salary', 'jobType', 'status', 'createdAt', 'validTill'],
          include: [{
            model: JobApplication,
            as: 'jobApplications',
            attributes: ['id', 'status', 'created_at'],
            include: [{
              model: User,
              as: 'applicant',
              attributes: ['id', 'first_name', 'last_name', 'email']
            }]
          }],
          order: [['created_at', 'DESC']]
        },
        {
          model: CompanyPhoto,
          as: 'photos',
          attributes: ['id', 'filePath', 'isPrimary', 'created_at']
        },
        {
          model: CompanyReview,
          as: 'reviews',
          attributes: ['id', 'rating', 'review', 'created_at'],
          include: [{
            model: User,
            as: 'reviewer',
            attributes: ['id', 'first_name', 'last_name']
          }],
          order: [['created_at', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get additional statistics
    const totalJobs = await Job.count({ where: { companyId } });
    const activeJobs = await Job.count({ where: { companyId, status: 'active' } });
    const totalApplications = await JobApplication.count({
      include: [{
        model: Job,
        as: 'job',
        where: { companyId }
      }]
    });
    const totalReviews = await CompanyReview.count({ where: { companyId } });
    const averageRating = await CompanyReview.findOne({
      where: { companyId },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating']
      ],
      raw: true
    });

    // Get company subscription/pricing information
    const subscription = await Subscription.findOne({
      where: { 
        userId: company.employees?.[0]?.id // Use first employee's ID as a proxy
      },
      include: [{
        model: SubscriptionPlan,
        as: 'plan',
        attributes: ['id', 'name', 'monthlyPrice', 'yearlyPrice', 'currency', 'features', 'planType']
      }],
      order: [['created_at', 'DESC']]
    });

    // Get payment history
    const payments = await Payment.findAll({
      where: { 
        userId: company.employees?.[0]?.id // Use first employee's ID as a proxy
      },
      attributes: ['id', 'amount', 'currency', 'status', 'paymentMethod', 'created_at', 'description'],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Get company activity logs (using UserActivityLog for now)
    const activityLogs = await UserActivityLog.findAll({
      where: { 
        userId: company.employees?.[0]?.id // Use first employee's ID as a proxy
      },
      attributes: ['id', 'activityType', 'details', 'timestamp'],
      order: [['timestamp', 'DESC']],
      limit: 20
    });

    // Get company analytics
    const analytics = await Analytics.findAll({
      where: { companyId },
      attributes: ['id', 'eventType', 'metadata', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    const companyDetails = {
      ...company.toJSON(),
      statistics: {
        totalJobs,
        activeJobs,
        totalApplications,
        totalReviews,
        averageRating: averageRating?.averageRating ? parseFloat(averageRating.averageRating).toFixed(1) : 0,
        totalEmployees: company.employees?.length || 0,
        totalPhotos: company.photos?.length || 0
      },
      subscription: subscription || null,
      payments: payments || [],
      activityLogs: activityLogs || [],
      analytics: analytics || []
    };

    res.json({
      success: true,
      data: companyDetails
    });
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company details',
      error: error.message
    });
  }
});

// Get comprehensive job details for superadmin
router.get('/jobs/:jobId/details', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findByPk(jobId, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'email', 'industry', 'sector', 'companySize', 'website', 'phone', 'address', 'city', 'state', 'country', 'region', 'isVerified', 'isActive', 'createdAt']
        },
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'first_name', 'last_name', 'email', 'user_type']
        },
        {
          model: JobApplication,
          as: 'jobApplications',
          attributes: ['id', 'status', 'coverLetter', 'created_at', 'updated_at'],
          include: [{
            model: User,
            as: 'applicant',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'region'],
            include: [{
              model: Resume,
              as: 'resumes',
              attributes: ['id', 'title', 'summary', 'isDefault'],
              where: { isDefault: true },
              required: false
            }]
          }],
          order: [['created_at', 'DESC']]
        },
        {
          model: JobBookmark,
          as: 'bookmarks',
          attributes: ['id', 'created_at'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }],
          order: [['created_at', 'DESC']]
        },
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get additional statistics
    const totalApplications = await JobApplication.count({ where: { jobId } });
    const totalBookmarks = await JobBookmark.count({ where: { jobId } });
    const applicationsByStatus = await JobApplication.findAll({
      where: { jobId },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get job analytics
    const jobAnalytics = await Analytics.findAll({
      where: { 
        jobId,
        eventType: ['job_view', 'job_apply', 'job_bookmark']
      },
      attributes: ['id', 'eventType', 'metadata', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    // Get job performance metrics
    const viewCount = await Analytics.count({ 
      where: { jobId, eventType: 'job_view' } 
    });
    const applyCount = await Analytics.count({ 
      where: { jobId, eventType: 'job_apply' } 
    });
    const bookmarkCount = await Analytics.count({ 
      where: { jobId, eventType: 'job_bookmark' } 
    });

    // Calculate conversion rates
    const conversionRate = viewCount > 0 ? ((applyCount / viewCount) * 100).toFixed(2) : 0;
    const bookmarkRate = viewCount > 0 ? ((bookmarkCount / viewCount) * 100).toFixed(2) : 0;

    // Get similar jobs
    const similarJobsQuery = {
      id: { [Op.ne]: jobId },
      [Op.or]: [
        { companyId: job.companyId },
        { location: { [Op.iLike]: `%${job.location?.split(',')[0]}%` } }
      ]
    };

    // Add category filter only if job has a category
    if (job.category) {
      similarJobsQuery[Op.or].unshift({ category: job.category });
    }

    const similarJobs = await Job.findAll({
      where: similarJobsQuery,
      attributes: ['id', 'title', 'location', 'salary', 'jobType', 'status', 'createdAt'],
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name', 'industry']
      }],
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    // Get job requirements analysis
    const requirementsAnalysis = {
        totalRequirements: job.jobRequirements?.length || 0,
        requiredRequirements: job.jobRequirements?.filter(req => req.isRequired).length || 0,
        optionalRequirements: job.jobRequirements?.filter(req => !req.isRequired).length || 0
    };

    const jobDetails = {
      ...job.toJSON(),
      statistics: {
        totalApplications,
        totalBookmarks,
        viewCount,
        applyCount,
        bookmarkCount,
        conversionRate: `${conversionRate}%`,
        bookmarkRate: `${bookmarkRate}%`,
        applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {})
      },
      requirementsAnalysis,
      analytics: jobAnalytics || [],
      similarJobs: similarJobs || []
    };

    res.json({
      success: true,
      data: jobDetails
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job details',
      error: error.message
    });
  }
});

// Portal-based user categorization routes
router.get('/users/portal/:portal', async (req, res) => {
  try {
    const { portal } = req.params;
    const {
      page = 1,
      limit = 20,
      search,
      userType,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};

    // Portal-based filtering logic
    switch (portal) {
      case 'normal':
        // Normal dashboard users (India region or null region)
        whereClause = {
          [Op.or]: [
            { region: 'india' },
            { region: null },
            { region: 'other' }
          ]
        };
        break;
      case 'gulf':
        // Gulf dashboard users (Gulf region only)
        whereClause = { region: 'gulf' };
        break;
      case 'both':
        // Users who can access both portals (this would need additional logic)
        // For now, we'll consider users with specific preferences or all regions
        whereClause = {
          [Op.or]: [
            { willing_to_relocate: true },
            { preferred_locations: { [Op.contains]: ['india', 'gulf'] } }
          ]
        };
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid portal type. Use: normal, gulf, or both'
        });
    }

    // Add filters
    if (userType && userType !== 'all') {
      whereClause.user_type = userType;
    }

    if (status && status !== 'all') {
      whereClause.is_active = status === 'active';
    }

    if (search) {
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      });
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        users,
        totalPages,
        currentPage: parseInt(page),
        totalCount: count,
        portal: portal
      }
    });
  } catch (error) {
    console.error('Error fetching users by portal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users by portal',
      error: error.message
    });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ is_active: isActive });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: { id: user.id, is_active: user.is_active } }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting admin users
    if (user.user_type === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Export users
router.get('/users/export', async (req, res) => {
  try {
    const { userType, status, region } = req.query;

    const whereClause = {};

    if (userType && userType !== 'all') {
      whereClause.user_type = userType;
    }

    if (status && status !== 'all') {
      whereClause.is_active = status === 'active';
    }

    if (region && region !== 'all') {
      whereClause.region = region;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    // Convert to CSV
    const csvHeader = 'ID,First Name,Last Name,Email,Phone,User Type,Region,Status,Email Verified,Phone Verified,Last Login,Created At\n';
    const csvRows = users.map(user => {
      return [
        user.id,
        user.first_name || '',
        user.last_name || '',
        user.email || '',
        user.phone || '',
        user.user_type || '',
        user.region || '',
        user.is_active ? 'Active' : 'Inactive',
        user.is_email_verified ? 'Yes' : 'No',
        user.is_phone_verified ? 'Yes' : 'No',
        user.last_login_at ? new Date(user.last_login_at).toISOString() : '',
        new Date(user.createdAt).toISOString()
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
});

// Get all companies with filters
router.get('/companies', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      region,
      verification
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    if (region && region !== 'all') {
      whereClause.region = region;
    }

    if (verification && verification !== 'all') {
      // Support both old isVerified and new verificationStatus
      if (verification === 'verified' || verification === 'approved') {
        whereClause.verificationStatus = 'verified';
      } else if (verification === 'pending') {
        whereClause.verificationStatus = 'pending';
      } else if (verification === 'rejected') {
        whereClause.verificationStatus = 'rejected';
      } else if (verification === 'unverified') {
        whereClause.verificationStatus = 'unverified';
      }
    } else {
      // By default, show only verified companies in the list
      whereClause.verificationStatus = 'verified';
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { industry: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: companies } = await Company.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        companies,
        totalPages,
        currentPage: parseInt(page),
        totalCount: count
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// Get companies by region
router.get('/companies/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const {
      page = 1,
      limit = 20,
      search,
      status,
      verification
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { region };

    // Add filters
    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    if (verification && verification !== 'all') {
      whereClause.isVerified = verification === 'verified';
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { industry: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: companies } = await Company.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        companies,
        totalPages,
        currentPage: parseInt(page),
        totalCount: count
      }
    });
  } catch (error) {
    console.error('Error fetching companies by region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// Update company status
router.patch('/companies/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    await company.update({ isActive });

    res.json({
      success: true,
      message: `Company ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { company: { id: company.id, isActive: company.isActive } }
    });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company status',
      error: error.message
    });
  }
});

// Update company verification
router.patch('/companies/:id/verification', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    await company.update({ isVerified });

    res.json({
      success: true,
      message: `Company ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: { company: { id: company.id, isVerified: company.isVerified } }
    });
  } catch (error) {
    console.error('Error updating company verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company verification',
      error: error.message
    });
  }
});

// Delete company
router.delete('/companies/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id, { transaction });
    if (!company) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Delete company users first (foreign key constraint)
    await User.destroy({ 
      where: { company_id: id },
      transaction 
    });

    // Delete company jobs
    await Job.destroy({ 
      where: { companyId: id },
      transaction 
    });

    // Delete other related data
    await JobApplication.destroy({ 
      where: { companyId: id },
      transaction 
    });

    await CompanyFollow.destroy({ 
      where: { companyId: id },
      transaction 
    });

    // Delete company photos if they exist
    const { CompanyPhoto } = require('../models');
    if (CompanyPhoto) {
      await CompanyPhoto.destroy({ 
        where: { companyId: id },
        transaction 
      });
    }

    // Finally delete the company
    await company.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Company and all related data deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
});

// Export companies
router.get('/companies/export', async (req, res) => {
  try {
    const { status, region, verification } = req.query;

    const whereClause = {};

    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    if (region && region !== 'all') {
      whereClause.region = region;
    }

    if (verification && verification !== 'all') {
      whereClause.isVerified = verification === 'verified';
    }

    const companies = await Company.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    // Convert to CSV
    const csvHeader = 'ID,Name,Email,Phone,Industry,Sector,Region,Status,Verified,Website,Address,City,State,Country,Total Jobs,Total Applications,Rating,Created At\n';
    const csvRows = companies.map(company => {
      return [
        company.id,
        company.name || '',
        company.email || '',
        company.phone || '',
        company.industry || '',
        company.sector || '',
        company.region || '',
        company.isActive ? 'Active' : 'Inactive',
        company.isVerified ? 'Yes' : 'No',
        company.website || '',
        company.address || '',
        company.city || '',
        company.state || '',
        company.country || '',
        company.totalJobsPosted || 0,
        company.totalApplications || 0,
        company.rating || 0,
        new Date(company.createdAt).toISOString()
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=companies-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export companies',
      error: error.message
    });
  }
});

// Get all jobs with filters
router.get('/jobs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      region,
      jobType
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (region && region !== 'all') {
      whereClause.region = region;
    }

    if (jobType && jobType !== 'all') {
      whereClause.jobType = jobType;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo']
        }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        jobs,
        totalPages,
        currentPage: parseInt(page),
        totalCount: count
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Get jobs by region
router.get('/jobs/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const {
      page = 1,
      limit = 20,
      search,
      status,
      jobType
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { region };

    // Add filters
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (jobType && jobType !== 'all') {
      whereClause.jobType = jobType;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo']
        }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        jobs,
        totalPages,
        currentPage: parseInt(page),
        totalCount: count
      }
    });
  } catch (error) {
    console.error('Error fetching jobs by region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Update job status
router.patch('/jobs/:id/status', async (req, res) => {
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

    res.json({
      success: true,
      message: `Job ${status} successfully`,
      data: { job: { id: job.id, status: job.status } }
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status',
      error: error.message
    });
  }
});

// Delete job
router.delete('/jobs/:id', async (req, res) => {
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

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
});

// Export jobs
router.get('/jobs/export', async (req, res) => {
  try {
    const { status, region, jobType } = req.query;

    const whereClause = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (region && region !== 'all') {
      whereClause.region = region;
    }

    if (jobType && jobType !== 'all') {
      whereClause.jobType = jobType;
    }

    const jobs = await Job.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['name']
        }
      ]
    });

    // Convert to CSV
    const csvHeader = 'ID,Title,Company,Location,Region,Job Type,Status,Experience Level,Salary Min,Salary Max,Currency,Description,Created At\n';
    const csvRows = jobs.map(job => {
      return [
        job.id,
        job.title || '',
        job.company?.name || '',
        job.location || '',
        job.region || '',
        job.jobType || '',
        job.status || '',
        job.experienceLevel || '',
        job.salaryMin || 0,
        job.salaryMax || 0,
        job.salaryCurrency || '',
        (job.description || '').replace(/"/g, '""'),
        new Date(job.createdAt).toISOString()
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export jobs',
      error: error.message
    });
  }
});

module.exports = router;