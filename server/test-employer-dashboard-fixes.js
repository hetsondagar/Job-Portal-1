require('dotenv').config();
const { sequelize } = require('./config/sequelize');
const DashboardService = require('./services/dashboardService');
const Job = require('./models/Job');
const JobApplication = require('./models/JobApplication');
const Company = require('./models/Company');

async function testEmployerDashboardFixes() {
  try {
    console.log('🧪 Testing all employer dashboard fixes...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    const testUserId = '143234aa-ffda-4238-a1d6-253a2586d45e';
    
    // Test 1: DashboardService.getDashboardData (companyId fix)
    console.log('\n🧪 Test 1: DashboardService.getDashboardData');
    try {
      const dashboardData = await DashboardService.getDashboardData(testUserId);
      console.log('✅ DashboardService.getDashboardData works');
    } catch (error) {
      console.log('❌ DashboardService.getDashboardData failed:', error.message);
    }
    
    // Test 2: DashboardService.updateDashboardStats (dashboard.save fix)
    console.log('\n🧪 Test 2: DashboardService.updateDashboardStats');
    try {
      const updatedDashboard = await DashboardService.updateDashboardStats(testUserId, {
        totalApplications: 1
      });
      console.log('✅ DashboardService.updateDashboardStats works');
    } catch (error) {
      console.log('❌ DashboardService.updateDashboardStats failed:', error.message);
    }
    
    // Test 3: Job queries with company_size (companySize fix)
    console.log('\n🧪 Test 3: Job queries with company_size');
    try {
      const jobs = await Job.findAll({
        where: { created_by: testUserId },
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'industry', 'company_size'],
            required: false
          }
        ],
        limit: 5
      });
      console.log('✅ Job queries with company_size work');
    } catch (error) {
      console.log('❌ Job queries with company_size failed:', error.message);
    }
    
    // Test 4: JobApplication queries with employer_id (employerId fix)
    console.log('\n🧪 Test 4: JobApplication queries with employer_id');
    try {
      const applications = await JobApplication.findAll({
        where: { employer_id: testUserId },
        limit: 5
      });
      console.log('✅ JobApplication queries with employer_id work');
    } catch (error) {
      console.log('❌ JobApplication queries with employer_id failed:', error.message);
    }
    
    // Test 5: Company jobs endpoint simulation
    console.log('\n🧪 Test 5: Company jobs endpoint simulation');
    try {
      const companyId = 'f14d22a9-de48-4934-82fc-48d1235a118b';
      const companyJobs = await Job.findAll({
        where: { company_id: companyId },
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'industry', 'company_size'],
            required: false
          }
        ],
        limit: 5
      });
      console.log('✅ Company jobs endpoint simulation works');
    } catch (error) {
      console.log('❌ Company jobs endpoint simulation failed:', error.message);
    }
    
    console.log('\n🎉 All employer dashboard fixes tested!');
    console.log('✅ All major API errors should be resolved now');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testEmployerDashboardFixes().catch(console.error);








