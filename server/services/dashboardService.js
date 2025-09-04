const SearchHistory = require('../models/SearchHistory');
const UserDashboard = require('../models/UserDashboard');
const JobApplication = require('../models/JobApplication');
const JobBookmark = require('../models/JobBookmark');
const JobAlert = require('../models/JobAlert');
const Resume = require('../models/Resume');
const Analytics = require('../models/Analytics');
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
          profileViews: 0
        });
      }

      return dashboard;
    } catch (error) {
      console.error('Error getting user dashboard:', error);
      throw error;
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
      
      // Get recent applications
      const recentApplications = await JobApplication.findAll({
        where: { userId },
        order: [['appliedAt', 'DESC']],
        limit: 5,
        include: [{
          model: require('../models/Job'),
          as: 'job',
          attributes: ['id', 'title', 'location', 'salaryMin', 'salaryMax', 'companyId']
        }]
      });

      // Get recent bookmarks
      const recentBookmarks = await JobBookmark.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{
          model: require('../models/Job'),
          as: 'job',
          attributes: ['id', 'title', 'location', 'salaryMin', 'salaryMax', 'companyId']
        }]
      });

      // Get recent searches
      const recentSearches = await SearchHistory.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      // Get job alerts
      const jobAlerts = await JobAlert.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      // Get resumes
      const resumes = await Resume.findAll({
        where: { userId },
        order: [['isDefault', 'DESC'], ['lastUpdated', 'DESC']]
      });

      // Get profile analytics
      const profileViews = await Analytics.count({
        where: { 
          userId,
          eventType: 'profile_view'
        }
      });

      return {
        dashboard: dashboard.getDashboardSummary(),
        recentApplications,
        recentBookmarks,
        recentSearches,
        jobAlerts,
        resumes,
        profileViews,
        stats: {
          totalApplications: dashboard.totalApplications,
          applicationsUnderReview: dashboard.applicationsUnderReview,
          totalBookmarks: dashboard.totalBookmarks,
          totalSearches: dashboard.totalSearches,
          savedSearches: dashboard.savedSearches,
          totalResumes: dashboard.totalResumes,
          hasDefaultResume: dashboard.hasDefaultResume,
          totalJobAlerts: dashboard.totalJobAlerts,
          activeJobAlerts: dashboard.activeJobAlerts,
          profileViews
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
