'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('educations');
    if (!table.verification_date) {
      await queryInterface.addColumn('educations', 'verification_date', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('educations');
    if (table.verification_date) {
      await queryInterface.removeColumn('educations', 'verification_date');
    }
  }
};
