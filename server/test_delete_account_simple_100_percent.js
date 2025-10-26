const axios = require('axios');
const { sequelize } = require('./config/sequelize');
const { User, Company, Resume, CoverLetter, Notification, UserSession, UserDashboard, Analytics } = require('./models');

const API_BASE_URL = 'http://localhost:8000';

async function createTestUser() {
  console.log('🔧 Creating test user...');
  
  const testUser = await User.create({
    email: `test-delete-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
    phone: '+1234567890',
    user_type: 'employer',
    is_email_verified: true,
    is_phone_verified: true,
    is_active: true,
    account_status: 'active',
    region: 'india'
  });
  
  console.log('✅ Test user created with ID:', testUser.id);
  return testUser;
}

async function createTestCompany(userId) {
  console.log('🏢 Creating test company...');
  
  const testCompany = await Company.create({
    name: `Test Company ${Date.now()}`,
    slug: `test-company-${Date.now()}`,
    email: `company-${Date.now()}@example.com`,
    phone: '+1234567890',
    country: 'India',
    is_active: true,
    company_status: 'active'
  });
  
  // Associate user with company
  await User.update({ companyId: testCompany.id }, { where: { id: userId } });
  
  console.log('✅ Test company created with ID:', testCompany.id);
  return testCompany;
}

async function createSimpleTestData(userId) {
  console.log('📊 Creating simple test data for 100% GDPR compliance...');
  
  const testData = {};
  
  try {
    // Create resume
    const resume = await Resume.create({
      title: 'Test Resume',
      skills: ['JavaScript', 'Node.js', 'React'],
      userId: userId,
      is_primary: true,
      is_public: true,
      view_count: 0,
      download_count: 0,
      last_updated: new Date()
    });
    testData.resume = resume;
    
    // Create cover letter
    const coverLetter = await CoverLetter.create({
      userId: userId,
      title: 'Test Cover Letter',
      content: 'Test cover letter content',
      isDefault: true,
      isPublic: true,
      views: 0,
      downloads: 0,
      lastUpdated: new Date()
    });
    testData.coverLetter = coverLetter;
    
    // Create notification
    const notification = await Notification.create({
      userId: userId,
      type: 'job_application',
      title: 'Test Notification',
      message: 'Test notification message',
      is_read: false,
      priority: 'medium'
    });
    testData.notification = notification;
    
    // Create user session
    const userSession = await UserSession.create({
      userId: userId,
      sessionToken: `test-session-${Date.now()}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent'
    });
    testData.userSession = userSession;
    
    // Create user dashboard
    const userDashboard = await UserDashboard.create({
      userId: userId,
      totalApplications: 0,
      applicationsUnderReview: 0,
      applicationsShortlisted: 0,
      applicationsRejected: 0,
      applicationsAccepted: 0,
      totalBookmarks: 0,
      totalSearches: 0,
      savedSearches: 0,
      totalResumes: 1,
      hasDefaultResume: true,
      totalJobAlerts: 0,
      activeJobAlerts: 0,
      profileViews: 0,
      lastActivityDate: new Date(),
      totalLoginCount: 1,
      dashboardLayout: 'default',
      favoriteActions: [],
      metadata: {}
    });
    testData.userDashboard = userDashboard;
    
    // Create analytics
    const analytics = await Analytics.create({
      userId: userId,
      event_type: 'page_view',
      event_category: 'job_search',
      search_query: 'test job',
      filters: { location: 'Test City' },
      custom_parameters: { source: 'test' }
    });
    testData.analytics = analytics;
    
    console.log('✅ Simple test data created successfully');
    return testData;
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
}

