'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('job_applications');
    
    if (!tableDescription.coverLetterId) {
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
    }

    // Add index for better performance
    try {
      await queryInterface.addIndex('job_applications', ['coverLetterId'], { name: 'job_applications_cover_letter_id' });
    } catch (error) {
      console.log('Index job_applications_cover_letter_id might already exist, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('job_applications', ['coverLetterId']);
    await queryInterface.removeColumn('job_applications', 'coverLetterId');
  }
};
