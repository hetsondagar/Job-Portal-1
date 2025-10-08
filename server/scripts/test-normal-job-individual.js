#!/usr/bin/env node

/**
 * 💼 INDIVIDUAL NORMAL JOB POSTING TEST
 * 
 * This script tests ONLY normal job creation flow
 * to ensure it doesn't interfere with hot vacancy features.
 */

const { sequelize } = require('../config/sequelize');
const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');

const c = {
  reset: '\x1b[0m', bright: '\x1b[1m', green: '\x1b[32m',
  red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m',
  cyan: '\x1b[36m', magenta: '\x1b[35m'
};

let passed = 0, failed = 0;

function test(name, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`${c.green}✅${c.reset} ${name}`);
  } else {
    failed++;
    console.log(`${c.red}❌${c.reset} ${name}`);
    if (details) console.log(`   ${c.yellow}${details}${c.reset}`);
  }
}

async function testNormalJobFlow() {
  console.log(`\n${c.bright}${c.cyan}╔═══════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bright}${c.cyan}║  💼 NORMAL JOB POSTING - INDIVIDUAL TEST        ║${c.reset}`);
  console.log(`${c.bright}${c.cyan}╚═══════════════════════════════════════════════════╝${c.reset}\n`);

  let testCompany, testUser, testJob;

  try {
    await sequelize.authenticate();
    console.log(`${c.green}✅ Connected to database${c.reset}\n`);

    // Create test data
    console.log(`${c.blue}${c.bright}▸ Creating test company and user...${c.reset}`);
    const timestamp = Date.now();
    
    testCompany = await Company.create({
      name: `Normal Job Test Company ${timestamp}`,
      slug: `normal-job-company-${timestamp}`,
      industry: 'Technology',
      companySize: '51-200',
      email: `normaljob${timestamp}@test.com`,
      contactEmail: `normaljob${timestamp}@test.com`,
      region: 'india',
      country: 'India'
    });
    test('Test company created', testCompany && testCompany.id);

    testUser = await User.create({
      email: `normal_job_test_${timestamp}@example.com`,
      password: 'TestPassword123!',
      first_name: 'Normal',
      last_name: 'JobTester',
      user_type: 'employer',
      company_id: testCompany.id,
      is_active: true,
      is_email_verified: true,
      region: 'india'
    });
    test('Test employer created', testUser && testUser.id);

    // Create normal job
    console.log(`\n${c.blue}${c.bright}▸ Creating NORMAL job (no hot vacancy features)...${c.reset}`);
    
    const normalJobData = {
      title: 'Junior JavaScript Developer - NORMAL JOB',
      slug: `junior-js-normal-${timestamp}`,
      description: 'Looking for a passionate JavaScript developer',
      requirements: 'JavaScript, HTML, CSS, basic React',
      responsibilities: 'Develop web applications, write clean code',
      location: 'Mumbai, Maharashtra, India',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      companyId: testCompany.id,
      employerId: testUser.id,
      jobType: 'full-time',
      experienceLevel: 'junior',
      experienceMin: 1,
      experienceMax: 3,
      salaryMin: 400000,
      salaryMax: 600000,
      salaryCurrency: 'INR',
      salaryPeriod: 'yearly',
      department: 'Development',
      category: 'Software Development',
      skills: ['JavaScript', 'HTML', 'CSS'],
      benefits: ['Health Insurance', 'Paid Leave'],
      remoteWork: 'on-site',
      status: 'active',
      // Explicitly set hot vacancy to false
      isHotVacancy: false
    };

    testJob = await Job.create(normalJobData);
    test('Normal job created', testJob && testJob.id);

    // Verify it's in jobs table
    await testJob.reload();
    console.log(`\n${c.blue}${c.bright}▸ Verifying job saved correctly...${c.reset}`);
    test('Job has UUID', testJob.id && testJob.id.length === 36);
    test('Title matches', testJob.title === 'Junior JavaScript Developer - NORMAL JOB');
    test('Location matches', testJob.location === 'Mumbai, Maharashtra, India');
    test('Status is active', testJob.status === 'active');

    // CRITICAL: Verify NO hot vacancy features
    console.log(`\n${c.blue}${c.bright}▸ Verifying NO hot vacancy features...${c.reset}`);
    test('isHotVacancy = false', testJob.isHotVacancy === false,
      `Expected: false, Got: ${testJob.isHotVacancy}`);
    test('urgencyLevel is NULL', !testJob.urgencyLevel,
      `Expected: NULL, Got: ${testJob.urgencyLevel}`);
    test('hiringTimeline is NULL', !testJob.hiringTimeline);
    test('pricingTier is NULL', !testJob.pricingTier);
    test('hotVacancyPrice is NULL', !testJob.hotVacancyPrice);
    test('priorityListing is false/NULL', !testJob.priorityListing);
    test('featuredBadge is false/NULL', !testJob.featuredBadge);
    test('unlimitedApplications is false/NULL', !testJob.unlimitedApplications);
    test('advancedAnalytics is false/NULL', !testJob.advancedAnalytics);
    test('candidateMatching is false/NULL', !testJob.candidateMatching);
    test('directContact is false/NULL', !testJob.directContact);
    test('urgentHiring is false/NULL', !testJob.urgentHiring);
    test('boostedSearch is false/NULL', !testJob.boostedSearch);
    test('superFeatured is false/NULL', !testJob.superFeatured);
    test('seoTitle is NULL', !testJob.seoTitle);
    test('seoDescription is NULL', !testJob.seoDescription);
    test('keywords is empty array or NULL', 
      !testJob.keywords || (Array.isArray(testJob.keywords) && testJob.keywords.length === 0));
    test('multipleEmailIds is empty or NULL',
      !testJob.multipleEmailIds || (Array.isArray(testJob.multipleEmailIds) && testJob.multipleEmailIds.length === 0));
    test('paymentId is NULL', !testJob.paymentId);
    test('paymentDate is NULL', !testJob.paymentDate);

    // Verify normal job appears in queries
    console.log(`\n${c.blue}${c.bright}▸ Testing queries and filtering...${c.reset}`);
    
    const normalJobs = await Job.findAll({
      where: {
        isHotVacancy: false,
        employerId: testUser.id
      }
    });
    test('Normal job found in queries', normalJobs.length >= 1);
    test('Filtered result is normal job', normalJobs[0].isHotVacancy === false);

    // Verify it doesn't appear in hot vacancy queries
    const hotVacancies = await Job.findAll({
      where: {
        isHotVacancy: true,
        employerId: testUser.id
      }
    });
    test('Normal job NOT in hot vacancy queries', hotVacancies.length === 0);

    // Cleanup
    console.log(`\n${c.blue}${c.bright}▸ Cleaning up test data...${c.reset}`);
    await testJob.destroy();
    test('Test job deleted', true);
    await testUser.destroy();
    test('Test user deleted', true);
    await testCompany.destroy();
    test('Test company deleted', true);

    // Summary
    console.log(`\n${c.bright}${c.blue}╔═══════════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.bright}${c.blue}║  TEST SUMMARY                                     ║${c.reset}`);
    console.log(`${c.bright}${c.blue}╚═══════════════════════════════════════════════════╝${c.reset}\n`);
    
    const total = passed + failed;
    console.log(`Total Tests: ${total}`);
    console.log(`${c.green}Passed: ${passed}${c.reset}`);
    console.log(`${c.red}Failed: ${failed}${c.reset}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed === 0) {
      console.log(`${c.green}${c.bright}🎉 ALL TESTS PASSED!${c.reset}`);
      console.log(`${c.green}✅ Normal job posting works perfectly!${c.reset}`);
      console.log(`${c.green}✅ No interference with hot vacancy features!${c.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${c.red}${c.bright}❌ SOME TESTS FAILED${c.reset}\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n${c.red}${c.bright}❌ ERROR:${c.reset}`, error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testNormalJobFlow();

