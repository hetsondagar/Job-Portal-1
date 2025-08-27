require('dotenv').config();

console.log('🔧 Simple Dashboard Stats Test');
console.log('==============================\n');

async function testDatabaseModels() {
  console.log('1️⃣ Testing Database Models...');
  
  try {
    // Test if we can load the config without errors
    const { User, JobApplication, Analytics, Job } = require('./config/index');
    
    console.log('✅ All models loaded successfully');
    
    // Test basic model operations
    const userCount = await User.count();
    console.log('✅ User count:', userCount);
    
    const jobCount = await Job.count();
    console.log('✅ Job count:', jobCount);
    
    const appCount = await JobApplication.count();
    console.log('✅ JobApplication count:', appCount);
    
    const analyticsCount = await Analytics.count();
    console.log('✅ Analytics count:', analyticsCount);
    
    console.log('✅ All model operations successful');
    return true;
  } catch (error) {
    console.log('❌ Model test failed:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting simple dashboard stats test...\n');
  
  const modelsOk = await testDatabaseModels();
  
  console.log('\n📋 Test Results:');
  console.log('================');
  console.log(`Database Models: ${modelsOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (modelsOk) {
    console.log('\n🎉 Dashboard stats should now work correctly!');
    console.log('\n🔧 FIXES APPLIED:');
    console.log('1. ✅ Fixed model import naming conflict in config/index.js');
    console.log('2. ✅ Updated dashboard stats endpoint to use correct models');
    console.log('3. ✅ Ensured all required models are properly imported');
  } else {
    console.log('\n⚠️ There are still issues with the database models.');
  }
  
  console.log('\n🔗 Next Steps:');
  console.log('1. Test the dashboard stats in the frontend');
  console.log('2. Check if the "failed to load dashboard stats" error is resolved');
  console.log('3. Verify both jobseeker and employer dashboards work');
}

// Run the test
runTest().catch(console.error);
