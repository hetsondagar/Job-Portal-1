const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const JobAlert = sequelize.define('JobAlert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  keywords: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of job title keywords'
  },
  locations: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of preferred locations'
  },
  categories: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of job category IDs'
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive'),
    allowNull: true
  },
  salaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  jobType: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of job types: full-time, part-time, etc.'
  },
  remoteWork: {
    type: DataTypes.ENUM('on_site', 'hybrid', 'remote', 'any'),
    defaultValue: 'any'
  },
  frequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
    defaultValue: 'weekly'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextSendAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  pushEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  smsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  maxResults: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Maximum number of jobs to include in alert'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional alert data'
  }
}, {
  tableName: 'job_alerts',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'is_active']
    },
    {
      fields: ['next_send_at']
    },
    {
      fields: ['frequency']
    }
  ],
  hooks: {
    beforeCreate: (alert) => {
      if (!alert.nextSendAt) {
        alert.nextSendAt = new Date();
        switch (alert.frequency) {
          case 'daily':
            alert.nextSendAt.setDate(alert.nextSendAt.getDate() + 1);
            break;
          case 'weekly':
            alert.nextSendAt.setDate(alert.nextSendAt.getDate() + 7);
            break;
          case 'monthly':
            alert.nextSendAt.setMonth(alert.nextSendAt.getMonth() + 1);
            break;
        }
      }
    },
    afterCreate: async (alert) => {
      try {
        const DashboardService = require('../services/dashboardService');
        await DashboardService.updateDashboardStats(alert.userId, {
          totalJobAlerts: sequelize.literal('totalJobAlerts + 1'),
          activeJobAlerts: sequelize.literal('activeJobAlerts + 1')
        });
        
        // Record activity
        await DashboardService.recordActivity(alert.userId, 'job_alert_create', {
          alertId: alert.id,
          keywords: alert.keywords,
          frequency: alert.frequency
        });
      } catch (error) {
        console.error('Error updating dashboard stats after job alert creation:', error);
      }
    },
    afterUpdate: async (alert) => {
      try {
        const DashboardService = require('../services/dashboardService');
        
        const updates = {};
        
        // Check if active status changed
        if (alert.changed('isActive')) {
          if (alert.isActive) {
            updates.activeJobAlerts = sequelize.literal('activeJobAlerts + 1');
          } else {
            updates.activeJobAlerts = sequelize.literal('activeJobAlerts - 1');
          }
        }
        
        if (Object.keys(updates).length > 0) {
          await DashboardService.updateDashboardStats(alert.userId, updates);
        }
        
        // Record activity
        await DashboardService.recordActivity(alert.userId, 'job_alert_update', {
          alertId: alert.id,
          changes: alert.changed()
        });
      } catch (error) {
        console.error('Error updating dashboard stats after job alert update:', error);
      }
    },
    afterDestroy: async (alert) => {
      try {
        const DashboardService = require('../services/dashboardService');
        
        const updates = {
          totalJobAlerts: sequelize.literal('totalJobAlerts - 1')
        };
        
        // Decrement active count if it was active
        if (alert.isActive) {
          updates.activeJobAlerts = sequelize.literal('activeJobAlerts - 1');
        }
        
        await DashboardService.updateDashboardStats(alert.userId, updates);
        
        // Record activity
        await DashboardService.recordActivity(alert.userId, 'job_alert_delete', {
          alertId: alert.id,
          keywords: alert.keywords
        });
      } catch (error) {
        console.error('Error updating dashboard stats after job alert deletion:', error);
      }
    }
  }
});

// Instance methods
JobAlert.prototype.getSearchCriteria = function() {
  return {
    keywords: this.keywords || [],
    locations: this.locations || [],
    categories: this.categories || [],
    experienceLevel: this.experienceLevel,
    salaryMin: this.salaryMin,
    salaryMax: this.salaryMax,
    jobType: this.jobType || [],
    remoteWork: this.remoteWork
  };
};

JobAlert.prototype.isDue = function() {
  return this.isActive && this.nextSendAt && this.nextSendAt <= new Date();
};

JobAlert.prototype.updateNextSendDate = function() {
  this.lastSentAt = new Date();
  this.nextSendAt = new Date();
  
  switch (this.frequency) {
    case 'daily':
      this.nextSendAt.setDate(this.nextSendAt.getDate() + 1);
      break;
    case 'weekly':
      this.nextSendAt.setDate(this.nextSendAt.getDate() + 7);
      break;
    case 'monthly':
      this.nextSendAt.setMonth(this.nextSendAt.getMonth() + 1);
      break;
  }
  
  return this.save();
};

JobAlert.prototype.getNotificationChannels = function() {
  const channels = [];
  if (this.emailEnabled) channels.push('email');
  if (this.pushEnabled) channels.push('push');
  if (this.smsEnabled) channels.push('sms');
  return channels;
};

module.exports = JobAlert; 