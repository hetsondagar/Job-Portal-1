'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'region', {
      type: Sequelize.ENUM('india', 'gulf', 'other'),
      allowNull: true,
      defaultValue: 'india'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'region');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_companies_region";');
  }
};
