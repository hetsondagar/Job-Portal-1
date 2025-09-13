const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resume_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'resumes',
      key: 'id'
    }
  },
  cover_letter_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'cover_letters',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'applied'
  },
  applied_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'JobApplication',
  tableName: 'job_applications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false
});

module.exports = JobApplication;