async function testLogin(user) {
  console.log('🔐 Testing Login API...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: user.email,
      password: 'TestPassword123!'
    });
    
    if (response.data.success) {
      console.log('✅ Login API test successful');
      return response.data.data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('❌ Login API test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testDeleteAccount(authToken) {
  console.log('🧪 Testing Delete Account API...');
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/user/account`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        currentPassword: 'TestPassword123!',
        confirmationText: 'DELETE MY ACCOUNT'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Delete account API call successful');
      console.log('📋 Delete response:', response.data);
      return response.data;
    } else {
      throw new Error(`Delete account failed: ${response.data.message}`);
    }
  } catch (error) {
    console.error('❌ Delete account API test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function verify100PercentGDPRCompliance(userId) {
  console.log('🔍 Verifying 100% GDPR Compliance...');
  console.log('================================================================================');
  
  const verificationResults = [];
  
  // Define core tables that should be checked
  const tablesToCheck = [
    { name: 'USERS', model: User, field: 'id', value: userId, shouldExist: false, description: 'User account soft deleted' },
    { name: 'RESUMES', model: Resume, field: 'userId', value: userId, shouldExist: false, description: 'All resumes deleted' },
    { name: 'COVER_LETTERS', model: CoverLetter, field: 'userId', value: userId, shouldExist: false, description: 'All cover letters deleted' },
    { name: 'NOTIFICATIONS', model: Notification, field: 'userId', value: userId, shouldExist: false, description: 'All notifications deleted' },
    { name: 'USER_SESSIONS', model: UserSession, field: 'userId', value: userId, shouldExist: false, description: 'All user sessions deleted' },
    { name: 'USER_DASHBOARD', model: UserDashboard, field: 'userId', value: userId, shouldExist: false, description: 'All user dashboard data deleted' },
    { name: 'ANALYTICS', model: Analytics, field: 'userId', value: userId, shouldExist: false, description: 'All analytics deleted' }
  ];
  
  let passedCount = 0;
  let totalCount = tablesToCheck.length;
  
  for (const table of tablesToCheck) {
    try {
      const count = await table.model.count({
        where: { [table.field]: table.value }
      });
      
      const passed = table.shouldExist ? count > 0 : count === 0;
      const status = passed ? '✅' : '❌';
      
      console.log(`📊 Table: ${table.name}`);
      console.log(`   ${status} ${table.description}`);
      console.log(`   Current Records: ${count}`);
      
      verificationResults.push({
        table: table.name,
        passed: passed,
        count: count,
        description: table.description
      });
      
      if (passed) passedCount++;
      
    } catch (error) {
      console.log(`📊 Table: ${table.name}`);
      console.log(`   ⚠️ Could not verify: ${error.message}`);
      
      verificationResults.push({
        table: table.name,
        passed: false,
        count: 'Error',
        description: table.description,
        error: error.message
      });
    }
  }
  
  console.log('================================================================================');
  console.log(`📊 GDPR Compliance Score: ${passedCount}/${totalCount} (${Math.round((passedCount/totalCount)*100)}%)`);
  
  if (passedCount === totalCount) {
    console.log('🎉 100% GDPR COMPLIANCE ACHIEVED! 🎉');
    return true;
  } else {
    console.log('❌ GDPR compliance verification failed');
    return false;
  }
}

async function cleanupTestData(userId, companyId) {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Delete user
    await User.destroy({ where: { id: userId } });
    console.log('✅ User deleted');
    
    // Delete company
    await Company.destroy({ where: { id: companyId } });
    console.log('✅ Company deleted');
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('⚠️ Error during cleanup:', error.message);
  }
}

async function runSimple100PercentGDPRTest() {
  console.log('🚀 Starting SIMPLE 100% GDPR COMPLIANCE TEST for Delete Account Functionality');
  console.log('🎯 Testing /employer-dashboard/settings page delete account feature');
  console.log('================================================================================');
  
  let testUser = null;
  let testCompany = null;
  let testData = null;
  
  try {
    // Create test user
    testUser = await createTestUser();
    
    // Create test company
    testCompany = await createTestCompany(testUser.id);
    
    // Create simple test data
    testData = await createSimpleTestData(testUser.id);
    
    // Test login
    const authToken = await testLogin(testUser);
    
    // Test delete account
    await testDeleteAccount(authToken);
    
    // Verify 100% GDPR compliance
    const isCompliant = await verify100PercentGDPRCompliance(testUser.id);
    
    if (isCompliant) {
      console.log('🎉 100% GDPR COMPLIANCE TEST PASSED! 🎉');
      console.log('✅ Delete account functionality is PERFECT and GDPR compliant!');
    } else {
      console.log('❌ 100% GDPR COMPLIANCE TEST FAILED!');
      throw new Error('GDPR compliance verification failed');
    }
    
  } catch (error) {
    console.error('❌ 100% GDPR COMPLIANCE TEST FAILED:', error.message);
    throw error;
  } finally {
    // Cleanup
    if (testUser) {
      await cleanupTestData(testUser.id, testCompany?.id);
    }
  }
  
  console.log('🏁 Simple 100% GDPR compliance test completed');
}

// Run the test
if (require.main === module) {
  runSimple100PercentGDPRTest()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { runSimple100PercentGDPRTest };
