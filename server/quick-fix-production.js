#!/usr/bin/env node

/**
 * Quick Production Fix Script
 * 
 * This script can be run directly on the production server
 * to add missing columns to the jobs table.
 * 
 * Usage: node quick-fix-production.js
 */

const { Sequelize } = require('sequelize');

// Use environment variables or default to production config
const config = {
  host: process.env.DB_HOST || 'dpg-d372gajuibrs738lnm5g-a',
  username: process.env.DB_USERNAME || 'jobportal_dev_0u1u_user',
  password: process.env.DB_PASSWORD || 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
  database: process.env.DB_NAME || 'jobportal_dev_0u1u',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: console.log, // Enable logging to see what's happening
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

async function quickFix() {
  console.log('🚀 Quick Production Fix - Adding Missing Job Columns');
  
  let sequelize;
  
  try {
    // Connect to database
    sequelize = new Sequelize(config);
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Add missing columns
    const queries = [
      "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS role VARCHAR(255)",
      "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS industrytype VARCHAR(255)",
      "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rolecategory VARCHAR(255)",
      "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employmenttype VARCHAR(255)"
    ];
    
    for (const query of queries) {
      try {
        console.log(`🔧 Executing: ${query}`);
        await sequelize.query(query);
        console.log('✅ Success');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('ℹ️  Column already exists');
        } else {
          console.error('❌ Error:', error.message);
        }
      }
    }
    
    // Test the fix
    console.log('🧪 Testing job creation...');
    try {
      const [results] = await sequelize.query(`
        SELECT id, title, role, industrytype, rolecategory, employmenttype 
        FROM jobs 
        LIMIT 1
      `);
      console.log('✅ Schema test successful');
      console.log('📊 Available columns:', Object.keys(results[0] || {}));
    } catch (error) {
      console.error('❌ Schema test failed:', error.message);
    }
    
    console.log('🎉 Quick fix completed! Job creation should now work.');
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the fix
quickFix()
  .then(() => {
    console.log('✅ Quick fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Quick fix failed:', error.message);
    process.exit(1);
  });
