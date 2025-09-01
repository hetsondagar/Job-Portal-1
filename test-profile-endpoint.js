const fetch = require('node-fetch');

async function testProfileEndpoint() {
  console.log('🔍 Testing User Profile Endpoint...');
  
  // Test 1: Check if server is running
  try {
    const response = await fetch('http://localhost:8000/api/oauth/urls?userType=jobseeker');
    const data = await response.json();
    console.log('✅ Server is running');
  } catch (error) {
    console.error('❌ Server not running:', error.message);
    return;
  }
  
  // Test 2: Check profile endpoint without token
  try {
    const response = await fetch('http://localhost:8000/api/user/profile');
    console.log('🔍 Profile endpoint without token - Status:', response.status);
    const data = await response.json();
    console.log('🔍 Response:', data);
  } catch (error) {
    console.error('❌ Error testing profile endpoint without token:', error.message);
  }
  
  // Test 3: Check profile endpoint with invalid token
  try {
    const response = await fetch('http://localhost:8000/api/user/profile', {
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('🔍 Profile endpoint with invalid token - Status:', response.status);
    const data = await response.json();
    console.log('🔍 Response:', data);
  } catch (error) {
    console.error('❌ Error testing profile endpoint with invalid token:', error.message);
  }
  
  // Test 4: Check if the endpoint exists
  try {
    const response = await fetch('http://localhost:8000/api/user/profile', {
      method: 'OPTIONS'
    });
    console.log('🔍 Profile endpoint OPTIONS - Status:', response.status);
    console.log('🔍 Headers:', response.headers);
  } catch (error) {
    console.error('❌ Error testing profile endpoint OPTIONS:', error.message);
  }
}

testProfileEndpoint().catch(console.error);
