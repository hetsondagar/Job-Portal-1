require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🧪 OAuth & Dashboard Fix Test Script');
console.log('=====================================\n');

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  first_name: 'Test',
  last_name: 'User'
};

let authToken = null;

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

async function testOAuthConfiguration() {
  console.log('1️⃣ Testing OAuth Configuration...');
  
  try {
    // Test OAuth URLs endpoint
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ OAuth URLs endpoint working');
      if (response.data.data.google) {
        console.log('✅ Google OAuth URL available');
        return true;
      } else {
        console.log('❌ Google OAuth URL not available');
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

async function testUserRegistration() {
  console.log('\n2️⃣ Testing User Registration...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: testUser
    });
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ User registration successful');
      authToken = response.data.data.token;
      return true;
    } else {
      console.log('❌ User registration failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Registration test failed:', error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n3️⃣ Testing User Login...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ User login successful');
      authToken = response.data.data.token;
      return true;
    } else {
      console.log('❌ User login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
    return false;
  }
}

async function testDashboardStats() {
  console.log('\n4️⃣ Testing Dashboard Stats...');
  
  if (!authToken) {
    console.log('❌ No auth token available for dashboard test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/user/dashboard-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Dashboard stats loaded successfully');
      console.log('📊 Stats data:', {
        applicationCount: response.data.data.applicationCount,
        profileViews: response.data.data.profileViews,
        recentApplications: response.data.data.recentApplications?.length || 0
      });
      return true;
    } else {
      console.log('❌ Dashboard stats failed:', response.data.message);
      if (response.data.error) {
        console.log('🔍 Error details:', response.data.error);
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Dashboard stats test failed:', error.message);
    return false;
  }
}

async function testGoogleProfileSync() {
  console.log('\n5️⃣ Testing Google Profile Sync...');
  
  if (!authToken) {
    console.log('❌ No auth token available for Google sync test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/sync-google-profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Google profile sync successful');
      console.log('👤 User data updated');
      return true;
    } else {
      console.log('❌ Google profile sync failed:', response.data.message);
      if (response.data.error) {
        console.log('🔍 Error details:', response.data.error);
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Google profile sync test failed:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n6️⃣ Testing Database Connection...');
  
  try {
    const { sequelize } = require('./config/sequelize');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test if Analytics table exists
    try {
      const { Analytics } = require('./config/index');
      const analyticsCount = await Analytics.count();
      console.log(`✅ Analytics table accessible (${analyticsCount} records)`);
      return true;
    } catch (error) {
      console.log('⚠️ Analytics table not accessible:', error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testServerStatus() {
  console.log('\n0️⃣ Testing Server Status...');
  
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

async function runAllTests() {
  console.log('🚀 Starting comprehensive tests...\n');
  
  const results = {
    serverStatus: await testServerStatus(),
    oauthConfig: await testOAuthConfiguration(),
    database: await testDatabaseConnection(),
    registration: await testUserRegistration(),
    login: await testUserLogin(),
    dashboardStats: await testDashboardStats(),
    googleSync: await testGoogleProfileSync()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ${results.serverStatus ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OAuth Configuration: ${results.oauthConfig ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database Connection: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Registration: ${results.registration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Login: ${results.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Dashboard Stats: ${results.dashboardStats ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Google Profile Sync: ${results.googleSync ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The fixes are working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  // Provide recommendations
  console.log('\n💡 Recommendations:');
  if (!results.serverStatus) {
    console.log('- Start the backend server: npm start');
  }
  if (!results.oauthConfig) {
    console.log('- Check Google OAuth credentials in .env file');
    console.log('- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set');
  }
  if (!results.database) {
    console.log('- Check database connection settings');
    console.log('- Run database migrations: npm run migrate');
  }
  if (!results.dashboardStats) {
    console.log('- Check if Analytics table exists and has proper structure');
    console.log('- Verify user authentication is working');
  }
  if (!results.googleSync) {
    console.log('- This is expected for non-OAuth users');
    console.log('- Test with a Google OAuth user for full functionality');
  }
}

// Run the tests
runAllTests().catch(console.error);
