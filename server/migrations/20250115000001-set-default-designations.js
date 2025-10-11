'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Set default designations for existing users based on their user_type
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET designation = CASE 
        WHEN user_type = 'admin' THEN 'Hiring Manager'
        WHEN user_type = 'employer' THEN 'Recruiter'
        ELSE designation
      END
      WHERE designation IS NULL OR designation = '';
    `);

    console.log('✅ Set default designations for existing users');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is not easily reversible as we don't know what the original values were
    console.log('⚠️ Cannot reverse designation defaults - original values unknown');
  }
};
