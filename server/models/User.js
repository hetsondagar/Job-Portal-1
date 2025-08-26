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
    allowNull: true // Allow null for OAuth users
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_type: {
    type: DataTypes.ENUM('jobseeker', 'employer', 'admin'),
    allowNull: false,
    defaultValue: 'jobseeker'
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // For job seekers
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  current_location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  willing_to_relocate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expected_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  notice_period: {
    type: DataTypes.INTEGER, // in days
    allowNull: true
  },
  // For employers
  company_id: {
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
  email_verification_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email_verification_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  password_reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_secret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lock_until: {
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
  social_links: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Privacy & preferences
  profile_visibility: {
    type: DataTypes.ENUM('public', 'private', 'connections'),
    defaultValue: 'public'
  },
  contact_visibility: {
    type: DataTypes.ENUM('public', 'private', 'connections'),
    defaultValue: 'public'
  },
  email_notifications: {
    type: DataTypes.JSONB,
    defaultValue: {
      jobAlerts: true,
      applicationUpdates: true,
      messages: true,
      companyUpdates: true,
      marketing: false
    }
  },
  push_notifications: {
    type: DataTypes.JSONB,
    defaultValue: {
      jobAlerts: true,
      applicationUpdates: true,
      messages: true,
      companyUpdates: true
    }
  },
  // Account status & verification
  account_status: {
    type: DataTypes.ENUM('active', 'suspended', 'deleted'),
    defaultValue: 'active'
  },
  verification_level: {
    type: DataTypes.ENUM('unverified', 'basic', 'premium'),
    defaultValue: 'unverified'
  },
  last_profile_update: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profile_completion: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  // OAuth fields
  oauth_provider: {
    type: DataTypes.ENUM('google', 'facebook', 'local'),
    defaultValue: 'local'
  },
  oauth_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  oauth_access_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  oauth_refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  oauth_token_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      // Hash password for all users with passwords (except OAuth users without passwords)
      if (user.password && (!user.oauth_provider || user.oauth_provider === 'local')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      // Hash password for all users with passwords (except OAuth users without passwords)
      if (user.changed('password') && user.password && (!user.oauth_provider || user.oauth_provider === 'local')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  // Users without passwords (OAuth users) can't login with password
  if (!this.password) {
    return false;
  }
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

User.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

User.prototype.getInitials = function() {
  return `${this.first_name.charAt(0)}${this.last_name.charAt(0)}`.toUpperCase();
};

module.exports = User; 