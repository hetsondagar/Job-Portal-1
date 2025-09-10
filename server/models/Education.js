const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Education = sequelize.define('Education', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id', // Map to the snake_case column in database
    references: {
      model: 'users',
      key: 'id'
    }
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: false
  },
  degree: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fieldOfStudy: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'field_of_study' // Map to snake_case column
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date' // Map to snake_case column
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date' // Map to snake_case column
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_current' // Map to snake_case column
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  cgpa: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'gpa', // Map to actual column name
    validate: {
      min: 0,
      max: 10
    }
  },
  scale: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '10'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activities: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  achievements: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  educationType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'distance', 'online'),
    allowNull: true,
    defaultValue: 'full-time'
  },
  level: {
    type: DataTypes.ENUM('high-school', 'diploma', 'bachelor', 'master', 'phd', 'certification', 'other'),
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
  }
}, {
  tableName: 'educations',
  hooks: {
    beforeCreate: async (education) => {
      if (education.isCurrent) {
        education.endDate = null;
      }
    },
    beforeUpdate: async (education) => {
      if (education.changed('isCurrent') && education.isCurrent) {
        education.endDate = null;
      }
    }
  }
});

// Instance methods
Education.prototype.getDuration = function() {
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

Education.prototype.getFormattedPeriod = function() {
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

Education.prototype.getGradeDisplay = function() {
  if (this.percentage) {
    return `${this.percentage}%`;
  } else if (this.cgpa) {
    return `${this.cgpa}/${this.scale} CGPA`;
  } else if (this.grade) {
    return this.grade;
  }
  return 'Not specified';
};

Education.prototype.getFullDegree = function() {
  return `${this.degree} in ${this.fieldOfStudy}`;
};

module.exports = Education; 