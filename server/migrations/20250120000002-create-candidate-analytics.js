'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('candidate_analytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      employer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Employer who performed the search',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Company this analytics belongs to',
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      search_query: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Search parameters used (keywords, filters, etc.)'
      },
      search_type: {
        type: Sequelize.ENUM('basic', 'advanced', 'ats', 'saved', 'recommended'),
        allowNull: false,
        defaultValue: 'basic',
        comment: 'Type of search performed'
      },
      total_results: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Total number of candidates found'
      },
      viewed_candidates: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of candidate profiles viewed'
      },
      contacted_candidates: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of candidates contacted'
      },
      shortlisted_candidates: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of candidates shortlisted'
      },
      downloaded_resumes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of resumes downloaded'
      },
      bulk_actions: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Bulk actions performed (export, contact, etc.)'
      },
      search_duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Time taken for search in milliseconds'
      },
      filters_used: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: 'Array of filters applied during search'
      },
      sort_criteria: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Sorting criteria used'
      },
      result_quality: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Quality score of search results (0-1)'
      },
      conversion_rate: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 0,
        comment: 'Conversion rate from search to contact'
      },
      engagement_score: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0,
        comment: 'Overall engagement score for this search'
      },
      search_session_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Unique session ID for tracking search flow'
      },
      device_info: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Device and browser information'
      },
      location: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Geographic location of the search'
      },
      time_of_day: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Hour of day when search was performed (0-23)'
      },
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Day of week when search was performed (0-6)'
      },
      is_successful: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether the search was considered successful'
      },
      feedback: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'User feedback on search results'
      },
      related_searches: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: 'Related searches performed in the same session'
      },
      candidate_interactions: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: 'Detailed interactions with individual candidates'
      },
      search_refinements: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: 'Search refinements made during the session'
      },
      export_data: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Data exported from this search'
      },
      cost_incurred: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Cost incurred for this search (credits, premium features, etc.)'
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
    await queryInterface.addIndex('candidate_analytics', ['employer_id']);
    await queryInterface.addIndex('candidate_analytics', ['company_id']);
    await queryInterface.addIndex('candidate_analytics', ['search_type']);
    await queryInterface.addIndex('candidate_analytics', ['created_at']);
    await queryInterface.addIndex('candidate_analytics', ['search_session_id']);
    await queryInterface.addIndex('candidate_analytics', ['is_successful']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('candidate_analytics');
  }
};
