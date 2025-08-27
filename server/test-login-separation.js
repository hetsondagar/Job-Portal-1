require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🧪 Login Separation Test');
console.log('========================\n');

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

async function testJobseekerRegistration() {
  console.log('\n1️⃣ Testing Jobseeker Registration...');
  
  const testJobseeker = {
    fullName: 'Test Jobseeker',
    email: 'testjobseeker@example.com',
    password: 'TestPass123',
    phone: '1234567890',
    agreeToTerms: true
  };
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      body: testJobseeker
    });
    
    console.log('📊 Jobseeker Registration Response Status:', response.status);
    console.log('📊 Jobseeker Registration Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Jobseeker registration successful');
      console.log('👤 User Type:', response.data.data.user.userType);
      return response.data.data.token;
    } else {
      console.log('❌ Jobseeker registration failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Jobseeker registration test failed:', error.message);
    return null;
  }
}

async function testEmployerRegistration() {
  console.log('\n2️⃣ Testing Employer Registration...');
  
  const testEmployer = {
    fullName: 'Test Employer',
    email: 'testemployer@example.com',
    password: 'TestPass123',
    companyName: 'Test Company',
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
    
    console.log('📊 Employer Registration Response Status:', response.status);
    console.log('📊 Employer Registration Response Data:', JSON.stringify(response.data, null, 2));
    
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
    console.log('❌ Employer registration test failed:', error.message);
    return null;
  }
}

async function testJobseekerLogin() {
  console.log('\n3️⃣ Testing Jobseeker Login...');
  
  const loginData = {
    email: 'testjobseeker@example.com',
    password: 'TestPass123'
  };
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: loginData
    });
    
    console.log('📊 Jobseeker Login Response Status:', response.status);
    console.log('📊 Jobseeker Login Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Jobseeker login successful');
      console.log('👤 User Type:', response.data.data.user.userType);
      
      if (response.data.data.user.userType === 'jobseeker') {
        console.log('✅ User type is correctly set to jobseeker');
        return response.data.data.token;
      } else {
        console.log('❌ User type is not jobseeker:', response.data.data.user.userType);
        return null;
      }
    } else {
      console.log('❌ Jobseeker login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Jobseeker login test failed:', error.message);
    return null;
  }
}

async function testEmployerLogin() {
  console.log('\n4️⃣ Testing Employer Login...');
  
  const loginData = {
    email: 'testemployer@example.com',
    password: 'TestPass123'
  };
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: loginData
    });
    
    console.log('📊 Employer Login Response Status:', response.status);
    console.log('📊 Employer Login Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Employer login successful');
      console.log('👤 User Type:', response.data.data.user.userType);
      console.log('🏢 Company ID:', response.data.data.user.companyId);
      
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
    console.log('❌ Employer login test failed:', error.message);
    return null;
  }
}

async function testUserProfile(token, expectedUserType) {
  console.log(`\n5️⃣ Testing User Profile for ${expectedUserType}...`);
  
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
      
      if (response.data.data.userType === expectedUserType) {
        console.log(`✅ Profile confirms user is ${expectedUserType}`);
        return true;
      } else {
        console.log(`❌ Profile shows wrong user type: ${response.data.data.userType}, expected: ${expectedUserType}`);
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

async function runTests() {
  console.log('🚀 Starting login separation tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test registrations
  const jobseekerToken = await testJobseekerRegistration();
  const employerToken = await testEmployerRegistration();
  
  // Test logins
  const jobseekerLoginToken = await testJobseekerLogin();
  const employerLoginToken = await testEmployerLogin();
  
  // Test profiles
  const jobseekerProfileOk = await testUserProfile(jobseekerLoginToken || jobseekerToken, 'jobseeker');
  const employerProfileOk = await testUserProfile(employerLoginToken || employerToken, 'employer');
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ✅ PASS`);
  console.log(`Jobseeker Registration: ${jobseekerToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Registration: ${employerToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Jobseeker Login: ${jobseekerLoginToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Login: ${employerLoginToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Jobseeker Profile: ${jobseekerProfileOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Profile: ${employerProfileOk ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = [true, !!jobseekerToken, !!employerToken, !!jobseekerLoginToken, !!employerLoginToken, jobseekerProfileOk, employerProfileOk].filter(Boolean).length;
  const totalTests = 7;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Login separation is working correctly!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n🔗 Frontend Testing Steps:');
  console.log('\n📋 Jobseeker Login Flow:');
  console.log('1. Go to http://localhost:3000/login');
  console.log('2. Enter email: testjobseeker@example.com');
  console.log('3. Enter password: TestPass123');
  console.log('4. Click "Sign In"');
  console.log('5. Should redirect to /dashboard');
  console.log('6. Dashboard should show jobseeker data');
  
  console.log('\n📋 Employer Login Flow:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Enter email: testemployer@example.com');
  console.log('3. Enter password: TestPass123');
  console.log('4. Click "Sign In"');
  console.log('5. Should redirect to /employer-dashboard');
  console.log('6. Dashboard should show employer data');
  
  console.log('\n📋 Cross-Login Tests:');
  console.log('1. Try employer email on jobseeker login - should redirect to employer-login');
  console.log('2. Try jobseeker email on employer login - should redirect to login');
  
  console.log('\n✅ Expected Behavior:');
  console.log('- Jobseekers can only login through /login and go to /dashboard');
  console.log('- Employers can only login through /employer-login and go to /employer-dashboard');
  console.log('- Cross-login attempts should redirect to correct login page');
  console.log('- Each dashboard shows data specific to that user type');
  
  console.log('\n🐛 Common Issues:');
  console.log('- User type not set correctly during registration');
  console.log('- Login redirect logic not working properly');
  console.log('- Dashboard not showing correct user data');
  console.log('- Cross-login protection not working');
}

// Run the tests
runTests().catch(console.error);
