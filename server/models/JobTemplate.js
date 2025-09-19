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
      field: 'company_id',
      comment: 'Company this template belongs to'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Template title'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Template description'
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'category_id',
      comment: 'Category ID for this template'
    }
}, {
  tableName: 'job_templates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
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

