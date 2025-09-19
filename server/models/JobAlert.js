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
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'job_alerts',
  timestamps: true,
<<<<<<< HEAD
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
          totalJobAlerts: sequelize.literal('"totalJobAlerts" + 1'),
          activeJobAlerts: sequelize.literal('"activeJobAlerts" + 1')
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
            updates.activeJobAlerts = sequelize.literal('"activeJobAlerts" + 1');
          } else {
            updates.activeJobAlerts = sequelize.literal('"activeJobAlerts" - 1');
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
          totalJobAlerts: sequelize.literal('\"totalJobAlerts\" - 1')
        };
        
        // Decrement active count if it was active
        if (alert.isActive) {
          updates.activeJobAlerts = sequelize.literal('"activeJobAlerts" - 1');
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
=======
  createdAt: 'created_at',
  updatedAt: 'updated_at'
>>>>>>> c2d8c46e9f208357c6add02e1349b8dd86595f70
});

module.exports = JobAlert; 