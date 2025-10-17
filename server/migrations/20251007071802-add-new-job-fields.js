'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'role', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'industrytype', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'rolecategory', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'employmenttype', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'role');
    await queryInterface.removeColumn('jobs', 'industrytype');
    await queryInterface.removeColumn('jobs', 'rolecategory');
    await queryInterface.removeColumn('jobs', 'employmenttype');
  }
};
