const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userType: {
    type: DataTypes.ENUM('jobseeker', 'employer', 'admin'),
    allowNull: false,
    defaultValue: 'jobseeker'
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPhoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // For job seekers
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  currentLocation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  willingToRelocate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expectedSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  noticePeriod: {
    type: DataTypes.INTEGER, // in days
    allowNull: true
  },
  // For employers
  companyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Enhanced authentication & security
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  twoFactorSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Enhanced profile fields
  headline: {
    type: DataTypes.STRING,
    allowNull: true
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  languages: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  socialLinks: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Privacy & preferences
  profileVisibility: {
    type: DataTypes.ENUM('public', 'private', 'connections_only'),
    defaultValue: 'public'
  },
  contactVisibility: {
    type: DataTypes.ENUM('public', 'private', 'connections_only'),
    defaultValue: 'public'
  },
  emailNotifications: {
    type: DataTypes.JSONB,
    defaultValue: {
      jobAlerts: true,
      applicationUpdates: true,
      messages: true,
      companyUpdates: true,
      marketing: false
    }
  },
  pushNotifications: {
    type: DataTypes.JSONB,
    defaultValue: {
      jobAlerts: true,
      applicationUpdates: true,
      messages: true,
      companyUpdates: true
    }
  },
  // Account status & verification
  accountStatus: {
    type: DataTypes.ENUM('active', 'suspended', 'deactivated', 'pending_verification'),
    defaultValue: 'pending_verification'
  },
  verificationLevel: {
    type: DataTypes.ENUM('basic', 'verified', 'premium_verified'),
    defaultValue: 'basic'
  },
  lastProfileUpdate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profileCompletion: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.getInitials = function() {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
};

module.exports = User; 