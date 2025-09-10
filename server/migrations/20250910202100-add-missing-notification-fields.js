'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add missing columns to notifications table
    await queryInterface.addColumn('notifications', 'short_message', {
      type: Sequelize.STRING(200),
      allowNull: true
    });

    await queryInterface.addColumn('notifications', 'is_email_sent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('notifications', 'is_sms_sent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('notifications', 'is_push_sent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('notifications', 'icon', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('notifications', 'image', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('notifications', 'metadata', {
      type: Sequelize.JSONB,
      defaultValue: {}
    });

    await queryInterface.addColumn('notifications', 'read_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('notifications', 'scheduled_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('notifications', 'sent_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add indexes for new columns
    await queryInterface.addIndex('notifications', ['is_email_sent']);
    await queryInterface.addIndex('notifications', ['is_sms_sent']);
    await queryInterface.addIndex('notifications', ['is_push_sent']);
    await queryInterface.addIndex('notifications', ['scheduled_at']);
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('notifications', ['is_email_sent']);
    await queryInterface.removeIndex('notifications', ['is_sms_sent']);
    await queryInterface.removeIndex('notifications', ['is_push_sent']);
    await queryInterface.removeIndex('notifications', ['scheduled_at']);

    // Remove columns
    await queryInterface.removeColumn('notifications', 'short_message');
    await queryInterface.removeColumn('notifications', 'is_email_sent');
    await queryInterface.removeColumn('notifications', 'is_sms_sent');
    await queryInterface.removeColumn('notifications', 'is_push_sent');
    await queryInterface.removeColumn('notifications', 'icon');
    await queryInterface.removeColumn('notifications', 'image');
    await queryInterface.removeColumn('notifications', 'metadata');
    await queryInterface.removeColumn('notifications', 'read_at');
    await queryInterface.removeColumn('notifications', 'scheduled_at');
    await queryInterface.removeColumn('notifications', 'sent_at');
  }
};
