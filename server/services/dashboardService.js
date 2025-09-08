const SearchHistory = require('../models/SearchHistory');
const UserDashboard = require('../models/UserDashboard');
const JobApplication = require('../models/JobApplication');
const JobBookmark = require('../models/JobBookmark');
const JobAlert = require('../models/JobAlert');
const Resume = require('../models/Resume');
const Analytics = require('../models/Analytics');
const CandidateLike = require('../models/CandidateLike');
const { sequelize } = require('../config/sequelize');

class DashboardService {
  /**
   * Get or create user dashboard
   */
  static async getUserDashboard(userId) {
    try {
      let dashboard = await UserDashboard.findOne({
        where: { userId }
      });

      if (!dashboard) {
        dashboard = await UserDashboard.create({
          userId,
          totalApplications: 0,
          totalBookmarks: 0,
          totalSearches: 0,
          totalResumes: 0,
          totalJobAlerts: 0,
          profileViews: 0,
          applicationsUnderReview: 0,
          applicationsShortlisted: 0,
          applicationsRejected: 0,
          applicationsAccepted: 0,
          savedSearches: 0,
          hasDefaultResume: false,
          activeJobAlerts: 0,
          totalLoginCount: 0
        });
      }

      return dashboard;
    } catch (error) {
      console.error('Error getting user dashboard:', error);
      // Return a default dashboard object if database fails
      return {
        userId,
        totalApplications: 0,
        totalBookmarks: 0,
        totalSearches: 0,
        totalResumes: 0,
        totalJobAlerts: 0,
        profileViews: 0,
        applicationsUnderReview: 0,
        applicationsShortlisted: 0,
        applicationsRejected: 0,
        applicationsAccepted: 0,
        savedSearches: 0,
        hasDefaultResume: false,
        activeJobAlerts: 0,
        totalLoginCount: 0,
        getDashboardSummary: function() {
          return {
            applications: {
              total: this.totalApplications || 0,
              underReview: this.applicationsUnderReview || 0,
              shortlisted: this.applicationsShortlisted || 0,
              rejected: this.applicationsRejected || 0,
              accepted: this.applicationsAccepted || 0,
              lastDate: this.lastApplicationDate
            },
            bookmarks: {
              total: this.totalBookmarks || 0,
              lastDate: this.lastBookmarkDate
            },
            searches: {
              total: this.totalSearches || 0,
              saved: this.savedSearches || 0,
              lastDate: this.lastSearchDate
            },
            resumes: {
              total: this.totalResumes || 0,
              hasDefault: this.hasDefaultResume || false,
              lastUpdate: this.lastResumeUpdate
            },
            jobAlerts: {
              total: this.totalJobAlerts || 0,
              active: this.activeJobAlerts || 0
            },
            profile: {
              views: this.profileViews || 0,
              lastView: this.lastProfileView
            },
            activity: {
              lastLogin: this.lastLoginDate,
              lastActivity: this.lastActivityDate,
              totalLogins: this.totalLoginCount || 0
            }
          };
        }
      };
    }
  }

  /**
   * Update dashboard statistics
   */
  static async updateDashboardStats(userId, updates = {}) {
    try {
      const dashboard = await this.getUserDashboard(userId);
      
      // Update specific fields
      Object.keys(updates).forEach(key => {
        if (dashboard[key] !== undefined) {
          dashboard[key] = updates[key];
        }
      });

      await dashboard.save();
      return dashboard;
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Record a new search
   */
  static async recordSearch(searchData) {
    try {
      const { userId, searchQuery, filters, resultsCount, searchType = 'job_search' } = searchData;
      
      // Create search history record
      const searchHistory = await SearchHistory.create({
        userId,
        searchQuery,
        filters,
        resultsCount,
        searchType,
        location: filters.location,
        experienceLevel: filters.experienceLevel,
        salaryMin: filters.salaryMin,
        salaryMax: filters.salaryMax,
        remoteWork: filters.remoteWork,
        jobCategory: filters.jobCategory,
        metadata: {
          userAgent: searchData.userAgent,
          ipAddress: searchData.ipAddress,
          timestamp: new Date()
        }
      });

      // Update dashboard search stats
      await this.updateDashboardStats(userId, {
        totalSearches: sequelize.literal('totalSearches + 1'),
        lastSearchDate: new Date()
      });

      return searchHistory;
    } catch (error) {
      console.error('Error recording search:', error);
      throw error;
    }
  }

  /**
   * Get user search history
   */
  static async getSearchHistory(userId, limit = 20) {
    try {
      // Check if the table exists first
      const tableExists = await sequelize.getQueryInterface().showAllTables();
      const searchHistoryTableExists = tableExists.some(table => table === 'search_history');
      
      if (!searchHistoryTableExists) {
        console.log('Search history table does not exist, returning empty array');
        return [];
      }

      const searchHistory = await SearchHistory.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit
      });

      return searchHistory;
    } catch (error) {
      console.error('Error getting search history:', error);
      // Return empty array instead of throwing error to prevent frontend crashes
      console.log('Returning empty search history due to error');
      return [];
    }
  }

