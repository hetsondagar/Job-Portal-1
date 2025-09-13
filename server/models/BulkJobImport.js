const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BulkJobImport = sequelize.define('BulkJobImport', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    importName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Name for this bulk import job'
    },
    importType: {
      type: DataTypes.ENUM('csv', 'excel', 'json', 'api'),
      allowNull: false,
      defaultValue: 'csv',
      comment: 'Type of import file'
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL to the uploaded file'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Size of the uploaded file in bytes'
    },
    totalRecords: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total number of records in the file'
    },
    processedRecords: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of records processed so far'
    },
    successfulImports: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of jobs successfully imported'
    },
    failedImports: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of jobs that failed to import'
    },
    skippedRecords: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of records skipped (duplicates, invalid data, etc.)'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
      comment: 'Current status of the import process'
    },
    progress: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Progress percentage (0-100)'
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the import process started'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the import process completed'
    },
    errorLog: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of error messages and details'
    },
    successLog: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of successfully imported jobs'
    },
    mappingConfig: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Field mapping configuration for the import'
    },
    validationRules: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Validation rules applied during import'
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Job template to use for imported jobs'
    },
    defaultValues: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Default values to apply to all imported jobs'
    },
    isScheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this import is scheduled for later'
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the import should be executed'
    },
    notificationEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Email to notify when import completes'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by',
      comment: 'User who initiated this import'
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Company this import belongs to'
    }
  }, {
  tableName: 'bulk_job_imports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
    timestamps: true,
    indexes: [
      {
                  fields: ['created_by']
      },
          {
      fields: ['company_id']
    },
      {
        fields: ['status']
      },
      {
        fields: ['importType']
      },
      {
        fields: ['startedAt']
      },
      {
        fields: ['scheduledAt']
      }
    ]
  });

  BulkJobImport.associate = (models) => {
    BulkJobImport.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    BulkJobImport.belongsTo(models.Company, {
      foreignKey: 'companyId',
      as: 'company'
    });
    
    BulkJobImport.belongsTo(models.JobTemplate, {
      foreignKey: 'templateId',
      as: 'template'
    });
  };

  return BulkJobImport;
};


