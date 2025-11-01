/**
 * Bulk Import Production Test Script
 * 
 * This script helps test the bulk import functionality
 * Run with: node test-bulk-import-script.js
 * 
 * Prerequisites:
 * - Database connection configured
 * - Server running
 * - User exists: hxx@gmail.com
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Database connection (adjust as needed)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'jobportal',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function testBulkImport() {
  console.log('🧪 Starting Bulk Import Production Tests...\n');

  try {
    // Test 1: Check User Exists
    console.log('Test 1: Checking user exists...');
    const [user] = await sequelize.query(`
      SELECT id, email, company_id, region, user_type 
      FROM users 
      WHERE email = 'hxx@gmail.com'
      LIMIT 1
    `);
    
    if (user.length === 0) {
      console.error('❌ User hxx@gmail.com not found!');
      return;
    }
    
    const userId = user[0].id;
    const companyId = user[0].company_id;
    const userRegion = user[0].region || 'india';
    
    console.log('✅ User found:', {
      id: userId,
      email: user[0].email,
      companyId: companyId,
      region: userRegion,
      userType: user[0].user_type
    });
    console.log('');

    // Test 2: Check Company Exists
    if (companyId) {
      console.log('Test 2: Checking company exists...');
      const [company] = await sequelize.query(`
        SELECT id, name, region 
        FROM companies 
        WHERE id = :companyId
        LIMIT 1
      `, {
        replacements: { companyId }
      });
      
      if (company.length > 0) {
        console.log('✅ Company found:', {
          id: company[0].id,
          name: company[0].name,
          region: company[0].region
        });
      } else {
        console.warn('⚠️  Company ID exists but company record not found');
      }
      console.log('');
    }

    // Test 3: Check Recent Bulk Imports
    console.log('Test 3: Checking recent bulk imports...');
    const [imports] = await sequelize.query(`
      SELECT 
        id, 
        import_name, 
        status, 
        total_records, 
        successful_imports, 
        failed_imports,
        created_at
      FROM bulk_job_imports 
      WHERE created_by = :userId
      ORDER BY created_at DESC 
      LIMIT 5
    `, {
      replacements: { userId }
    });
    
    if (imports.length > 0) {
      console.log(`✅ Found ${imports.length} recent imports:`);
      imports.forEach(imp => {
        console.log(`  - ${imp.import_name}: ${imp.status} (${imp.successful_imports}/${imp.total_records} successful)`);
      });
    } else {
      console.log('ℹ️  No bulk imports found yet');
    }
    console.log('');

    // Test 4: Check Jobs Created from Bulk Import
    console.log('Test 4: Checking jobs created from bulk import...');
    const [jobs] = await sequelize.query(`
      SELECT 
        j.id,
        j.title,
        j.status,
        j.region,
        j.company_id,
        j.employer_id,
        j.published_at,
        j.created_at,
        c.name as company_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.employer_id = :userId
      ORDER BY j.created_at DESC
      LIMIT 10
    `, {
      replacements: { userId }
    });
    
    if (jobs.length > 0) {
      console.log(`✅ Found ${jobs.length} recent jobs:`);
      let activeJobs = 0;
      let jobsWithRegion = 0;
      let jobsWithPublishedAt = 0;
      
      jobs.forEach(job => {
        const issues = [];
        if (job.status !== 'active') issues.push(`status=${job.status}`);
        if (!job.region) issues.push('missing region');
        if (!job.published_at) issues.push('missing published_at');
        
        if (job.status === 'active') activeJobs++;
        if (job.region) jobsWithRegion++;
        if (job.published_at) jobsWithPublishedAt++;
        
        if (issues.length > 0) {
          console.log(`  ⚠️  ${job.title}: ${issues.join(', ')}`);
        } else {
          console.log(`  ✅ ${job.title}: status=active, region=${job.region}`);
        }
      });
      
      console.log(`\n📊 Summary:`);
      console.log(`  - Total jobs: ${jobs.length}`);
      console.log(`  - Active jobs: ${activeJobs}`);
      console.log(`  - Jobs with region: ${jobsWithRegion}`);
      console.log(`  - Jobs with published_at: ${jobsWithPublishedAt}`);
    } else {
      console.log('ℹ️  No jobs found for this user');
    }
    console.log('');

    // Test 5: Check for Data Integrity Issues
    console.log('Test 5: Checking data integrity...');
    const [integrityIssues] = await sequelize.query(`
      SELECT 
        j.id,
        j.title,
        CASE 
          WHEN c.id IS NULL THEN 'Missing company'
          WHEN u.id IS NULL THEN 'Missing employer'
          ELSE 'OK'
        END as issue
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN users u ON j.employer_id = u.id
      WHERE j.employer_id = :userId
      AND (c.id IS NULL OR u.id IS NULL)
      LIMIT 10
    `, {
      replacements: { userId }
    });
    
    if (integrityIssues.length > 0) {
      console.error(`❌ Found ${integrityIssues.length} integrity issues:`);
      integrityIssues.forEach(issue => {
        console.error(`  - ${issue.title}: ${issue.issue}`);
      });
    } else {
      console.log('✅ No integrity issues found');
    }
    console.log('');

    // Test 6: Check Jobs Visible in Queries
    console.log('Test 6: Checking job visibility...');
    
    // Check if jobs would appear in employer dashboard query
    const [employerJobs] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM jobs j
      WHERE j.employer_id = :userId
      AND j.status = 'active'
      ${companyId ? `AND j.company_id = :companyId` : ''}
      ${userRegion ? `AND j.region = :userRegion` : ''}
    `, {
      replacements: { userId, companyId, userRegion }
    });
    
    console.log(`✅ Jobs visible in employer dashboard: ${employerJobs[0].count}`);
    
    // Check if jobs would appear in public listings
    const [publicJobs] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM jobs j
      WHERE j.company_id = :companyId
      AND j.status = 'active'
      AND (j.valid_till IS NULL OR j.valid_till >= NOW())
      AND j.region = :userRegion
    `, {
      replacements: { companyId: companyId || '00000000-0000-0000-0000-000000000000', userRegion }
    });
    
    console.log(`✅ Jobs visible in public listings: ${publicJobs[0].count}`);
    console.log('');

    // Test 7: Validate Required Fields
    console.log('Test 7: Validating job fields...');
    const [invalidJobs] = await sequelize.query(`
      SELECT 
        id,
        title,
        CASE 
          WHEN title IS NULL OR title = '' THEN 'Missing title'
          WHEN description IS NULL OR description = '' THEN 'Missing description'
          WHEN location IS NULL OR location = '' THEN 'Missing location'
          WHEN status IS NULL THEN 'Missing status'
          WHEN region IS NULL THEN 'Missing region'
          WHEN company_id IS NULL THEN 'Missing company_id'
          WHEN employer_id IS NULL THEN 'Missing employer_id'
          ELSE 'Valid'
        END as issue
      FROM jobs
      WHERE employer_id = :userId
      AND (
        title IS NULL OR title = '' OR
        description IS NULL OR description = '' OR
        location IS NULL OR location = '' OR
        status IS NULL OR
        region IS NULL OR
        company_id IS NULL OR
        employer_id IS NULL
      )
      LIMIT 10
    `, {
      replacements: { userId }
    });
    
    if (invalidJobs.length > 0) {
      console.error(`❌ Found ${invalidJobs.length} jobs with missing required fields:`);
      invalidJobs.forEach(job => {
        console.error(`  - ${job.title || 'No title'}: ${job.issue}`);
      });
    } else {
      console.log('✅ All jobs have required fields');
    }

    console.log('\n✅ Testing completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Test CSV template download from UI');
    console.log('2. Upload a test CSV file');
    console.log('3. Verify jobs appear in /employer-dashboard');
    console.log('4. Verify jobs appear in /jobs page');
    console.log('5. Check company profile page');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run tests
testBulkImport();

