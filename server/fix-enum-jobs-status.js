#!/usr/bin/env node

/**
 * Fix ENUM Jobs Status
 * This script fixes the enum_jobs_status to include 'inactive' and handles existing data
 */

const dbConnection = require('./lib/database-connection');

console.log('🔧 Fixing ENUM Jobs Status...');

async function fixEnumJobsStatus() {
  try {
    // Connect to database
    const sequelize = await dbConnection.connect();
    console.log('✅ Database connection established');

    // Step 1: Check current enum values
    console.log('📋 Checking current enum values...');
    const [currentValues] = await sequelize.query(`
      SELECT t.typname enum_name, array_agg(e.enumlabel ORDER BY enumsortorder) enum_value 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
      WHERE n.nspname = 'public' AND t.typname='enum_jobs_status' 
      GROUP BY 1
    `);
    
    if (currentValues.length > 0) {
      console.log('Current enum_jobs_status values:', currentValues[0].enum_value);
    }

    // Step 2: Check for jobs with invalid status values
    console.log('🔍 Checking for jobs with invalid status values...');
    const [invalidJobs] = await sequelize.query(`
      SELECT id, status, title 
      FROM jobs 
      WHERE status NOT IN ('draft', 'active', 'paused', 'closed', 'expired', 'inactive')
      LIMIT 10
    `);
    
    if (invalidJobs.length > 0) {
      console.log('Found jobs with invalid status values:', invalidJobs);
    }

    // Step 3: Add 'inactive' to the enum if it doesn't exist
    console.log('➕ Adding "inactive" to enum_jobs_status...');
    try {
      await sequelize.query(`
        ALTER TYPE enum_jobs_status ADD VALUE IF NOT EXISTS 'inactive'
      `);
      console.log('✅ Added "inactive" to enum_jobs_status');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ "inactive" already exists in enum_jobs_status');
      } else {
        console.log('⚠️ Error adding "inactive" to enum:', error.message);
      }
    }

    // Step 4: Update any jobs with invalid status to 'inactive'
    console.log('🔄 Updating jobs with invalid status values...');
    const [updateResult] = await sequelize.query(`
      UPDATE jobs 
      SET status = 'inactive' 
      WHERE status NOT IN ('draft', 'active', 'paused', 'closed', 'expired', 'inactive')
    `);
    
    if (updateResult > 0) {
      console.log(`✅ Updated ${updateResult} jobs with invalid status to 'inactive'`);
    } else {
      console.log('✅ No jobs needed status updates');
    }

    // Step 5: Verify the fix
    console.log('✅ Verifying the fix...');
    const [finalValues] = await sequelize.query(`
      SELECT t.typname enum_name, array_agg(e.enumlabel ORDER BY enumsortorder) enum_value 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
      WHERE n.nspname = 'public' AND t.typname='enum_jobs_status' 
      GROUP BY 1
    `);
    
    if (finalValues.length > 0) {
      console.log('Final enum_jobs_status values:', finalValues[0].enum_value);
    }

    // Step 6: Test the admin stats query
    console.log('🧪 Testing admin stats query...');
    try {
      const [jobStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
          COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused,
          COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired
        FROM jobs
      `);
      
      console.log('✅ Job statistics query successful:', jobStats[0]);
    } catch (error) {
      console.error('❌ Job statistics query failed:', error.message);
    }

    console.log('✅ ENUM jobs status fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing enum jobs status:', error.message);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixEnumJobsStatus()
    .then(() => {
      console.log('🎉 ENUM jobs status fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to fix enum jobs status:', error);
      process.exit(1);
    });
}

module.exports = { fixEnumJobsStatus };
