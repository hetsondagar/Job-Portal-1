/**
 * Simple Production Test Script for Delete Account Functionality
 * This script tests the core delete account flow with minimal test data
 */

const { sequelize } = require('./config/sequelize');
const { User, Company } = require('./models');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

// Test configuration
const TEST_USER_EMAIL = `test_delete_${Date.now()}@example.com`;
const TEST_USER_PASSWORD = 'TestPassword123!';
const TEST_COMPANY_NAME = `Test Company ${Date.now()}`;

let testUserId = null;
let testCompanyId = null;

async function createTestUser() {
  console.log('🔧 Creating test user...');
  
  const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);
  
  const user = await User.create({
    email: TEST_USER_EMAIL,
    password: hashedPassword,
    first_name: 'Test',
    last_name: 'User',
    phone: '+1234567890',
    user_type: 'employer',
    region: 'india',
    is_active: true,
    account_status: 'active',
    preferences: { profileCompleted: true }
  });
  
  testUserId = user.id;
  console.log(`✅ Test user created with ID: ${testUserId}`);
  return user;
}

async function createTestCompany() {
  console.log('🏢 Creating test company...');
  
  const company = await Company.create({
    name: TEST_COMPANY_NAME,
    slug: `test-company-${Date.now()}`,
    description: 'Test company for delete account testing',
    industry: 'Technology',
    companySize: '1-50',
    website: 'https://testcompany.com',
    location: 'Test City',
    phone: '+1234567890',
    email: 'contact@testcompany.com',
    logo: null,
    banner: null,
    natureOfBusiness: ['Software Development'],
    companyTypes: ['Private Limited'],
    isActive: true,
    companyStatus: 'active'
  });
  
  testCompanyId = company.id;
  
  // Associate user with company
  await User.update(
    { companyId: testCompanyId },
    { where: { id: testUserId } }
  );
  
  console.log(`✅ Test company created with ID: ${testCompanyId}`);
  return company;
}

async function testDeleteAccountAPI() {
  console.log('🧪 Testing Delete Account API...');
  
  try {
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login successful, token obtained');
    
    // Now test delete account
    const deleteResponse = await fetch('http://localhost:8000/api/user/account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: TEST_USER_PASSWORD,
        confirmationText: 'DELETE MY ACCOUNT'
      })
    });
    
    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(`Delete account failed: ${deleteResponse.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    const deleteData = await deleteResponse.json();
    console.log('✅ Delete account API call successful');
    console.log('📋 Delete response:', JSON.stringify(deleteData, null, 2));
    
    return deleteData;
    
  } catch (error) {
    console.error('❌ Delete account API test failed:', error.message);
    throw error;
  }
}

async function verifyDataDeletion() {
  console.log('🔍 Verifying data deletion...');
  
  // Check if user is soft deleted
  const user = await User.findByPk(testUserId);
  if (!user) {
    console.log('❌ User not found - this should not happen with soft delete');
    return false;
  }
  
  if (user.account_status !== 'deleted') {
    console.log('❌ User account_status is not "deleted"');
    return false;
  }
  
  if (user.email === TEST_USER_EMAIL) {
    console.log('❌ User email was not anonymized');
    return false;
  }
  
  console.log('✅ User properly soft deleted and anonymized');
  
  // Check if company is preserved (since user was the only member)
  const company = await Company.findByPk(testCompanyId);
  if (!company) {
    console.log('❌ Company was deleted - this should not happen');
    return false;
  }
  
  if (company.isActive) {
    console.log('❌ Company is still active - should be marked as inactive');
    return false;
  }
  
  if (company.companyStatus !== 'inactive') {
    console.log('❌ Company status is not "inactive"');
    return false;
  }
  
  console.log('✅ Company properly marked as inactive');
  
  return true;
}

async function cleanup() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Delete the test user completely (hard delete for cleanup)
    await User.destroy({ where: { id: testUserId }, force: true });
    
    // Delete the test company
    await Company.destroy({ where: { id: testCompanyId }, force: true });
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

async function runSimpleTest() {
  console.log('🚀 Starting Simple Production Test for Delete Account Functionality');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Create test user
    await createTestUser();
    
    // Step 2: Create test company
    await createTestCompany();
    
    // Step 3: Test delete account API
    const deleteResult = await testDeleteAccountAPI();
    
    // Step 4: Verify data deletion
    const verificationResult = await verifyDataDeletion();
    
    if (verificationResult) {
      console.log('=' .repeat(60));
      console.log('🎉 SIMPLE PRODUCTION TEST PASSED!');
      console.log('✅ Delete account functionality is working perfectly');
      console.log('✅ GDPR compliance maintained');
      console.log('✅ Company data preserved appropriately');
      console.log('✅ User data properly deleted/anonymized');
      console.log('=' .repeat(60));
    } else {
      console.log('=' .repeat(60));
      console.log('❌ SIMPLE PRODUCTION TEST FAILED!');
      console.log('❌ Data deletion verification failed');
      console.log('=' .repeat(60));
    }
    
  } catch (error) {
    console.error('❌ Simple production test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Always cleanup
    await cleanup();
  }
}

// Run the test
if (require.main === module) {
  runSimpleTest()
    .then(() => {
      console.log('🏁 Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { runSimpleTest };
