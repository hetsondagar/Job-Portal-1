'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [exists] = await queryInterface.sequelize.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_skipped' LIMIT 1`
    );
    if (!(exists && exists.length > 0)) {
      await queryInterface.addColumn('users', 'password_skipped', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    } else {
      console.log('ℹ️  users.password_skipped already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'password_skipped');
  }
};
