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
    allowNull: true
  },
  companySize: {
    type: DataTypes.ENUM('1-50', '51-200', '201-500', '500-1000', '1000+'),
    allowNull: true
  },
  foundedYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  socialLinks: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
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
    allowNull: true
  },
  fundingStage: {
    type: DataTypes.ENUM('bootstrapped', 'seed', 'series-a', 'series-b', 'series-c', 'public'),
    allowNull: true
  },
  revenue: {
    type: DataTypes.ENUM('0-1cr', '1-10cr', '10-50cr', '50-100cr', '100cr+'),
    allowNull: true
  },
  culture: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  whyJoinUs: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'why_join_us'
  },
  workEnvironment: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  hiringProcess: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verificationStatus: {
    type: DataTypes.ENUM('unverified', 'pending', 'verified', 'premium_verified'),
    allowNull: true,
    defaultValue: 'unverified'
  },
  verificationDocuments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  totalJobsPosted: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  activeJobsCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  totalApplications: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  averageResponseTime: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  metaTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  keywords: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  companyStatus: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending_approval'),
    allowNull: true,
    defaultValue: 'pending_approval'
  },
  lastActivityAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profileCompletion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  region: {
    type: DataTypes.ENUM('india', 'gulf', 'other'),
    allowNull: true,
    defaultValue: 'india'
  }
}, {
  tableName: 'companies',
  timestamps: true,
  underscored: false,
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