require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🧪 OAuth No-Sync Test Script');
console.log('============================\n');

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testServerStatus() {
  console.log('0️⃣ Testing Server Status...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/health`);
    if (response.status === 200) {
      console.log('✅ Backend server is running');
      return true;
    } else {
      console.log('❌ Backend server responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend server is not running:', error.message);
    return false;
  }
}

async function testOAuthConfiguration() {
  console.log('\n1️⃣ Testing OAuth Configuration for Employer...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=employer`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ OAuth URLs endpoint working for employer');
      if (response.data.data.google) {
        console.log('✅ Google OAuth URL available for employer');
        console.log('🔗 Google URL:', response.data.data.google);
        return true;
      } else {
        console.log('❌ Google OAuth URL not available for employer');
        return false;
      }
    } else {
      console.log('❌ OAuth URLs endpoint failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ OAuth URLs test failed:', error.message);
    return false;
  }
}

async function testGoogleProfileSyncEndpoint() {
  console.log('\n2️⃣ Testing Google Profile Sync Endpoint (should be skipped)...');
  
  try {
    // This endpoint should not be called in the new flow
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/sync-google-profile`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('📊 Sync endpoint response status:', response.status);
    console.log('📊 Sync endpoint response:', response.data.message || 'No message');
    
    // The sync endpoint should still work if called directly, but it's not needed
    console.log('ℹ️ Note: This endpoint is no longer called in the OAuth flow');
    return true;
  } catch (error) {
    console.log('❌ Sync endpoint test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting OAuth No-Sync tests...\n');
  
  const results = {
    serverStatus: await testServerStatus(),
    oauthConfig: await testOAuthConfiguration(),
    syncEndpoint: await testGoogleProfileSyncEndpoint()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ${results.serverStatus ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OAuth Configuration: ${results.oauthConfig ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Sync Endpoint (optional): ${results.syncEndpoint ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (results.serverStatus && results.oauthConfig) {
    console.log('🎉 OAuth configuration is ready for no-sync flow!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n🔄 New OAuth Flow (No Sync):');
  console.log('1. User clicks "Continue with Google" on employer login');
  console.log('2. Google OAuth process runs');
  console.log('3. Google profile data is synced during OAuth (automatic)');
  console.log('4. User is redirected to employer dashboard');
  console.log('5. Dashboard displays Google account details directly');
  console.log('6. No additional sync step required');
  
  console.log('\n🔗 Manual Testing Steps:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Click "Continue with Google"');
  console.log('3. Complete Google OAuth flow');
  console.log('4. Verify redirect to employer dashboard');
  console.log('5. Check that dashboard shows Google account details');
  console.log('6. Verify no "syncing" messages appear');
  
  console.log('\n✅ Expected Behavior:');
  console.log('- OAuth flow completes without sync step');
  console.log('- Google profile data is available immediately');
  console.log('- Dashboard loads with Google account details');
  console.log('- No additional API calls for profile sync');
}

// Run the tests
runTests().catch(console.error);
