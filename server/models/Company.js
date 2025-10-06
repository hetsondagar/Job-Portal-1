const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sector: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
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
  pincode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0
  },
  mission: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vision: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  values: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  perks: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  shortDescription: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'short_description'
  },
  companySize: {
    type: DataTypes.ENUM('1-50', '51-200', '201-500', '500-1000', '1000+'),
    allowNull: true,
    field: 'company_size'
  },
  foundedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'founded_year'
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'total_reviews'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_verified'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    field: 'is_active'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_featured'
  },
  socialLinks: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'social_links'
  },
  benefits: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  technologies: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  companyType: {
    type: DataTypes.ENUM('startup', 'midsize', 'enterprise', 'multinational'),
    allowNull: true,
    field: 'company_type'
  },
  fundingStage: {
    type: DataTypes.ENUM('bootstrapped', 'seed', 'series-a', 'series-b', 'series-c', 'public'),
    allowNull: true,
    field: 'funding_stage'
  },
  revenue: {
    type: DataTypes.ENUM('0-1cr', '1-10cr', '10-50cr', '50-100cr', '100cr+'),
    allowNull: true,
    field: 'revenue'
  },
  culture: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'culture'
  },
  whyJoinUs: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'why_join_us'
  },
  workEnvironment: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'work_environment'
  },
  hiringProcess: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'hiring_process'
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'contact_person'
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'contact_email'
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'contact_phone'
  },
  verificationStatus: {
    type: DataTypes.ENUM('unverified', 'pending', 'verified', 'premium_verified'),
    allowNull: true,
    defaultValue: 'unverified',
    field: 'verification_status'
  },
  verificationDocuments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'verification_documents'
  },
  totalJobsPosted: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'total_jobs_posted'
  },
  activeJobsCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'active_jobs_count'
  },
  totalApplications: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'total_applications'
  },
  averageResponseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'average_response_time'
  },
  metaTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_description'
  },
  keywords: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'keywords'
  },
  companyStatus: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending_approval'),
    allowNull: true,
    defaultValue: 'pending_approval',
    field: 'company_status'
  },
  lastActivityAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_activity_at'
  },
  profileCompletion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'profile_completion'
  },
  region: {
    type: DataTypes.ENUM('india', 'gulf', 'other'),
    allowNull: true,
    defaultValue: 'india',
    field: 'region'
  }
}, {
  tableName: 'companies',
  timestamps: true,
  underscored: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    // Removed auto slug generation - handled manually in auth routes
  }
});

// Instance methods
Company.prototype.getFullAddress = function() {
  const parts = [this.address, this.city, this.state, this.pincode, this.country];
  return parts.filter(part => part).join(', ');
};

Company.prototype.getAverageRating = function() {
  return this.totalReviews > 0 ? this.rating : 0;
};

Company.prototype.getCompanySizeRange = function() {
  const sizeMap = {
    '1-50': '1-50 employees',
    '51-200': '51-200 employees',
    '201-500': '201-500 employees',
    '500-1000': '500-1000 employees',
    '1000+': '1000+ employees'
  };
  return sizeMap[this.companySize] || 'Not specified';
};

module.exports = Company;