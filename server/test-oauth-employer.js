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
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
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

async function testOAuthEmployerFlow() {
  console.log('🧪 Testing OAuth Employer Flow');
  
  try {
    // Step 1: Get OAuth URLs for employer
    console.log('\n1️⃣ Getting OAuth URLs for employer...');
    const urlsResponse = await makeRequest('http://localhost:8000/api/oauth/urls?userType=employer', {
      method: 'GET'
    });

    console.log('OAuth URLs response status:', urlsResponse.status);
    console.log('OAuth URLs response:', urlsResponse.data);

    if (urlsResponse.status === 200 && urlsResponse.data.success && urlsResponse.data.data) {
      console.log('✅ OAuth URLs received successfully');
      console.log('Google URL:', urlsResponse.data.data.google);
      console.log('Facebook URL:', urlsResponse.data.data.facebook);
      
      // Check if URLs contain the correct state parameter
      if (urlsResponse.data.data.google && urlsResponse.data.data.google.includes('state=employer')) {
        console.log('✅ Google URL contains correct state parameter');
      } else {
        console.log('❌ Google URL missing state parameter');
      }
      
      if (urlsResponse.data.data.facebook && urlsResponse.data.data.facebook.includes('state=employer')) {
        console.log('✅ Facebook URL contains correct state parameter');
      } else {
        console.log('❌ Facebook URL missing state parameter');
      }

      // Step 2: Test Google OAuth endpoint directly
      console.log('\n2️⃣ Testing Google OAuth endpoint...');
      const googleOAuthResponse = await makeRequest(urlsResponse.data.data.google, {
        method: 'GET'
      });

      console.log('Google OAuth response status:', googleOAuthResponse.status);
      console.log('Google OAuth response:', googleOAuthResponse.data);

      if (googleOAuthResponse.status === 503) {
        console.log('❌ Google OAuth is not configured - missing credentials');
        console.log('💡 To fix this, you need to:');
        console.log('   1. Set up a Google OAuth application in Google Cloud Console');
        console.log('   2. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file');
        console.log('   3. Configure the authorized redirect URIs');
      } else if (googleOAuthResponse.status === 302) {
        console.log('✅ Google OAuth is configured and redirecting to Google');
      } else {
        console.log('⚠️ Unexpected response from Google OAuth endpoint');
      }

    } else {
      console.log('❌ Failed to get OAuth URLs');
      console.log('Response:', urlsResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testOAuthEmployerFlow();
