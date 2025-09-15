'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const jobsTable = await queryInterface.describeTable('jobs');

    if (!jobsTable.duration) {
      await queryInterface.addColumn('jobs', 'duration', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!jobsTable.startDate) {
      await queryInterface.addColumn('jobs', 'startDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!jobsTable.workMode) {
      await queryInterface.addColumn('jobs', 'workMode', {
        type: Sequelize.ENUM('remote', 'on-site', 'hybrid'),
        allowNull: true
      });
    }

    if (!jobsTable.learningObjectives) {
      await queryInterface.addColumn('jobs', 'learningObjectives', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!jobsTable.mentorship) {
      await queryInterface.addColumn('jobs', 'mentorship', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'duration');
    await queryInterface.removeColumn('jobs', 'startDate');
    await queryInterface.removeColumn('jobs', 'workMode');
    await queryInterface.removeColumn('jobs', 'learningObjectives');
    await queryInterface.removeColumn('jobs', 'mentorship');
  }
};
