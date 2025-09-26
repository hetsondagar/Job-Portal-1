#!/usr/bin/env node

/**
 * Production Database Sync Script for Render
 * This script runs database migrations and syncs the database on deployment
 */

require('dotenv').config();
const { sequelize } = require('./config/sequelize');

async function deploySync() {
  try {
    console.log('🚀 Starting production database sync...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Run migrations
    console.log('📝 Running database migrations...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully');
    } catch (migrationError) {
      console.log('⚠️ Migration failed, trying force sync...');
      // Fallback to force sync if migrations fail
      const { syncDatabase } = require('./config/index.js');
      await syncDatabase(false);
      console.log('✅ Force sync completed');
    }
    
    // Verify database state
    const result = await sequelize.query(`
      SELECT 
        COUNT(*) as total_tables
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    console.log(`📊 Database sync completed - ${result[0][0].total_tables} tables available`);
    console.log('🎉 Production database is ready!');
    
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the sync
deploySync();
