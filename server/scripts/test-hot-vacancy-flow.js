#!/usr/bin/env node

/**
 * HOT VACANCY COMPREHENSIVE TEST SCRIPT
 * 
 * This script tests the complete hot vacancy flow to ensure:
 * 1. Hot vacancies are created correctly in jobs table
 * 2. Normal jobs don't get hot vacancy flags
 * 3. Data integrity is maintained
 * 4. All fields are properly saved
 * 
 * Usage:
 *   node test-hot-vacancy-flow.js
 * 
 * Requirements:
 *   - Database must be running
 *   - Server must be running (for API tests)
 *   - Test user credentials must be configured
 */

const { sequelize } = require('../config/sequelize');
const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to log test results
function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`${colors.green}✅ PASS${colors.reset}: ${name}`);
  } else {
    testResults.failed++;
    console.log(`${colors.red}❌ FAIL${colors.reset}: ${name}`);
    console.log(`   ${colors.yellow}Details: ${details}${colors.reset}`);
  }
  testResults.details.push({ name, passed, details });
}

// Helper function to create test data
async function createTestUser() {
  try {
    const company = await Company.create({
      name: 'Test Company for Hot Vacancy',
      industry: 'Technology',
      companySize: '50-100',
      website: 'https://testcompany.com',
      email: 'test@testcompany.com',
      region: 'india'
    });

    const user = await User.create({
      email: `test_hotvacancy_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'Employer',
      user_type: 'employer',
      company_id: company.id,
      is_active: true,
      is_email_verified: true,
      region: 'india'
    });

    return { user, company };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

// Test 1: Create hot vacancy and verify it's saved to jobs table
async function testHotVacancyCreation() {
  console.log(`\n${colors.cyan}${colors.bright}TEST 1: Hot Vacancy Creation${colors.reset}`);
  
  try {
    const { user, company } = await createTestUser();

    const hotVacancyData = {
      title: 'Senior React Developer - Hot Vacancy TEST',
      slug: `senior-react-developer-hot-vacancy-${Date.now()}`,
      description: 'We are urgently hiring a senior React developer!',
      requirements: 'React, TypeScript, Node.js',
      location: 'Bangalore, Karnataka',
      companyId: company.id,
      employerId: user.id,
      jobType: 'full-time',
      experienceLevel: 'senior',
      salaryMin: 1500000,
      salaryMax: 2500000,
      department: 'Engineering',
      status: 'active',
      // Hot vacancy specific fields
      isHotVacancy: true,
      urgentHiring: true,
      boostedSearch: true,
      searchBoostLevel: 'premium',
      tierLevel: 'premium',
      hotVacancyPrice: 5999,
      hotVacancyCurrency: 'INR',
      hotVacancyPaymentStatus: 'paid',
      proactiveAlerts: true,
      superFeatured: false,
      multipleEmailIds: ['hr@testcompany.com', 'recruiter@testcompany.com'],
      whyWorkWithUs: 'Great work culture and benefits',
      companyProfile: 'Leading tech company'
    };

    const hotVacancy = await Job.create(hotVacancyData);

    // Verify hot vacancy was created
    logTest('Hot vacancy created successfully', hotVacancy && hotVacancy.id);

    // Verify isHotVacancy flag
    logTest('isHotVacancy flag is true', hotVacancy.isHotVacancy === true, 
      `Expected: true, Got: ${hotVacancy.isHotVacancy}`);

    // Verify premium features
    logTest('urgentHiring is true', hotVacancy.urgentHiring === true,
      `Expected: true, Got: ${hotVacancy.urgentHiring}`);

    logTest('boostedSearch is true', hotVacancy.boostedSearch === true,
      `Expected: true, Got: ${hotVacancy.boostedSearch}`);

    logTest('tierLevel is premium', hotVacancy.tierLevel === 'premium',
      `Expected: premium, Got: ${hotVacancy.tierLevel}`);

    logTest('hotVacancyPrice is set', hotVacancy.hotVacancyPrice > 0,
      `Expected: >0, Got: ${hotVacancy.hotVacancyPrice}`);

    // Verify multiple email IDs
    logTest('multipleEmailIds saved correctly', 
      Array.isArray(hotVacancy.multipleEmailIds) && hotVacancy.multipleEmailIds.length === 2,
      `Expected: 2 emails, Got: ${hotVacancy.multipleEmailIds?.length || 0}`);

    // Verify it's in jobs table, not hot_vacancies table
    const jobInJobsTable = await Job.findByPk(hotVacancy.id);
    logTest('Hot vacancy exists in jobs table', jobInJobsTable !== null);

    // Try to query hot_vacancies table (should be empty or error)
    try {
      const [results] = await sequelize.query(
        'SELECT COUNT(*) as count FROM hot_vacancies WHERE id = :id',
        { replacements: { id: hotVacancy.id } }
      );
      logTest('hot_vacancies table is not used', 
        results[0].count === 0 || results[0].count === '0',
        `hot_vacancies table should be empty. Count: ${results[0].count}`);
    } catch (error) {
      // Table might not exist, which is also fine
      logTest('hot_vacancies table not used or doesn\'t exist', true);
    }

    // Cleanup
    await hotVacancy.destroy();
    await user.destroy();
    await company.destroy();

    return true;
  } catch (error) {
    logTest('Hot vacancy creation flow', false, error.message);
    return false;
  }
}

// Test 2: Create normal job and verify isHotVacancy is false
async function testNormalJobCreation() {
  console.log(`\n${colors.cyan}${colors.bright}TEST 2: Normal Job Creation${colors.reset}`);
  
  try {
    const { user, company } = await createTestUser();

    const normalJobData = {
      title: 'Junior JavaScript Developer - Normal Job TEST',
      slug: `junior-javascript-developer-${Date.now()}`,
      description: 'Looking for a junior JavaScript developer',
      requirements: 'JavaScript, HTML, CSS',
      location: 'Mumbai, Maharashtra',
      companyId: company.id,
      employerId: user.id,
      jobType: 'full-time',
      experienceLevel: 'junior',
      salaryMin: 400000,
      salaryMax: 600000,
      department: 'Development',
      status: 'active',
      // Normal job - no hot vacancy fields
      isHotVacancy: false
    };

    const normalJob = await Job.create(normalJobData);

    // Verify normal job was created
    logTest('Normal job created successfully', normalJob && normalJob.id);

    // Verify isHotVacancy is false or null
    logTest('isHotVacancy is false', 
      normalJob.isHotVacancy === false || normalJob.isHotVacancy === null,
      `Expected: false/null, Got: ${normalJob.isHotVacancy}`);

    // Verify hot vacancy fields are NOT set
    logTest('urgentHiring is false or null', 
      !normalJob.urgentHiring,
      `Expected: false/null, Got: ${normalJob.urgentHiring}`);

    logTest('boostedSearch is false or null', 
      !normalJob.boostedSearch,
      `Expected: false/null, Got: ${normalJob.boostedSearch}`);

    logTest('superFeatured is false or null', 
      !normalJob.superFeatured,
      `Expected: false/null, Got: ${normalJob.superFeatured}`);

    logTest('hotVacancyPrice is null', 
      normalJob.hotVacancyPrice === null || normalJob.hotVacancyPrice === undefined,
      `Expected: null, Got: ${normalJob.hotVacancyPrice}`);

    // Cleanup
    await normalJob.destroy();
    await user.destroy();
    await company.destroy();

    return true;
  } catch (error) {
    logTest('Normal job creation flow', false, error.message);
    return false;
  }
}

// Test 3: Query jobs by isHotVacancy filter
async function testHotVacancyFiltering() {
  console.log(`\n${colors.cyan}${colors.bright}TEST 3: Hot Vacancy Filtering${colors.reset}`);
  
  try {
    const { user, company } = await createTestUser();

    // Create one hot vacancy and one normal job
    const hotVacancy = await Job.create({
      title: 'Hot Vacancy for Filtering TEST',
      slug: `hot-vacancy-filter-${Date.now()}`,
      description: 'Test hot vacancy',
      requirements: 'Test',
      location: 'Test Location',
      companyId: company.id,
      employerId: user.id,
      jobType: 'full-time',
      experienceLevel: 'mid',
      status: 'active',
      isHotVacancy: true,
      urgentHiring: true,
      boostedSearch: true,
      tierLevel: 'premium',
      hotVacancyPrice: 5999
    });

    const normalJob = await Job.create({
      title: 'Normal Job for Filtering TEST',
      slug: `normal-job-filter-${Date.now()}`,
      description: 'Test normal job',
      requirements: 'Test',
      location: 'Test Location',
      companyId: company.id,
      employerId: user.id,
      jobType: 'full-time',
      experienceLevel: 'mid',
      status: 'active',
      isHotVacancy: false
    });

    // Query hot vacancies only
    const hotVacancies = await Job.findAll({
      where: {
        isHotVacancy: true,
        employerId: user.id
      }
    });

    logTest('Filter returns hot vacancies', hotVacancies.length >= 1,
      `Expected: >=1, Got: ${hotVacancies.length}`);

    logTest('Filtered results are actually hot vacancies', 
      hotVacancies.every(j => j.isHotVacancy === true),
      `All results should have isHotVacancy=true`);

    // Query normal jobs only
    const normalJobs = await Job.findAll({
      where: {
        isHotVacancy: false,
        employerId: user.id
      }
    });

    logTest('Filter returns normal jobs', normalJobs.length >= 1,
      `Expected: >=1, Got: ${normalJobs.length}`);

    logTest('Filtered normal jobs don\'t have hot vacancy flag', 
      normalJobs.every(j => j.isHotVacancy === false),
      `All results should have isHotVacancy=false`);

    // Cleanup
    await hotVacancy.destroy();
    await normalJob.destroy();
    await user.destroy();
    await company.destroy();

    return true;
  } catch (error) {
    logTest('Hot vacancy filtering', false, error.message);
    return false;
  }
}

// Test 4: Verify database schema has all hot vacancy fields
async function testDatabaseSchema() {
  console.log(`\n${colors.cyan}${colors.bright}TEST 4: Database Schema Verification${colors.reset}`);
  
  try {
    // Get table columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'jobs'
        AND column_name IN (
          'ishotvacancy', 'urgenthiring', 'boostedsearch', 'searchboostlevel',
          'superfeatured', 'tierlevel', 'hotvacancyprice', 'hotvacancycurrency',
          'hotvacancypaymentstatus', 'multipleemailids', 'cityspecificboost',
          'proactivealerts', 'alertradius', 'alertfrequency'
        )
      ORDER BY column_name
    `);

    const requiredColumns = [
      'ishotvacancy', 'urgenthiring', 'boostedsearch', 'searchboostlevel',
      'superfeatured', 'tierlevel', 'hotvacancyprice'
    ];

    const existingColumns = columns.map(c => c.column_name);

    for (const columnName of requiredColumns) {
      logTest(`Column ${columnName} exists`, 
        existingColumns.includes(columnName),
        `Required column ${columnName} should exist in jobs table`);
    }

    return true;
  } catch (error) {
    logTest('Database schema verification', false, error.message);
    return false;
  }
}

// Test 5: Test hot vacancy to normal job conversion and vice versa
async function testJobTypeConversion() {
  console.log(`\n${colors.cyan}${colors.bright}TEST 5: Job Type Conversion${colors.reset}`);
  
  try {
    const { user, company } = await createTestUser();

    // Create as normal job
    const job = await Job.create({
      title: 'Job Type Conversion TEST',
      slug: `job-conversion-${Date.now()}`,
      description: 'Test job for conversion',
      requirements: 'Test',
      location: 'Test Location',
      companyId: company.id,
      employerId: user.id,
      jobType: 'full-time',
      experienceLevel: 'mid',
      status: 'active',
      isHotVacancy: false
    });

    logTest('Job created as normal job', job.isHotVacancy === false);

    // Convert to hot vacancy
    await job.update({
      isHotVacancy: true,
      urgentHiring: true,
      boostedSearch: true,
      tierLevel: 'premium',
      hotVacancyPrice: 5999,
      hotVacancyCurrency: 'INR',
      hotVacancyPaymentStatus: 'paid'
    });

    await job.reload();

    logTest('Job converted to hot vacancy', job.isHotVacancy === true);
    logTest('Hot vacancy fields updated', 
      job.urgentHiring === true && job.boostedSearch === true && job.tierLevel === 'premium');

    // Convert back to normal job
    await job.update({
      isHotVacancy: false,
      urgentHiring: false,
      boostedSearch: false
    });

    await job.reload();

    logTest('Hot vacancy converted back to normal job', job.isHotVacancy === false);

    // Cleanup
    await job.destroy();
    await user.destroy();
    await company.destroy();

    return true;
  } catch (error) {
    logTest('Job type conversion', false, error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log(`\n${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║  🔥 HOT VACANCY COMPREHENSIVE TEST SUITE            ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    // Test database connection
    await sequelize.authenticate();
    console.log(`${colors.green}✅ Database connection established${colors.reset}\n`);

    // Run all tests
    await testHotVacancyCreation();
    await testNormalJobCreation();
    await testHotVacancyFiltering();
    await testDatabaseSchema();
    await testJobTypeConversion();

    // Print summary
    console.log(`\n${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}║  TEST SUMMARY                                          ║${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    console.log(`${colors.cyan}Total Tests:${colors.reset} ${testResults.total}`);
    console.log(`${colors.green}Passed:${colors.reset} ${testResults.passed}`);
    console.log(`${colors.red}Failed:${colors.reset} ${testResults.failed}`);
    console.log(`${colors.yellow}Success Rate:${colors.reset} ${((testResults.passed / testResults.total) * 100).toFixed(1)}%\n`);

    if (testResults.failed === 0) {
      console.log(`${colors.green}${colors.bright}🎉 ALL TESTS PASSED!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.red}${colors.bright}❌ SOME TESTS FAILED${colors.reset}\n`);
      console.log(`${colors.yellow}Failed Tests:${colors.reset}`);
      testResults.details
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(`  • ${t.name}`);
          if (t.details) console.log(`    ${t.details}`);
        });
      console.log('');
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ FATAL ERROR:${colors.reset}`, error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run tests
runTests();

