'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add benefits column to jobs table
    await queryInterface.addColumn('jobs', 'benefits', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Job benefits and perks'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove benefits column from jobs table
    await queryInterface.removeColumn('jobs', 'benefits');
  }
};
