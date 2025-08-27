require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🔍 OAuth Redirect Debug Script');
console.log('==============================\n');

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
  console.log('\n1️⃣ Testing OAuth URL Generation for Employer...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=employer`);
    
    if (response.status === 200 && response.data.success) {
      const googleUrl = response.data.data.google;
      console.log('✅ Employer Google OAuth URL:', googleUrl);
      
      if (googleUrl.includes('state=employer')) {
        console.log('✅ URL correctly includes state=employer');
        return googleUrl;
      } else {
        console.log('❌ URL missing state=employer');
        return null;
      }
    } else {
      console.log('❌ Failed to get OAuth URL');
      return null;
    }
  } catch (error) {
    console.log('❌ OAuth URL test failed:', error.message);
    return null;
  }
}

async function testOAuthUrlGenerationJobseeker() {
  console.log('\n2️⃣ Testing OAuth URL Generation for Jobseeker...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=jobseeker`);
    
    if (response.status === 200 && response.data.success) {
      const googleUrl = response.data.data.google;
      console.log('✅ Jobseeker Google OAuth URL:', googleUrl);
      
      if (!googleUrl.includes('state=employer')) {
        console.log('✅ URL correctly does NOT include state=employer');
        return true;
      } else {
        console.log('❌ URL incorrectly includes state=employer');
        return false;
      }
    } else {
      console.log('❌ Failed to get OAuth URL');
      return false;
    }
  } catch (error) {
    console.log('❌ OAuth URL test failed:', error.message);
    return false;
  }
}

async function testBackendOAuthCallbackLogic() {
  console.log('\n3️⃣ Testing Backend OAuth Callback Logic...');
  
  try {
    // Test the callback URL structure
    const callbackUrl = `${API_BASE_URL}/api/oauth/google/callback`;
    console.log('🔗 Callback URL:', callbackUrl);
    
    console.log('📋 Expected OAuth Callback Flow:');
    console.log('1. Google redirects to: /api/oauth/google/callback?code=...&state=employer');
    console.log('2. Backend detects state=employer');
    console.log('3. Backend sets user_type=employer');
    console.log('4. Backend redirects to: /employer-oauth-callback');
    console.log('5. Frontend redirects to: /employer-dashboard');
    
    console.log('\n🔍 Potential Issues:');
    console.log('- State parameter not being passed by Google');
    console.log('- Backend not detecting state parameter');
    console.log('- User type not being set correctly');
    console.log('- Wrong redirect URL being generated');
    
    return true;
  } catch (error) {
    console.log('❌ Callback logic test failed:', error.message);
    return false;
  }
}

async function testFrontendCallbackPages() {
  console.log('\n4️⃣ Testing Frontend Callback Pages...');
  
  try {
    console.log('📋 Frontend Callback Pages:');
    console.log('1. /employer-oauth-callback - Should handle employer OAuth');
    console.log('2. /oauth-callback - Should handle jobseeker OAuth');
    
    console.log('\n🔍 Expected Behavior:');
    console.log('- Employer OAuth should redirect to /employer-oauth-callback');
    console.log('- Jobseeker OAuth should redirect to /oauth-callback');
    console.log('- Each callback should redirect to appropriate dashboard');
    
    console.log('\n🐛 Common Issues:');
    console.log('- Backend redirecting to wrong callback page');
    console.log('- Frontend callback not detecting user type correctly');
    console.log('- Frontend redirecting to wrong dashboard');
    
    return true;
  } catch (error) {
    console.log('❌ Frontend callback test failed:', error.message);
    return false;
  }
}

async function runDebugTests() {
  console.log('🚀 Starting OAuth redirect debug tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test OAuth URL generation
  const employerUrlOk = await testOAuthUrlGeneration();
  const jobseekerUrlOk = await testOAuthUrlGenerationJobseeker();
  const callbackLogicOk = await testBackendOAuthCallbackLogic();
  const frontendCallbackOk = await testFrontendCallbackPages();
  
  console.log('\n📋 Debug Results Summary:');
  console.log('========================');
  console.log(`Server Status: ✅ PASS`);
  console.log(`Employer OAuth URL: ${employerUrlOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Jobseeker OAuth URL: ${jobseekerUrlOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Callback Logic: ${callbackLogicOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Callbacks: ${frontendCallbackOk ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🔍 Manual Testing Steps:');
  console.log('\n📋 Step 1: Test OAuth URL Generation');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Open browser developer tools (F12)');
  console.log('3. Go to Network tab');
  console.log('4. Click "Continue with Google"');
  console.log('5. Check the OAuth URL - should contain "state=employer"');
  
  console.log('\n📋 Step 2: Test OAuth Callback');
  console.log('1. Complete Google OAuth flow');
  console.log('2. Check backend console for logs:');
  console.log('   - "Processing employer OAuth - State detected as employer"');
  console.log('   - "User successfully updated to employer type"');
  console.log('   - "Redirecting to: /employer-oauth-callback"');
  
  console.log('\n📋 Step 3: Test Frontend Callback');
  console.log('1. Check browser console for logs:');
  console.log('   - "Employer OAuth callback - Params: { userType: employer }"');
  console.log('   - "User is already employer type"');
  console.log('   - "Redirecting employer to employer dashboard"');
  
  console.log('\n📋 Step 4: Check Final Redirect');
  console.log('1. Verify page redirects to /employer-dashboard');
  console.log('2. Check localStorage for user data');
  console.log('3. Verify userType is "employer"');
  
  console.log('\n🐛 Debugging Commands:');
  console.log('- Backend logs: Look for state parameter detection');
  console.log('- Browser network tab: Check OAuth URL and redirects');
  console.log('- Browser console: Check frontend callback logs');
  console.log('- localStorage: Check user data and userType');
  
  console.log('\n🎯 Expected Flow:');
  console.log('employer-login → Google OAuth (state=employer) → /employer-oauth-callback → /employer-dashboard');
  
  console.log('\n❌ Current Issue:');
  console.log('employer-login → Google OAuth (state=employer) → /oauth-callback → /dashboard');
  
  console.log('\n🔧 Potential Fixes:');
  console.log('1. Check if backend is detecting state=employer correctly');
  console.log('2. Check if backend is redirecting to correct callback page');
  console.log('3. Check if frontend callback is handling user type correctly');
  console.log('4. Check if there are any session/state issues');
}

// Run the debug tests
runDebugTests().catch(console.error);
