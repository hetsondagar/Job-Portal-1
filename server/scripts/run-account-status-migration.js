const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: 'dpg-d372gajuibrs738lnm5g-a',
  database: 'jobportal_dev_0u1u',
  user: 'jobportal_dev_0u1u_user',
  password: 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('🔌 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected to production database');

    console.log('🔄 Adding new account status values to ENUM...');
    
    // Add pending_verification
    await client.query(`
      ALTER TYPE "enum_users_account_status" ADD VALUE IF NOT EXISTS 'pending_verification';
    `);
    console.log('✅ Added "pending_verification" to account_status ENUM');

    // Add rejected
    await client.query(`
      ALTER TYPE "enum_users_account_status" ADD VALUE IF NOT EXISTS 'rejected';
    `);
    console.log('✅ Added "rejected" to account_status ENUM');

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️ ENUM values already exist, continuing...');
    } else {
      throw error;
    }
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration()
  .then(() => {
    console.log('✅ Account status migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
