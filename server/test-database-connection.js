#!/usr/bin/env node

/**
 * Test Database Connection
 * Simple script to test database connectivity
 */

const dbConnection = require('./lib/database-connection');

console.log('🧪 Testing Database Connection...');

async function testConnection() {
  try {
    // Test connection
    const success = await dbConnection.testConnection();
    
    if (success) {
      console.log('🎉 Database connection test PASSED!');
      
      // Test a simple query
      const sequelize = dbConnection.getSequelize();
      const [results] = await sequelize.query('SELECT version() as version');
      console.log('📋 PostgreSQL version:', results[0]?.version);
      
      // Test table listing
      const [tables] = await sequelize.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      console.log(`📊 Found ${tables.length} tables in database`);
      if (tables.length > 0) {
        console.log('Tables:', tables.map(t => t.table_name).join(', '));
      }
      
    } else {
      console.log('❌ Database connection test FAILED!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Database connection test error:', error.message);
    process.exit(1);
  } finally {
    await dbConnection.disconnect();
  }
}

// Run the test
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('✅ Database connection test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database connection test failed:', error);
      process.exit(1);
    });
}

module.exports = { testConnection };
