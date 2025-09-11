'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'duration', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Internship duration (e.g., "3 months", "6 months")'
    });

    await queryInterface.addColumn('jobs', 'startDate', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Internship start date'
    });

    await queryInterface.addColumn('jobs', 'workMode', {
      type: Sequelize.ENUM('remote', 'on-site', 'hybrid'),
      allowNull: true,
      comment: 'Work mode for internship'
    });

    await queryInterface.addColumn('jobs', 'learningObjectives', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'What the intern will learn from this experience'
    });

    await queryInterface.addColumn('jobs', 'mentorship', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Mentorship and guidance details'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'duration');
    await queryInterface.removeColumn('jobs', 'startDate');
    await queryInterface.removeColumn('jobs', 'workMode');
    await queryInterface.removeColumn('jobs', 'learningObjectives');
    await queryInterface.removeColumn('jobs', 'mentorship');
  }
};
