#!/usr/bin/env node

/**
 * Reset Database State
 * This script resets the database to a clean state for production deployment
 */

const { Sequelize } = require('sequelize');
const config = require('./config/database');

console.log('🔄 Resetting Database State...');

async function resetDatabaseState() {
  let sequelize;
  
  try {
    // Create sequelize instance
    const env = process.env.NODE_ENV || 'production';
    const dbConfig = config[env];
    
    sequelize = new Sequelize(dbConfig.url || dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: console.log,
      pool: dbConfig.pool,
      define: dbConfig.define,
      dialectOptions: dbConfig.dialectOptions
    });

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Drop all tables in reverse dependency order
    console.log('🗑️ Dropping all tables...');
    await dropAllTables(sequelize);
    
    // Clear migration history
    console.log('🧹 Clearing migration history...');
    await clearMigrationHistory(sequelize);
    
    console.log('✅ Database state reset successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting database state:', error.message);
    throw error;
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

async function dropAllTables(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  
  // Get all table names
  const [tables] = await queryInterface.sequelize.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    AND table_name != 'spatial_ref_sys'
  `);
  
  console.log(`Found ${tables.length} tables to drop`);
  
  // Drop tables in reverse dependency order
  const tableNames = tables.map(t => t.table_name);
  const dropOrder = [
    'messages', 'conversations', 'interviews', 'user_sessions', 'payments', 'subscriptions',
    'subscription_plans', 'company_follows', 'company_reviews', 'notifications', 'job_alerts',
    'job_bookmarks', 'applications', 'job_applications', 'requirements', 'educations',
    'work_experiences', 'resumes', 'jobs', 'job_categories', 'users', 'companies'
  ];
  
  for (const tableName of dropOrder) {
    if (tableNames.includes(tableName)) {
      try {
        await queryInterface.dropTable(tableName, { cascade: true });
        console.log(`  ✅ Dropped ${tableName} table`);
      } catch (error) {
        console.log(`  ⚠️ Error dropping ${tableName}:`, error.message);
      }
    }
  }
  
  // Drop any remaining tables
  for (const table of tables) {
    const tableName = table.table_name;
    if (!dropOrder.includes(tableName)) {
      try {
        await queryInterface.dropTable(tableName, { cascade: true });
        console.log(`  ✅ Dropped ${tableName} table`);
      } catch (error) {
        console.log(`  ⚠️ Error dropping ${tableName}:`, error.message);
      }
    }
  }
}

async function clearMigrationHistory(sequelize) {
  try {
    // Drop SequelizeMeta table if it exists
    await sequelize.query(`DROP TABLE IF EXISTS "SequelizeMeta" CASCADE`);
    console.log('  ✅ Cleared migration history');
  } catch (error) {
    console.log('  ⚠️ Error clearing migration history:', error.message);
  }
}

// Run the reset
if (require.main === module) {
  resetDatabaseState()
    .then(() => {
      console.log('🎉 Database state reset completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to reset database state:', error);
      process.exit(1);
    });
}

module.exports = { resetDatabaseState };
