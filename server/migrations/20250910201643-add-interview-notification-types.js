'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new enum values to the notifications type enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" ADD VALUE 'interview_scheduled';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" ADD VALUE 'interview_cancelled';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" ADD VALUE 'interview_reminder';
    `);
  },

  async down (queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type, which is complex
    // For now, we'll leave the enum values in place
    console.log('Note: PostgreSQL enum values cannot be easily removed. The new enum values will remain.');
  }
};
