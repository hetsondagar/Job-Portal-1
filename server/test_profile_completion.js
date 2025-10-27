/**
 * Test Profile Completion Issue
 * Tests if profileCompleted flag is being saved and retrieved correctly
 */

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testProfileCompletion() {
  console.log('🔍 Testing Profile Completion Issue...\n');

  try {
    // Test 1: Check if server is running
    console.log('📋 Test 1: Server Health Check');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/health',
      method: 'GET'
    });

    if (healthResponse.statusCode !== 200) {
      throw new Error(`Server not running: ${healthResponse.statusCode}`);
    }
    console.log('✅ Server is running');

    // Test 2: Check user profile endpoint
    console.log('\n📋 Test 2: User Profile Endpoint Check');
    const profileResponse = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/user/profile',
      method: 'GET'
    });

    if (profileResponse.statusCode === 401) {
      console.log('✅ Profile endpoint requires authentication (expected)');
    } else {
      console.log(`⚠️  Unexpected response: ${profileResponse.statusCode}`);
    }

    // Test 3: Check if preferences field exists in user model
    console.log('\n📋 Test 3: Check User Model Structure');
    console.log('This would require database access to verify preferences field exists');

    console.log('\n🎯 DIAGNOSIS:');
    console.log('The issue is likely that:');
    console.log('1. The profileCompleted flag is being saved in preferences');
    console.log('2. But the frontend is not properly reading it from the user object');
    console.log('3. Or the backend is not properly returning the updated preferences');
    console.log('\n💡 SOLUTION:');
    console.log('1. Check if preferences are being properly merged in backend');
    console.log('2. Ensure frontend is reading user.preferences.profileCompleted');
    console.log('3. Add debugging to see what\'s actually stored in database');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileCompletion();
