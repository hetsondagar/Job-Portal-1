'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'role', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'industryType', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'roleCategory', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'employmentType', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'role');
    await queryInterface.removeColumn('jobs', 'industryType');
    await queryInterface.removeColumn('jobs', 'roleCategory');
    await queryInterface.removeColumn('jobs', 'employmentType');
  }
};
