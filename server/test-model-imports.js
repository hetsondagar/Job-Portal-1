require('dotenv').config();

console.log('🔧 Model Import Test');
console.log('====================\n');

async function testIndividualModels() {
  console.log('1️⃣ Testing Individual Model Imports...');
  
  try {
    console.log('Testing User model...');
    const User = require('./models/User');
    const userCount = await User.count();
    console.log('✅ User model works, count:', userCount);
  } catch (error) {
    console.log('❌ User model failed:', error.message);
  }
  
  try {
    console.log('Testing JobApplication model...');
    const JobApplication = require('./models/JobApplication');
    const appCount = await JobApplication.count();
    console.log('✅ JobApplication model works, count:', appCount);
  } catch (error) {
    console.log('❌ JobApplication model failed:', error.message);
  }
  
  try {
    console.log('Testing Analytics model...');
    const Analytics = require('./models/Analytics');
    const analyticsCount = await Analytics.count();
    console.log('✅ Analytics model works, count:', analyticsCount);
  } catch (error) {
    console.log('❌ Analytics model failed:', error.message);
  }
  
  try {
    console.log('Testing Job model...');
    const Job = require('./models/Job');
    const jobCount = await Job.count();
    console.log('✅ Job model works, count:', jobCount);
  } catch (error) {
    console.log('❌ Job model failed:', error.message);
  }
  
  try {
    console.log('Testing Application model...');
    const Application = require('./models/Application');
    const applicationCount = await Application.count();
    console.log('✅ Application model works, count:', applicationCount);
  } catch (error) {
    console.log('❌ Application model failed:', error.message);
  }
}

async function testConfigImport() {
  console.log('\n2️⃣ Testing Config Import...');
  
  try {
    console.log('Testing config/index.js import...');
    const config = require('./config/index');
    console.log('✅ Config imported successfully');
    console.log('Available models:', Object.keys(config).filter(key => key !== 'sequelize' && key !== 'syncDatabase'));
    return true;
  } catch (error) {
    console.log('❌ Config import failed:', error.message);
    return false;
  }
}

async function testSpecificModelsFromConfig() {
  console.log('\n3️⃣ Testing Specific Models from Config...');
  
  try {
    const { User, JobApplication, Analytics, Job, Application } = require('./config/index');
    
    console.log('Testing User from config...');
    const userCount = await User.count();
    console.log('✅ User from config works, count:', userCount);
    
    console.log('Testing JobApplication from config...');
    const appCount = await JobApplication.count();
    console.log('✅ JobApplication from config works, count:', appCount);
    
    console.log('Testing Analytics from config...');
    const analyticsCount = await Analytics.count();
    console.log('✅ Analytics from config works, count:', analyticsCount);
    
    console.log('Testing Job from config...');
    const jobCount = await Job.count();
    console.log('✅ Job from config works, count:', jobCount);
    
    console.log('Testing Application from config...');
    const applicationCount = await Application.count();
    console.log('✅ Application from config works, count:', applicationCount);
    
    return true;
  } catch (error) {
    console.log('❌ Specific models from config failed:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting model import test...\n');
  
  await testIndividualModels();
  const configOk = await testConfigImport();
  const specificModelsOk = await testSpecificModelsFromConfig();
  
  console.log('\n📋 Test Results:');
  console.log('================');
  console.log(`Config Import: ${configOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Specific Models from Config: ${specificModelsOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (configOk && specificModelsOk) {
    console.log('\n🎉 All model imports are working correctly!');
    console.log('The dashboard stats should now work.');
  } else {
    console.log('\n⚠️ There are still issues with model imports.');
  }
}

// Run the test
runTest().catch(console.error);
