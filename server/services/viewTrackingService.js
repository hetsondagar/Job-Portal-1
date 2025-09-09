const { ViewTracking, User, Job } = require('../config/index');
const { Op } = require('sequelize');

class ViewTrackingService {
  /**
   * Track a view (job, profile, or company)
   * @param {Object} params - View tracking parameters
   * @param {string} params.viewerId - ID of the user viewing (null for anonymous)
   * @param {string} params.viewedUserId - ID of the user being viewed
   * @param {string} params.jobId - ID of the job being viewed (optional)
   * @param {string} params.viewType - Type of view ('job_view', 'profile_view', 'company_view')
   * @param {string} params.ipAddress - IP address of the viewer
   * @param {string} params.userAgent - User agent string
   * @param {string} params.sessionId - Session ID for anonymous users
   * @param {string} params.referrer - Referrer URL
   * @param {Object} params.metadata - Additional metadata
   */
  static async trackView({
    viewerId,
    viewedUserId,
    jobId = null,
    viewType,
    ipAddress = null,
    userAgent = null,
    sessionId = null,
    referrer = null,
    metadata = {}
  }) {
    try {
      // Don't track views from the same user to their own profile/job
      if (viewerId === viewedUserId) {
        return { success: false, message: 'Cannot track self-views' };
      }

      // Check if this view already exists (prevent duplicate tracking)
      const existingView = await ViewTracking.findOne({
        where: {
          viewerId: viewerId || null,
          viewedUserId,
          viewType,
          jobId: jobId || null,
          [Op.or]: [
            // For authenticated users, check by viewerId
            ...(viewerId ? [{ viewerId }] : []),
            // For anonymous users, check by IP and session
            ...(!viewerId ? [
              { ipAddress },
              { sessionId }
            ] : [])
          ]
        }
      });

      if (existingView) {
        return { success: false, message: 'View already tracked' };
      }

      // Create the view tracking record
      const view = await ViewTracking.create({
        viewerId,
        viewedUserId,
        jobId,
        viewType,
        ipAddress,
        userAgent,
        sessionId,
        referrer,
        metadata
      });

      console.log(`✅ View tracked: ${viewType} for user ${viewedUserId} by ${viewerId || 'anonymous'}`);
      
      return { success: true, data: view };
    } catch (error) {
      console.error('Error tracking view:', error);
      return { success: false, message: 'Failed to track view', error: error.message };
    }
  }

  /**
   * Get view statistics for a user
   * @param {string} userId - User ID to get stats for
   * @param {string} viewType - Type of views to count (optional)
   * @param {number} days - Number of days to look back (default: 30)
   */
  static async getUserViewStats(userId, viewType = null, days = 30) {
    try {
      const whereClause = {
        viewedUserId: userId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      };

      if (viewType) {
        whereClause.viewType = viewType;
      }

      const stats = await ViewTracking.findAll({
        where: whereClause,
        attributes: [
          'viewType',
          [ViewTracking.sequelize.fn('COUNT', ViewTracking.sequelize.col('id')), 'count'],
          [ViewTracking.sequelize.fn('DATE', ViewTracking.sequelize.col('createdAt')), 'date']
        ],
        group: ['viewType', ViewTracking.sequelize.fn('DATE', ViewTracking.sequelize.col('createdAt'))],
        order: [[ViewTracking.sequelize.fn('DATE', ViewTracking.sequelize.col('createdAt')), 'DESC']]
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting view stats:', error);
      return { success: false, message: 'Failed to get view stats', error: error.message };
    }
  }

  /**
   * Get unique viewers count for a user
   * @param {string} userId - User ID
   * @param {string} viewType - Type of views to count (optional)
   * @param {number} days - Number of days to look back (default: 30)
   */
  static async getUniqueViewersCount(userId, viewType = null, days = 30) {
    try {
      const whereClause = {
        viewedUserId: userId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      };

      if (viewType) {
        whereClause.viewType = viewType;
      }

      const count = await ViewTracking.count({
        where: whereClause,
        distinct: true,
        col: 'viewerId'
      });

      return { success: true, data: { uniqueViewers: count } };
    } catch (error) {
      console.error('Error getting unique viewers count:', error);
      return { success: false, message: 'Failed to get unique viewers count', error: error.message };
    }
  }

  /**
   * Get recent views for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of recent views to return (default: 10)
   */
  static async getRecentViews(userId, limit = 10) {
    try {
      const views = await ViewTracking.findAll({
        where: { viewedUserId: userId },
        include: [
          {
            model: User,
            as: 'viewer',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          },
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'location'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit
      });

      return { success: true, data: views };
    } catch (error) {
      console.error('Error getting recent views:', error);
      return { success: false, message: 'Failed to get recent views', error: error.message };
    }
  }
}

module.exports = ViewTrackingService;
