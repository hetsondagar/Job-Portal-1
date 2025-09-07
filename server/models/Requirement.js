const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Requirement = sequelize.define('Requirement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: true
  },
  experienceMin: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  experienceMax: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  salary: {
    type: DataTypes.STRING,
    allowNull: true
  },
  salaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'INR'
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
    allowNull: false,
    defaultValue: 'full-time'
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  keySkills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  education: {
    type: DataTypes.STRING,
    allowNull: true
  },
  validTill: {
    type: DataTypes.DATE,
    allowNull: true
  },
  noticePeriod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remoteWork: {
    type: DataTypes.ENUM('on-site', 'remote', 'hybrid'),
    allowNull: true,
    defaultValue: 'on-site'
  },
  travelRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shiftTiming: {
    type: DataTypes.ENUM('day', 'night', 'rotational', 'flexible'),
    allowNull: true,
    defaultValue: 'day'
  },
  benefits: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  candidateDesignations: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  candidateLocations: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  includeWillingToRelocate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  currentSalaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currentSalaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  includeNotMentioned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'closed'),
    allowNull: false,
    defaultValue: 'draft'
  },
  isUrgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  matches: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applications: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'requirements',
  hooks: {
    beforeCreate: async (requirement) => {
      if (requirement.status === 'active' && !requirement.publishedAt) {
        requirement.publishedAt = new Date();
      }
    },
    beforeUpdate: async (requirement) => {
      if (requirement.changed('status')) {
        if (requirement.status === 'active' && !requirement.publishedAt) {
          requirement.publishedAt = new Date();
        } else if (requirement.status === 'closed' && !requirement.closedAt) {
          requirement.closedAt = new Date();
        }
      }
    }
  }
});

// Instance methods
Requirement.prototype.getExperienceRange = function() {
  if (this.experienceMin && this.experienceMax) {
    return `${this.experienceMin}-${this.experienceMax} years`;
  } else if (this.experienceMin) {
    return `${this.experienceMin}+ years`;
  } else if (this.experienceMax) {
    return `0-${this.experienceMax} years`;
  }
  return this.experience || 'Not specified';
};

Requirement.prototype.getSalaryRange = function() {
  if (this.salaryMin && this.salaryMax) {
    return `${this.currency} ${this.salaryMin.toLocaleString()}-${this.salaryMax.toLocaleString()}`;
  } else if (this.salaryMin) {
    return `${this.currency} ${this.salaryMin.toLocaleString()}+`;
  } else if (this.salaryMax) {
    return `${this.currency} Up to ${this.salaryMax.toLocaleString()}`;
  }
  return this.salary || 'Not specified';
};

Requirement.prototype.isExpired = function() {
  if (!this.validTill) return false;
  return new Date() > new Date(this.validTill);
};

Requirement.prototype.getStatusColor = function() {
  const statusColors = {
    draft: 'gray',
    active: 'green',
    paused: 'yellow',
    closed: 'red'
  };
  return statusColors[this.status] || 'gray';
};

module.exports = Requirement; 