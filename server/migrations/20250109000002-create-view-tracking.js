'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('view_tracking', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      viewer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID of the user who viewed (null for anonymous)'
      },
      viewed_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID of the user whose profile was viewed'
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'jobs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID of the job that was viewed (if applicable)'
      },
      view_type: {
        type: Sequelize.ENUM('job_view', 'profile_view', 'company_view'),
        allowNull: false,
        comment: 'Type of view that occurred'
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'IP address of the viewer'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent string'
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Session ID for tracking anonymous users'
      },
      referrer: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Referrer URL'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Additional view metadata'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('view_tracking', ['viewer_id', 'viewed_user_id', 'view_type'], {
      name: 'unique_user_view',
      unique: true,
      comment: 'Prevent duplicate views from same user'
    });
    
    await queryInterface.addIndex('view_tracking', ['viewed_user_id', 'view_type'], {
      name: 'viewed_user_type'
    });
    
    await queryInterface.addIndex('view_tracking', ['job_id', 'view_type'], {
      name: 'job_view_type'
    });
    
    await queryInterface.addIndex('view_tracking', ['ip_address', 'viewed_user_id'], {
      name: 'ip_user_view'
    });
    
    await queryInterface.addIndex('view_tracking', ['created_at'], {
      name: 'view_tracking_created_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('view_tracking');
  }
};
