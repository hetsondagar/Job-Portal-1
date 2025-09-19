'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HotVacancy = sequelize.define('HotVacancy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
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
  modelName: 'HotVacancy',
  tableName: 'hot_vacancies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false
});

module.exports = HotVacancy;