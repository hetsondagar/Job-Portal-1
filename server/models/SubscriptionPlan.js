const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  planType: {
    type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise', 'custom'),
    defaultValue: 'basic',
    allowNull: false
  },
  monthlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  yearlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Plan features and limits'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  trialDays: {
    type: DataTypes.INTEGER,
    defaultValue: 14
  },
  maxTeamMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  maxJobPostings: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  maxCandidateViews: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  maxResumeDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  hasAdvancedAnalytics: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasPrioritySupport: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasCustomBranding: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasAPIAccess: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasBulkOperations: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional plan data'
  }
}, {
  tableName: 'subscription_plans',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (plan) => {
      if (!plan.slug) {
        plan.slug = plan.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
    },
    beforeUpdate: (plan) => {
      if (plan.changed('name') && !plan.changed('slug')) {
        plan.slug = plan.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
    }
  }
});

// Instance methods
SubscriptionPlan.prototype.getPrice = function(billingCycle = 'monthly') {
  return billingCycle === 'yearly' ? this.yearlyPrice : this.monthlyPrice;
};

SubscriptionPlan.prototype.getSavings = function() {
  if (!this.yearlyPrice || !this.monthlyPrice) return 0;
  const yearlyTotal = this.monthlyPrice * 12;
  const savings = yearlyTotal - this.yearlyPrice;
  return Math.round((savings / yearlyTotal) * 100);
};

SubscriptionPlan.prototype.hasFeature = function(featureName) {
  return this.features?.[featureName] || false;
};

SubscriptionPlan.prototype.getFeatureLimit = function(featureName) {
  return this.features?.[featureName] || 0;
};

SubscriptionPlan.prototype.isUnlimited = function(featureName) {
  const limit = this.getFeatureLimit(featureName);
  return limit === -1 || limit === 'unlimited';
};

SubscriptionPlan.prototype.getDisplayPrice = function(billingCycle = 'monthly') {
  const price = this.getPrice(billingCycle);
  return `${this.currency} ${price}`;
};

SubscriptionPlan.prototype.getPopularBadge = function() {
  return this.isPopular ? 'Most Popular' : null;
};

module.exports = SubscriptionPlan; 