const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subscriptions',
      key: 'id'
    }
  },
  paymentType: {
    type: DataTypes.ENUM('subscription', 'one_time', 'refund', 'credit', 'debit'),
    allowNull: false,
    defaultValue: 'subscription'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'net_banking', 'upi', 'wallet', 'bank_transfer'),
    allowNull: false
  },
  paymentGateway: {
    type: DataTypes.ENUM('razorpay', 'stripe', 'paypal', 'paytm', 'phonepe'),
    allowNull: false
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gatewayOrderId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gatewayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gatewayRefundId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  billingAddress: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  finalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  failureCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'payments',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['subscription_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['payment_gateway']
    },
    {
      fields: ['gateway_transaction_id']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: (payment) => {
      // Calculate final amount
      payment.finalAmount = payment.amount + payment.taxAmount - payment.discountAmount;
    },
    beforeUpdate: (payment) => {
      if (payment.changed('amount') || payment.changed('taxAmount') || payment.changed('discountAmount')) {
        payment.finalAmount = payment.amount + payment.taxAmount - payment.discountAmount;
      }
    }
  }
});

// Instance methods
Payment.prototype.isSuccessful = function() {
  return this.status === 'completed';
};

Payment.prototype.isFailed = function() {
  return this.status === 'failed';
};

Payment.prototype.isPending = function() {
  return this.status === 'pending' || this.status === 'processing';
};

Payment.prototype.canBeRefunded = function() {
  return this.status === 'completed' && !this.refundedAt;
};

Payment.prototype.getStatusColor = function() {
  const colors = {
    pending: 'yellow',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
    refunded: 'orange'
  };
  return colors[this.status] || 'gray';
};

Payment.prototype.getStatusLabel = function() {
  const labels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  return labels[this.status] || 'Unknown';
};

Payment.prototype.getFormattedAmount = function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency
  }).format(this.finalAmount);
};

Payment.prototype.process = function() {
  this.status = 'processing';
  return this.save();
};

Payment.prototype.complete = function(gatewayTransactionId) {
  this.status = 'completed';
  this.gatewayTransactionId = gatewayTransactionId;
  this.processedAt = new Date();
  return this.save();
};

Payment.prototype.fail = function(reason, code) {
  this.status = 'failed';
  this.failureReason = reason;
  this.failureCode = code;
  return this.save();
};

Payment.prototype.refund = function(amount, reason) {
  this.status = 'refunded';
  this.refundAmount = amount || this.finalAmount;
  this.refundReason = reason;
  this.refundedAt = new Date();
  return this.save();
};

module.exports = Payment; 