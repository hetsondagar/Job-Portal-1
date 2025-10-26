const { v4: uuidv4 } = require('uuid');

// Test configuration
const API_BASE_URL = 'http://localhost:8000';
const TEST_USER_EMAIL = `test-delete-${Date.now()}@example.com`;
const TEST_USER_PASSWORD = 'TestPassword123!';

async function createTestUser() {
  const { User, Company } = require('./models');
  
  console.log('🔧 Creating test user...');
  
  const userId = uuidv4();
  const companyId = uuidv4();
  
  // Create test company first
  const company = await Company.create({
    id: companyId,
    name: 'Test Company',
    slug: `test-company-${Date.now()}`,
    email: 'test@company.com',
    phone: '+1234567890',
    country: 'India',
    isActive: true,
    companyStatus: 'active'
  });
  
  // Create test user
  const user = await User.create({
    id: userId,
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    first_name: 'Test',
    last_name: 'User',
    phone: '+1234567890',
    user_type: 'employer',
    is_email_verified: true,
    is_phone_verified: true,
    is_active: true,
    company_id: companyId,
    account_status: 'active'
  });
  
  console.log('✅ Test user created with ID:', userId);
  console.log('✅ Test company created with ID:', companyId);
  
  return { user, company, userId, companyId };
}

async function testLogin() {
  console.log('🔐 Testing Login API...');
  
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Login failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }
  
  const loginData = await response.json();
  console.log('✅ Login API test successful');
  
  return loginData.data.token;
}

async function testDeleteAccount(authToken) {
  console.log('🧪 Testing Delete Account API...');
  
  try {
    const deleteResponse = await fetch(`${API_BASE_URL}/api/user/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        currentPassword: TEST_USER_PASSWORD,
        confirmationText: 'DELETE MY ACCOUNT'
      })
    });
    
    console.log('📋 Delete response status:', deleteResponse.status);
    console.log('📋 Delete response headers:', Object.fromEntries(deleteResponse.headers.entries()));
    
    const responseText = await deleteResponse.text();
    console.log('📋 Delete response body:', responseText);
    
    if (!deleteResponse.ok) {
      throw new Error(`Delete account failed: ${deleteResponse.statusText} - ${responseText}`);
    }
    
    const deleteData = JSON.parse(responseText);
    console.log('✅ Delete account API call successful');
    console.log('📋 Delete response:', JSON.stringify(deleteData, null, 2));
    
    return deleteData;
    
  } catch (error) {
    console.error('❌ Delete account API test failed:', error.message);
    throw error;
  }
}

async function cleanup(userId, companyId) {
  console.log('🧹 Cleaning up test data...');
  
  try {
    const { User, Company } = require('./models');
    
    // Delete user
    await User.destroy({ where: { id: userId } });
    console.log('✅ User deleted');
    
    // Delete company
    await Company.destroy({ where: { id: companyId } });
    console.log('✅ Company deleted');
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('⚠️ Cleanup error:', error.message);
  }
}

async function runSimpleDebugTest() {
  console.log('🚀 Starting SIMPLE DEBUG TEST for Delete Account Functionality');
  console.log('🎯 Testing delete account endpoint with minimal data');
  console.log('================================================================================');
  
  let userId, companyId;
  
  try {
    // Create test user
    const { user, company } = await createTestUser();
    userId = user.id;
    companyId = company.id;
    
    // Test login
    const authToken = await testLogin();
    
    // Test delete account
    await testDeleteAccount(authToken);
    
    console.log('✅ SIMPLE DEBUG TEST PASSED!');
    
  } catch (error) {
    console.error('❌ SIMPLE DEBUG TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cleanup
    if (userId && companyId) {
      await cleanup(userId, companyId);
    }
  }
  
  console.log('🏁 Simple debug test completed');
}

// Run the test
runSimpleDebugTest().catch(console.error);
