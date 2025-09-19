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
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company_size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  founded_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  headquarters: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contact_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  social_links: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: 'India'
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  }
}, {
  tableName: 'companies',
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