const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const UserSession = sequelize.define('UserSession', {
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
  sessionToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceType: {
    type: DataTypes.ENUM('web', 'mobile', 'tablet'),
    allowNull: false,
    defaultValue: 'web'
  },
  deviceInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastActivityAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  loginMethod: {
    type: DataTypes.ENUM('email', 'google', 'linkedin', 'facebook', 'apple'),
    allowNull: false,
    defaultValue: 'email'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'user_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['session_token']
    },
    {
      fields: ['refresh_token']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['expires_at']
    }
  ],
  hooks: {
    beforeCreate: (session) => {
      if (!session.expiresAt) {
        // Default session expiry: 30 days
        session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    }
  }
});

// Instance methods
UserSession.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

UserSession.prototype.extendSession = function(days = 30) {
  this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  this.lastActivityAt = new Date();
  return this.save();
};

UserSession.prototype.deactivate = function() {
  this.isActive = false;
  return this.save();
};

module.exports = UserSession; 