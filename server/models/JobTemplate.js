const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
      type: DataTypes.ENUM('technical', 'non-technical', 'management', 'entry-level', 'senior', 'custom'),
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
      {
        fields: ['created_by']
      },
      {
        fields: ['company_id']
      },
      {
        fields: ['category']
      },
      {
        fields: ['is_public']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  JobTemplate.associate = (models) => {
    JobTemplate.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    JobTemplate.belongsTo(models.Company, {
      foreignKey: 'companyId',
      as: 'company'
    });
  };

  return JobTemplate;
};

