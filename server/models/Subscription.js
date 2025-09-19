const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'subscription_plans',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired', 'trial', 'past_due'),
    defaultValue: 'trial',
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  trialEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  billingCycle: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
    defaultValue: 'monthly'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  nextBillingDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastBillingDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Payment method type: credit_card, bank_transfer, etc.'
  },
  paymentGateway: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Payment gateway: stripe, razorpay, etc.'
  },
  paymentGatewayId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'External payment gateway subscription ID'
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Active features for this subscription'
  },
  usage: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Usage statistics: job_postings, candidate_views, etc.'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional subscription data'
  }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'status']
    },
    {
      fields: ['status']
    },
    {
      fields: ['next_billing_date']
    },
    {
      fields: ['payment_gateway_id']
    }
  ],
  hooks: {
    beforeCreate: (subscription) => {
      if (subscription.status === 'trial' && !subscription.trialEndDate) {
        // Set trial end date to 14 days from start
        subscription.trialEndDate = new Date(subscription.startDate);
        subscription.trialEndDate.setDate(subscription.trialEndDate.getDate() + 14);
      }
    }
  }
});

// Instance methods
Subscription.prototype.isActive = function() {
  return ['active', 'trial'].includes(this.status);
};

Subscription.prototype.isTrial = function() {
  return this.status === 'trial' && this.trialEndDate > new Date();
};

Subscription.prototype.isExpired = function() {
  return this.endDate && this.endDate < new Date();
};

Subscription.prototype.daysUntilExpiry = function() {
  if (!this.endDate) return null;
  const now = new Date();
  const diffTime = this.endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

Subscription.prototype.canCancel = function() {
  return this.isActive() && this.status !== 'cancelled';
};

Subscription.prototype.getFeatureValue = function(featureName) {
  return this.features?.[featureName] || 0;
};

Subscription.prototype.hasFeature = function(featureName) {
  return this.getFeatureValue(featureName) > 0;
};

Subscription.prototype.getUsagePercentage = function(featureName) {
  const limit = this.getFeatureValue(featureName);
  const used = this.usage?.[featureName] || 0;
  return limit > 0 ? Math.round((used / limit) * 100) : 0;
};

module.exports = Subscription; 