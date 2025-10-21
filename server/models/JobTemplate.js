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
      field: 'companyId', // Explicitly map to camelCase column
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
      field: 'template_data',
      comment: 'Template data structure'
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Template tags'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_public',
      comment: 'Whether template is public'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_default',
      comment: 'Whether template is default'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by',
      comment: 'User who created this template'
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_used_at',
      comment: 'When template was last used'
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'usage_count',
      comment: 'Number of times template was used'
    }
}, {
  tableName: 'job_templates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['created_by'] },
    { fields: ['companyId'] },
    { fields: ['category'] },
    { fields: ['is_public'] }
  ]
});

module.exports = JobTemplate;

