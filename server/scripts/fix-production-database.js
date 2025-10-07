#!/usr/bin/env node

/**
 * Production Database Fix Script
 * 
 * This script connects to the production database and adds missing columns
 * to fix the job creation error.
 * 
 * Usage: node scripts/fix-production-database.js
 */

const { Sequelize } = require('sequelize');

// Production database credentials
const productionConfig = {
  host: 'dpg-d372gajuibrs738lnm5g-a',
  username: 'jobportal_dev_0u1u_user',
  password: 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
  database: 'jobportal_dev_0u1u',
  port: 5432,
  dialect: 'postgres',
  logging: false, // Disable SQL logging for cleaner output
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

async function fixProductionDatabase() {
  console.log('🔧 Fixing Production Database - Adding Missing Job Columns');
  
  let sequelize;
  
  try {
    // Connect to production database
    sequelize = new Sequelize(productionConfig);
    await sequelize.authenticate();
    console.log('✅ Connected to production database');
    
    // Check current columns
    console.log('🔍 Checking current jobs table columns...');
    const [currentColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND table_schema = 'public'
      ORDER BY column_name
    `);
    
    const existingColumns = currentColumns.map(col => col.column_name.toLowerCase());
    console.log(`📋 Found ${existingColumns.length} existing columns in jobs table`);
    
    // Define required columns
    const requiredColumns = [
      { name: 'role', type: 'VARCHAR(255)' },
      { name: 'industrytype', type: 'VARCHAR(255)' },
      { name: 'rolecategory', type: 'VARCHAR(255)' },
      { name: 'employmenttype', type: 'VARCHAR(255)' }
    ];
    
    // Check which columns are missing
    const columnsToAdd = requiredColumns.filter(col => 
      !existingColumns.includes(col.name.toLowerCase())
    );
    
    if (columnsToAdd.length === 0) {
      console.log('✅ All required columns already exist in jobs table');
      return;
    }
    
    console.log(`⚠️  Found ${columnsToAdd.length} missing columns:`);
    columnsToAdd.forEach(col => console.log(`  - ${col.name}`));
    
    // Add missing columns
    for (const column of columnsToAdd) {
      try {
        const query = `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`;
        console.log(`🔧 Adding column: ${column.name}`);
        await sequelize.query(query);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
          console.log(`ℹ️  Column ${column.name} already exists`);
        } else {
          console.error(`❌ Failed to add column ${column.name}:`, error.message);
          throw error;
        }
      }
    }
    
    // Test the schema
    console.log('🧪 Testing jobs table schema...');
    try {
      const [testResults] = await sequelize.query(`
        SELECT id, title, role, industrytype, rolecategory, employmenttype 
        FROM jobs 
        LIMIT 1
      `);
      console.log('✅ Jobs table schema test successful');
      console.log('📊 Available columns:', Object.keys(testResults[0] || {}));
    } catch (error) {
      console.error('❌ Jobs table schema test failed:', error.message);
      throw error;
    }
    
    console.log('🎉 Production database fix completed successfully!');
    console.log('🚀 Job creation should now work without errors');
    
  } catch (error) {
    console.error('❌ Production database fix failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Handle script execution
if (require.main === module) {
  fixProductionDatabase()
    .then(() => {
      console.log('✅ Production database fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Production database fix failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fixProductionDatabase };
