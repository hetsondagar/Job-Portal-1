const { Client } = require('pg');

async function runMigration() {
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

  try {
    console.log('🔌 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected to production database');

    console.log('🔄 Adding new account status values to ENUM...');
    
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
      }
    }

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
      }
    }

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
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
