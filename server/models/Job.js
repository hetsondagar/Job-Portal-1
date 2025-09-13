const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'job_categories',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  salary_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salary_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salary_currency: {
    type: DataTypes.STRING,
    allowNull: true
  },
  employment_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  experience_level: {
    type: DataTypes.STRING,
    allowNull: true
  },
  skills_required: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  benefits: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  application_deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  is_remote: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  is_internship: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  visibility_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  application_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Job',
  tableName: 'jobs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false
});

module.exports = Job;