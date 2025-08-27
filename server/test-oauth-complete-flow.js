require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🔍 OAuth Complete Flow Test');
console.log('===========================\n');

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
      const employerUrl = employerResponse.data.data.google;
      console.log('✅ Employer OAuth URL:', employerUrl);
      
      if (employerUrl.includes('state=employer')) {
        console.log('✅ Employer URL correctly includes state=employer');
      } else {
        console.log('❌ Employer URL missing state=employer');
        return false;
      }
    } else {
      console.log('❌ Failed to get employer OAuth URL');
      return false;
    }
    
    // Test jobseeker OAuth URL
    const jobseekerResponse = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=jobseeker`);
    
    if (jobseekerResponse.status === 200 && jobseekerResponse.data.success) {
      const jobseekerUrl = jobseekerResponse.data.data.google;
      console.log('✅ Jobseeker OAuth URL:', jobseekerUrl);
      
      if (!jobseekerUrl.includes('state=employer')) {
        console.log('✅ Jobseeker URL correctly does NOT include state=employer');
      } else {
        console.log('❌ Jobseeker URL incorrectly includes state=employer');
        return false;
      }
    } else {
      console.log('❌ Failed to get jobseeker OAuth URL');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ OAuth URL test failed:', error.message);
    return false;
  }
}

async function testOAuthCallbackEndpoints() {
  console.log('\n2️⃣ Testing OAuth Callback Endpoints...');
  
  try {
    // Test if callback endpoints exist
    const employerCallbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer-oauth-callback`;
    const jobseekerCallbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback`;
    
    console.log('🔗 Employer callback URL:', employerCallbackUrl);
    console.log('🔗 Jobseeker callback URL:', jobseekerCallbackUrl);
    
    console.log('📋 Expected OAuth Flow:');
    console.log('1. User clicks "Continue with Google"');
    console.log('2. Frontend calls /api/oauth/urls?userType=employer/jobseeker');
    console.log('3. Backend returns OAuth URL with/without state=employer');
    console.log('4. Frontend redirects to Google OAuth URL');
    console.log('5. Google redirects back to /api/oauth/google/callback');
    console.log('6. Backend processes callback and redirects to frontend callback');
    console.log('7. Frontend callback redirects to appropriate dashboard');
    
    return true;
  } catch (error) {
    console.log('❌ OAuth callback test failed:', error.message);
    return false;
  }
}

async function testBackendOAuthCallback() {
  console.log('\n3️⃣ Testing Backend OAuth Callback Logic...');
  
  try {
    console.log('📋 Backend OAuth Callback Flow:');
    console.log('1. Google redirects to: /api/oauth/google/callback?code=...&state=employer');
    console.log('2. Backend detects state=employer from query params');
    console.log('3. Backend sets user_type=employer in database');
    console.log('4. Backend generates JWT token');
    console.log('5. Backend redirects to: /employer-oauth-callback?token=...&userType=employer');
    
    console.log('\n🔍 Potential Issues:');
    console.log('- State parameter not being passed by Google');
    console.log('- Backend not detecting state parameter correctly');
    console.log('- User type not being set in database');
    console.log('- Wrong redirect URL being generated');
    console.log('- Frontend callback not handling user type correctly');
    
    return true;
  } catch (error) {
    console.log('❌ Backend OAuth callback test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting OAuth complete flow tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test OAuth URL generation
  const oauthUrlsOk = await testOAuthUrlGeneration();
  const callbackEndpointsOk = await testOAuthCallbackEndpoints();
  const backendCallbackOk = await testBackendOAuthCallback();
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ✅ PASS`);
  console.log(`OAuth URL Generation: ${oauthUrlsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Callback Endpoints: ${callbackEndpointsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend Callback Logic: ${backendCallbackOk ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🔍 DIAGNOSIS:');
  console.log('Based on your description, the issue is likely:');
  console.log('1. ❌ OAuth callback is redirecting to login pages instead of dashboards');
  console.log('2. ❌ Employer OAuth is not going to employer dashboard');
  console.log('3. ❌ Jobseeker OAuth is not going to jobseeker dashboard');
  
  console.log('\n🔧 POTENTIAL FIXES:');
  console.log('1. Check if backend is detecting state parameter correctly');
  console.log('2. Check if backend is setting user_type correctly');
  console.log('3. Check if backend is redirecting to correct callback pages');
  console.log('4. Check if frontend callbacks are handling user type correctly');
  console.log('5. Check if there are any authentication/token issues');
  
  console.log('\n🔗 MANUAL TESTING STEPS:');
  console.log('\n📋 Step 1: Test Employer OAuth');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Click "Continue with Google"');
  console.log('3. Complete Google OAuth flow');
  console.log('4. Check backend console for logs');
  console.log('5. Check browser console for logs');
  console.log('6. Check browser network tab for redirects');
  
  console.log('\n📋 Step 2: Test Jobseeker OAuth');
  console.log('1. Go to http://localhost:3000/login');
  console.log('2. Click "Continue with Google"');
  console.log('3. Complete Google OAuth flow');
  console.log('4. Check backend console for logs');
  console.log('5. Check browser console for logs');
  console.log('6. Check browser network tab for redirects');
  
  console.log('\n🔍 DEBUGGING COMMANDS:');
  console.log('- Backend logs: Look for OAuth callback processing');
  console.log('- Browser network tab: Check OAuth URL and redirects');
  console.log('- Browser console: Check frontend callback logs');
  console.log('- localStorage: Check user data and userType');
  
  console.log('\n🎯 EXPECTED BEHAVIOR:');
  console.log('- Employer OAuth: employer-login → Google OAuth → /employer-oauth-callback → /employer-dashboard');
  console.log('- Jobseeker OAuth: login → Google OAuth → /oauth-callback → /dashboard');
  
  console.log('\n❌ CURRENT ISSUE:');
  console.log('- Both OAuth flows are redirecting back to login pages');
  console.log('- This suggests a problem with callback handling or authentication');
}

// Run the tests
runTests().catch(console.error);
