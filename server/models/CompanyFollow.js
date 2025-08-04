const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const CompanyFollow = sequelize.define('CompanyFollow', {
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
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  notificationPreferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      newJobs: true,
      companyUpdates: true,
      jobAlerts: true,
      email: true,
      push: true,
      sms: false
    },
    comment: 'Notification preferences for this company'
  },
  followedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  lastNotificationAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional follow data'
  }
}, {
  tableName: 'company_follows',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['userId', 'companyId'],
      unique: true,
      name: 'unique_user_company_follow'
    },
    {
      fields: ['companyId']
    },
    {
      fields: ['followedAt']
    }
  ],
  hooks: {
    afterCreate: async (follow) => {
      // Update company follower count
      const { Company } = require('../config/index');
      const company = await Company.findByPk(follow.companyId);
      if (company) {
        await company.increment('followerCount');
      }
    },
    afterDestroy: async (follow) => {
      // Update company follower count
      const { Company } = require('../config/index');
      const company = await Company.findByPk(follow.companyId);
      if (company) {
        await company.decrement('followerCount');
      }
    }
  }
});

// Instance methods
CompanyFollow.prototype.getNotificationCount = function() {
  return this.notificationPreferences?.newJobs ? 1 : 0;
};

CompanyFollow.prototype.isNotificationEnabled = function(type) {
  return this.notificationPreferences?.[type] || false;
};

CompanyFollow.prototype.updateLastNotification = function() {
  this.lastNotificationAt = new Date();
  return this.save();
};

module.exports = CompanyFollow; 