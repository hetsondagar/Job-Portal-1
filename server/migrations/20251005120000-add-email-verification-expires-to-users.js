'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing column if it doesn't exist
    await queryInterface.addColumn('users', 'email_verification_expires', {
      type: Sequelize.DATE,
      allowNull: true
    }).catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'email_verification_expires').catch(() => {});
  }
};


