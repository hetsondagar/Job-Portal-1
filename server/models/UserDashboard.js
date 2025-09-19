const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const UserDashboard = sequelize.define('UserDashboard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Application statistics
  totalApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_applications'
  },
  applicationsUnderReview: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'applications_under_review'
  },
  applicationsShortlisted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'applications_shortlisted'
  },
  applicationsRejected: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'applications_rejected'
  },
  applicationsAccepted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'applications_accepted'
  },
  lastApplicationDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_application_date'
  },
  
  // Bookmark statistics
  totalBookmarks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_bookmarks'
  },
  lastBookmarkDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_bookmark_date'
  },
  
  // Search statistics
  totalSearches: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_searches'
  },
  savedSearches: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'saved_searches'
  },
  lastSearchDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_search_date'
  },
  
  // Resume statistics
  totalResumes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_resumes'
  },
  hasDefaultResume: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_default_resume'
  },
  lastResumeUpdate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_resume_update'
  },
  
  // Job alert statistics
  totalJobAlerts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_job_alerts'
  },
  activeJobAlerts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'active_job_alerts'
  },
  lastJobAlertDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_job_alert_date'
  },
  
  // Profile statistics
  profileViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'profile_views'
  },
  lastProfileView: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_profile_update'
  },
  profileCompletionPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'profile_completion_percentage'
  },
  
  // Activity tracking
  lastLoginDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_date'
  },
  lastActivityDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_activity_date'
  },
  totalLoginCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_login_count'
  },
  
  // Dashboard preferences
  dashboardLayout: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'dashboard_layout',
    comment: 'User preferences for dashboard layout and widgets'
  },
  notificationPreferences: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'notification_preferences',
    comment: 'User notification preferences'
  },
  privacySettings: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'privacy_settings',
    comment: 'User privacy settings'
  },
  
  // Analytics metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'metadata',
    comment: 'Additional dashboard analytics and user behavior data'
  }
}, {
  tableName: 'user_dashboard',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['last_activity_date']
    },
    {
      fields: ['total_applications']
    },
    {
      fields: ['total_bookmarks']
    }
  ],
  hooks: {
    beforeCreate: (dashboard) => {
      dashboard.lastActivityDate = new Date();
    },
    beforeUpdate: (dashboard) => {
      dashboard.lastActivityDate = new Date();
    }
  }
});

// Instance methods
UserDashboard.prototype.updateApplicationStats = async function(applicationData) {
  // Update application counts based on status
  if (applicationData.status === 'reviewing') {
    this.applicationsUnderReview += 1;
  } else if (applicationData.status === 'shortlisted') {
    this.applicationsShortlisted += 1;
  } else if (applicationData.status === 'rejected') {
    this.applicationsRejected += 1;
  } else if (applicationData.status === 'accepted') {
    this.applicationsAccepted += 1;
  }
  
  this.totalApplications += 1;
  this.lastApplicationDate = new Date();
  
  return this.save();
};

UserDashboard.prototype.updateBookmarkStats = async function() {
  this.totalBookmarks += 1;
  this.lastBookmarkDate = new Date();
  return this.save();
};

UserDashboard.prototype.updateSearchStats = async function() {
  this.totalSearches += 1;
  this.lastSearchDate = new Date();
  return this.save();
};

UserDashboard.prototype.updateResumeStats = async function(hasDefault = false) {
  this.totalResumes += 1;
  this.hasDefaultResume = hasDefault;
  this.lastResumeUpdate = new Date();
  return this.save();
};

UserDashboard.prototype.updateJobAlertStats = async function(activeCount) {
  this.totalJobAlerts += 1;
  this.activeJobAlerts = activeCount;
  return this.save();
};

UserDashboard.prototype.updateProfileStats = async function() {
  this.profileViews += 1;
  this.lastProfileView = new Date();
  return this.save();
};

UserDashboard.prototype.updateLoginStats = async function() {
  this.lastLoginDate = new Date();
  this.totalLoginCount += 1;
  this.lastActivityDate = new Date();
  return this.save();
};

UserDashboard.prototype.getDashboardSummary = function() {
  return {
    applications: {
      total: this.totalApplications,
      underReview: this.applicationsUnderReview,
      shortlisted: this.applicationsShortlisted,
      rejected: this.applicationsRejected,
      accepted: this.applicationsAccepted,
      lastDate: this.lastApplicationDate
    },
    bookmarks: {
      total: this.totalBookmarks,
      lastDate: this.lastBookmarkDate
    },
    searches: {
      total: this.totalSearches,
      saved: this.savedSearches,
      lastDate: this.lastSearchDate
    },
    resumes: {
      total: this.totalResumes,
      hasDefault: this.hasDefaultResume,
      lastUpdate: this.lastResumeUpdate
    },
    jobAlerts: {
      total: this.totalJobAlerts,
      active: this.activeJobAlerts
    },
    profile: {
      views: this.profileViews,
      lastView: this.lastProfileView
    },
    activity: {
      lastLogin: this.lastLoginDate,
      lastActivity: this.lastActivityDate,
      totalLogins: this.totalLoginCount
    }
  };
};

module.exports = UserDashboard;
