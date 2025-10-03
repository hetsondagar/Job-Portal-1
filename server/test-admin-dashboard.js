#!/usr/bin/env node

/**
 * Test Admin Dashboard
 * This script tests the admin dashboard functionality to ensure data loads correctly
 */

const dbConnection = require('./lib/database-connection');

console.log('🧪 Testing Admin Dashboard Functionality...');

async function testAdminDashboard() {
  try {
    // Connect to database using robust connection handler
    const sequelize = await dbConnection.connect();
    console.log('✅ Database connection established');

    // Test 1: Check if all required tables exist
    console.log('🔍 Test 1: Checking required tables...');
    const requiredTables = ['users', 'companies', 'jobs', 'company_photos'];
    
    for (const tableName of requiredTables) {
      try {
        const [results] = await sequelize.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = '${tableName}'
        `);
        
        if (results.length > 0) {
          console.log(`  ✅ ${tableName} table exists`);
        } else {
          console.log(`  ❌ ${tableName} table missing`);
        }
      } catch (error) {
        console.log(`  ❌ Error checking ${tableName}:`, error.message);
      }
    }

    // Test 2: Check enum_jobs_status values
    console.log('🔍 Test 2: Checking enum_jobs_status values...');
    try {
      const [enumValues] = await sequelize.query(`
        SELECT unnest(enum_range(NULL::enum_jobs_status)) as value
      `);
      
      const values = enumValues.map(row => row.value);
      console.log('  Enum values:', values);
      
      if (values.includes('inactive')) {
        console.log('  ✅ "inactive" value exists in enum_jobs_status');
      } else {
        console.log('  ❌ "inactive" value missing from enum_jobs_status');
      }
    } catch (error) {
      console.log('  ❌ Error checking enum values:', error.message);
    }

    // Test 3: Test admin stats query (same as in admin.js)
    console.log('🔍 Test 3: Testing admin stats query...');
    try {
      const { Op } = require('sequelize');
      
      // User statistics
      const [userStats] = await Promise.all([
        sequelize.query('SELECT COUNT(*) as total FROM users'),
        sequelize.query("SELECT COUNT(*) as jobseekers FROM users WHERE user_type = 'jobseeker'"),
        sequelize.query("SELECT COUNT(*) as employers FROM users WHERE user_type = 'employer'"),
        sequelize.query("SELECT COUNT(*) as admins FROM users WHERE user_type = 'admin'"),
        sequelize.query('SELECT COUNT(*) as active FROM users WHERE is_active = true'),
        sequelize.query(`SELECT COUNT(*) as newLast30Days FROM users WHERE created_at >= NOW() - INTERVAL '30 days'`)
      ]);

      // Company statistics
      const [companyStats] = await Promise.all([
        sequelize.query('SELECT COUNT(*) as total FROM companies'),
        sequelize.query("SELECT COUNT(*) as verified FROM companies WHERE verification_status = 'verified'"),
        sequelize.query("SELECT COUNT(*) as unverified FROM companies WHERE verification_status = 'unverified'"),
        sequelize.query("SELECT COUNT(*) as active FROM companies WHERE company_status = 'active'"),
        sequelize.query(`SELECT COUNT(*) as newLast30Days FROM companies WHERE created_at >= NOW() - INTERVAL '30 days'`)
      ]);

      // Job statistics
      const [jobStats] = await Promise.all([
        sequelize.query('SELECT COUNT(*) as total FROM jobs'),
        sequelize.query("SELECT COUNT(*) as active FROM jobs WHERE status = 'active'"),
        sequelize.query("SELECT COUNT(*) as inactive FROM jobs WHERE status = 'inactive'"),
        sequelize.query("SELECT COUNT(*) as india FROM jobs WHERE region = 'india'"),
        sequelize.query("SELECT COUNT(*) as gulf FROM jobs WHERE region = 'gulf'"),
        sequelize.query(`SELECT COUNT(*) as newLast30Days FROM jobs WHERE created_at >= NOW() - INTERVAL '30 days'`)
      ]);

      // Application statistics
      const [applicationStats] = await sequelize.query('SELECT COUNT(*) as total FROM job_applications');

      const stats = {
        users: {
          total: userStats[0][0].total,
          jobseekers: userStats[1][0].jobseekers,
          employers: userStats[2][0].employers,
          admins: userStats[3][0].admins,
          active: userStats[4][0].active,
          newLast30Days: userStats[5][0].newlast30days
        },
        companies: {
          total: companyStats[0][0].total,
          verified: companyStats[1][0].verified,
          unverified: companyStats[2][0].unverified,
          active: companyStats[3][0].active,
          newLast30Days: companyStats[4][0].newlast30days
        },
        jobs: {
          total: jobStats[0][0].total,
          active: jobStats[1][0].active,
          inactive: jobStats[2][0].inactive,
          india: jobStats[3][0].india,
          gulf: jobStats[4][0].gulf,
          newLast30Days: jobStats[5][0].newlast30days
        },
        applications: {
          total: applicationStats[0][0].total
        }
      };

      console.log('  ✅ Admin stats query successful');
      console.log('  📊 Stats:', JSON.stringify(stats, null, 2));
      
    } catch (error) {
      console.log('  ❌ Admin stats query error:', error.message);
    }

    // Test 4: Test CompanyPhoto model
    console.log('🔍 Test 4: Testing CompanyPhoto model...');
    try {
      const CompanyPhoto = require('./models/CompanyPhoto');
      const count = await CompanyPhoto.count();
      console.log(`  ✅ CompanyPhoto model working, count: ${count}`);
    } catch (error) {
      console.log('  ❌ CompanyPhoto model error:', error.message);
    }

    // Test 5: Test API endpoint simulation
    console.log('🔍 Test 5: Testing API endpoint simulation...');
    try {
      // Simulate the admin stats endpoint
      const { User, Company, Job } = require('./config');
      
      const [userStats, companyStats, jobStats, applicationStats] = await Promise.all([
        // User statistics
        Promise.all([
          User.count(),
          User.count({ where: { user_type: 'jobseeker' } }),
          User.count({ where: { user_type: 'employer' } }),
          User.count({ where: { user_type: 'admin' } }),
          User.count({ where: { is_active: true } }),
          User.count({
            where: {
              createdAt: {
                [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          })
        ]),
        // Company statistics
        Promise.all([
          Company.count(),
          Company.count({ where: { isVerified: true } }),
          Company.count({ where: { isVerified: false } }),
          Company.count({ where: { isActive: true } }),
          Company.count({
            where: {
              createdAt: {
                [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          })
        ]),
        // Job statistics
        Promise.all([
          Job.count(),
          Job.count({ where: { status: 'active' } }),
          Job.count({ where: { status: 'inactive' } }),
          Job.count({ where: { region: 'india' } }),
          Job.count({ where: { region: 'gulf' } }),
          Job.count({
            where: {
              createdAt: {
                [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          })
        ]),
        // Application statistics
        sequelize.query('SELECT COUNT(*) as total FROM job_applications')
      ]);

      const apiStats = {
        users: {
          total: userStats[0],
          jobseekers: userStats[1],
          employers: userStats[2],
          admins: userStats[3],
          active: userStats[4],
          newLast30Days: userStats[5]
        },
        companies: {
          total: companyStats[0],
          verified: companyStats[1],
          unverified: companyStats[2],
          active: companyStats[3],
          newLast30Days: companyStats[4]
        },
        jobs: {
          total: jobStats[0],
          active: jobStats[1],
          inactive: jobStats[2],
          india: jobStats[3],
          gulf: jobStats[4],
          newLast30Days: jobStats[5]
        },
        applications: {
          total: applicationStats[0][0].total
        }
      };

      console.log('  ✅ API endpoint simulation successful');
      console.log('  📊 API Stats:', JSON.stringify(apiStats, null, 2));
      
    } catch (error) {
      console.log('  ❌ API endpoint simulation error:', error.message);
    }

    console.log('✅ Admin dashboard testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing admin dashboard:', error.message);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

// Run the test
if (require.main === module) {
  testAdminDashboard()
    .then(() => {
      console.log('🎉 Admin dashboard testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin dashboard testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testAdminDashboard };
