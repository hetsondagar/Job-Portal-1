const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const JobTemplate = sequelize.define('JobTemplate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Template name for easy identification'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Template description'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'custom',
      comment: 'Template category for organization'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether template is available to all employers'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a system default template'
    },
    templateData: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Structured template data including all job fields'
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of times this template has been used'
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time this template was used'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether template is active and available'
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Tags for easy searching and categorization'
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Template version for tracking changes'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'User who created this template'
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Company this template belongs to (null for system templates)'
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

