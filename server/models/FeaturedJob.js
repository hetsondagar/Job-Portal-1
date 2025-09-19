const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const FeaturedJob = sequelize.define('FeaturedJob', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Reference to the job being featured'
    },
    promotionType: {
      type: DataTypes.ENUM('featured', 'premium', 'urgent', 'sponsored', 'top-listing'),
      allowNull: false,
      defaultValue: 'featured',
      comment: 'Type of promotion'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the promotion starts'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the promotion ends'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the promotion is currently active'
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Priority level for sorting (higher = more prominent)'
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Budget allocated for this promotion'
    },
    spentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Amount spent so far on this promotion'
    },
    impressions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of times the job was shown'
    },
    clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of clicks on the job listing'
    },
    applications: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of applications received during promotion'
    },
    ctr: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0,
      comment: 'Click-through rate'
    },
    conversionRate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0,
      comment: 'Application conversion rate'
    },
    targetAudience: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Target audience criteria (location, skills, experience, etc.)'
    },
    placement: {
      type: DataTypes.JSONB,
      defaultValue: ['search-results', 'homepage', 'category-pages'],
      comment: 'Where the job should be featured'
    },
    customStyling: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Custom styling for the featured job'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal notes about the promotion'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by',
      comment: 'User who created this promotion'
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Admin who approved this promotion'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the promotion was approved'
    }
  }, {
  tableName: 'featured_jobs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
    timestamps: true,
    indexes: [
      {
        fields: ['jobId']
      },
      {
        fields: ['promotionType']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['startDate', 'endDate']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['createdBy']
      }
    ]
  });


module.exports = FeaturedJob;

