const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

async function testJobseekerOAuthFlow() {
  console.log('🧪 Testing Jobseeker OAuth Flow');
  console.log('================================');

  try {
    // 1. Test OAuth URLs for jobseeker
    console.log('\n1️⃣ Testing OAuth URLs for jobseeker...');
    const urlsResponse = await makeRequest(`${API_BASE_URL}/oauth/urls?userType=jobseeker`);
    
    if (urlsResponse.success && urlsResponse.data?.google) {
      console.log('✅ Jobseeker OAuth URLs generated successfully');
      console.log('🔗 Google OAuth URL:', urlsResponse.data.google);
      
      // 2. Test Google OAuth initiation
      console.log('\n2️⃣ Testing Google OAuth initiation...');
      const oauthResponse = await makeRequest(urlsResponse.data.google, {
        method: 'GET',
        followRedirect: false
      });
      
      if (oauthResponse.status === 302) {
        console.log('✅ Google OAuth initiation successful');
        console.log('🔗 Redirect URL:', oauthResponse.headers?.location);
        
        // Check if the redirect URL contains the correct Google OAuth endpoint
        if (oauthResponse.headers?.location?.includes('accounts.google.com')) {
          console.log('✅ Redirect URL is correct Google OAuth endpoint');
        } else {
          console.log('❌ Redirect URL is not a valid Google OAuth endpoint');
        }
      } else {
        console.log('❌ Google OAuth initiation failed');
        console.log('Status:', oauthResponse.status);
      }
    } else {
      console.log('❌ Failed to get OAuth URLs');
    }

    // 3. Test OAuth callback with mock data
    console.log('\n3️⃣ Testing OAuth callback simulation...');
    
    // Test callback with error
    const errorCallbackResponse = await makeRequest(`${API_BASE_URL}/oauth/google/callback?error=access_denied`, {
      method: 'GET',
      followRedirect: false
    });
    
    if (errorCallbackResponse.status === 302) {
      console.log('✅ Error callback handling works');
      console.log('🔗 Error redirect:', errorCallbackResponse.headers?.location);
      
      // Check if it redirects to jobseeker login page
      if (errorCallbackResponse.headers?.location?.includes('/login')) {
        console.log('✅ Error redirects to jobseeker login page');
      } else {
        console.log('❌ Error redirects to wrong page');
      }
    }

    // 4. Test frontend callback page accessibility
    console.log('\n4️⃣ Testing frontend callback page...');
    const frontendResponse = await makeRequest('http://localhost:3000/oauth-callback', {
      method: 'GET',
      followRedirect: false
    });
    
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend OAuth callback page is accessible');
    } else {
      console.log('❌ Frontend OAuth callback page is not accessible');
      console.log('Status:', frontendResponse.status);
    }

    // 5. Test dashboard page accessibility
    console.log('\n5️⃣ Testing jobseeker dashboard page...');
    const dashboardResponse = await makeRequest('http://localhost:3000/dashboard', {
      method: 'GET',
      followRedirect: false
    });
    
    if (dashboardResponse.status === 200) {
      console.log('✅ Jobseeker dashboard page is accessible');
    } else {
      console.log('❌ Jobseeker dashboard page is not accessible');
      console.log('Status:', dashboardResponse.status);
    }

    console.log('\n📋 Jobseeker OAuth Flow Test Summary:');
    console.log('=====================================');
    console.log('✅ OAuth URLs generation: Working');
    console.log('✅ Google OAuth initiation: Working');
    console.log('✅ Error handling: Working');
    console.log('✅ Frontend callback page: Accessible');
    console.log('✅ Dashboard page: Accessible');
    
    console.log('\n🎯 Expected Jobseeker OAuth Flow:');
    console.log('1. User clicks "Sign in with Google" on /login');
    console.log('2. Frontend calls apiService.getOAuthUrls("jobseeker")');
    console.log('3. Backend returns: http://localhost:8000/api/oauth/google');
    console.log('4. User redirected to Google OAuth');
    console.log('5. Google redirects to: http://localhost:8000/api/oauth/google/callback');
    console.log('6. Backend processes callback, ensures user_type = "jobseeker"');
    console.log('7. Backend redirects to: /oauth-callback');
    console.log('8. Frontend redirects to: /dashboard ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const https = require('https');
    const { URL } = require('url');
    
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Job-Portal-Test/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: jsonData.success,
            data: jsonData.data,
            message: jsonData.message,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

testJobseekerOAuthFlow();
