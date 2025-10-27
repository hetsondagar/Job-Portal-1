#!/usr/bin/env node

/**
 * Frontend Job Template Test Runner
 * Executes frontend tests for job template functionality
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Frontend Job Template Test Suite...\n');

async function runFrontendTests() {
  try {
    console.log('📋 Running Frontend Job Template Tests...\n');
    
    const startTime = Date.now();
    
    // Run Playwright tests
    execSync('npx playwright test test_job_templates_comprehensive.test.js', {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Frontend tests completed successfully in ${duration}s`);
    console.log('\n🎉 All frontend tests passed! Job template UI is working perfectly.');
    
  } catch (error) {
    console.error('\n❌ Frontend tests failed:');
    console.error(error.message);
    console.log('\n⚠️  Please check the test results above and fix any issues.');
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runFrontendTests().catch(error => {
  console.error('\n💥 Frontend test runner failed:', error.message);
  process.exit(1);
});
