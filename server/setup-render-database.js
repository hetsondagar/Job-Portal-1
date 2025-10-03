#!/usr/bin/env node

/**
 * Setup Render Database
 * This script helps set up the database connection for Render deployment
 */

console.log('🔧 Setting up Render Database Configuration...');

// Display current environment variables
console.log('📋 Current Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('DB_URL:', process.env.DB_URL ? '✅ Set' : '❌ Not set');
console.log('DB_HOST:', process.env.DB_HOST ? '✅ Set' : '❌ Not set');
console.log('DB_USER:', process.env.DB_USER ? '✅ Set' : '❌ Not set');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('DB_NAME:', process.env.DB_NAME ? '✅ Set' : '❌ Not set');
console.log('DB_PORT:', process.env.DB_PORT ? '✅ Set' : '❌ Not set');

// Test database connection
async function testDatabaseConnection() {
  try {
    const dbConnection = require('./lib/database-connection');
    
    console.log('\n🧪 Testing database connection...');
    const success = await dbConnection.testConnection();
    
    if (success) {
      console.log('✅ Database connection successful!');
      
      // Get database info
      const sequelize = dbConnection.getSequelize();
      const [results] = await sequelize.query('SELECT current_database() as db_name, current_user as user_name');
      console.log('📊 Connected to database:', results[0]?.db_name);
      console.log('👤 Connected as user:', results[0]?.user_name);
      
    } else {
      console.log('❌ Database connection failed!');
    }
    
    await dbConnection.disconnect();
    
  } catch (error) {
    console.error('💥 Database connection error:', error.message);
  }
}

// Provide setup instructions
function provideSetupInstructions() {
  console.log('\n📖 Render Database Setup Instructions:');
  console.log('1. In your Render dashboard, go to your PostgreSQL database');
  console.log('2. Copy the "External Database URL"');
  console.log('3. In your web service environment variables, add:');
  console.log('   DATABASE_URL = <your-external-database-url>');
  console.log('4. Make sure your database is accessible from Render');
  console.log('5. The database URL should look like:');
  console.log('   postgresql://username:password@host:port/database');
  
  console.log('\n🔧 Alternative: Set individual variables:');
  console.log('DB_HOST = your-database-host');
  console.log('DB_USER = your-database-user');
  console.log('DB_PASSWORD = your-database-password');
  console.log('DB_NAME = your-database-name');
  console.log('DB_PORT = 5432');
}

// Run the setup
async function runSetup() {
  try {
    await testDatabaseConnection();
    provideSetupInstructions();
    
    console.log('\n✅ Setup completed!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    provideSetupInstructions();
  }
}

// Run if called directly
if (require.main === module) {
  runSetup();
}

module.exports = { runSetup, testDatabaseConnection };
