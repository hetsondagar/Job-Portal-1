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
    },
    field: 'job_id'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'employer_id'
  },
  status: {
    type: DataTypes.ENUM('applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'),
    defaultValue: 'applied',
    allowNull: false
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expectedSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  expectedSalaryCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  noticePeriod: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Notice period in days'
  },
  availableFrom: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isWillingToRelocate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  preferredLocations: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of preferred locations'
  },
  source: {
    type: DataTypes.STRING(50),
    defaultValue: 'website',
    comment: 'Application source: website, email, referral, etc.'
  },
  referralCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  resumeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'resumes',
      key: 'id'
    },
    field: 'resume_id'
  },
  cover_letter_id: {
    type: DataTypes.UUID,
    allowNull: true,
    // Map to existing DB column to avoid missing column errors if snake_case column isn't present yet
    field: 'cover_letter_id',
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