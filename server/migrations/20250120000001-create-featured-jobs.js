'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('featured_jobs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Reference to the job being featured',
        references: {
          model: 'jobs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      promotion_type: {
        type: Sequelize.ENUM('featured', 'premium', 'urgent', 'sponsored', 'top-listing'),
        allowNull: false,
        defaultValue: 'featured',
        comment: 'Type of promotion'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'When the promotion starts'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'When the promotion ends'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether the promotion is currently active'
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: 'Priority level for sorting (higher = more prominent)'
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Budget allocated for this promotion'
      },
      spent_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Amount spent so far on this promotion'
      },
      impressions: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of times the job was shown'
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of clicks on the job listing'
      },
      applications: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of applications received during promotion'
      },
      ctr: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 0,
        comment: 'Click-through rate'
      },
      conversion_rate: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 0,
        comment: 'Application conversion rate'
      },
      target_audience: {
        type: Sequelize.JSONB,
        defaultValue: Sequelize.literal(`'{}'::jsonb`),
        comment: 'Target audience criteria (location, skills, experience, etc.)'
      },
      placement: {
        type: Sequelize.JSONB,
        defaultValue: Sequelize.literal(`'["search-results", "homepage", "category-pages"]'::jsonb`),
        comment: 'Where the job should be featured'
      },
      custom_styling: {
        type: Sequelize.JSONB,
        defaultValue: Sequelize.literal(`'{}'::jsonb`),
        comment: 'Custom styling for the featured job'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Internal notes about the promotion'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'User who created this promotion',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Admin who approved this promotion',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the promotion was approved'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('featured_jobs', ['job_id']);
    await queryInterface.addIndex('featured_jobs', ['promotion_type']);
    await queryInterface.addIndex('featured_jobs', ['is_active']);
    await queryInterface.addIndex('featured_jobs', ['start_date', 'end_date']);
    await queryInterface.addIndex('featured_jobs', ['priority']);
    await queryInterface.addIndex('featured_jobs', ['created_by']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('featured_jobs');
  }
};
