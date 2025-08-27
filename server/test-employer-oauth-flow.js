require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🧪 Employer OAuth Flow Test Script');
console.log('===================================\n');

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Test data
const testEmployer = {
  email: 'employer@example.com',
  password: 'employerpass123',
  first_name: 'Test',
  last_name: 'Employer',
  user_type: 'employer'
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
  console.log('\n1️⃣ Testing OAuth Configuration...');
  
  try {
    // Test OAuth URLs endpoint for employer
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=employer`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ OAuth URLs endpoint working');
      if (response.data.data.google) {
        console.log('✅ Google OAuth URL available for employer');
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

async function testEmployerRegistration() {
  console.log('\n2️⃣ Testing Employer Registration...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: testEmployer
    });
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Employer registration successful');
      authToken = response.data.data.token;
      return true;
    } else {
      console.log('❌ Employer registration failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Registration test failed:', error.message);
    return false;
  }
}

async function testEmployerLogin() {
  console.log('\n3️⃣ Testing Employer Login...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: testEmployer.email,
        password: testEmployer.password
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Employer login successful');
      authToken = response.data.data.token;
      
      // Check if user type is employer
      if (response.data.data.user.userType === 'employer') {
        console.log('✅ User type correctly set as employer');
        return true;
      } else {
        console.log('❌ User type not set as employer:', response.data.data.user.userType);
        return false;
      }
    } else {
      console.log('❌ Employer login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
    return false;
  }
}

async function testEmployerDashboardStats() {
  console.log('\n4️⃣ Testing Employer Dashboard Stats...');
  
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
      console.log('✅ Employer dashboard stats loaded successfully');
      console.log('📊 Stats data:', {
        activeJobs: response.data.data.activeJobs,
        totalApplications: response.data.data.totalApplications,
        profileViews: response.data.data.profileViews,
        recentApplications: response.data.data.recentApplications?.length || 0
      });
      return true;
    } else {
      console.log('❌ Employer dashboard stats failed:', response.data.message);
      if (response.data.error) {
        console.log('🔍 Error details:', response.data.error);
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Employer dashboard stats test failed:', error.message);
    return false;
  }
}

async function testGoogleProfileSync() {
  console.log('\n5️⃣ Testing Google Profile Sync for Employer...');
  
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
      console.log('✅ Google profile sync successful for employer');
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

async function testCompanyData() {
  console.log('\n6️⃣ Testing Company Data Loading...');
  
  if (!authToken) {
    console.log('❌ No auth token available for company test');
    return false;
  }
  
  try {
    // First get user data to check if they have a company
    const userResponse = await makeRequest(`${API_BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (userResponse.status === 200 && userResponse.data.success) {
      const user = userResponse.data.data;
      console.log('✅ User profile loaded');
      
      if (user.company_id) {
        console.log('✅ User has company ID:', user.company_id);
        
        // Try to get company data
        const companyResponse = await makeRequest(`${API_BASE_URL}/api/companies/${user.company_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (companyResponse.status === 200 && companyResponse.data.success) {
          console.log('✅ Company data loaded successfully');
          console.log('🏢 Company:', companyResponse.data.data.name);
          return true;
        } else {
          console.log('❌ Company data loading failed:', companyResponse.data.message);
          return false;
        }
      } else {
        console.log('⚠️ User does not have a company ID (this is normal for new employers)');
        return true; // This is not an error for new employers
      }
    } else {
      console.log('❌ User profile loading failed:', userResponse.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Company data test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting employer OAuth flow tests...\n');
  
  const results = {
    serverStatus: await testServerStatus(),
    oauthConfig: await testOAuthConfiguration(),
    registration: await testEmployerRegistration(),
    login: await testEmployerLogin(),
    dashboardStats: await testEmployerDashboardStats(),
    googleSync: await testGoogleProfileSync(),
    companyData: await testCompanyData()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ${results.serverStatus ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OAuth Configuration: ${results.oauthConfig ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Registration: ${results.registration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Employer Login: ${results.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Dashboard Stats: ${results.dashboardStats ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Google Profile Sync: ${results.googleSync ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Company Data: ${results.companyData ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The employer OAuth flow is working correctly.');
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
  if (!results.dashboardStats) {
    console.log('- Check if Analytics table exists and has proper structure');
    console.log('- Verify user authentication is working');
  }
  if (!results.googleSync) {
    console.log('- This is expected for non-OAuth users');
    console.log('- Test with a Google OAuth user for full functionality');
  }
  
  console.log('\n🔗 Manual Testing Steps:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Click "Continue with Google"');
  console.log('3. Complete Google OAuth flow');
  console.log('4. Verify redirect to employer dashboard');
  console.log('5. Check that dashboard loads with Google profile data');
}

// Run the tests
runAllTests().catch(console.error);
