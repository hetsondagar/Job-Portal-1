/**
 * Run final agency system migrations
 * This adds client email verification fields
 */

const { sequelize } = require('../config/sequelize');
const migration = require('../migrations/20250110000005-add-client-verification-fields');

async function runMigration() {
  try {
    console.log('\n🚀 Running Final Agency System Migration...\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');
    
    // Run migration
    console.log('📦 Adding client verification fields...');
    await migration.up(sequelize.getQueryInterface(), require('sequelize'));
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('✅ Added fields:');
    console.log('  - client_verification_token');
    console.log('  - client_verification_token_expiry');
    console.log('  - client_verification_action\n');
    
    console.log('📧 Client email verification is now fully functional!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

runMigration();


