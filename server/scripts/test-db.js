require('dotenv').config();
const { sequelize } = require('../config/sequelize');
const { exec } = require('child_process');
const path = require('path');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection and status...\n');
    
    // Test database connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Show database info
    const config = sequelize.config;
    console.log('📊 Database Information:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Username: ${config.username}`);
    console.log(`   Dialect: ${config.dialect}\n`);
    
    // Check migration status
    console.log('🔄 Checking migration status...');
    await checkMigrationStatus();
    
    // Test table creation
    console.log('\n🧪 Testing table creation...');
    await testTableCreation();
    
    console.log('\n🎉 Database test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

function checkMigrationStatus() {
  return new Promise((resolve, reject) => {
    const command = 'npx sequelize-cli db:migrate:status';
    
    exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error('Migration status error:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn('Migration warnings:', stderr);
      }
      
      console.log('Migration Status:');
      console.log(stdout);
      resolve();
    });
  });
}

async function testTableCreation() {
  try {
    // Test if we can query the database
    const result = await sequelize.query('SELECT current_database(), current_user, version()');
    console.log('✅ Database query successful');
    console.log(`   Current Database: ${result[0][0].current_database}`);
    console.log(`   Current User: ${result[0][0].current_user}`);
    console.log(`   PostgreSQL Version: ${result[0][0].version.split(',')[0]}`);
  } catch (error) {
    console.error('❌ Database query failed:', error.message);
    throw error;
  }
}

// Run the test
testDatabase();
