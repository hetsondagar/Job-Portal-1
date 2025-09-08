'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HotVacancy = sequelize.define('HotVacancy', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    employerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'India'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    jobType: {
      type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'temporary'),
      allowNull: false,
      defaultValue: 'full-time'
    },
    experienceLevel: {
      type: DataTypes.ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive'),
      allowNull: false,
      defaultValue: 'mid'
    },
    experienceMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    experienceMax: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5
    },
    salaryMin: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    salaryMax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    salary: {
      type: DataTypes.STRING,
      allowNull: true
    },
    salaryCurrency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'INR'
    },
    salaryPeriod: {
      type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
      allowNull: true,
      defaultValue: 'yearly'
    },
    isSalaryVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    benefits: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    remoteWork: {
      type: DataTypes.ENUM('on-site', 'remote', 'hybrid'),
      allowNull: false,
      defaultValue: 'on-site'
    },
    travelRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    shiftTiming: {
      type: DataTypes.ENUM('day', 'night', 'rotating', 'flexible'),
      allowNull: false,
      defaultValue: 'day'
    },
    noticePeriod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    education: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    certifications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'paused', 'closed', 'expired'),
      allowNull: false,
      defaultValue: 'draft'
    },
    isUrgent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    applications: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    validTill: {
      type: DataTypes.DATE,
      allowNull: false
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
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    // Hot Vacancy specific fields
    urgencyLevel: {
      type: DataTypes.ENUM('high', 'critical', 'immediate'),
      allowNull: false,
      defaultValue: 'high'
    },
    hiringTimeline: {
      type: DataTypes.ENUM('immediate', '1-week', '2-weeks', '1-month'),
      allowNull: false,
      defaultValue: 'immediate'
    },
    maxApplications: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 50
    },
    applicationDeadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Premium pricing fields
    pricingTier: {
      type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
      allowNull: false,
      defaultValue: 'premium'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'INR'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Premium features
    priorityListing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    featuredBadge: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    unlimitedApplications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    advancedAnalytics: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    candidateMatching: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    directContact: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // SEO and visibility
    seoTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    keywords: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    // Analytics
    impressions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    clicks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    applicationRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    qualityScore: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    modelName: 'HotVacancy',
    tableName: 'hot_vacancies',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        fields: ['status', 'publishedAt']
      },
      {
        fields: ['companyId']
      },
      {
        fields: ['employerId']
      },
      {
        fields: ['urgencyLevel']
      },
      {
        fields: ['hiringTimeline']
      },
      {
        fields: ['pricingTier']
      },
      {
        fields: ['paymentStatus']
      },
      {
        fields: ['validTill']
      },
      {
        fields: ['applicationDeadline']
      }
    ],
    hooks: {
      beforeCreate: (hotVacancy) => {
        // Generate slug from title
        if (hotVacancy.title && !hotVacancy.slug) {
          hotVacancy.slug = hotVacancy.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
        }
        
        // Set default validTill to 30 days from now
        if (!hotVacancy.validTill) {
          hotVacancy.validTill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
        
        // Set default application deadline based on hiring timeline
        if (!hotVacancy.applicationDeadline) {
          const now = new Date();
          switch (hotVacancy.hiringTimeline) {
            case 'immediate':
              hotVacancy.applicationDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
              break;
            case '1-week':
              hotVacancy.applicationDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
              break;
            case '2-weeks':
              hotVacancy.applicationDeadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
              break;
            case '1-month':
              hotVacancy.applicationDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
              break;
            default:
              hotVacancy.applicationDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
          }
        }
      },
      beforeUpdate: (hotVacancy) => {
        // Update slug if title changed
        if (hotVacancy.changed('title') && hotVacancy.title) {
          hotVacancy.slug = hotVacancy.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
        }
      }
    }
  });

module.exports = HotVacancy;
