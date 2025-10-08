/**
 * AUTO-MIGRATION SCRIPT FOR RENDER DEPLOYMENT
 * This script runs automatically when deploying to Render
 * Adds all hot vacancy columns to production database
 */

const { Sequelize } = require('sequelize');

// Determine if we need SSL (production) or not (local)
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.DATABASE_URL || 
                     (process.env.DB_SSL === 'true');

const sslConfig = isProduction ? {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
} : {};

// Use Render's DATABASE_URL or individual credentials
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: sslConfig,
      logging: console.log
    })
  : new Sequelize(
      process.env.DB_NAME || process.env.DATABASE_NAME || 'job_portal',
      process.env.DB_USER || process.env.DATABASE_USER || 'postgres',
      process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
        port: process.env.DB_PORT || process.env.DATABASE_PORT || 5432,
        dialect: 'postgres',
        dialectOptions: sslConfig,
        logging: console.log
      }
    );

async function runMigration() {
  console.log('='.repeat(80));
  console.log('🚀 AUTO-MIGRATION: Adding Hot Vacancy Features');
  console.log('='.repeat(80));
  
  try {
    // Test connection
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Define all columns to add
    const columns = [
      { name: 'ishotvacancy', sql: 'BOOLEAN DEFAULT false' },
      { name: 'urgenthiring', sql: 'BOOLEAN DEFAULT false' },
      { name: 'boostedsearch', sql: 'BOOLEAN DEFAULT false' },
      { name: 'superfeatured', sql: 'BOOLEAN DEFAULT false' },
      { name: 'multipleemailids', sql: "JSONB DEFAULT '[]'::jsonb" },
      { name: 'externalapplyurl', sql: 'VARCHAR(255)' },
      { name: 'searchboostlevel', sql: "VARCHAR(20) CHECK (searchboostlevel IN ('standard', 'premium', 'super', 'city-specific')) DEFAULT 'standard'" },
      { name: 'cityspecificboost', sql: "JSONB DEFAULT '[]'::jsonb" },
      { name: 'featuredkeywords', sql: "JSONB DEFAULT '[]'::jsonb" },
      { name: 'videobanner', sql: 'VARCHAR(255)' },
      { name: 'whyworkwithus', sql: 'TEXT' },
      { name: 'companyprofile', sql: 'TEXT' },
      { name: 'companyreviews', sql: "JSONB DEFAULT '[]'::jsonb" },
      { name: 'custombranding', sql: "JSONB DEFAULT '{}'::jsonb" },
      { name: 'attachmentfiles', sql: "JSONB DEFAULT '[]'::jsonb" },
      { name: 'officeimages', sql: "JSONB DEFAULT '[]'::jsonb" },
      { name: 'autorefresh', sql: 'BOOLEAN DEFAULT false' },
      { name: 'refreshdiscount', sql: 'DECIMAL(10,2) DEFAULT 0' },
      { name: 'proactivealerts', sql: 'BOOLEAN DEFAULT false' },
      { name: 'alertradius', sql: 'INTEGER DEFAULT 50' },
      { name: 'alertfrequency', sql: "VARCHAR(20) CHECK (alertfrequency IN ('immediate', 'daily', 'weekly')) DEFAULT 'immediate'" },
      { name: 'hotvacancyprice', sql: 'DECIMAL(10,2)' },
      { name: 'hotvacancycurrency', sql: "VARCHAR(10) DEFAULT 'INR'" },
      { name: 'hotvacancypaymentstatus', sql: "VARCHAR(20) CHECK (hotvacancypaymentstatus IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending'" },
      { name: 'tierlevel', sql: "VARCHAR(20) CHECK (tierlevel IN ('basic', 'premium', 'enterprise', 'super-premium')) DEFAULT 'basic'" }
    ];
    
    let added = 0;
    let existed = 0;
    let failed = 0;
    
    console.log(`\n📦 Adding ${columns.length} columns to jobs table...\n`);
    
    for (const col of columns) {
      try {
        await sequelize.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ${col.name} ${col.sql}`);
        console.log(`✅ ${col.name}`);
        added++;
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  ${col.name} (already exists)`);
          existed++;
        } else {
          console.log(`❌ ${col.name}: ${error.message}`);
          failed++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Added: ${added}`);
    console.log(`ℹ️  Existed: ${existed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(80));
    
    if (failed === 0) {
      console.log('\n🎉 AUTO-MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('✅ Hot vacancy features are now enabled in production\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some columns failed to add. Check errors above.\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ AUTO-MIGRATION FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run immediately
runMigration();
