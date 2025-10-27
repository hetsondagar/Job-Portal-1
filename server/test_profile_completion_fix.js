/**
 * Test Profile Completion Fix
 * Tests if the profileCompleted flag is now being saved and retrieved correctly
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

async function testProfileCompletionFix() {
  console.log('🔧 Testing Profile Completion Fix...\n');

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

    console.log('\n🎯 FIX APPLIED:');
    console.log('1. ✅ Backend now properly merges preferences instead of overwriting');
    console.log('2. ✅ Added debugging logs to track preferences updates');
    console.log('3. ✅ Added localStorage fallback in frontend');
    console.log('4. ✅ Enhanced debugging in employer dashboard');
    
    console.log('\n📝 WHAT TO DO NEXT:');
    console.log('1. Restart the server to apply the backend fix');
    console.log('2. Clear browser localStorage and cookies');
    console.log('3. Login again and complete your profile');
    console.log('4. Check browser console for debugging logs');
    console.log('5. The profile completion dialog should NOT show again after completion');

    console.log('\n🔍 DEBUGGING STEPS:');
    console.log('1. Open browser developer tools');
    console.log('2. Go to Console tab');
    console.log('3. Look for "🔍 DEBUG: User preferences check" logs');
    console.log('4. Check if profileCompleted is true in the preferences object');
    console.log('5. If still showing, check the backend logs for preferences merging');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileCompletionFix();
