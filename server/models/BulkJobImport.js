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
      field: 'import_name',
      comment: 'Name for this bulk import job'
    },
    importType: {
      type: DataTypes.ENUM('csv', 'excel', 'json', 'api'),
      allowNull: false,
      defaultValue: 'csv',
      field: 'import_type',
      comment: 'Type of import file'
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'file_path',
      comment: 'Path to the uploaded file'
    },
    totalRecords: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_records',
      comment: 'Total number of records in the file'
    },
    processedRecords: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'processed_records',
      comment: 'Number of records processed so far'
    },
    failedRecords: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'failed_records',
      comment: 'Number of records that failed to import'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
      comment: 'Current status of the import process'
    },
    errorLog: {
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'error_log',
      comment: 'Array of error messages and details'
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
      field: 'company_id',
      comment: 'Company this import belongs to'
    }
  }, {
    tableName: 'bulk_job_imports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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
        fields: ['import_type']
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
  };

  return BulkJobImport;
};


