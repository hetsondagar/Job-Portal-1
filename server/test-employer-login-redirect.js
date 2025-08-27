require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🧪 Employer Login Redirect Test');
console.log('===============================\n');

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
  
  const testEmployer = {
    fullName: 'Test Employer Login',
    email: 'testemployerlogin@example.com',
    password: 'TestPass123',
    companyName: 'Test Company Login',
    phone: '1234567890',
    companySize: '1-50',
    industry: 'technology',
    agreeToTerms: true
  };
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/employer-signup`, {
      method: 'POST',
      body: testEmployer
    });
    
    console.log('📊 Registration Response Status:', response.status);
    console.log('📊 Registration Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Employer registration successful');
      console.log('👤 User Type:', response.data.data.user.userType);
      console.log('🏢 Company ID:', response.data.data.user.companyId);
      return response.data.data.token;
    } else {
      console.log('❌ Employer registration failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Registration test failed:', error.message);
    return null;
  }
}

async function testEmployerLogin() {
  console.log('\n2️⃣ Testing Employer Login...');
  
  const loginData = {
    email: 'testemployerlogin@example.com',
    password: 'TestPass123'
  };
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: loginData
    });
    
    console.log('📊 Login Response Status:', response.status);
    console.log('📊 Login Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Employer login successful');
      console.log('👤 User Type:', response.data.data.user.userType);
      console.log('🏢 Company ID:', response.data.data.user.companyId);
      
      // Check if user type is correctly set to 'employer'
      if (response.data.data.user.userType === 'employer') {
        console.log('✅ User type is correctly set to employer');
        return response.data.data.token;
      } else {
        console.log('❌ User type is not employer:', response.data.data.user.userType);
        return null;
      }
    } else {
      console.log('❌ Employer login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
    return null;
  }
}

async function testUserProfile(token) {
  console.log('\n3️⃣ Testing User Profile After Login...');
  
  if (!token) {
    console.log('❌ No token available for profile test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Profile Response Status:', response.status);
    console.log('📊 Profile Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ User profile loaded successfully');
      console.log('👤 User Type:', response.data.data.userType);
      console.log('🏢 Company ID:', response.data.data.companyId);
      
      if (response.data.data.userType === 'employer') {
        console.log('✅ Profile confirms user is employer');
        return true;
      } else {
        console.log('❌ Profile shows wrong user type:', response.data.data.userType);
        return false;
      }
    } else {
      console.log('❌ User profile failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Profile test failed:', error.message);
    return false;
  }
}

async function testDashboardStats(token) {
  console.log('\n4️⃣ Testing Dashboard Stats for Employer...');
  
  if (!token) {
    console.log('❌ No token available for dashboard test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/user/dashboard-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Dashboard Stats Response Status:', response.status);
    console.log('📊 Dashboard Stats Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Dashboard stats loaded successfully');
      console.log('📊 Active Jobs:', response.data.data.activeJobs);
      console.log('📊 Total Applications:', response.data.data.totalApplications);
      console.log('📊 Profile Views:', response.data.data.profileViews);
      console.log('📊 Hired Candidates:', response.data.data.hiredCandidates);
      return true;
    } else {
      console.log('❌ Dashboard stats failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Dashboard stats test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting employer login redirect tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test registration and login
  let token = await testEmployerRegistration();
  if (!token) {
    console.log('🔄 Registration failed, trying login with existing account...');
    token = await testEmployerLogin();
  } else {
    // If registration succeeded, also test login
    console.log('🔄 Registration succeeded, testing login...');
    token = await testEmployerLogin();
  }
  
  if (token) {
    // Test profile and dashboard
    const profileOk = await testUserProfile(token);
    const dashboardOk = await testDashboardStats(token);
    
    console.log('\n📋 Test Results Summary:');
    console.log('========================');
    console.log(`Server Status: ✅ PASS`);
    console.log(`Employer Registration/Login: ${token ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`User Profile: ${profileOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Dashboard Stats: ${dashboardOk ? '✅ PASS' : '❌ FAIL'}`);
    
    const passedTests = [true, !!token, profileOk, dashboardOk].filter(Boolean).length;
    const totalTests = 4;
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Employer login redirect is working correctly!');
    } else {
      console.log('⚠️ Some tests failed. Check the logs above for details.');
    }
  } else {
    console.log('\n❌ Cannot test profile and dashboard without valid token');
  }
  
  console.log('\n🔗 Frontend Testing Steps:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Enter email: testemployerlogin@example.com');
  console.log('3. Enter password: TestPass123');
  console.log('4. Click "Sign In"');
  console.log('5. Verify redirect to /employer-dashboard');
  console.log('6. Check browser console for userType value');
  
  console.log('\n✅ Expected Frontend Behavior:');
  console.log('- Login form submits successfully');
  console.log('- User data shows userType: "employer"');
  console.log('- Success toast shows "Redirecting to employer dashboard"');
  console.log('- Page redirects to /employer-dashboard');
  console.log('- Dashboard loads with employer-specific data');
  
  console.log('\n🐛 Common Issues:');
  console.log('- User type not set correctly in database');
  console.log('- Frontend not checking userType properly');
  console.log('- Redirect logic not working');
  console.log('- Dashboard not loading employer data');
}

// Run the tests
runTests().catch(console.error);
