'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('job_applications', 'coverLetterId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'cover_letters',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for better performance
    await queryInterface.addIndex('job_applications', ['coverLetterId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('job_applications', ['coverLetterId']);
    await queryInterface.removeColumn('job_applications', 'coverLetterId');
  }
};
