const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Resume = sequelize.define('Resume', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  objective: {
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
  projects: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  achievements: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'resumes',
  hooks: {
    beforeCreate: async (resume) => {
      resume.lastUpdated = new Date();
    },
    beforeUpdate: async (resume) => {
      resume.lastUpdated = new Date();
    }
  }
});

// Instance methods
Resume.prototype.getSkillsString = function() {
  return this.skills.join(', ');
};

Resume.prototype.getLanguagesString = function() {
  return this.languages.map(lang => `${lang.name} (${lang.proficiency})`).join(', ');
};

Resume.prototype.getCertificationsString = function() {
  return this.certifications.map(cert => `${cert.name} - ${cert.issuer}`).join(', ');
};

Resume.prototype.getTotalExperience = function() {
  // This would be calculated from work experience entries
  return 0; // Placeholder
};

module.exports = Resume; 