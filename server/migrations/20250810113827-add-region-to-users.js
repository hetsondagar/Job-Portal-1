'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [exists] = await queryInterface.sequelize.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'region' LIMIT 1`
    );
    if (!(exists && exists.length > 0)) {
      await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_users_region" AS ENUM ('india', 'gulf', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
      await queryInterface.addColumn('users', 'region', {
        type: Sequelize.ENUM('india', 'gulf', 'other'),
        allowNull: true,
      });
    } else {
      console.log('ℹ️  users.region already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'region');
  }
};
