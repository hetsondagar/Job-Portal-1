#!/usr/bin/env node

/**
 * Fix urgencyLevel Column
 * 
 * This script manually adds the urgencyLevel column that failed during migration
 * due to SQL syntax error.
 */

const { Sequelize } = require('sequelize');

// Use production credentials
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'jobportal_dev_0u1u',
  username: process.env.DB_USER || 'jobportal_dev_0u1u_user',
  password: process.env.DB_PASSWORD || 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
  host: process.env.DB_HOST || 'dpg-d372gajuibrs738lnm5g-a.singapore-postgres.render.com',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function fixUrgencyLevelColumn() {
  try {
    console.log('🔧 Connecting to production database...\n');
    
    await sequelize.authenticate();
    console.log('✅ Connected successfully!\n');
    
    console.log('🔍 Checking if urgencylevel column exists...');
    const [existing] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'urgencylevel'
    `);
    
    if (existing && existing.length > 0) {
      console.log('✅ urgencylevel column already exists!');
      return;
    }
    
    console.log('❌ urgencylevel column missing, adding now...\n');
    
    // Step 1: Create the ENUM type if it doesn't exist
    console.log('📊 Step 1: Creating ENUM type...');
    await sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_jobs_urgencylevel') THEN
          CREATE TYPE enum_jobs_urgencylevel AS ENUM ('high', 'critical', 'immediate');
        END IF;
      END $$;
    `);
    console.log('✅ ENUM type created/verified');
    
    // Step 2: Add the column
    console.log('📊 Step 2: Adding urgencylevel column...');
    await sequelize.query(`
      ALTER TABLE jobs 
      ADD COLUMN IF NOT EXISTS urgencylevel enum_jobs_urgencylevel;
    `);
    console.log('✅ urgencylevel column added');
    
    // Step 3: Verify
    const [verify] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'urgencylevel'
    `);
    
    console.log('\n📋 Verification:');
    console.log(verify[0]);
    console.log('\n✅ urgencylevel column fixed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

fixUrgencyLevelColumn();

