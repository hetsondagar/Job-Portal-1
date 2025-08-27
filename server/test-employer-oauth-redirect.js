require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🧪 Employer OAuth Redirect Test');
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

async function testOAuthUrlsForEmployer() {
  console.log('\n1️⃣ Testing OAuth URLs for Employer...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=employer`);
    
    console.log('📊 OAuth URLs Response Status:', response.status);
    console.log('📊 OAuth URLs Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ OAuth URLs endpoint working for employer');
      
      if (response.data.data.google) {
        const googleUrl = response.data.data.google;
        console.log('✅ Google OAuth URL available for employer');
        console.log('🔗 Google URL:', googleUrl);
        
        // Check if the URL contains the employer state parameter
        if (googleUrl.includes('state=employer')) {
          console.log('✅ Google URL correctly includes employer state parameter');
          return true;
        } else {
          console.log('❌ Google URL missing employer state parameter');
          return false;
        }
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

async function testOAuthUrlsForJobseeker() {
  console.log('\n2️⃣ Testing OAuth URLs for Jobseeker...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=jobseeker`);
    
    console.log('📊 OAuth URLs Response Status:', response.status);
    console.log('📊 OAuth URLs Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ OAuth URLs endpoint working for jobseeker');
      
      if (response.data.data.google) {
        const googleUrl = response.data.data.google;
        console.log('✅ Google OAuth URL available for jobseeker');
        console.log('🔗 Google URL:', googleUrl);
        
        // Check if the URL does NOT contain the employer state parameter
        if (!googleUrl.includes('state=employer')) {
          console.log('✅ Google URL correctly does not include employer state parameter');
          return true;
        } else {
          console.log('❌ Google URL incorrectly includes employer state parameter');
          return false;
        }
      } else {
        console.log('❌ Google OAuth URL not available for jobseeker');
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

async function testDefaultOAuthUrls() {
  console.log('\n3️⃣ Testing Default OAuth URLs (no userType specified)...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls`);
    
    console.log('📊 Default OAuth URLs Response Status:', response.status);
    console.log('📊 Default OAuth URLs Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Default OAuth URLs endpoint working');
      
      if (response.data.data.google) {
        const googleUrl = response.data.data.google;
        console.log('✅ Google OAuth URL available for default');
        console.log('🔗 Google URL:', googleUrl);
        
        // Check if the URL does NOT contain the employer state parameter (should default to jobseeker)
        if (!googleUrl.includes('state=employer')) {
          console.log('✅ Default Google URL correctly does not include employer state parameter');
          return true;
        } else {
          console.log('❌ Default Google URL incorrectly includes employer state parameter');
          return false;
        }
      } else {
        console.log('❌ Google OAuth URL not available for default');
        return false;
      }
    } else {
      console.log('❌ Default OAuth URLs endpoint failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Default OAuth URLs test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting employer OAuth redirect tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test OAuth URLs for different user types
  const employerUrlsOk = await testOAuthUrlsForEmployer();
  const jobseekerUrlsOk = await testOAuthUrlsForJobseeker();
  const defaultUrlsOk = await testDefaultOAuthUrls();
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ✅ PASS`);
  console.log(`Employer OAuth URLs: ${employerUrlsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Jobseeker OAuth URLs: ${jobseekerUrlsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Default OAuth URLs: ${defaultUrlsOk ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = [true, employerUrlsOk, jobseekerUrlsOk, defaultUrlsOk].filter(Boolean).length;
  const totalTests = 4;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 OAuth URL generation is working correctly!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n🔗 Frontend Testing Steps:');
  console.log('\n📋 Employer OAuth Flow:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Click "Continue with Google"');
  console.log('3. Check the URL in browser - should contain "state=employer"');
  console.log('4. Complete Google OAuth flow');
  console.log('5. Should redirect to /employer-oauth-callback');
  console.log('6. Should then redirect to /employer-dashboard');
  
  console.log('\n📋 Jobseeker OAuth Flow:');
  console.log('1. Go to http://localhost:3000/login');
  console.log('2. Click "Continue with Google"');
  console.log('3. Check the URL in browser - should NOT contain "state=employer"');
  console.log('4. Complete Google OAuth flow');
  console.log('5. Should redirect to /oauth-callback');
  console.log('6. Should then redirect to /dashboard');
  
  console.log('\n🔍 Debugging Steps:');
  console.log('1. Check browser network tab for OAuth redirect URLs');
  console.log('2. Verify state parameter is being passed correctly');
  console.log('3. Check backend logs for OAuth callback processing');
  console.log('4. Verify user type is being set correctly in database');
  
  console.log('\n✅ Expected Behavior:');
  console.log('- Employer OAuth URLs should include "state=employer"');
  console.log('- Jobseeker OAuth URLs should NOT include "state=employer"');
  console.log('- Backend should detect state parameter and set user type accordingly');
  console.log('- OAuth callbacks should redirect to correct dashboard based on user type');
  
  console.log('\n🐛 Common Issues:');
  console.log('- State parameter not being passed in OAuth URL');
  console.log('- Backend not detecting state parameter correctly');
  console.log('- User type not being set during OAuth callback');
  console.log('- Frontend not using correct OAuth callback page');
}

// Run the tests
runTests().catch(console.error);
