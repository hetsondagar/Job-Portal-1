'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('jobs');
    
    if (!tableDescription.salary) {
      await queryInterface.addColumn('jobs', 'salary', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Salary range as entered by user (e.g., "₹8-15 LPA")'
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'salary');
  }
};
