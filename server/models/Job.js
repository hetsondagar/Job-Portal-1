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
    field: 'company_id',
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'posted_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  shortDescription: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'short_description'
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
    defaultValue: 'full-time',
    field: 'job_type'
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive'),
    allowNull: true,
    field: 'experience_level'
  },
  experienceMin: {
    type: DataTypes.INTEGER, // in years
    allowNull: true,
    field: 'experience_min'
  },
  experienceMax: {
    type: DataTypes.INTEGER, // in years
    allowNull: true,
    field: 'experience_max'
  },
  salaryMin: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    field: 'salary_min'
  },
  salaryMax: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    field: 'salary_max'
  },
  salaryCurrency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'INR',
    field: 'salary_currency'
  },
  salaryPeriod: {
    type: DataTypes.ENUM('per-year', 'per-month', 'per-hour'),
    allowNull: true,
    defaultValue: 'per-year',
    field: 'salary_type'
  },
  isSalaryVisible: {
    type: DataTypes.VIRTUAL
  },
  department: {
    type: DataTypes.VIRTUAL
  },
  category: {
    type: DataTypes.VIRTUAL
  },
  skills: {
    type: DataTypes.VIRTUAL
  },
  remoteWork: {
    type: DataTypes.ENUM('on-site', 'remote', 'hybrid'),
    allowNull: true,
    defaultValue: 'on-site',
    field: 'location_type'
  },
  travelRequired: {
    type: DataTypes.VIRTUAL
  },
  shiftTiming: {
    type: DataTypes.VIRTUAL
  },
  noticePeriod: {
    type: DataTypes.VIRTUAL
  },
  education: {
    type: DataTypes.VIRTUAL
  },
  certifications: {
    type: DataTypes.VIRTUAL
  },
  languages: {
    type: DataTypes.VIRTUAL
  },
  isUrgent: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_urgent'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_featured'
  },
  isPremium: {
    type: DataTypes.VIRTUAL
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'view_count'
  },
  applications: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'application_count'
  },
  validTill: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'application_deadline'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'published_at'
  },
  closedAt: {
    type: DataTypes.VIRTUAL
  },
  tags: {
    type: DataTypes.VIRTUAL
  },
  metadata: {
    type: DataTypes.VIRTUAL
  },
  isPrivate: {
    type: DataTypes.VIRTUAL
  },
  visibilityType: {
    type: DataTypes.VIRTUAL
  },
  allowedViewers: {
    type: DataTypes.VIRTUAL
  },
  referralCode: { type: DataTypes.VIRTUAL },
  scheduledPublishAt: { type: DataTypes.VIRTUAL },
  scheduledExpiryAt: { type: DataTypes.VIRTUAL },
  autoRenew: { type: DataTypes.VIRTUAL },
  renewalPeriod: { type: DataTypes.VIRTUAL },
  maxRenewals: { type: DataTypes.VIRTUAL },
  currentRenewalCount: { type: DataTypes.VIRTUAL },
  templateId: { type: DataTypes.VIRTUAL },
  bulkImportId: { type: DataTypes.VIRTUAL },
  searchImpressions: { type: DataTypes.VIRTUAL },
  searchClicks: { type: DataTypes.VIRTUAL },
  applicationRate: { type: DataTypes.VIRTUAL },
  qualityScore: { type: DataTypes.VIRTUAL },
  seoScore: { type: DataTypes.VIRTUAL },
  isATSEnabled: { type: DataTypes.VIRTUAL },
  atsKeywords: { type: DataTypes.VIRTUAL },
  targetAudience: { type: DataTypes.VIRTUAL },
  promotionSettings: { type: DataTypes.VIRTUAL },
  bookmarkCount: { type: DataTypes.VIRTUAL },
  salary: { type: DataTypes.VIRTUAL },
  duration: { type: DataTypes.VIRTUAL },
  startDate: { type: DataTypes.VIRTUAL },
  workMode: { type: DataTypes.VIRTUAL },
  learningObjectives: { type: DataTypes.VIRTUAL },
  mentorship: { type: DataTypes.VIRTUAL },
  region: { type: DataTypes.VIRTUAL }
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