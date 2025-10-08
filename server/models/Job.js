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
  description: {
    type: DataTypes.TEXT,
    allowNull: false
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
  shortDescription: {
    type: DataTypes.STRING,
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
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'closed', 'expired'),
    allowNull: false,
    defaultValue: 'draft'
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responsibilities: {
    type: DataTypes.TEXT,
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
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  salaryMax: {
    type: DataTypes.DECIMAL,
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
    allowNull: true,
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
    allowNull: true,
    defaultValue: []
  },
  remoteWork: {
    type: DataTypes.ENUM('on-site', 'remote', 'hybrid'),
    allowNull: true,
    defaultValue: 'on-site'
  },
  travelRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  shiftTiming: {
    type: DataTypes.ENUM('day', 'night', 'rotational', 'flexible'),
    allowNull: true,
    defaultValue: 'day'
  },
  noticePeriod: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  education: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certifications: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  languages: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  isUrgent: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  applications: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  visibilityType: {
    type: DataTypes.ENUM('public', 'private', 'referral-only', 'invite-only'),
    allowNull: true,
    defaultValue: 'public'
  },
  allowedViewers: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  referralCode: {
    type: DataTypes.STRING,
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
    allowNull: true,
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
    allowNull: true,
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
  searchImpressions: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  searchClicks: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  applicationRate: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0
  },
  qualityScore: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0
  },
  seoScore: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0
  },
  isATSEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  atsKeywords: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  targetAudience: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  promotionSettings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  bookmarkCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  salary: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  workMode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  learningObjectives: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mentorship: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  region: {
    type: DataTypes.ENUM('india', 'gulf', 'other'),
    allowNull: true,
    defaultValue: 'india'
  },
  // New fields from step 2
  role: {
    type: DataTypes.STRING,
    allowNull: true
  },
  industryType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'industrytype' // Map to lowercase database column
  },
  roleCategory: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'rolecategory' // Map to lowercase database column
  },
  employmentType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'employmenttype' // Map to lowercase database column
  },
  // Hot Vacancy Premium Features
  isHotVacancy: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  urgentHiring: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  multipleEmailIds: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  boostedSearch: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  searchBoostLevel: {
    type: DataTypes.ENUM('standard', 'premium', 'super', 'city-specific'),
    allowNull: true,
    defaultValue: 'standard'
  },
  citySpecificBoost: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  videoBanner: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whyWorkWithUs: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyReviews: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  autoRefresh: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  refreshDiscount: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0
  },
  attachmentFiles: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  officeImages: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  companyProfile: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  proactiveAlerts: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  alertRadius: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 50
  },
  alertFrequency: {
    type: DataTypes.ENUM('immediate', 'daily', 'weekly'),
    allowNull: true,
    defaultValue: 'immediate'
  },
  featuredKeywords: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  customBranding: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  superFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  tierLevel: {
    type: DataTypes.ENUM('basic', 'premium', 'enterprise', 'super-premium'),
    allowNull: true,
    defaultValue: 'basic'
  },
  externalApplyUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hotVacancyPrice: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  hotVacancyCurrency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'INR'
  },
  hotVacancyPaymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: true,
    defaultValue: 'pending'
  }
}, {
  sequelize,
  modelName: 'Job',
  tableName: 'jobs',
  timestamps: true,
  paranoid: false
});

module.exports = Job;