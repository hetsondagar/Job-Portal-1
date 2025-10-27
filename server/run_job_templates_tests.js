#!/usr/bin/env node

/**
 * Job Template Test Runner
 * Executes all job template tests in the correct order
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Job Template Test Suite...\n');

const tests = [
  {
    name: 'Database Integration Tests',
    file: 'test_job_templates_database_integration.js',
    description: 'Testing database operations, constraints, and data integrity'
  },
  {
    name: 'API Endpoint Tests',
    file: 'test_job_templates_api_comprehensive.js',
    description: 'Testing all backend API endpoints for job templates'
  },
  {
    name: 'End-to-End Complete Tests',
    file: 'test_job_templates_e2e_complete.js',
    description: 'Testing complete workflow from template creation to job posting'
  }
];

async function runTests() {
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    console.log(`\n📋 Running ${test.name}...`);
    console.log(`   ${test.description}\n`);

    try {
      const startTime = Date.now();
      
      // Run the test file
      execSync(`node ${test.file}`, {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`\n✅ ${test.name} completed successfully in ${duration}s`);
      passedTests++;
      
    } catch (error) {
      console.error(`\n❌ ${test.name} failed:`);
      console.error(error.message);
      failedTests++;
    }
    
    totalTests++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Test Suites: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Job template functionality is working perfectly.');
  } else {
    console.log(`\n⚠️  ${failedTests} test suite(s) failed. Please check the errors above.`);
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
runTests().catch(error => {
  console.error('\n💥 Test runner failed:', error.message);
  process.exit(1);
});
