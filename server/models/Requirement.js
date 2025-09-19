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
    field: 'company_id',
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by',
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
    allowNull: true,
    field: 'experience_min'
  },
  experienceMax: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'experience_max'
  },
  salary: {
    type: DataTypes.STRING,
    allowNull: true
  },
  salaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'salary_min'
  },
  salaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'salary_max'
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'INR'
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
    allowNull: false,
    defaultValue: 'full-time',
    field: 'job_type'
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  keySkills: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'key_skills'
  },
  education: {
    type: DataTypes.STRING,
    allowNull: true
  },
  validTill: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'valid_till'
  },
  noticePeriod: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'notice_period'
  },
  remoteWork: {
    type: DataTypes.ENUM('on-site', 'remote', 'hybrid'),
    allowNull: true,
    defaultValue: 'on-site',
    field: 'remote_work'
  },
  travelRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'travel_required'
  },
  shiftTiming: {
    type: DataTypes.ENUM('day', 'night', 'rotational', 'flexible'),
    allowNull: true,
    defaultValue: 'day',
    field: 'shift_timing'
  },
  benefits: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  candidateDesignations: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'candidate_designations'
  },
  candidateLocations: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'candidate_locations'
  },
  includeWillingToRelocate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'include_willing_to_relocate'
  },
  currentSalaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'current_salary_min'
  },
  currentSalaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'current_salary_max'
  },
  includeNotMentioned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'include_not_mentioned'
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'closed'),
    allowNull: false,
    defaultValue: 'draft'
  },
  isUrgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_urgent'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
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
    allowNull: true,
    field: 'published_at'
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'closed_at'
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
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
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