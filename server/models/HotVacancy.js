'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HotVacancy = sequelize.define('HotVacancy', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shortDescription: {
    type: DataTypes.TEXT,
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
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'temporary'),
    allowNull: false,
    defaultValue: 'full-time'
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive'),
    allowNull: false,
    defaultValue: 'mid'
  },
  experienceMin: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  experienceMax: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 5
  },
  salaryMin: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  salaryMax: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  salary: {
    type: DataTypes.STRING,
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
    allowNull: false,
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
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  benefits: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  remoteWork: {
    type: DataTypes.ENUM('on-site', 'remote', 'hybrid'),
    allowNull: false,
    defaultValue: 'on-site'
  },
  travelRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  shiftTiming: {
    type: DataTypes.ENUM('day', 'night', 'rotating', 'flexible'),
    allowNull: false,
    defaultValue: 'day'
  },
  noticePeriod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  education: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  certifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  languages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'closed', 'expired'),
    allowNull: false,
    defaultValue: 'draft'
  },
  isUrgent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  applications: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  validTill: {
    type: DataTypes.DATE,
    allowNull: false
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
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  urgencyLevel: {
    type: DataTypes.ENUM('high', 'critical', 'immediate'),
    allowNull: false,
    defaultValue: 'high'
  },
  hiringTimeline: {
    type: DataTypes.ENUM('immediate', '1-week', '2-weeks', '1-month'),
    allowNull: false,
    defaultValue: 'immediate'
  },
  maxApplications: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 50
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  pricingTier: {
    type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
    allowNull: false,
    defaultValue: 'premium'
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'INR'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priorityListing: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  featuredBadge: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  unlimitedApplications: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  advancedAnalytics: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  candidateMatching: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  directContact: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  seoTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seoDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  impressions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  clicks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  applicationRate: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0
  },
  qualityScore: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0
  },
  // Premium Hot Vacancy Features
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
    defaultValue: true
  },
  searchBoostLevel: {
    type: DataTypes.ENUM('standard', 'premium', 'super', 'city-specific'),
    allowNull: false,
    defaultValue: 'premium'
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
    defaultValue: true
  },
  alertRadius: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 50 // km
  },
  alertFrequency: {
    type: DataTypes.ENUM('immediate', 'daily', 'weekly'),
    allowNull: false,
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
    allowNull: false,
    defaultValue: 'premium'
  }
}, {
  sequelize,
  modelName: 'HotVacancy',
  tableName: 'hot_vacancies',
  timestamps: true,
  paranoid: false
});

module.exports = HotVacancy;