require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🔧 OAuth Flow Verification Test');
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

async function testOAuthUrls() {
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

async function runTests() {
  console.log('🚀 Starting OAuth flow verification tests...\n');
  
  // Test server status first
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('❌ Cannot proceed without running server');
    return;
  }
  
  // Test OAuth URL generation
  const oauthUrlsOk = await testOAuthUrls();
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Server Status: ✅ PASS`);
  console.log(`OAuth URL Generation: ${oauthUrlsOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (oauthUrlsOk) {
    console.log('\n🎉 OAuth URL generation is working correctly!');
  } else {
    console.log('\n⚠️ OAuth URL generation has issues.');
  }
  
  console.log('\n🔧 FIXES IMPLEMENTED:');
  console.log('1. ✅ Enhanced state parameter detection in backend OAuth callback');
  console.log('2. ✅ Added explicit logging for redirect decisions');
  console.log('3. ✅ Force user type to employer in employer OAuth callback');
  console.log('4. ✅ Added safety check in jobseeker OAuth callback');
  console.log('5. ✅ Added error handling with fallback redirects');
  console.log('6. ✅ Enhanced logging for debugging');
  
  console.log('\n🔗 Manual Testing Steps:');
  console.log('\n📋 Test Employer OAuth Flow:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Click "Continue with Google"');
  console.log('3. Complete Google OAuth flow');
  console.log('4. Should redirect to /employer-oauth-callback');
  console.log('5. Should then redirect to /employer-dashboard');
  
  console.log('\n📋 Test Jobseeker OAuth Flow:');
  console.log('1. Go to http://localhost:3000/login');
  console.log('2. Click "Continue with Google"');
  console.log('3. Complete Google OAuth flow');
  console.log('4. Should redirect to /oauth-callback');
  console.log('5. Should then redirect to /dashboard');
  
  console.log('\n🔍 Debugging:');
  console.log('- Check backend console for detailed OAuth logs');
  console.log('- Check browser console for frontend callback logs');
  console.log('- Check browser network tab for redirect URLs');
  console.log('- Check localStorage for user data and userType');
  
  console.log('\n✅ Expected Behavior:');
  console.log('- Employer OAuth: employer-login → /employer-oauth-callback → /employer-dashboard');
  console.log('- Jobseeker OAuth: login → /oauth-callback → /dashboard');
  console.log('- No cross-redirects between user types');
  
  console.log('\n🐛 If Still Not Working:');
  console.log('1. Check if Google OAuth is properly configured');
  console.log('2. Check if backend is detecting state parameter');
  console.log('3. Check if user type is being set correctly');
  console.log('4. Check if there are any JavaScript errors');
  console.log('5. Check if there are any network/CORS issues');
}

// Run the tests
runTests().catch(console.error);
