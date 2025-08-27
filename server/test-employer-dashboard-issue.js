require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🔧 Employer Dashboard Issue Test');
console.log('================================\n');

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

async function testEmployerRegistration() {
  console.log('\n1️⃣ Testing Employer Registration...');
  
  try {
    const testEmployer = {
      fullName: 'Test Employer',
      email: `employer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phone: '1234567890',
      companyName: 'Test Company',
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
      message: response.data?.message,
      userType: response.data?.data?.user?.userType
    });
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Employer registration successful');
      console.log('👤 User data:', response.data.data.user);
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
  console.log('\n2️⃣ Testing Employer Login...');
  
  if (!token) {
    console.log('❌ No token available for employer login test');
    return null;
  }
  
  try {
    // Test login with the registered employer
    const loginData = {
      email: `employer-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: loginData
    });
    
    console.log('📊 Employer Login Response:', {
      status: response.status,
      success: response.data?.success,
      message: response.data?.message,
      userType: response.data?.data?.user?.userType
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Employer login successful');
      console.log('👤 User data:', response.data.data.user);
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

async function testUserProfile(token) {
  console.log('\n3️⃣ Testing User Profile...');
  
  if (!token) {
    console.log('❌ No token available for user profile test');
    return null;
  }
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 User Profile Response:', {
      status: response.status,
      success: response.data?.success,
      userType: response.data?.data?.userType
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ User profile retrieved successfully');
      console.log('👤 Profile data:', response.data.data);
      return response.data.data;
    } else {
      console.log('❌ User profile failed:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ User profile error:', error.message);
    return null;
  }
}

async function testDatabaseUserType() {
  console.log('\n4️⃣ Testing Database User Type...');
  
  try {
    const User = require('./models/User');
    
    // Find the most recent employer user
    const employerUser = await User.findOne({
      where: { user_type: 'employer' },
      order: [['createdAt', 'DESC']]
    });
    
    if (employerUser) {
      console.log('✅ Found employer user in database:', {
        id: employerUser.id,
        email: employerUser.email,
        userType: employerUser.user_type,
        companyId: employerUser.company_id
      });
      return employerUser;
    } else {
      console.log('❌ No employer users found in database');
      return null;
    }
  } catch (error) {
    console.log('❌ Database user type test error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting employer dashboard issue tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test employer registration
  const registrationToken = await testEmployerRegistration();
  
  // Test employer login
  const loginToken = await testEmployerLogin(registrationToken);
  
  // Test user profile
  const profileData = await testUserProfile(loginToken || registrationToken);
  
  // Test database user type
  const dbUser = await testDatabaseUserType();
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ✅ PASS`);
  console.log(`Employer Registration: ${registrationToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Login: ${loginToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Profile: ${profileData ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database User Type: ${dbUser ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🔍 DIAGNOSIS:');
  if (!profileData || profileData.userType !== 'employer') {
    console.log('❌ User type is not being set correctly to "employer"');
    console.log('🔧 This is causing the employer dashboard to redirect to jobseeker dashboard');
  } else {
    console.log('✅ User type is correctly set to "employer"');
  }
  
  console.log('\n🔧 POTENTIAL FIXES:');
  console.log('1. Check if employer registration is setting user_type correctly');
  console.log('2. Check if OAuth flow is setting user_type correctly');
  console.log('3. Check if login endpoint is returning correct user_type');
  console.log('4. Check if frontend is handling user_type correctly');
  
  console.log('\n🔗 Manual Testing Steps:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Sign in with an employer account');
  console.log('3. Check if you are redirected to /employer-dashboard');
  console.log('4. Check browser console for any errors');
  console.log('5. Check backend console for detailed logs');
  
  console.log('\n🔍 Debugging Commands:');
  console.log('- Backend logs: Look for login processing and user type');
  console.log('- Browser console: Check for user data and userType');
  console.log('- Network tab: Check login API response');
  console.log('- localStorage: Check stored user data');
}

// Run the tests
runTests().catch(console.error);
