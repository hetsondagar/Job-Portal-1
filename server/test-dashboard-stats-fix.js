require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🔧 Dashboard Stats Fix Test');
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

async function testDatabaseConnection() {
  console.log('\n1️⃣ Testing Database Connection...');
  
  try {
    // Test if we can connect to the database by checking if models are accessible
    const { User, JobApplication, Analytics, Job } = require('./config/index');
    
    console.log('✅ Database models loaded successfully');
    
    // Test User model
    const userCount = await User.count();
    console.log('✅ User model accessible, count:', userCount);
    
    // Test JobApplication model
    try {
      const appCount = await JobApplication.count();
      console.log('✅ JobApplication model accessible, count:', appCount);
    } catch (error) {
      console.log('❌ JobApplication model error:', error.message);
    }
    
    // Test Analytics model
    try {
      const analyticsCount = await Analytics.count();
      console.log('✅ Analytics model accessible, count:', analyticsCount);
    } catch (error) {
      console.log('❌ Analytics model error:', error.message);
    }
    
    // Test Job model
    try {
      const jobCount = await Job.count();
      console.log('✅ Job model accessible, count:', jobCount);
    } catch (error) {
      console.log('❌ Job model error:', error.message);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n2️⃣ Testing User Registration...');
  
  try {
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phone: '1234567890',
      userType: 'jobseeker'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      body: testUser
    });
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ User registration successful');
      return response.data.data.token;
    } else {
      console.log('❌ User registration failed:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ User registration error:', error.message);
    return null;
  }
}

async function testDashboardStats(token) {
  console.log('\n3️⃣ Testing Dashboard Stats...');
  
  if (!token) {
    console.log('❌ No token available for dashboard stats test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/user/dashboard-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Dashboard Stats Response:', {
      status: response.status,
      success: response.data?.success,
      message: response.data?.message,
      hasData: !!response.data?.data
    });
    
    if (response.status === 200 && response.data?.success) {
      console.log('✅ Dashboard stats loaded successfully');
      console.log('📊 Stats data:', response.data.data);
      return true;
    } else {
      console.log('❌ Dashboard stats failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Dashboard stats error:', error.message);
    return false;
  }
}

async function testEmployerRegistration() {
  console.log('\n4️⃣ Testing Employer Registration...');
  
  try {
    const testEmployer = {
      firstName: 'Test',
      lastName: 'Employer',
      email: `employer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phone: '1234567890',
      companyName: 'Test Company',
      companySize: '1-50',
      industry: 'Technology',
      userType: 'employer'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/api/auth/employer-signup`, {
      method: 'POST',
      body: testEmployer
    });
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Employer registration successful');
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

async function testEmployerDashboardStats(token) {
  console.log('\n5️⃣ Testing Employer Dashboard Stats...');
  
  if (!token) {
    console.log('❌ No token available for employer dashboard stats test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/user/dashboard-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Employer Dashboard Stats Response:', {
      status: response.status,
      success: response.data?.success,
      message: response.data?.message,
      hasData: !!response.data?.data
    });
    
    if (response.status === 200 && response.data?.success) {
      console.log('✅ Employer dashboard stats loaded successfully');
      console.log('📊 Employer stats data:', response.data.data);
      return true;
    } else {
      console.log('❌ Employer dashboard stats failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Employer dashboard stats error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting dashboard stats fix tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test database connection
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    console.log('❌ Database connection issues detected');
  }
  
  // Test jobseeker flow
  const jobseekerToken = await testUserRegistration();
  const jobseekerStatsOk = await testDashboardStats(jobseekerToken);
  
  // Test employer flow
  const employerToken = await testEmployerRegistration();
  const employerStatsOk = await testDashboardStats(employerToken);
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ✅ PASS`);
  console.log(`Database Connection: ${dbOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Jobseeker Registration: ${jobseekerToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Jobseeker Dashboard Stats: ${jobseekerStatsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Registration: ${employerToken ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Dashboard Stats: ${employerStatsOk ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🔍 DIAGNOSIS:');
  if (!jobseekerStatsOk || !employerStatsOk) {
    console.log('❌ Dashboard stats loading is failing');
    console.log('🔧 Common causes:');
    console.log('1. Database model associations not set up correctly');
    console.log('2. Missing or incorrect model imports');
    console.log('3. Authentication token issues');
    console.log('4. Database table structure issues');
    console.log('5. Missing required fields in database');
  } else {
    console.log('✅ Dashboard stats loading is working correctly!');
  }
  
  console.log('\n🔧 POTENTIAL FIXES:');
  console.log('1. Check database model associations in config/index.js');
  console.log('2. Verify all required models are imported correctly');
  console.log('3. Check if database tables exist and have correct structure');
  console.log('4. Verify authentication middleware is working');
  console.log('5. Check for any missing database migrations');
  
  console.log('\n🔗 Manual Testing Steps:');
  console.log('1. Go to http://localhost:3000/login or /employer-login');
  console.log('2. Sign in with valid credentials');
  console.log('3. Navigate to dashboard');
  console.log('4. Check browser console for errors');
  console.log('5. Check backend console for detailed logs');
  
  console.log('\n🔍 Debugging Commands:');
  console.log('- Backend logs: Look for dashboard stats processing');
  console.log('- Browser console: Check for API call errors');
  console.log('- Network tab: Check dashboard stats API response');
  console.log('- Database: Verify tables and relationships');
}

// Run the tests
runTests().catch(console.error);
