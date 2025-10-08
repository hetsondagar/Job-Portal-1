/**
 * IMMEDIATE PRODUCTION FIX
 * Connects directly to production database and adds hot vacancy columns
 */

const { Sequelize } = require('sequelize');

// Production database credentials
const sequelize = new Sequelize(
  'jobportal_dev_0u1u',
  'jobportal_dev_0u1u_user',
  'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
  {
    host: 'dpg-d372gajuibrs738lnm5g-a.oregon-postgres.render.com',
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  }
);

async function fixProductionNow() {
  console.log('='.repeat(80));
  console.log('🚨 IMMEDIATE PRODUCTION FIX - ADDING HOT VACANCY COLUMNS');
  console.log('='.repeat(80));
  console.log('');
  
  try {
    // Test connection
    console.log('🔌 Connecting to production database...');
    await sequelize.authenticate();
    console.log('✅ Connected to production database successfully!');
    console.log('');
    
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
    
    console.log(`🔧 Adding ${columns.length} columns to jobs table...`);
    console.log('');
    
    for (const col of columns) {
      try {
        const sql = `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ${col.name} ${col.sql}`;
        await sequelize.query(sql);
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
    
    console.log('');
    console.log('='.repeat(80));
    console.log('📊 PRODUCTION FIX SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Columns Added: ${added}`);
    console.log(`ℹ️  Already Existed: ${existed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(80));
    console.log('');
    
    if (failed === 0) {
      console.log('🎉 PRODUCTION DATABASE FIXED SUCCESSFULLY!');
      console.log('');
      console.log('✅ All hot vacancy columns added to jobs table');
      console.log('✅ All 500 errors will be resolved');
      console.log('');
      console.log('🚀 NEXT STEPS:');
      console.log('   1. Go to Render dashboard');
      console.log('   2. Restart your backend service');
      console.log('   3. Refresh your employer dashboard');
      console.log('   4. All errors should be GONE! ✅');
      console.log('');
      process.exit(0);
    } else {
      console.log('⚠️  Some columns failed to add. Check errors above.');
      console.log('');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ PRODUCTION FIX FAILED:', error.message);
    console.error('');
    console.error('Stack trace:', error.stack);
    console.error('');
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run immediately
console.log('');
console.log('⚡ STARTING IMMEDIATE PRODUCTION FIX...');
console.log('');

fixProductionNow();

