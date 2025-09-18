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
  employerId: {
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
  region: {
    type: DataTypes.ENUM('india', 'gulf', 'other'),
    allowNull: true,
    defaultValue: 'india'
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
  salary: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Salary range as entered by user (e.g., "₹8-15 LPA")'
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
    defaultValue: false
  },
  visibilityType: {
    type: DataTypes.ENUM('public', 'private', 'referral-only', 'invite-only'),
    defaultValue: 'public'
  },
  allowedViewers: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  referralCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  scheduledPublishAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  scheduledExpiryAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  renewalPeriod: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  maxRenewals: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  currentRenewalCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  bulkImportId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  // Enhanced Analytics
  searchImpressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  searchClicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applicationRate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0
  },
  qualityScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  seoScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  bookmarkCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Advanced Features
  isATSEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  atsKeywords: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  targetAudience: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  promotionSettings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Internship-specific fields
  duration: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Internship duration (e.g., "3 months", "6 months")'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Internship start date'
  },
  workMode: {
    type: DataTypes.ENUM('remote', 'on-site', 'hybrid'),
    allowNull: true,
    comment: 'Work mode for internship'
  },
  learningObjectives: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'What the intern will learn from this experience'
  },
  mentorship: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mentorship and guidance details'
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
  // Use the salary field if available (user-entered format)
  if (this.salary && this.salary.trim()) {
    return this.salary.trim();
  }
  // Fallback to calculated range from min/max
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