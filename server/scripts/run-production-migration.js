const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Production database configuration
const sequelize = new Sequelize('jobportal_dev_0u1u', 'jobportal_dev_0u1u_user', 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc', {
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
});

async function runMigration() {
  try {
    console.log('🔌 Connecting to production database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully!');

    console.log('\n📊 Running migration: add-benefits-to-jobs');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'benefits';
    `);

    if (results.length > 0) {
      console.log('⚠️  Benefits column already exists, skipping...');
    } else {
      // Add benefits column
      await sequelize.query(`
        ALTER TABLE jobs 
        ADD COLUMN benefits TEXT;
      `);
      console.log('✅ Benefits column added successfully!');
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n🎉 All migrations completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });

