const { sequelize } = require('./config/sequelize');

async function runMigration() {
  try {
    console.log('🔄 Running secure job tracking migration...');
    
    // Import the migration
    const migration = require('./migrations/20250125000004-add-secure-job-tracking');
    
    // Run the migration
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Added fields:');
    console.log('  - jobs.isSecure (boolean)');
    console.log('  - users.secureJobTaps (integer)');
    console.log('  - users.secureJobTapsAt (date)');
    console.log('  - secure_job_taps table');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigration();
