'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔧 Adding missing posted_by column to jobs table...');
    
    try {
      // Check if posted_by column exists
      const tableInfo = await queryInterface.describeTable('jobs');
      
      if (!tableInfo.posted_by) {
        console.log('📝 Adding posted_by column to jobs table...');
        await queryInterface.addColumn('jobs', 'posted_by', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        });
        
        // Copy data from employerId to posted_by if employerId exists
        if (tableInfo.employerId) {
          await queryInterface.sequelize.query(`
            UPDATE jobs SET posted_by = "employerId" WHERE posted_by IS NULL
          `);
        }
        
        console.log('✅ Added posted_by column to jobs table');
      } else {
        console.log('ℹ️ posted_by column already exists in jobs table');
      }
      
    } catch (error) {
      console.error('❌ Error adding posted_by column:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing posted_by column from jobs table...');
    
    try {
      const tableInfo = await queryInterface.describeTable('jobs');
      
      if (tableInfo.posted_by) {
        await queryInterface.removeColumn('jobs', 'posted_by');
        console.log('✅ Removed posted_by column from jobs table');
      }
      
    } catch (error) {
      console.error('❌ Error removing posted_by column:', error);
      throw error;
    }
  }
};
