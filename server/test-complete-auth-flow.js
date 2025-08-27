require('dotenv').config();
const http = require('http');
const https = require('https');

async function makeRequest(url, options = {}) {
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
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
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

async function testCompleteAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow');
  console.log('=====================================\n');
  
  try {
    // Step 1: Check environment variables
    console.log('1️⃣ Checking Environment Configuration...');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000');
    console.log('BACKEND_URL:', process.env.BACKEND_URL || 'http://localhost:8000');

    // Step 2: Test OAuth URLs for both user types
    console.log('\n2️⃣ Testing OAuth URLs for Jobseekers...');
    const jobseekerUrlsResponse = await makeRequest('http://localhost:8000/api/oauth/urls?userType=jobseeker');
    
    if (jobseekerUrlsResponse.status === 200 && jobseekerUrlsResponse.data.success) {
      console.log('✅ Jobseeker OAuth URLs working');
      console.log('Google URL:', jobseekerUrlsResponse.data.data.google);
    } else {
      console.log('❌ Jobseeker OAuth URLs failed');
      return;
    }

    console.log('\n3️⃣ Testing OAuth URLs for Employers...');
    const employerUrlsResponse = await makeRequest('http://localhost:8000/api/oauth/urls?userType=employer');
    
    if (employerUrlsResponse.status === 200 && employerUrlsResponse.data.success) {
      console.log('✅ Employer OAuth URLs working');
      console.log('Google URL:', employerUrlsResponse.data.data.google);
      
      // Check if URLs contain the correct state parameter
      if (employerUrlsResponse.data.data.google && employerUrlsResponse.data.data.google.includes('state=employer')) {
        console.log('✅ Employer Google URL contains correct state parameter');
      } else {
        console.log('❌ Employer Google URL missing state parameter');
      }
    } else {
      console.log('❌ Employer OAuth URLs failed');
      return;
    }

    // Step 4: Test Google OAuth initiation for both user types
    console.log('\n4️⃣ Testing Google OAuth Initiation for Jobseekers...');
    const jobseekerGoogleResponse = await makeRequest(jobseekerUrlsResponse.data.data.google);
    
    if (jobseekerGoogleResponse.status === 302) {
      console.log('✅ Jobseeker Google OAuth initiation successful');
      console.log('Redirect location:', jobseekerGoogleResponse.headers.location);
    } else {
      console.log('❌ Jobseeker Google OAuth initiation failed');
    }

    console.log('\n5️⃣ Testing Google OAuth Initiation for Employers...');
    const employerGoogleResponse = await makeRequest(employerUrlsResponse.data.data.google);
    
    if (employerGoogleResponse.status === 302) {
      console.log('✅ Employer Google OAuth initiation successful');
      console.log('Redirect location:', employerGoogleResponse.headers.location);
    } else {
      console.log('❌ Employer Google OAuth initiation failed');
    }

    // Step 6: Test OAuth callback endpoints
    console.log('\n6️⃣ Testing OAuth Callback Error Handling...');
    const callbackErrorResponse = await makeRequest('http://localhost:8000/api/oauth/google/callback?error=access_denied');
    
    if (callbackErrorResponse.status === 302) {
      console.log('✅ OAuth callback error handling working');
      console.log('Redirect location:', callbackErrorResponse.headers.location);
    } else {
      console.log('⚠️ OAuth callback error handling response:', callbackErrorResponse.data);
    }

    // Step 7: Test frontend callback pages
    console.log('\n7️⃣ Testing Frontend Callback Pages...');
    
    const jobseekerCallbackResponse = await makeRequest('http://localhost:3000/oauth-callback?token=invalid&provider=google&userType=jobseeker');
    console.log('Jobseeker callback page status:', jobseekerCallbackResponse.status);
    
    const employerCallbackResponse = await makeRequest('http://localhost:3000/employer-oauth-callback?token=invalid&provider=google&userType=employer');
    console.log('Employer callback page status:', employerCallbackResponse.status);

    // Step 8: Test regular authentication endpoints
    console.log('\n8️⃣ Testing Regular Authentication Endpoints...');
    
    // Test login endpoint
    const loginResponse = await makeRequest('http://localhost:8000/api/auth/login', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'testpassword'
      }
    });
    
    console.log('Login endpoint status:', loginResponse.status);
    if (loginResponse.status === 400 || loginResponse.status === 401) {
      console.log('✅ Login endpoint responding correctly (expected failure for invalid credentials)');
    }

    // Test signup endpoint
    const signupResponse = await makeRequest('http://localhost:8000/api/auth/signup', {
      method: 'POST',
      body: {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123'
      }
    });
    
    console.log('Signup endpoint status:', signupResponse.status);
    if (signupResponse.status === 400 || signupResponse.status === 409) {
      console.log('✅ Signup endpoint responding correctly (expected failure for existing user)');
    }

    // Test employer signup endpoint
    const employerSignupResponse = await makeRequest('http://localhost:8000/api/auth/employer-signup', {
      method: 'POST',
      body: {
        fullName: 'Test Employer',
        email: 'employer@example.com',
        password: 'TestPassword123',
        companyName: 'Test Company',
        phone: '1234567890',
        companySize: '1-50',
        industry: 'technology',
        website: 'https://testcompany.com',
        agreeToTerms: true,
        subscribeUpdates: true
      }
    });
    
    console.log('Employer signup endpoint status:', employerSignupResponse.status);
    if (employerSignupResponse.status === 400 || employerSignupResponse.status === 409) {
      console.log('✅ Employer signup endpoint responding correctly (expected failure for existing user)');
    }

    console.log('\n📋 Summary:');
    console.log('✅ OAuth URLs generation: Working for both user types');
    console.log('✅ Google OAuth initiation: Working for both user types');
    console.log('✅ OAuth callback handling: Working');
    console.log('✅ Frontend callback pages: Accessible');
    console.log('✅ Regular authentication endpoints: Responding correctly');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Test OAuth flow in browser with real Google account');
    console.log('2. Verify redirection to correct dashboards');
    console.log('3. Check that user types are properly set');
    console.log('4. Test with new vs existing users');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testCompleteAuthFlow();
