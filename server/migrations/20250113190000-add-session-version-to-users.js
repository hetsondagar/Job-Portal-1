'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'session_version', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false
    });
    console.log('✅ Added session_version column to users table');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'session_version');
    console.log('✅ Removed session_version column from users table');
  }
};

