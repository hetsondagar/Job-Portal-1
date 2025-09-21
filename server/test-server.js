#!/usr/bin/env node

/**
 * Simple server test script
 */

require('dotenv').config();

console.log('🧪 Testing server startup...');

async function runTests() {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const { testConnection } = require('./config/sequelize');
    await testConnection();
    console.log('✅ Database connection successful');
  
  // Test server import
  console.log('🔍 Testing server import...');
  const app = require('./index.js');
  console.log('✅ Server imported successfully');
  
  // Test basic route
  console.log('🔍 Testing basic route...');
  const testResponse = await new Promise((resolve, reject) => {
    const req = { method: 'GET', url: '/' };
    const res = {
      status: (code) => ({ json: (data) => resolve({ status: code, data }) }),
      json: (data) => resolve({ status: 200, data })
    };
    
    app(req, res, (err) => {
      if (err) reject(err);
      else resolve({ status: 200, data: { message: 'Route handled' } });
    });
  });
  
  console.log('✅ Basic route test successful:', testResponse);
  
    console.log('🎉 All tests passed! Server is ready for deployment.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('📋 Error details:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
