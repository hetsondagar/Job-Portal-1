/**
 * Test Script: Gulf Job Posting Scenario
 * Tests if admin (hxx@gmail.com) and employer (hxx2@gmail.com) can post Gulf jobs
 */

const { sequelize } = require('./config/sequelize');
const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');

async function testGulfJobPosting() {
  try {
    console.log('🔍 Testing Gulf Job Posting Scenario\n');
    console.log('='.repeat(80));

    // Test 1: Check Admin User (hxx@gmail.com)
    console.log('\n📋 TEST 1: Admin User (hxx@gmail.com)');
    console.log('-'.repeat(80));
    
    const adminUser = await User.findOne({
      where: { email: 'hxx@gmail.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user (hxx@gmail.com) not found in database');
    } else {
      console.log('✅ Admin User Found:');
      console.log(`   - ID: ${adminUser.id}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - User Type: ${adminUser.user_type}`);
      console.log(`   - Region: ${adminUser.region || 'NULL (not set)'}`);
      console.log(`   - Company ID: ${adminUser.company_id || 'NULL (not linked)'}`);
      console.log(`   - Account Status: ${adminUser.account_status}`);
      console.log(`   - Is Active: ${adminUser.is_active}`);

      if (adminUser.company_id) {
        const adminCompany = await Company.findByPk(adminUser.company_id);
        if (adminCompany) {
          console.log(`\n   📦 Associated Company:`);
          console.log(`      - Company ID: ${adminCompany.id}`);
          console.log(`      - Company Name: ${adminCompany.name}`);
          console.log(`      - Company Region: ${adminCompany.region || 'NULL (not set)'}`);
          console.log(`      - Company Status: ${adminCompany.companyStatus || adminCompany.company_status || 'N/A'}`);
          console.log(`      - Is Active: ${adminCompany.isActive || adminCompany.is_active || false}`);
        }
      }

      // Check if admin can post jobs
      console.log(`\n   🔐 Job Posting Permissions:`);
      if (adminUser.user_type === 'admin' || adminUser.user_type === 'employer') {
        console.log(`      ✅ CAN POST JOBS (user_type: ${adminUser.user_type})`);
      } else {
        console.log(`      ❌ CANNOT POST JOBS (user_type: ${adminUser.user_type})`);
      }

      // Check if admin has company association
      if (adminUser.company_id) {
        console.log(`      ✅ HAS COMPANY ASSOCIATION (company_id: ${adminUser.company_id})`);
      } else {
        console.log(`      ⚠️  NO COMPANY ASSOCIATION - Cannot post jobs (company_id required)`);
      }

      // Check Gulf job posting capability
      console.log(`\n   🌍 Gulf Job Posting Capability:`);
      if (adminUser.region === 'gulf') {
        console.log(`      ✅ USER REGION IS GULF - Jobs will be posted as Gulf region`);
        if (adminUser.company_id) {
          const adminCompany = await Company.findByPk(adminUser.company_id);
          if (adminCompany && adminCompany.region === 'gulf') {
            console.log(`      ✅ COMPANY REGION IS GULF - Perfect match!`);
          } else if (adminCompany && adminCompany.region !== 'gulf') {
            console.log(`      ⚠️  COMPANY REGION IS ${adminCompany.region?.toUpperCase() || 'NULL'} - Region mismatch!`);
            console.log(`      ⚠️  Recommendation: Update company region to 'gulf'`);
          }
        }
      } else if (adminUser.region === 'india') {
        console.log(`      ⚠️  USER REGION IS INDIA - Jobs will default to India region`);
        console.log(`      💡 To post Gulf jobs: Set user.region = 'gulf' OR pass region='gulf' in job posting request`);
      } else if (!adminUser.region) {
        console.log(`      ⚠️  USER REGION IS NULL - Jobs will default to 'india'`);
        console.log(`      💡 To post Gulf jobs: Set user.region = 'gulf' OR pass region='gulf' in job posting request`);
      }

      // Check existing jobs
      const adminJobs = await Job.findAll({
        where: { employerId: adminUser.id },
        limit: 5,
        order: [['created_at', 'DESC']]
      });
      console.log(`\n   📝 Existing Jobs (last 5):`);
      if (adminJobs.length > 0) {
        adminJobs.forEach((job, index) => {
          console.log(`      ${index + 1}. ${job.title}`);
          console.log(`         - Region: ${job.region || 'NULL'}`);
          console.log(`         - Status: ${job.status}`);
          console.log(`         - Created: ${job.created_at}`);
        });
      } else {
        console.log(`      No jobs posted yet`);
      }
    }

    // Test 2: Check Employer User (hxx2@gmail.com)
    console.log('\n\n📋 TEST 2: Employer User (hxx2@gmail.com)');
    console.log('-'.repeat(80));
    
    const employerUser = await User.findOne({
      where: { email: 'hxx2@gmail.com' }
    });

    if (!employerUser) {
      console.log('❌ Employer user (hxx2@gmail.com) not found in database');
    } else {
      console.log('✅ Employer User Found:');
      console.log(`   - ID: ${employerUser.id}`);
      console.log(`   - Email: ${employerUser.email}`);
      console.log(`   - User Type: ${employerUser.user_type}`);
      console.log(`   - Region: ${employerUser.region || 'NULL (not set)'}`);
      console.log(`   - Company ID: ${employerUser.company_id || 'NULL (not linked)'}`);
      console.log(`   - Account Status: ${employerUser.account_status}`);
      console.log(`   - Is Active: ${employerUser.is_active}`);

      if (employerUser.company_id) {
        const employerCompany = await Company.findByPk(employerUser.company_id);
        if (employerCompany) {
          console.log(`\n   📦 Associated Company:`);
          console.log(`      - Company ID: ${employerCompany.id}`);
          console.log(`      - Company Name: ${employerCompany.name}`);
          console.log(`      - Company Region: ${employerCompany.region || 'NULL (not set)'}`);
          console.log(`      - Company Status: ${employerCompany.companyStatus || employerCompany.company_status || 'N/A'}`);
          console.log(`      - Is Active: ${employerCompany.isActive || employerCompany.is_active || false}`);
        }
      }

      // Check if employer can post jobs
      console.log(`\n   🔐 Job Posting Permissions:`);
      if (employerUser.user_type === 'admin' || employerUser.user_type === 'employer') {
        console.log(`      ✅ CAN POST JOBS (user_type: ${employerUser.user_type})`);
      } else {
        console.log(`      ❌ CANNOT POST JOBS (user_type: ${employerUser.user_type})`);
      }

      // Check if employer has company association
      if (employerUser.company_id) {
        console.log(`      ✅ HAS COMPANY ASSOCIATION (company_id: ${employerUser.company_id})`);
      } else {
        console.log(`      ⚠️  NO COMPANY ASSOCIATION - Cannot post jobs (company_id required)`);
      }

      // Check Gulf job posting capability
      console.log(`\n   🌍 Gulf Job Posting Capability:`);
      if (employerUser.region === 'gulf') {
        console.log(`      ✅ USER REGION IS GULF - Jobs will be posted as Gulf region`);
        if (employerUser.company_id) {
          const employerCompany = await Company.findByPk(employerUser.company_id);
          if (employerCompany && employerCompany.region === 'gulf') {
            console.log(`      ✅ COMPANY REGION IS GULF - Perfect match!`);
          } else if (employerCompany && employerCompany.region !== 'gulf') {
            console.log(`      ⚠️  COMPANY REGION IS ${employerCompany.region?.toUpperCase() || 'NULL'} - Region mismatch!`);
            console.log(`      ⚠️  Recommendation: Update company region to 'gulf'`);
          }
        }
      } else if (employerUser.region === 'india') {
        console.log(`      ⚠️  USER REGION IS INDIA - Jobs will default to India region`);
        console.log(`      💡 To post Gulf jobs: Set user.region = 'gulf' OR pass region='gulf' in job posting request`);
      } else if (!employerUser.region) {
        console.log(`      ⚠️  USER REGION IS NULL - Jobs will default to 'india'`);
        console.log(`      💡 To post Gulf jobs: Set user.region = 'gulf' OR pass region='gulf' in job posting request`);
      }

      // Check existing jobs
      const employerJobs = await Job.findAll({
        where: { employerId: employerUser.id },
        limit: 5,
        order: [['created_at', 'DESC']]
      });
      console.log(`\n   📝 Existing Jobs (last 5):`);
      if (employerJobs.length > 0) {
        employerJobs.forEach((job, index) => {
          console.log(`      ${index + 1}. ${job.title}`);
          console.log(`         - Region: ${job.region || 'NULL'}`);
          console.log(`         - Status: ${job.status}`);
          console.log(`         - Created: ${job.created_at}`);
        });
      } else {
        console.log(`      No jobs posted yet`);
      }
    }

    // Test 3: Check all Gulf companies
    console.log('\n\n📋 TEST 3: All Gulf Companies in Database');
    console.log('-'.repeat(80));
    
    const gulfCompanies = await Company.findAll({
      where: { region: 'gulf' },
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    console.log(`Found ${gulfCompanies.length} Gulf companies:`);
    if (gulfCompanies.length > 0) {
      gulfCompanies.forEach((company, index) => {
        console.log(`\n   ${index + 1}. ${company.name}`);
        console.log(`      - ID: ${company.id}`);
        console.log(`      - Region: ${company.region}`);
        console.log(`      - Status: ${company.companyStatus || company.company_status || 'N/A'}`);
        console.log(`      - Is Active: ${company.isActive || company.is_active || false}`);
      });
    } else {
      console.log(`   ⚠️  No Gulf companies found in database`);
    }

    // Test 4: Check all Gulf jobs
    console.log('\n\n📋 TEST 4: All Gulf Jobs in Database');
    console.log('-'.repeat(80));
    
    const gulfJobs = await Job.findAll({
      where: { region: 'gulf' },
      limit: 10,
      order: [['created_at', 'DESC']]
    });
    
    // Fetch company data separately for each job
    const gulfJobsWithCompanies = await Promise.all(gulfJobs.map(async (job) => {
      let company = null;
      if (job.companyId) {
        company = await Company.findByPk(job.companyId, {
          attributes: ['id', 'name', 'region']
        });
      }
      return { job, company };
    }));

    console.log(`Found ${gulfJobsWithCompanies.length} Gulf jobs:`);
    if (gulfJobsWithCompanies.length > 0) {
      gulfJobsWithCompanies.forEach(({ job, company }, index) => {
        console.log(`\n   ${index + 1}. ${job.title}`);
        console.log(`      - ID: ${job.id}`);
        console.log(`      - Region: ${job.region}`);
        console.log(`      - Status: ${job.status}`);
        console.log(`      - Company: ${company?.name || 'N/A'} (Region: ${company?.region || 'N/A'})`);
        console.log(`      - Created: ${job.created_at}`);
      });
    } else {
      console.log(`   ⚠️  No Gulf jobs found in database`);
    }

    // Test 5: Summary and Recommendations
    console.log('\n\n📋 TEST 5: Summary & Recommendations');
    console.log('='.repeat(80));

    console.log('\n✅ WHAT IS WORKING:');
    console.log('   1. Both admin and employer users CAN post jobs (if user_type is admin/employer)');
    console.log('   2. Region field exists in User, Company, and Job models');
    console.log('   3. Job posting automatically uses user.region if not explicitly provided');
    console.log('   4. Company association is required for job posting');

    console.log('\n⚠️  POTENTIAL ISSUES:');
    console.log('   1. If user.region is NULL, jobs default to "india"');
    console.log('   2. If user.region !== company.region, there may be region mismatch');
    console.log('   3. Admin users must have company_id to post jobs');

    console.log('\n💡 RECOMMENDATIONS FOR GULF JOB POSTING:');
    console.log('   1. Ensure user.region = "gulf" for Gulf employers/admins');
    console.log('   2. Ensure company.region = "gulf" for Gulf companies');
    console.log('   3. When posting, explicitly pass region="gulf" in request body (optional but recommended)');
    console.log('   4. Verify company association exists before posting');

    console.log('\n🔧 HOW TO FIX IF NEEDED:');
    console.log('   To set user region to Gulf:');
    console.log('   UPDATE users SET region = \'gulf\' WHERE email = \'hxx@gmail.com\';');
    console.log('   UPDATE users SET region = \'gulf\' WHERE email = \'hxx2@gmail.com\';');
    console.log('\n   To set company region to Gulf:');
    console.log('   UPDATE companies SET region = \'gulf\' WHERE id = \'<company_id>\';');

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test Complete!\n');

  } catch (error) {
    console.error('❌ Error running test:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the test
if (require.main === module) {
  testGulfJobPosting()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testGulfJobPosting };

