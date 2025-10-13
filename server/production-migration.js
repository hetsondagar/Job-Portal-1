/**
 * PRODUCTION DATABASE MIGRATION SCRIPT
 * Adds new account status ENUM values for verification system
 * 
 * Usage: node production-migration.js
 */

const { Client } = require('pg');

// Get database config from environment or use provided values
const client = new Client({
  host: process.env.DB_HOSTNAME || 'dpg-d372gajuibrs738lnm5g-a',
  database: process.env.DB_DATABASE || 'jobportal_dev_0u1u',
  user: process.env.DB_USERNAME || 'jobportal_dev_0u1u_user',
  password: process.env.DB_PASSWORD || 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
});

async function runProductionMigration() {
  try {
    console.log('🔌 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected to production database');

    console.log('🔄 Checking current ENUM values...');
    
    // Check current ENUM values
    const enumCheck = await client.query(`
      SELECT unnest(enum_range(NULL::enum_users_account_status)) as enum_value;
    `);
    
    console.log('📋 Current ENUM values:', enumCheck.rows.map(r => r.enum_value));
    
    console.log('🔄 Adding new account status values...');
    
    // Add pending_verification
    try {
      await client.query(`
        ALTER TYPE "enum_users_account_status" ADD VALUE IF NOT EXISTS 'pending_verification';
      `);
      console.log('✅ Added "pending_verification" to account_status ENUM');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ "pending_verification" already exists');
      } else {
        console.error('❌ Error adding pending_verification:', error.message);
        throw error;
      }
    }

    // Add rejected
    try {
      await client.query(`
        ALTER TYPE "enum_users_account_status" ADD VALUE IF NOT EXISTS 'rejected';
      `);
      console.log('✅ Added "rejected" to account_status ENUM');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ "rejected" already exists');
      } else {
        console.error('❌ Error adding rejected:', error.message);
        throw error;
      }
    }

    // Verify the changes
    console.log('🔍 Verifying ENUM values after migration...');
    const finalCheck = await client.query(`
      SELECT unnest(enum_range(NULL::enum_users_account_status)) as enum_value;
    `);
    
    console.log('📋 Final ENUM values:', finalCheck.rows.map(r => r.enum_value));
    
    // Check if new values are present
    const hasPendingVerification = finalCheck.rows.some(r => r.enum_value === 'pending_verification');
    const hasRejected = finalCheck.rows.some(r => r.enum_value === 'rejected');
    
    if (hasPendingVerification && hasRejected) {
      console.log('🎉 Migration completed successfully!');
      console.log('✅ All required ENUM values are now available');
    } else {
      console.log('⚠️ Migration completed but some values may be missing');
      console.log(`pending_verification: ${hasPendingVerification ? '✅' : '❌'}`);
      console.log(`rejected: ${hasRejected ? '✅' : '❌'}`);
    }

    // Test the ENUM by checking if we can create a user with new status
    console.log('🧪 Testing ENUM functionality...');
    try {
      const testQuery = await client.query(`
        SELECT 'pending_verification'::enum_users_account_status as test_value;
      `);
      console.log('✅ ENUM test passed - pending_verification works');
    } catch (error) {
      console.error('❌ ENUM test failed:', error.message);
    }

    try {
      const testQuery2 = await client.query(`
        SELECT 'rejected'::enum_users_account_status as test_value;
      `);
      console.log('✅ ENUM test passed - rejected works');
    } catch (error) {
      console.error('❌ ENUM test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runProductionMigration()
  .then(() => {
    console.log('✅ Production migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Production migration failed:', error.message);
    process.exit(1);
  });
