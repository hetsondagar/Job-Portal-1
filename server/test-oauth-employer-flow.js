require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🔧 Employer OAuth Flow Test');
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

async function testOAuthUrls() {
  console.log('\n1️⃣ Testing OAuth URLs Generation...');
  
  try {
    // Test employer OAuth URLs
    const employerResponse = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=employer`);
    
    console.log('📊 Employer OAuth URLs Response:', {
      status: employerResponse.status,
      success: employerResponse.data?.success,
      hasGoogleUrl: !!employerResponse.data?.data?.google,
      hasFacebookUrl: !!employerResponse.data?.data?.facebook
    });
    
    if (employerResponse.status === 200 && employerResponse.data?.success) {
      const googleUrl = employerResponse.data.data.google;
      const facebookUrl = employerResponse.data.data.facebook;
      
      console.log('✅ OAuth URLs generated successfully');
      console.log('🔍 Google URL contains state=employer:', googleUrl.includes('state=employer'));
      console.log('🔍 Facebook URL contains state=employer:', facebookUrl.includes('state=employer'));
      
      if (googleUrl.includes('state=employer') && facebookUrl.includes('state=employer')) {
        console.log('✅ Both OAuth URLs correctly include state=employer parameter');
        return true;
      } else {
        console.log('❌ OAuth URLs missing state=employer parameter');
        return false;
      }
    } else {
      console.log('❌ Failed to get OAuth URLs:', employerResponse.data);
      return false;
    }
  } catch (error) {
    console.log('❌ OAuth URLs test error:', error.message);
    return false;
  }
}

async function testOAuthConfiguration() {
  console.log('\n2️⃣ Testing OAuth Configuration...');
  
  const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET'
  ];
  
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length === 0) {
    console.log('✅ All OAuth environment variables are configured');
    return true;
  } else {
    console.log('❌ Missing OAuth environment variables:', missingVars);
    console.log('⚠️ OAuth will not work without these variables');
    return false;
  }
}

async function testDatabaseModels() {
  console.log('\n3️⃣ Testing Database Models...');
  
  try {
    const User = require('./models/User');
    const Company = require('./models/Company');
    
    console.log('✅ User and Company models loaded successfully');
    
    // Test if we can query the models
    const userCount = await User.count();
    const companyCount = await Company.count();
    
    console.log('✅ Database models accessible');
    console.log('📊 User count:', userCount);
    console.log('📊 Company count:', companyCount);
    
    return true;
  } catch (error) {
    console.log('❌ Database models test error:', error.message);
    return false;
  }
}

async function testEmployerRegistration() {
  console.log('\n4️⃣ Testing Employer Registration...');
  
  try {
    const testEmployer = {
      fullName: 'Test OAuth Employer',
      email: `oauth-employer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phone: '1234567890',
      companyName: 'Test OAuth Company',
      companySize: '1-50',
      industry: 'technology'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/api/auth/employer-signup`, {
      method: 'POST',
      body: testEmployer
    });
    
    console.log('📊 Employer Registration Response:', {
      status: response.status,
      success: response.data?.success,
      userType: response.data?.data?.user?.userType
    });
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Employer registration successful');
      console.log('👤 User type:', response.data.data.user.userType);
      return response.data.data.token;
    } else {
      console.log('❌ Employer registration failed:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Employer registration error:', error.message);
    return null;
  }
}

async function testEmployerLogin(token) {
  console.log('\n5️⃣ Testing Employer Login...');
  
  if (!token) {
    console.log('❌ No token available for employer login test');
    return null;
  }
  
  try {
    // Test login with the registered employer
    const loginData = {
      email: `oauth-employer-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: loginData
    });
    
    console.log('📊 Employer Login Response:', {
      status: response.status,
      success: response.data?.success,
      userType: response.data?.data?.user?.userType
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Employer login successful');
      console.log('👤 User type:', response.data.data.user.userType);
      return response.data.data.token;
    } else {
      console.log('❌ Employer login failed:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Employer login error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting employer OAuth flow tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test OAuth configuration
  const oauthConfigured = await testOAuthConfiguration();
  
  // Test OAuth URLs generation
  const oauthUrlsOk = await testOAuthUrls();
  
  // Test database models
  const dbModelsOk = await testDatabaseModels();
  
  // Test employer registration
  const registrationToken = await testEmployerRegistration();
  
  // Test employer login
  const loginToken = await testEmployerLogin(registrationToken);
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ✅ PASS`);
  console.log(`OAuth Configuration: ${oauthConfigured ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OAuth URLs Generation: ${oauthUrlsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database Models: ${dbModelsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Registration: ${registrationToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Login: ${loginToken ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🔍 DIAGNOSIS:');
  if (!oauthConfigured) {
    console.log('❌ OAuth is not properly configured');
    console.log('🔧 Please set up Google and Facebook OAuth credentials in your .env file');
  } else if (!oauthUrlsOk) {
    console.log('❌ OAuth URLs are not being generated correctly');
    console.log('🔧 The state=employer parameter is missing from OAuth URLs');
  } else {
    console.log('✅ OAuth flow should work correctly for employers');
  }
  
  console.log('\n🔧 MANUAL TESTING STEPS:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Click on "Google" OAuth button');
  console.log('3. Complete Google OAuth flow');
  console.log('4. Verify you are redirected to /employer-dashboard');
  console.log('5. Check browser console for any errors');
  console.log('6. Check backend console for detailed logs');
  
  console.log('\n🔍 DEBUGGING COMMANDS:');
  console.log('- Backend logs: Look for OAuth callback processing');
  console.log('- Browser console: Check for OAuth flow and redirects');
  console.log('- Network tab: Check OAuth URL generation and callback');
  console.log('- localStorage: Check stored user data and userType');
  
  console.log('\n🔗 EXPECTED FLOW:');
  console.log('1. Employer clicks Google OAuth → /api/oauth/google?state=employer');
  console.log('2. Google OAuth callback → /api/oauth/google/callback');
  console.log('3. Backend processes state=employer → sets user_type=employer');
  console.log('4. Redirect to → /employer-oauth-callback?token=...&userType=employer');
  console.log('5. Frontend processes → stores user with userType=employer');
  console.log('6. Redirect to → /employer-dashboard');
}

// Run the tests
runTests().catch(console.error);
