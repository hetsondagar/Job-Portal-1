#!/usr/bin/env node

/**
 * Production Database Setup Script
 * This script runs on Render to set up the database
 */

// Load environment variables
require('dotenv').config();

const { sequelize } = require('./config/sequelize');

async function setupProductionDatabase() {
  try {
    console.log('🚀 Starting production database setup...');
    console.log('📋 Environment:', process.env.NODE_ENV);
    console.log('🗄️ Database:', process.env.DB_HOST);
    
    // Test connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check existing tables
    console.log('🔍 Checking existing tables...');
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('📋 Existing tables:', tables.length, 'tables found');
    
    if (tables.length > 0) {
      console.log('📋 Table names:', tables);
    }
    
    // Sync database (create tables if they don't exist)
    console.log('🔄 Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database sync completed');
    
    // Check tables after sync
    console.log('🔍 Checking tables after sync...');
    const tablesAfter = await queryInterface.showAllTables();
    console.log('📋 Tables after sync:', tablesAfter.length, 'tables');
    
    // Test key models
    console.log('🔍 Testing key models...');
    
    try {
      const User = require('./models/User');
      const userCount = await User.count();
      console.log('✅ User model working, count:', userCount);
    } catch (userError) {
      console.log('❌ User model error:', userError.message);
    }
    
    try {
      const Company = require('./models/Company');
      const companyCount = await Company.count();
      console.log('✅ Company model working, count:', companyCount);
    } catch (companyError) {
      console.log('❌ Company model error:', companyError.message);
    }
    
    try {
      const Job = require('./models/Job');
      const jobCount = await Job.count();
      console.log('✅ Job model working, count:', jobCount);
    } catch (jobError) {
      console.log('❌ Job model error:', jobError.message);
    }
    
    console.log('🎉 Production database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Production database setup failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionDatabase };
