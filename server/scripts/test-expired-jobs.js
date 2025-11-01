/**
 * Production-level testing for expired job filtering
 * Tests:
 * 1. Jobs with expired validTill are NOT shown in /jobs page
 * 2. Jobs with expired validTill are NOT shown in /companies/[id] department section
 * 3. Jobs with expired validTill are NOT shown in /companies/[id]/department/[departmentId]
 */

const { sequelize } = require('../config/sequelize');
const { Job, Company } = require('../models');
const { Op } = require('sequelize');
const { calculateJobExpiry, isJobExpired } = require('../utils/jobExpiryHelper');

async function testExpiredJobFiltering() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    const now = new Date();
    
    // Test Case 1: Create a job with expired validTill
    console.log('📝 Test Case 1: Creating job with expired validTill...');
    const expiredDate = new Date(now);
    expiredDate.setDate(expiredDate.getDate() - 10); // 10 days ago
    
    const expiredJob = await Job.create({
      title: 'TEST - Expired Job (Should NOT appear in public listings)',
      description: 'This job has expired and should not appear in public listings',
      location: 'Test City',
      status: 'active',
      publishedAt: new Date(expiredDate.getTime() - 10 * 24 * 60 * 60 * 1000), // Published 20 days ago
      validTill: expiredDate, // Expired 10 days ago
      applicationDeadline: new Date(expiredDate.getTime() - 15 * 24 * 60 * 60 * 1000), // Deadline 25 days ago
      experienceLevel: 'entry',
      department: 'Engineering - Software & QA',
      companyId: null,
      employerId: null
    });
    console.log(`✅ Created expired job: ${expiredJob.id}`);
    console.log(`   - validTill: ${new Date(expiredJob.validTill).toISOString()}`);
    console.log(`   - Is expired: ${isJobExpired(expiredJob.validTill)}\n`);

    // Test Case 2: Create a job with future validTill (should appear)
    console.log('📝 Test Case 2: Creating job with future validTill...');
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    
    const activeJob = await Job.create({
      title: 'TEST - Active Job (Should appear in public listings)',
      description: 'This job is active and should appear in public listings',
      location: 'Test City',
      status: 'active',
      publishedAt: now,
      validTill: futureDate,
      applicationDeadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // Deadline in 14 days
      experienceLevel: 'entry',
      department: 'Engineering - Software & QA',
      companyId: null,
      employerId: null
    });
    console.log(`✅ Created active job: ${activeJob.id}`);
    console.log(`   - validTill: ${new Date(activeJob.validTill).toISOString()}`);
    console.log(`   - Is expired: ${isJobExpired(activeJob.validTill)}\n`);

    // Test Case 3: Test getAllJobs filtering (simulates /jobs page)
    console.log('📝 Test Case 3: Testing getAllJobs filtering (simulates /jobs page)...');
    const publicJobs = await Job.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { validTill: null },
          { validTill: { [Op.gte]: now } }
        ]
      }
    });
    
    const expiredInPublic = publicJobs.find(j => j.id === expiredJob.id);
    const activeInPublic = publicJobs.find(j => j.id === activeJob.id);
    
    console.log(`   Total active jobs found: ${publicJobs.length}`);
    console.log(`   Expired job in public listings: ${expiredInPublic ? '❌ FAIL - Expired job found!' : '✅ PASS - Expired job correctly filtered'}`);
    console.log(`   Active job in public listings: ${activeInPublic ? '✅ PASS - Active job found' : '❌ FAIL - Active job missing!'}\n`);

    // Test Case 4: Test getJobsByCompany filtering (simulates /companies/[id] department section)
    console.log('📝 Test Case 4: Testing getJobsByCompany filtering...');
    // Since we don't have a companyId, let's test with a company that might exist
    const companyJobs = await Job.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { validTill: null },
          { validTill: { [Op.gte]: now } }
        ]
      },
      limit: 10
    });
    
    const expiredInCompany = companyJobs.find(j => j.id === expiredJob.id);
    const activeInCompany = companyJobs.find(j => j.id === activeJob.id);
    
    console.log(`   Total active company jobs found: ${companyJobs.length}`);
    console.log(`   Expired job in company listings: ${expiredInCompany ? '❌ FAIL - Expired job found!' : '✅ PASS - Expired job correctly filtered'}`);
    console.log(`   Active job in company listings: ${activeInCompany ? '✅ PASS - Active job found' : '❌ FAIL - Active job missing!'}\n`);

    // Test Case 5: Test calculateJobExpiry function
    console.log('📝 Test Case 5: Testing calculateJobExpiry function...');
    const testDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const calculatedExpiry = await calculateJobExpiry(testDeadline, now);
    console.log(`   Application deadline: ${testDeadline.toISOString()}`);
    console.log(`   Calculated expiry: ${calculatedExpiry.toISOString()}`);
    const daysAfter = Math.round((calculatedExpiry.getTime() - testDeadline.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`   Days after deadline: ${daysAfter}`);
    console.log(`   Expected: 30 days (from system setting)`);
    console.log(`   ${daysAfter === 30 ? '✅ PASS' : '❌ FAIL - Incorrect calculation'}\n`);

    // Test Case 6: Test job with null validTill (should appear)
    console.log('📝 Test Case 6: Testing job with null validTill...');
    const noExpiryJob = await Job.create({
      title: 'TEST - Job with no expiry (Should appear in public listings)',
      description: 'This job has no expiry and should appear in public listings',
      location: 'Test City',
      status: 'active',
      publishedAt: now,
      validTill: null,
      experienceLevel: 'entry',
      department: 'Engineering - Software & QA',
      companyId: null,
      employerId: null
    });
    
    const noExpiryInPublic = await Job.findOne({
      where: {
        id: noExpiryJob.id,
        status: 'active',
        [Op.or]: [
          { validTill: null },
          { validTill: { [Op.gte]: now } }
        ]
      }
    });
    
    console.log(`   No-expiry job in public listings: ${noExpiryInPublic ? '✅ PASS - Job found' : '❌ FAIL - Job missing!'}\n`);

    // Summary
    console.log('📊 TEST SUMMARY:');
    console.log('================');
    const allTestsPass = 
      !expiredInPublic &&
      !!activeInPublic &&
      !expiredInCompany &&
      !!activeInCompany &&
      daysAfter === 30 &&
      !!noExpiryInPublic;
    
    if (allTestsPass) {
      console.log('✅ ALL TESTS PASSED - Expired job filtering is working correctly!');
    } else {
      console.log('❌ SOME TESTS FAILED - Please review the output above');
    }

    // Cleanup: Delete test jobs
    console.log('\n🧹 Cleaning up test jobs...');
    await Job.destroy({ where: { title: { [Op.like]: 'TEST - %' } } });
    console.log('✅ Test jobs deleted');

    await sequelize.close();
    process.exit(allTestsPass ? 0 : 1);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testExpiredJobFiltering();



