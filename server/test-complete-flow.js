const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Password Reset Flow...\n');

    // Test 1: Create a test user first
    console.log('1. Creating test user...');
    try {
      const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: 'test@example.com',
        password: 'TestPassword123',
        fullName: 'Test User',
        phone: '1234567890'
      });
      console.log('✅ Test user created or already exists');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Test user already exists');
      } else {
        console.log('⚠️ Could not create test user:', error.response?.data?.message);
      }
    }

    // Test 2: Request password reset
    console.log('\n2. Requesting password reset...');
    const forgotPasswordResponse = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email: 'test@example.com'
    });
    console.log('✅ Password reset requested:', forgotPasswordResponse.data.message);

    // Test 3: Check OAuth configuration
    console.log('\n3. Checking OAuth configuration...');
    const oauthUrlsResponse = await axios.get(`${API_BASE_URL}/oauth/urls`);
    console.log('✅ OAuth URLs available:', oauthUrlsResponse.data.data);

    // Test 4: Test login with original password
    console.log('\n4. Testing login with original password...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'TestPassword123'
      });
      console.log('✅ Login successful with original password');
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message);
    }

    console.log('\n🎉 Complete flow test finished!');
    console.log('\n📝 Next Steps:');
    console.log('1. Check server console for password reset link');
    console.log('2. Copy the reset link from console');
    console.log('3. Open the link in browser');
    console.log('4. Set a new password');
    console.log('5. Test login with new password');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testCompleteFlow();
