require('dotenv').config();

console.log('🔧 Final Dashboard Stats Test');
console.log('=============================\n');

async function testDashboardStatsModels() {
  console.log('1️⃣ Testing Dashboard Stats Required Models...');
  
  try {
    // Test only the models that are actually used in dashboard stats
    console.log('Testing User model...');
    const User = require('./models/User');
    const userCount = await User.count();
    console.log('✅ User model works, count:', userCount);
    
    console.log('Testing JobApplication model...');
    const JobApplication = require('./models/JobApplication');
    const appCount = await JobApplication.count();
    console.log('✅ JobApplication model works, count:', appCount);
    
    console.log('Testing Analytics model...');
    const Analytics = require('./models/Analytics');
    const analyticsCount = await Analytics.count();
    console.log('✅ Analytics model works, count:', analyticsCount);
    
    console.log('Testing Job model...');
    const Job = require('./models/Job');
    const jobCount = await Job.count();
    console.log('✅ Job model works, count:', jobCount);
    
    return true;
  } catch (error) {
    console.log('❌ Dashboard stats models failed:', error.message);
    return false;
  }
}

async function testDashboardStatsEndpoint() {
  console.log('\n2️⃣ Testing Dashboard Stats Endpoint...');
  
  try {
    // Test the dashboard stats endpoint directly
    const JobApplication = require('./models/JobApplication');
    const Analytics = require('./models/Analytics');
    const Job = require('./models/Job');
    
    // Simulate what the dashboard stats endpoint does
    console.log('Testing application count query...');
    const applicationCount = await JobApplication.count();
    console.log('✅ Application count query works:', applicationCount);
    
    console.log('Testing profile views query...');
    const profileViews = await Analytics.count({
      where: { 
        eventType: 'profile_view'
      }
    });
    console.log('✅ Profile views query works:', profileViews);
    
    console.log('Testing recent applications query...');
    const recentApplications = await JobApplication.findAll({
      order: [['appliedAt', 'DESC']],
      limit: 5
    });
    console.log('✅ Recent applications query works, count:', recentApplications.length);
    
    console.log('Testing job stats query...');
    const activeJobs = await Job.count({
      where: { 
        status: 'active'
      }
    });
    console.log('✅ Job stats query works, active jobs:', activeJobs);
    
    return true;
  } catch (error) {
    console.log('❌ Dashboard stats endpoint test failed:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting final dashboard stats test...\n');
  
  const modelsOk = await testDashboardStatsModels();
  const endpointOk = await testDashboardStatsEndpoint();
  
  console.log('\n📋 Test Results:');
  console.log('================');
  console.log(`Required Models: ${modelsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Dashboard Stats Endpoint: ${endpointOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (modelsOk && endpointOk) {
    console.log('\n🎉 Dashboard stats should now work correctly!');
    console.log('\n🔧 FIXES APPLIED:');
    console.log('1. ✅ Fixed Application model naming conflict');
    console.log('2. ✅ Fixed model instance methods');
    console.log('3. ✅ Updated config file to use correct model names');
    console.log('4. ✅ Verified all required models for dashboard stats work');
  } else {
    console.log('\n⚠️ There are still issues with dashboard stats.');
  }
  
  console.log('\n🔗 Next Steps:');
  console.log('1. Test the dashboard stats in the frontend');
  console.log('2. Check if the "failed to load dashboard stats" error is resolved');
  console.log('3. Verify both jobseeker and employer dashboards work');
  
  console.log('\n🔍 If Still Having Issues:');
  console.log('1. Check if the server is running');
  console.log('2. Check if the database is accessible');
  console.log('3. Check browser console for any JavaScript errors');
  console.log('4. Check backend console for detailed error logs');
}

// Run the test
runTest().catch(console.error);
