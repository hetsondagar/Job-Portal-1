const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
    }
  },
  additionalDocuments: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of additional document URLs'
  },
  employerNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Private notes for employer'
  },
  candidateNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes visible to candidate'
  },
  interviewScheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  interviewLocation: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  interviewType: {
    type: DataTypes.ENUM('phone', 'video', 'in_person', 'technical_test'),
    allowNull: true
  },
  interviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  offerDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Offer letter details'
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  lastUpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional application data'
  }
}, {
  tableName: 'job_applications',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['job_id', 'user_id'],
      unique: true,
      name: 'unique_job_application'
    },
    {
      fields: ['status']
    },
    {
      fields: ['applied_at']
    },
    {
      fields: ['employer_id', 'status']
    }
  ],
  hooks: {
    beforeUpdate: (application) => {
      application.lastUpdatedAt = new Date();
    }
  }
});

// Instance methods
JobApplication.prototype.getStatusLabel = function() {
  const statusLabels = {
    applied: 'Applied',
    reviewing: 'Under Review',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview Scheduled',
    interviewed: 'Interviewed',
    offered: 'Offer Made',
    hired: 'Hired',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  };
  return statusLabels[this.status] || this.status;
};

JobApplication.prototype.getStatusColor = function() {
  const statusColors = {
    applied: 'blue',
    reviewing: 'yellow',
    shortlisted: 'green',
    interview_scheduled: 'purple',
    interviewed: 'indigo',
    offered: 'emerald',
    hired: 'green',
    rejected: 'red',
    withdrawn: 'gray'
  };
  return statusColors[this.status] || 'gray';
};

JobApplication.prototype.canWithdraw = function() {
  return ['applied', 'reviewing', 'shortlisted'].includes(this.status);
};

JobApplication.prototype.canRescheduleInterview = function() {
  return this.status === 'interview_scheduled' && this.interviewScheduledAt > new Date();
};

module.exports = JobApplication; 