  /**
   * Save a search as favorite
   */
  static async saveSearch(userId, searchId) {
    try {
      const searchHistory = await SearchHistory.findOne({
        where: { id: searchId, userId }
      });

      if (!searchHistory) {
        throw new Error('Search not found');
      }

      searchHistory.isSaved = true;
      await searchHistory.save();

      // Update dashboard saved searches count
      await this.updateDashboardStats(userId, {
        savedSearches: sequelize.literal('savedSearches + 1')
      });

      return searchHistory;
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  }

  /**
   * Remove saved search
   */
  static async removeSavedSearch(userId, searchId) {
    try {
      const searchHistory = await SearchHistory.findOne({
        where: { id: searchId, userId }
      });

      if (!searchHistory) {
        throw new Error('Search not found');
      }

      searchHistory.isSaved = false;
      await searchHistory.save();

      // Update dashboard saved searches count
      await this.updateDashboardStats(userId, {
        savedSearches: sequelize.literal('savedSearches - 1')
      });

      return searchHistory;
    } catch (error) {
      console.error('Error removing saved search:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  static async getDashboardData(userId) {
    try {
      const dashboard = await this.getUserDashboard(userId);
      
      // Get recent applications with error handling
      let recentApplications = [];
      try {
        recentApplications = await JobApplication.findAll({
          where: { userId },
          order: [['appliedAt', 'DESC']],
          limit: 5,
          include: [{
            model: require('../models/Job'),
            as: 'job',
            attributes: ['id', 'title', 'location', 'salaryMin', 'salaryMax', 'companyId']
          }]
        });
      } catch (error) {
        console.error('Error fetching recent applications:', error);
        recentApplications = [];
      }

      // Get recent bookmarks with error handling
      let recentBookmarks = [];
      try {
        recentBookmarks = await JobBookmark.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 5,
          include: [{
            model: require('../models/Job'),
            as: 'job',
            attributes: ['id', 'title', 'location', 'salaryMin', 'salaryMax', 'companyId']
          }]
        });
      } catch (error) {
        console.error('Error fetching recent bookmarks:', error);
        recentBookmarks = [];
      }

      // Get recent searches with error handling
      let recentSearches = [];
      try {
        recentSearches = await this.getSearchHistory(userId, 5);
      } catch (error) {
        console.error('Error fetching recent searches:', error);
        recentSearches = [];
      }

      // Get job alerts with error handling
      let jobAlerts = [];
      try {
        jobAlerts = await JobAlert.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']]
        });
      } catch (error) {
        console.error('Error fetching job alerts:', error);
        jobAlerts = [];
      }

      // Get resumes with error handling
      let resumes = [];
      try {
        resumes = await Resume.findAll({
          where: { userId },
          order: [['isDefault', 'DESC'], ['lastUpdated', 'DESC']]
        });
      } catch (error) {
        console.error('Error fetching resumes:', error);
        resumes = [];
      }

      // Get profile analytics with error handling
      let profileViews = 0;
      try {
        profileViews = await Analytics.count({
          where: { 
            userId,
            eventType: 'profile_view'
          }
        });
      } catch (error) {
        console.error('Error fetching profile views:', error);
        profileViews = 0;
      }

      // Get profile like count with error handling
      let profileLikes = 0;
      try {
        profileLikes = await CandidateLike.count({ where: { candidateId: userId } });
      } catch (error) {
        console.error('Error fetching profile likes:', error);
        profileLikes = 0;
      }

      return {
        dashboard: dashboard.getDashboardSummary ? dashboard.getDashboardSummary() : {
          applications: {
            total: dashboard.totalApplications || 0,
            underReview: dashboard.applicationsUnderReview || 0,
            shortlisted: dashboard.applicationsShortlisted || 0,
            rejected: dashboard.applicationsRejected || 0,
            accepted: dashboard.applicationsAccepted || 0,
            lastDate: dashboard.lastApplicationDate
          },
          bookmarks: {
            total: dashboard.totalBookmarks || 0,
            lastDate: dashboard.lastBookmarkDate
          },
          searches: {
            total: dashboard.totalSearches || 0,
            saved: dashboard.savedSearches || 0,
            lastDate: dashboard.lastSearchDate
          },
          resumes: {
            total: dashboard.totalResumes || 0,
            hasDefault: dashboard.hasDefaultResume || false,
            lastUpdate: dashboard.lastResumeUpdate
          },
          jobAlerts: {
            total: dashboard.totalJobAlerts || 0,
            active: dashboard.activeJobAlerts || 0
          },
          profile: {
            views: dashboard.profileViews || 0,
            lastView: dashboard.lastProfileView
          },
          activity: {
            lastLogin: dashboard.lastLoginDate,
            lastActivity: dashboard.lastActivityDate,
            totalLogins: dashboard.totalLoginCount || 0
          }
        },
        recentApplications,
        recentBookmarks,
        recentSearches,
        jobAlerts,
        resumes,
        profileViews,
        profileLikes,
        stats: {
          totalApplications: dashboard.totalApplications || 0,
          applicationsUnderReview: dashboard.applicationsUnderReview || 0,
          totalBookmarks: dashboard.totalBookmarks || 0,
          totalSearches: dashboard.totalSearches || 0,
          savedSearches: dashboard.savedSearches || 0,
          totalResumes: dashboard.totalResumes || 0,
          hasDefaultResume: dashboard.hasDefaultResume || false,
          totalJobAlerts: dashboard.totalJobAlerts || 0,
          activeJobAlerts: dashboard.activeJobAlerts || 0,
          profileViews,
          profileLikes
        }
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  /**
   * Sync dashboard stats with actual data
   */
  static async syncDashboardStats(userId) {
    try {
      // Count actual applications
      const applicationStats = await JobApplication.findAll({
        where: { userId },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Count actual bookmarks
      const bookmarkCount = await JobBookmark.count({
        where: { userId }
      });

      // Count actual searches
      const searchCount = await SearchHistory.count({
        where: { userId }
      });

      // Count saved searches
      const savedSearchCount = await SearchHistory.count({
        where: { userId, isSaved: true }
      });

      // Count actual resumes
      const resumeCount = await Resume.count({
        where: { userId }
      });

      // Count actual job alerts
      const jobAlertCount = await JobAlert.count({
        where: { userId }
      });

      // Update dashboard with actual counts
      await this.updateDashboardStats(userId, {
        totalApplications: applicationStats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0),
        applicationsUnderReview: applicationStats.find(s => s.status === 'reviewing')?.dataValues.count || 0,
        applicationsShortlisted: applicationStats.find(s => s.status === 'shortlisted')?.dataValues.count || 0,
        applicationsRejected: applicationStats.find(s => s.status === 'rejected')?.dataValues.count || 0,
        applicationsAccepted: applicationStats.find(s => s.status === 'accepted')?.dataValues.count || 0,
        totalBookmarks: bookmarkCount,
        totalSearches: searchCount,
        savedSearches: savedSearchCount,
        totalResumes: resumeCount,
        totalJobAlerts: jobAlertCount
      });

      return true;
    } catch (error) {
      console.error('Error syncing dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Record user activity
   */
  static async recordActivity(userId, activityType, metadata = {}) {
    try {
      // Update dashboard activity
      await this.updateDashboardStats(userId, {
        lastActivityDate: new Date()
      });

      // Record analytics event
      await Analytics.create({
        userId,
        eventType: activityType,
        eventCategory: this.getEventCategory(activityType),
        metadata: {
          ...metadata,
          timestamp: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Error recording activity:', error);
      throw error;
    }
  }

  /**
   * Get event category for analytics
   */
  static getEventCategory(eventType) {
    const categoryMap = {
      'dashboard_view': 'user_engagement',
      'search_performed': 'user_engagement',
      'job_apply': 'application_process',
      'job_bookmark': 'job_interaction',
      'resume_upload': 'user_engagement',
      'profile_update': 'user_engagement',
      'job_alert_create': 'user_engagement'
    };

    return categoryMap[eventType] || 'user_engagement';
  }
}

module.exports = DashboardService;
