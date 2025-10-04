const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const JobPreference = sequelize.define('JobPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  // Job preferences
  preferredJobTitles: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  preferredLocations: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  preferredJobTypes: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  preferredExperienceLevels: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  preferredSalaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  preferredSalaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  preferredSalaryCurrency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'INR'
  },
  preferredSkills: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  preferredWorkMode: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  preferredShiftTiming: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  // Additional preferences
  willingToRelocate: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  willingToTravel: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  noticePeriod: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Notification preferences
  emailAlerts: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  pushNotifications: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  // Region specific
  region: {
    type: DataTypes.ENUM('india', 'gulf', 'other'),
    allowNull: true,
    defaultValue: 'india'
  },
  // Additional metadata
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'job_preferences',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      unique: true,
      fields: ['userId']
    },
    {
      fields: ['region']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = JobPreference;
