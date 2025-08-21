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
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  postedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'India'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
    allowNull: false,
    defaultValue: 'full-time'
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive'),
    allowNull: true
  },
  experienceMin: {
    type: DataTypes.INTEGER, // in years
    allowNull: true
  },
  experienceMax: {
    type: DataTypes.INTEGER, // in years
    allowNull: true
  },
  salaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salaryCurrency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'INR'
  },
  salaryPeriod: {
    type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
    allowNull: true,
    defaultValue: 'yearly'
  },
  isSalaryVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  benefits: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  remoteWork: {
    type: DataTypes.ENUM('on-site', 'remote', 'hybrid'),
    allowNull: true,
    defaultValue: 'on-site'
  },
  travelRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shiftTiming: {
    type: DataTypes.ENUM('day', 'night', 'rotational', 'flexible'),
    allowNull: true,
    defaultValue: 'day'
  },
  noticePeriod: {
    type: DataTypes.INTEGER, // in days
    allowNull: true
  },
  education: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  languages: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'closed', 'expired'),
    allowNull: false,
    defaultValue: 'draft'
  },
  isUrgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applications: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  validTill: {
    type: DataTypes.DATE,
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Advanced Job Posting Features
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this is a private/targeted job posting'
  },
  visibilityType: {
    type: DataTypes.ENUM('public', 'private', 'referral-only', 'invite-only'),
    defaultValue: 'public',
    comment: 'Visibility type for the job posting'
  },
  allowedViewers: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of user IDs or email domains allowed to view this job'
  },
  referralCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Referral code for private job access'
  },
  scheduledPublishAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When to automatically publish this job'
  },
  scheduledExpiryAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When to automatically expire this job'
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether to automatically renew this job posting'
  },
  renewalPeriod: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Renewal period in days'
  },
  maxRenewals: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maximum number of times this job can be renewed'
  },
  currentRenewalCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Current number of renewals'
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Reference to job template used'
  },
  bulkImportId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Reference to bulk import job if created via bulk import'
  },
  // Enhanced Analytics
  searchImpressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times job appeared in search results'
  },
  searchClicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of clicks from search results'
  },
  applicationRate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0,
    comment: 'Application rate (applications/views)'
  },
  qualityScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    comment: 'AI-powered quality score for the job posting'
  },
  seoScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    comment: 'SEO optimization score'
  },
  // Advanced Features
  isATSEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether ATS scoring is enabled for this job'
  },
  atsKeywords: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Keywords for ATS optimization'
  },
  targetAudience: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Target audience criteria for this job'
  },
  promotionSettings: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Promotion and advertising settings'
  }
}, {
  tableName: 'jobs',
  hooks: {
    beforeCreate: async (job) => {
      if (!job.slug) {
        job.slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    },
    beforeUpdate: async (job) => {
      if (job.changed('title') && !job.changed('slug')) {
        job.slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    }
  }
});

// Instance methods
Job.prototype.getExperienceRange = function() {
  if (this.experienceMin && this.experienceMax) {
    return `${this.experienceMin}-${this.experienceMax} years`;
  } else if (this.experienceMin) {
    return `${this.experienceMin}+ years`;
  } else if (this.experienceMax) {
    return `0-${this.experienceMax} years`;
  }
  return 'Not specified';
};

Job.prototype.getSalaryRange = function() {
  if (!this.isSalaryVisible) {
    return 'Not disclosed';
  }
  if (this.salaryMin && this.salaryMax) {
    return `${this.salaryCurrency} ${this.salaryMin.toLocaleString()}-${this.salaryMax.toLocaleString()} ${this.salaryPeriod}`;
  } else if (this.salaryMin) {
    return `${this.salaryCurrency} ${this.salaryMin.toLocaleString()}+ ${this.salaryPeriod}`;
  } else if (this.salaryMax) {
    return `${this.salaryCurrency} Up to ${this.salaryMax.toLocaleString()} ${this.salaryPeriod}`;
  }
  return 'Not specified';
};

Job.prototype.isExpired = function() {
  if (!this.validTill) return false;
  return new Date() > new Date(this.validTill);
};

Job.prototype.getLocationString = function() {
  const parts = [this.city, this.state, this.country];
  return parts.filter(part => part).join(', ');
};

module.exports = Job; 