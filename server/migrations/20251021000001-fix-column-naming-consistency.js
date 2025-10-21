'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔧 Fixing column naming consistency issues...');
    
    try {
      // Check if we need to rename columns to match the expected naming convention
      const tableInfo = await queryInterface.describeTable('users');
      const jobsTableInfo = await queryInterface.describeTable('jobs');
      
      // For users table - ensure we have both createdAt and created_at for compatibility
      if (tableInfo.createdAt && !tableInfo.created_at) {
        console.log('📝 Adding created_at column to users table for compatibility...');
        await queryInterface.addColumn('users', 'created_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });
        
        // Copy data from createdAt to created_at
        await queryInterface.sequelize.query(`
          UPDATE users SET created_at = "createdAt" WHERE created_at IS NULL
        `);
      }
      
      if (tableInfo.updatedAt && !tableInfo.updated_at) {
        console.log('📝 Adding updated_at column to users table for compatibility...');
        await queryInterface.addColumn('users', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });
        
        // Copy data from updatedAt to updated_at
        await queryInterface.sequelize.query(`
          UPDATE users SET updated_at = "updatedAt" WHERE updated_at IS NULL
        `);
      }
      
      // For jobs table - ensure we have both companyId and company_id for compatibility
      if (jobsTableInfo.companyId && !jobsTableInfo.company_id) {
        console.log('📝 Adding company_id column to jobs table for compatibility...');
        await queryInterface.addColumn('jobs', 'company_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'companies',
            key: 'id'
          }
        });
        
        // Copy data from companyId to company_id
        await queryInterface.sequelize.query(`
          UPDATE jobs SET company_id = "companyId" WHERE company_id IS NULL
        `);
      }
      
      console.log('✅ Column naming consistency fixes completed');
      
    } catch (error) {
      console.error('❌ Error fixing column naming consistency:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting column naming consistency fixes...');
    
    try {
      // Remove the compatibility columns
      const tableInfo = await queryInterface.describeTable('users');
      const jobsTableInfo = await queryInterface.describeTable('jobs');
      
      if (tableInfo.created_at) {
        await queryInterface.removeColumn('users', 'created_at');
      }
      
      if (tableInfo.updated_at) {
        await queryInterface.removeColumn('users', 'updated_at');
      }
      
      if (jobsTableInfo.company_id) {
        await queryInterface.removeColumn('jobs', 'company_id');
      }
      
      console.log('✅ Column naming consistency fixes reverted');
      
    } catch (error) {
      console.error('❌ Error reverting column naming consistency fixes:', error);
      throw error;
    }
  }
};
