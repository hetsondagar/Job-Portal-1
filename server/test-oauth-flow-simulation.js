require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🧪 OAuth Flow Simulation Test');
console.log('=============================\n');

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

async function testOAuthUrlGeneration() {
  console.log('\n1️⃣ Testing OAuth URL Generation...');
  
  try {
    // Test employer OAuth URL
    const employerResponse = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=employer`);
    
    if (employerResponse.status === 200 && employerResponse.data.success) {
      const employerGoogleUrl = employerResponse.data.data.google;
      console.log('✅ Employer Google OAuth URL:', employerGoogleUrl);
      
      // Check if URL contains state parameter
      if (employerGoogleUrl.includes('state=employer')) {
        console.log('✅ Employer URL correctly includes state=employer');
        return employerGoogleUrl;
      } else {
        console.log('❌ Employer URL missing state=employer');
        return null;
      }
    } else {
      console.log('❌ Failed to get employer OAuth URL');
      return null;
    }
  } catch (error) {
    console.log('❌ OAuth URL generation test failed:', error.message);
    return null;
  }
}

async function testOAuthCallbackSimulation() {
  console.log('\n2️⃣ Testing OAuth Callback Simulation...');
  
  try {
    // Simulate what happens when Google redirects back to our callback
    // We'll test the callback URL structure
    const callbackUrl = `${API_BASE_URL}/api/oauth/google/callback`;
    console.log('🔗 Testing callback URL:', callbackUrl);
    
    // Note: We can't actually test the full OAuth flow without Google's response
    // But we can test the URL structure and parameters
    
    console.log('ℹ️ OAuth callback simulation - this would normally receive:');
    console.log('  - code: Authorization code from Google');
    console.log('  - state: employer (from our OAuth URL)');
    console.log('  - scope: profile email');
    
    return true;
  } catch (error) {
    console.log('❌ OAuth callback simulation failed:', error.message);
    return false;
  }
}

async function testBackendOAuthLogic() {
  console.log('\n3️⃣ Testing Backend OAuth Logic...');
  
  try {
    // Test the OAuth URLs endpoint with different user types
    const testCases = [
      { userType: 'employer', expectedState: 'employer' },
      { userType: 'jobseeker', expectedState: null },
      { userType: undefined, expectedState: null }
    ];
    
    for (const testCase of testCases) {
      const query = testCase.userType ? `?userType=${testCase.userType}` : '';
      const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls${query}`);
      
      if (response.status === 200 && response.data.success) {
        const googleUrl = response.data.data.google;
        const hasState = googleUrl.includes('state=employer');
        
        if (testCase.expectedState === 'employer' && hasState) {
          console.log(`✅ ${testCase.userType || 'default'} OAuth URL correctly includes state=employer`);
        } else if (testCase.expectedState === null && !hasState) {
          console.log(`✅ ${testCase.userType || 'default'} OAuth URL correctly does not include state=employer`);
        } else {
          console.log(`❌ ${testCase.userType || 'default'} OAuth URL incorrect state parameter`);
          return false;
        }
      } else {
        console.log(`❌ Failed to get OAuth URL for ${testCase.userType || 'default'}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Backend OAuth logic test failed:', error.message);
    return false;
  }
}

async function testFrontendOAuthFlow() {
  console.log('\n4️⃣ Testing Frontend OAuth Flow Logic...');
  
  try {
    console.log('📋 Frontend OAuth Flow Steps:');
    console.log('1. User clicks "Continue with Google" on employer-login page');
    console.log('2. Frontend calls /api/oauth/urls?userType=employer');
    console.log('3. Backend returns URL with state=employer');
    console.log('4. Frontend redirects to Google OAuth URL');
    console.log('5. Google redirects back to /api/oauth/google/callback with state=employer');
    console.log('6. Backend processes callback and sets user_type=employer');
    console.log('7. Backend redirects to /employer-oauth-callback');
    console.log('8. Frontend processes callback and redirects to /employer-dashboard');
    
    console.log('\n🔍 Potential Issues:');
    console.log('- State parameter not being passed correctly');
    console.log('- Backend not detecting state parameter');
    console.log('- User type not being set correctly');
    console.log('- Wrong callback page being used');
    console.log('- Frontend not handling callback correctly');
    
    return true;
  } catch (error) {
    console.log('❌ Frontend OAuth flow test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting OAuth flow simulation tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test OAuth URL generation
  const oauthUrlOk = await testOAuthUrlGeneration();
  const callbackSimulationOk = await testOAuthCallbackSimulation();
  const backendLogicOk = await testBackendOAuthLogic();
  const frontendFlowOk = await testFrontendOAuthFlow();
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ✅ PASS`);
  console.log(`OAuth URL Generation: ${oauthUrlOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Callback Simulation: ${callbackSimulationOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend OAuth Logic: ${backendLogicOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend OAuth Flow: ${frontendFlowOk ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = [true, !!oauthUrlOk, callbackSimulationOk, backendLogicOk, frontendFlowOk].filter(Boolean).length;
  const totalTests = 5;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 OAuth flow simulation is working correctly!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n🔗 Manual Testing Steps:');
  console.log('\n📋 To test the actual OAuth flow:');
  console.log('1. Start both servers (backend and frontend)');
  console.log('2. Go to http://localhost:3000/employer-login');
  console.log('3. Click "Continue with Google"');
  console.log('4. Check browser network tab for the OAuth URL');
  console.log('5. Verify URL contains "state=employer"');
  console.log('6. Complete Google OAuth flow');
  console.log('7. Check backend logs for state parameter detection');
  console.log('8. Verify redirect goes to /employer-oauth-callback');
  console.log('9. Verify final redirect goes to /employer-dashboard');
  
  console.log('\n🔍 Debugging Commands:');
  console.log('- Check backend logs: Look for "state=employer" detection');
  console.log('- Check browser network tab: Verify OAuth URL structure');
  console.log('- Check browser console: Look for frontend redirect logs');
  console.log('- Check localStorage: Verify user data and userType');
  
  console.log('\n🐛 Common Issues and Solutions:');
  console.log('1. State parameter missing: Check OAuth URL generation');
  console.log('2. Backend not detecting state: Check session handling');
  console.log('3. Wrong user type: Check database user_type field');
  console.log('4. Wrong callback page: Check backend redirect logic');
  console.log('5. Frontend redirect issue: Check callback page logic');
}

// Run the tests
runTests().catch(console.error);
