'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'region', {
      type: Sequelize.ENUM('india', 'gulf', 'other'),
      allowNull: true,
      defaultValue: 'india'
    });

    // Add index for better query performance
    await queryInterface.addIndex('jobs', ['region']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('jobs', ['region']);
    await queryInterface.removeColumn('jobs', 'region');
  }
};
