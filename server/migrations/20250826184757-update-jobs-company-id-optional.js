'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Make companyId column optional (allow NULL)
    await queryInterface.changeColumn('jobs', 'companyId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert companyId column to required (not allow NULL)
    await queryInterface.changeColumn('jobs', 'companyId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    });
  }
};
