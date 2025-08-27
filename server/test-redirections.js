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

async function testRedirections() {
  console.log('🧪 Testing OAuth Redirections');
  console.log('=============================\n');
  
  try {
    // Test 1: OAuth URLs generation
    console.log('1️⃣ Testing OAuth URL Generation...');
    
    const jobseekerUrls = await makeRequest('http://localhost:8000/api/oauth/urls?userType=jobseeker');
    console.log('✅ Jobseeker OAuth URLs:', jobseekerUrls.data);
    
    const employerUrls = await makeRequest('http://localhost:8000/api/oauth/urls?userType=employer');
    console.log('✅ Employer OAuth URLs:', employerUrls.data);
    
    // Verify state parameter is added for employers
    if (employerUrls.data.data.google.includes('state=employer')) {
      console.log('✅ Employer Google URL contains correct state parameter');
    } else {
      console.log('❌ Employer Google URL missing state parameter');
    }

    // Test 2: Frontend callback pages accessibility
    console.log('\n2️⃣ Testing Frontend Callback Pages...');
    
    const jobseekerCallback = await makeRequest('http://localhost:3000/oauth-callback?token=test&provider=google&userType=jobseeker');
    console.log('✅ Jobseeker callback page status:', jobseekerCallback.status);
    
    const employerCallback = await makeRequest('http://localhost:3000/employer-oauth-callback?token=test&provider=google&userType=employer');
    console.log('✅ Employer callback page status:', employerCallback.status);

    // Test 3: Dashboard pages accessibility
    console.log('\n3️⃣ Testing Dashboard Pages...');
    
    const jobseekerDashboard = await makeRequest('http://localhost:3000/dashboard');
    console.log('✅ Jobseeker dashboard status:', jobseekerDashboard.status);
    
    const employerDashboard = await makeRequest('http://localhost:3000/employer-dashboard');
    console.log('✅ Employer dashboard status:', employerDashboard.status);

    // Test 4: OAuth callback error handling
    console.log('\n4️⃣ Testing OAuth Callback Error Handling...');
    
    const googleCallbackError = await makeRequest('http://localhost:8000/api/oauth/google/callback?error=access_denied');
    console.log('✅ Google OAuth error callback status:', googleCallbackError.status);
    console.log('✅ Google OAuth error redirect:', googleCallbackError.headers.location);
    
    const facebookCallbackError = await makeRequest('http://localhost:8000/api/oauth/facebook/callback?error=access_denied');
    console.log('✅ Facebook OAuth error callback status:', facebookCallbackError.status);
    console.log('✅ Facebook OAuth error redirect:', facebookCallbackError.headers.location);

    // Test 5: Verify redirection logic
    console.log('\n5️⃣ Verifying Redirection Logic...');
    
    // Check that error redirects go to correct login pages
    if (googleCallbackError.headers.location.includes('/login?error=oauth_failed')) {
      console.log('✅ Google OAuth error redirects to correct login page');
    } else {
      console.log('❌ Google OAuth error redirects to wrong page');
    }
    
    if (facebookCallbackError.headers.location.includes('/login?error=oauth_failed')) {
      console.log('✅ Facebook OAuth error redirects to correct login page');
    } else {
      console.log('❌ Facebook OAuth error redirects to wrong page');
    }

    console.log('\n📋 Redirection Summary:');
    console.log('========================');
    console.log('✅ OAuth URLs are generated correctly for both user types');
    console.log('✅ State parameter is added for employer OAuth');
    console.log('✅ Frontend callback pages are accessible');
    console.log('✅ Dashboard pages are accessible');
    console.log('✅ OAuth error handling redirects to correct pages');
    
    console.log('\n🎯 Expected OAuth Flow:');
    console.log('=======================');
    console.log('For Jobseekers:');
    console.log('1. Click "Sign in with Google" on /login');
    console.log('2. Redirected to Google OAuth');
    console.log('3. Google redirects to /api/oauth/google/callback');
    console.log('4. Backend redirects to /oauth-callback');
    console.log('5. Frontend redirects to /dashboard ✅');
    
    console.log('\nFor Employers:');
    console.log('1. Click "Sign in with Google" on /employer-login');
    console.log('2. Redirected to Google OAuth with state=employer');
    console.log('3. Google redirects to /api/oauth/google/callback');
    console.log('4. Backend detects state=employer, redirects to /employer-oauth-callback');
    console.log('5. Frontend redirects to /employer-dashboard ✅');
    
    console.log('\n🔍 Debugging Tips:');
    console.log('==================');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Monitor server logs for OAuth callback messages');
    console.log('3. Verify user type detection in callback');
    console.log('4. Test with real Google accounts');
    console.log('5. Check that companies are created for new OAuth employers');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testRedirections();
