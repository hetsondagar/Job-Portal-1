'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'rejected' value to enum_companies_verificationStatus ENUM
    // Note: The ENUM currently has: 'unverified', 'pending', 'verified', 'premium_verified'
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_companies_verificationStatus" ADD VALUE IF NOT EXISTS 'rejected';
    `);
    
    console.log('✅ Added "rejected" to verificationStatus ENUM');
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing ENUM values
    // This is a one-way migration for safety
    console.log('Cannot remove ENUM values in PostgreSQL - this is a one-way migration');
  }
};
