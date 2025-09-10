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
  coverLetterId: {
    type: DataTypes.UUID,
    allowNull: true,
    // Map to existing DB column to avoid missing column errors if snake_case column isn't present yet
    field: 'coverLetterId',
    references: {
      model: 'cover_letters',
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
    },
    afterCreate: async (application) => {
      try {
        const DashboardService = require('../services/dashboardService');
        await DashboardService.updateDashboardStats(application.userId, {
          totalApplications: sequelize.literal('totalApplications + 1'),
          lastApplicationDate: new Date()
        });
        
        // Record activity
        await DashboardService.recordActivity(application.userId, 'job_apply', {
          jobId: application.jobId,
          applicationId: application.id,
          status: application.status
        });
      } catch (error) {
        console.error('Error updating dashboard stats after application creation:', error);
      }
    },
    afterUpdate: async (application) => {
      try {
        const DashboardService = require('../services/dashboardService');
        
        // Update status-specific counts
        const updates = {};
        if (application.changed('status')) {
          const oldStatus = application._previousDataValues?.status;
          const newStatus = application.status;
          
          // Decrement old status count
          if (oldStatus === 'reviewing') {
            updates.applicationsUnderReview = sequelize.literal('applications_under_review - 1');
          } else if (oldStatus === 'shortlisted') {
            updates.applicationsShortlisted = sequelize.literal('applications_shortlisted - 1');
          } else if (oldStatus === 'rejected') {
            updates.applicationsRejected = sequelize.literal('applications_rejected - 1');
          } else if (oldStatus === 'hired') {
            updates.applicationsAccepted = sequelize.literal('applications_accepted - 1');
          }
          
          // Increment new status count
          if (newStatus === 'reviewing') {
            updates.applicationsUnderReview = sequelize.literal('applications_under_review + 1');
          } else if (newStatus === 'shortlisted') {
            updates.applicationsShortlisted = sequelize.literal('applications_shortlisted + 1');
          } else if (newStatus === 'rejected') {
            updates.applicationsRejected = sequelize.literal('applications_rejected + 1');
          } else if (newStatus === 'hired') {
            updates.applicationsAccepted = sequelize.literal('applications_accepted + 1');
          }
        }
        
        if (Object.keys(updates).length > 0) {
          await DashboardService.updateDashboardStats(application.userId, updates);
        }
        
        // Record activity
        await DashboardService.recordActivity(application.userId, 'application_update', {
          jobId: application.jobId,
          applicationId: application.id,
          status: application.status,
          changes: application.changed()
        });
      } catch (error) {
        console.error('Error updating dashboard stats after application update:', error);
      }
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