const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const WorkExperience = sequelize.define('WorkExperience', {
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
  companyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responsibilities: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  achievements: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  technologies: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salaryCurrency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'INR'
  },
  employmentType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
    allowNull: true,
    defaultValue: 'full-time'
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companySize: {
    type: DataTypes.ENUM('1-50', '51-200', '201-500', '500-1000', '1000+'),
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  resumeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'resumes',
      key: 'id'
    }
  }
}, {
  tableName: 'work_experiences',
  timestamps: true,
  hooks: {
    beforeCreate: async (experience) => {
      if (experience.isCurrent) {
        experience.endDate = null;
      }
    },
    beforeUpdate: async (experience) => {
      if (experience.changed('isCurrent') && experience.isCurrent) {
        experience.endDate = null;
      }
    }
  }
});

// Instance methods
WorkExperience.prototype.getDuration = function() {
  const start = new Date(this.startDate);
  const end = this.endDate ? new Date(this.endDate) : new Date();
  
  const diffInMs = end - start;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffInDays / 365);
  const months = Math.floor((diffInDays % 365) / 30);
  
  let duration = '';
  if (years > 0) {
    duration += `${years} year${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    duration += `${duration ? ' ' : ''}${months} month${months > 1 ? 's' : ''}`;
  }
  if (!duration) {
    duration = 'Less than a month';
  }
  
  return duration;
};

WorkExperience.prototype.getFormattedPeriod = function() {
  const start = new Date(this.startDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  });
  
  if (this.isCurrent) {
    return `${start} - Present`;
  }
  
  const end = new Date(this.endDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  });
  
  return `${start} - ${end}`;
};

WorkExperience.prototype.getSkillsString = function() {
  return this.skills.join(', ');
};

WorkExperience.prototype.getTechnologiesString = function() {
  return this.technologies.join(', ');
};

module.exports = WorkExperience; 