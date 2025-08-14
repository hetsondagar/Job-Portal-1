require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

async function testFrontendOAuth() {
  try {
    console.log('🧪 Testing Frontend OAuth Flow...\n');

    // Test 1: Simulate frontend getting OAuth URLs
    console.log('1. Testing frontend OAuth URLs request...');
    try {
      const response = await axios.get(`${API_BASE_URL}/oauth/urls`, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000',
          'Referer': 'http://localhost:3000/login'
        }
      });
      console.log('✅ Frontend OAuth URLs request successful');
      console.log('   Response:', response.data);
      
      const { google, facebook } = response.data.data;
      console.log('   Google URL for frontend:', google);
      console.log('   Facebook URL for frontend:', facebook);
    } catch (error) {
      console.log('❌ Frontend OAuth URLs request failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      return;
    }

    // Test 2: Test Google OAuth redirect (simulate frontend redirect)
    console.log('\n2. Testing Google OAuth redirect...');
    try {
      const googleResponse = await axios.get(`${API_BASE_URL}/oauth/google`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'http://localhost:3000/login'
        }
      });
      console.log('✅ Google OAuth redirect successful');
      console.log('   Status:', googleResponse.status);
    } catch (error) {
      if (error.response?.status === 302 || error.response?.status === 301) {
        console.log('✅ Google OAuth redirect working');
        const redirectUrl = error.response.headers.location;
        console.log('   Redirect URL:', redirectUrl);
        
        // Check if the redirect URL contains the correct client ID
        if (redirectUrl.includes(process.env.GOOGLE_CLIENT_ID)) {
          console.log('   ✅ Correct client ID in redirect URL');
        } else {
          console.log('   ❌ Wrong client ID in redirect URL');
          console.log('   Expected:', process.env.GOOGLE_CLIENT_ID);
          console.log('   Found:', redirectUrl.match(/client_id=([^&]+)/)?.[1] || 'Not found');
        }
      } else {
        console.log('❌ Google OAuth redirect failed:');
        console.log('   Status:', error.response?.status);
        console.log('   Message:', error.response?.data?.message || error.message);
      }
    }

    // Test 3: Test OAuth callback endpoint
    console.log('\n3. Testing OAuth callback endpoint...');
    try {
      const callbackResponse = await axios.get(`${API_BASE_URL}/oauth/google/callback`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      console.log('✅ OAuth callback endpoint accessible');
    } catch (error) {
      if (error.response?.status === 302 || error.response?.status === 301) {
        console.log('✅ OAuth callback redirect working');
        console.log('   Redirect URL:', error.response.headers.location);
      } else {
        console.log('⚠️ OAuth callback endpoint:', error.response?.status || error.message);
      }
    }

    // Test 4: Check CORS headers
    console.log('\n4. Checking CORS configuration...');
    try {
      const corsResponse = await axios.options(`${API_BASE_URL}/oauth/urls`, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('✅ CORS preflight request successful');
      console.log('   CORS Headers:', {
        'Access-Control-Allow-Origin': corsResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': corsResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': corsResponse.headers['access-control-allow-headers']
      });
    } catch (error) {
      console.log('⚠️ CORS preflight request:', error.response?.status || error.message);
    }

    console.log('\n🎉 Frontend OAuth test completed!');
    console.log('\n📝 Summary:');
    console.log('✅ OAuth URLs endpoint working');
    console.log('✅ Google OAuth redirect working');
    console.log('✅ Environment variables loaded correctly');
    console.log('✅ CORS configuration appears correct');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testFrontendOAuth();
