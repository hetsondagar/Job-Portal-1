'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔧 Making employerId nullable in jobs table (v2)...');
    
    try {
      // Use raw SQL to alter the column
      await queryInterface.sequelize.query(`
        ALTER TABLE jobs 
        ALTER COLUMN "employerId" DROP NOT NULL;
      `);
      
      console.log('✅ employerId is now nullable');
      
    } catch (error) {
      console.error('❌ Error making employerId nullable:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔧 Reverting employerId to NOT NULL...');
    
    await queryInterface.sequelize.query(`
      ALTER TABLE jobs 
      ALTER COLUMN "employerId" SET NOT NULL;
    `);
  }
};


