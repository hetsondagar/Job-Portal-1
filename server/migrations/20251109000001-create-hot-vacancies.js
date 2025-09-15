'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create hot_vacancies table
    await queryInterface.createTable('hot_vacancies', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      companyId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      employerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      responsibilities: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'India'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      jobType: {
        type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'internship', 'temporary'),
        allowNull: false,
        defaultValue: 'full-time'
      },
      experienceLevel: {
        type: Sequelize.ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive'),
        allowNull: false,
        defaultValue: 'mid'
      },
      experienceMin: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      experienceMax: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 5
      },
      salaryMin: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      salaryMax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      salary: {
        type: Sequelize.STRING,
        allowNull: true
      },
      salaryCurrency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'INR'
      },
      salaryPeriod: {
        type: Sequelize.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
        allowNull: true,
        defaultValue: 'yearly'
      },
      isSalaryVisible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      department: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      skills: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      benefits: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      remoteWork: {
        type: Sequelize.ENUM('on-site', 'remote', 'hybrid'),
        allowNull: false,
        defaultValue: 'on-site'
      },
      travelRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      shiftTiming: {
        type: Sequelize.ENUM('day', 'night', 'rotating', 'flexible'),
        allowNull: false,
        defaultValue: 'day'
      },
      noticePeriod: {
        type: Sequelize.STRING,
        allowNull: true
      },
      education: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      certifications: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      languages: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'paused', 'closed', 'expired'),
        allowNull: false,
        defaultValue: 'draft'
      },
      isUrgent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isPremium: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      applications: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      validTill: {
        type: Sequelize.DATE,
        allowNull: false
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      closedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      // Hot Vacancy specific fields
      urgencyLevel: {
        type: Sequelize.ENUM('high', 'critical', 'immediate'),
        allowNull: false,
        defaultValue: 'high'
      },
      hiringTimeline: {
        type: Sequelize.ENUM('immediate', '1-week', '2-weeks', '1-month'),
        allowNull: false,
        defaultValue: 'immediate'
      },
      maxApplications: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 50
      },
      applicationDeadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Premium pricing fields
      pricingTier: {
        type: Sequelize.ENUM('basic', 'premium', 'enterprise'),
        allowNull: false,
        defaultValue: 'premium'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'INR'
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      paymentId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Premium features
      priorityListing: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      featuredBadge: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      unlimitedApplications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      advancedAnalytics: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      candidateMatching: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      directContact: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      // SEO and visibility
      seoTitle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      seoDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      keywords: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      // Analytics
      impressions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      clicks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      applicationRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      qualityScore: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create hot_vacancy_photos table
    await queryInterface.createTable('hot_vacancy_photos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      hotVacancyId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'hot_vacancies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      altText: {
        type: Sequelize.STRING,
        allowNull: true
      },
      caption: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      isPrimary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      uploadedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('hot_vacancies', ['status', 'publishedAt']);
    await queryInterface.addIndex('hot_vacancies', ['companyId']);
    await queryInterface.addIndex('hot_vacancies', ['employerId']);
    await queryInterface.addIndex('hot_vacancies', ['urgencyLevel']);
    await queryInterface.addIndex('hot_vacancies', ['hiringTimeline']);
    await queryInterface.addIndex('hot_vacancies', ['pricingTier']);
    await queryInterface.addIndex('hot_vacancies', ['paymentStatus']);
    await queryInterface.addIndex('hot_vacancies', ['validTill']);
    await queryInterface.addIndex('hot_vacancies', ['applicationDeadline']);

    await queryInterface.addIndex('hot_vacancy_photos', ['hotVacancyId']);
    await queryInterface.addIndex('hot_vacancy_photos', ['isActive']);
    await queryInterface.addIndex('hot_vacancy_photos', ['isPrimary']);
    await queryInterface.addIndex('hot_vacancy_photos', ['displayOrder']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('hot_vacancy_photos');
    await queryInterface.dropTable('hot_vacancies');
  }
};
