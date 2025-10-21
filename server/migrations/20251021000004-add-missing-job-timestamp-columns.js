'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔧 Adding missing timestamp columns to jobs table...');
    
    try {
      const tableInfo = await queryInterface.describeTable('jobs');
      
      // Add created_at column if it doesn't exist
      if (!tableInfo.created_at) {
        console.log('📝 Adding created_at column to jobs table...');
        await queryInterface.addColumn('jobs', 'created_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });
        
        // Copy data from createdAt to created_at
        if (tableInfo.createdAt) {
          await queryInterface.sequelize.query(`
            UPDATE jobs SET created_at = "createdAt" WHERE created_at IS NULL
          `);
        }
        console.log('✅ Added created_at column to jobs table');
      } else {
        console.log('ℹ️ created_at column already exists in jobs table');
      }
      
      // Add updated_at column if it doesn't exist
      if (!tableInfo.updated_at) {
        console.log('📝 Adding updated_at column to jobs table...');
        await queryInterface.addColumn('jobs', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });
        
        // Copy data from updatedAt to updated_at
        if (tableInfo.updatedAt) {
          await queryInterface.sequelize.query(`
            UPDATE jobs SET updated_at = "updatedAt" WHERE updated_at IS NULL
          `);
        }
        console.log('✅ Added updated_at column to jobs table');
      } else {
        console.log('ℹ️ updated_at column already exists in jobs table');
      }
      
      console.log('✅ All missing timestamp columns added to jobs table');
      
    } catch (error) {
      console.error('❌ Error adding timestamp columns:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing timestamp columns from jobs table...');
    
    try {
      const tableInfo = await queryInterface.describeTable('jobs');
      
      if (tableInfo.created_at) {
        await queryInterface.removeColumn('jobs', 'created_at');
        console.log('✅ Removed created_at column from jobs table');
      }
      
      if (tableInfo.updated_at) {
        await queryInterface.removeColumn('jobs', 'updated_at');
        console.log('✅ Removed updated_at column from jobs table');
      }
      
      console.log('✅ Timestamp columns removed from jobs table');
      
    } catch (error) {
      console.error('❌ Error removing timestamp columns:', error);
      throw error;
    }
  }
};
