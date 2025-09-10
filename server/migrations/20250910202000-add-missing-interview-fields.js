'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add missing columns to interviews table
    await queryInterface.addColumn('interviews', 'employer_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('interviews', 'job_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'jobs',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('interviews', 'title', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('interviews', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('interviews', 'timezone', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'UTC'
    });

    await queryInterface.addColumn('interviews', 'interviewers', {
      type: Sequelize.JSONB,
      defaultValue: []
    });

    await queryInterface.addColumn('interviews', 'agenda', {
      type: Sequelize.JSONB,
      defaultValue: []
    });

    await queryInterface.addColumn('interviews', 'requirements', {
      type: Sequelize.JSONB,
      defaultValue: {}
    });

    await queryInterface.addColumn('interviews', 'next_round_details', {
      type: Sequelize.JSONB,
      defaultValue: {}
    });

    await queryInterface.addColumn('interviews', 'reminder_sent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('interviews', 'reminder_sent_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('interviews', 'cancelled_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('interviews', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('interviews', 'cancellation_reason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('interviews', 'metadata', {
      type: Sequelize.JSONB,
      defaultValue: {}
    });

    // Add indexes for new columns
    await queryInterface.addIndex('interviews', ['employer_id']);
    await queryInterface.addIndex('interviews', ['job_id']);
    await queryInterface.addIndex('interviews', ['reminder_sent']);
    await queryInterface.addIndex('interviews', ['cancelled_by']);
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('interviews', ['employer_id']);
    await queryInterface.removeIndex('interviews', ['job_id']);
    await queryInterface.removeIndex('interviews', ['reminder_sent']);
    await queryInterface.removeIndex('interviews', ['cancelled_by']);

    // Remove columns
    await queryInterface.removeColumn('interviews', 'employer_id');
    await queryInterface.removeColumn('interviews', 'job_id');
    await queryInterface.removeColumn('interviews', 'title');
    await queryInterface.removeColumn('interviews', 'description');
    await queryInterface.removeColumn('interviews', 'timezone');
    await queryInterface.removeColumn('interviews', 'interviewers');
    await queryInterface.removeColumn('interviews', 'agenda');
    await queryInterface.removeColumn('interviews', 'requirements');
    await queryInterface.removeColumn('interviews', 'next_round_details');
    await queryInterface.removeColumn('interviews', 'reminder_sent');
    await queryInterface.removeColumn('interviews', 'reminder_sent_at');
    await queryInterface.removeColumn('interviews', 'cancelled_by');
    await queryInterface.removeColumn('interviews', 'cancelled_at');
    await queryInterface.removeColumn('interviews', 'cancellation_reason');
    await queryInterface.removeColumn('interviews', 'metadata');
  }
};
