'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [exists] = await queryInterface.sequelize.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'benefits' LIMIT 1`
    );
    if (!(exists && exists.length > 0)) {
      await queryInterface.addColumn('jobs', 'benefits', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Job benefits and perks'
      });
    } else {
      console.log('ℹ️  jobs.benefits already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'benefits');
  }
};
