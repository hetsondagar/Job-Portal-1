#!/usr/bin/env node

/**
 * Database Check Script
 * This script checks if tables exist and shows database status
 */

const { sequelize } = require('./config/sequelize');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database status...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check tables
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    
    console.log('📋 Database tables:');
    if (tables.length === 0) {
      console.log('❌ No tables found - database needs to be initialized');
    } else {
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table}`);
      });
    }
    
    // Check specific models
    const models = ['User', 'Company', 'Job', 'Application'];
    console.log('\n🔍 Checking model availability:');
    
    for (const modelName of models) {
      try {
        const Model = require(`./models/${modelName}`);
        const count = await Model.count();
        console.log(`  ✅ ${modelName}: ${count} records`);
      } catch (error) {
        console.log(`  ❌ ${modelName}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabase();
}

module.exports = { checkDatabase };
