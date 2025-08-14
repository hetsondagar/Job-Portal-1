const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

async function testPasswordReset() {
  try {
    console.log('🧪 Testing Password Reset Functionality...\n');

    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    try {
      const healthResponse = await axios.get('http://localhost:8000/health');
      console.log('✅ Health Check Response:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health Check Failed:', error.message);
      return;
    }

    // Test 2: Forgot Password
    console.log('\n2. Testing Forgot Password...');
    try {
      const forgotPasswordResponse = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: 'test@example.com'
      });
      console.log('✅ Forgot Password Response:', forgotPasswordResponse.data);
    } catch (error) {
      console.log('❌ Forgot Password Failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      console.log('   Data:', error.response?.data);
    }
    
    // Test 3: Check if OAuth URLs are available
    console.log('\n3. Testing OAuth URLs...');
    try {
      const oauthUrlsResponse = await axios.get(`${API_BASE_URL}/oauth/urls`);
      console.log('✅ OAuth URLs Response:', oauthUrlsResponse.data);
    } catch (error) {
      console.log('⚠️ OAuth URLs Error (expected if not configured):');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Wait a bit for server to start, then run tests
setTimeout(testPasswordReset, 1000);
