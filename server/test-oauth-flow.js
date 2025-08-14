require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

async function testOAuthFlow() {
  try {
    console.log('🧪 Testing OAuth Flow...\n');

    // Test 1: Check OAuth URLs endpoint
    console.log('1. Testing OAuth URLs endpoint...');
    try {
      const oauthUrlsResponse = await axios.get(`${API_BASE_URL}/oauth/urls`);
      console.log('✅ OAuth URLs Response:', oauthUrlsResponse.data);
      
      const { google, facebook } = oauthUrlsResponse.data.data;
      console.log('   Google URL:', google);
      console.log('   Facebook URL:', facebook);
    } catch (error) {
      console.log('❌ OAuth URLs Failed:', error.response?.data || error.message);
      return;
    }

    // Test 2: Check Google OAuth endpoint (should redirect)
    console.log('\n2. Testing Google OAuth endpoint...');
    try {
      const googleResponse = await axios.get(`${API_BASE_URL}/oauth/google`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept redirects
        }
      });
      console.log('✅ Google OAuth endpoint working');
      console.log('   Status:', googleResponse.status);
      console.log('   Headers:', googleResponse.headers);
    } catch (error) {
      if (error.response?.status === 302 || error.response?.status === 301) {
        console.log('✅ Google OAuth redirect working');
        console.log('   Redirect URL:', error.response.headers.location);
      } else {
        console.log('❌ Google OAuth Failed:', error.response?.data || error.message);
        console.log('   Status:', error.response?.status);
      }
    }

    // Test 3: Check Facebook OAuth endpoint
    console.log('\n3. Testing Facebook OAuth endpoint...');
    try {
      const facebookResponse = await axios.get(`${API_BASE_URL}/oauth/facebook`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      console.log('✅ Facebook OAuth endpoint working');
    } catch (error) {
      if (error.response?.status === 302 || error.response?.status === 301) {
        console.log('✅ Facebook OAuth redirect working');
        console.log('   Redirect URL:', error.response.headers.location);
      } else {
        console.log('❌ Facebook OAuth Failed:', error.response?.data || error.message);
      }
    }

    // Test 4: Check environment variables
    console.log('\n4. Checking environment variables...');
    console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set');
    console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('   GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || '❌ Not set');
    console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Not set');

    // Test 5: Check if OAuth strategy is configured
    console.log('\n5. Checking OAuth strategy configuration...');
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      console.log('✅ Google OAuth strategy should be configured');
      console.log('   Client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
      console.log('   Callback URL:', process.env.GOOGLE_CALLBACK_URL);
    } else {
      console.log('❌ Google OAuth strategy not configured - missing credentials');
    }

    console.log('\n🎉 OAuth flow test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testOAuthFlow();
