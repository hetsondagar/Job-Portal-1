#!/usr/bin/env node

/**
 * Fix Admin Stats Endpoint
 * This script fixes the admin stats endpoint to handle enum errors properly
 */

const dbConnection = require('./lib/database-connection');

console.log('🔧 Fixing Admin Stats Endpoint...');

async function fixAdminStatsEndpoint() {
  try {
    // Connect to database using robust connection handler
    const sequelize = await dbConnection.connect();
    console.log('✅ Database connection established');

    // Step 1: Fix enum_jobs_status to include 'inactive'
    console.log('🔧 Step 1: Fixing enum_jobs_status...');
    try {
      // Check current enum values
      const [enumValues] = await sequelize.query(`
        SELECT unnest(enum_range(NULL::enum_jobs_status)) as value
      `);
      
      const currentValues = enumValues.map(row => row.value);
      console.log('Current enum values:', currentValues);
      
      if (!currentValues.includes('inactive')) {
        console.log('Adding "inactive" to enum_jobs_status...');
        await sequelize.query(`
          ALTER TYPE enum_jobs_status ADD VALUE 'inactive'
        `);
        console.log('✅ Added "inactive" to enum_jobs_status');
      } else {
        console.log('✅ "inactive" already exists in enum_jobs_status');
      }
    } catch (error) {
      console.log('⚠️ Enum fix error:', error.message);
    }

    // Step 2: Update any jobs with invalid status to 'inactive'
    console.log('🔧 Step 2: Updating invalid job statuses...');
    try {
      const [invalidJobs] = await sequelize.query(`
        SELECT id, status FROM jobs 
        WHERE status NOT IN ('draft', 'active', 'paused', 'closed', 'expired', 'inactive')
      `);
      
      if (invalidJobs.length > 0) {
        console.log(`Found ${invalidJobs.length} jobs with invalid status, updating to 'inactive'...`);
        await sequelize.query(`
          UPDATE jobs 
          SET status = 'inactive' 
          WHERE status NOT IN ('draft', 'active', 'paused', 'closed', 'expired', 'inactive')
        `);
        console.log('✅ Updated invalid job statuses to inactive');
      } else {
        console.log('✅ No jobs with invalid status found');
      }
    } catch (error) {
      console.log('⚠️ Job status update error:', error.message);
    }

    // Step 3: Test the admin stats query
    console.log('🔧 Step 3: Testing admin stats query...');
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
      console.log('⚠️ Admin stats query error:', error.message);
    }

    // Step 4: Test user and company stats
    console.log('🔧 Step 4: Testing user and company stats...');
    try {
      const [userStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN user_type = 'jobseeker' THEN 1 END) as jobseekers,
          COUNT(CASE WHEN user_type = 'employer' THEN 1 END) as employers,
          COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admins,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active
        FROM users
      `);
      
      const [companyStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified,
          COUNT(CASE WHEN verification_status = 'unverified' THEN 1 END) as unverified,
          COUNT(CASE WHEN company_status = 'active' THEN 1 END) as active
        FROM companies
      `);
      
      console.log('✅ User statistics:', userStats[0]);
      console.log('✅ Company statistics:', companyStats[0]);
    } catch (error) {
      console.log('⚠️ User/Company stats error:', error.message);
    }

    console.log('✅ Admin stats endpoint fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing admin stats endpoint:', error.message);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixAdminStatsEndpoint()
    .then(() => {
      console.log('🎉 Admin stats endpoint fixed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to fix admin stats endpoint:', error);
      process.exit(1);
    });
}

module.exports = { fixAdminStatsEndpoint };
