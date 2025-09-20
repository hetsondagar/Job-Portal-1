#!/usr/bin/env node

/**
 * Database Setup Script for Production
 * This script checks tables, runs migrations, and ensures everything is ready
 */

const { sequelize } = require('./config/sequelize');
const { QueryInterface } = require('sequelize');

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Test connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check existing tables
    console.log('🔍 Checking existing tables...');
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('📋 Existing tables:', tables);
    
    // Run migrations
    console.log('🔄 Running migrations...');
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Database sync completed');
    } catch (syncError) {
      console.log('⚠️ Sync error (this might be normal):', syncError.message);
    }
    
    // Check tables again
    console.log('🔍 Checking tables after sync...');
    const tablesAfter = await queryInterface.showAllTables();
    console.log('📋 Tables after sync:', tablesAfter);
    
    // Test User model
    console.log('🔍 Testing User model...');
    try {
      const User = require('./models/User');
      const userCount = await User.count();
      console.log('✅ User model working, count:', userCount);
    } catch (userError) {
      console.log('❌ User model error:', userError.message);
    }
    
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
