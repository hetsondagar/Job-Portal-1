const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const JobTemplate = sequelize.define('JobTemplate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Company this template belongs to'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Template name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Template description'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Category for this template'
    },
    templateData: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Template data structure'
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Template tags'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether template is active'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether template is public'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether template is default'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'User who created this template'
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When template was last used'
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of times template was used'
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Template version'
    }
}, {
  tableName: 'job_templates',
  timestamps: true,
  indexes: [
    { fields: ['createdBy'] },
    { fields: ['companyId'] },
    { fields: ['category'] },
    { fields: ['isPublic'] },
    { fields: ['isActive'] }
  ]
});

module.exports = JobTemplate;

