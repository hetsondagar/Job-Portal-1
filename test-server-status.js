const fetch = require('node-fetch');

async function testServerStatus() {
  console.log('🔍 Testing server status and profile endpoints...');
  
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
    console.error('❌ Error testing profile endpoint:', error.message);
  }
  
  // Test 3: Check avatar endpoint without token
  try {
    const response = await fetch('http://localhost:8000/api/user/avatar', {
      method: 'POST'
    });
    console.log('🔍 Avatar endpoint without token - Status:', response.status);
    const data = await response.json();
    console.log('🔍 Response:', data);
  } catch (error) {
    console.error('❌ Error testing avatar endpoint:', error.message);
  }
  
  // Test 4: Test profile update with invalid data
  try {
    const response = await fetch('http://localhost:8000/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        expectedSalary: 'invalid-salary' // This should trigger validation error
      })
    });
    console.log('🔍 Profile update with invalid data - Status:', response.status);
    const data = await response.json();
    console.log('🔍 Response:', data);
  } catch (error) {
    console.error('❌ Error testing profile update:', error.message);
  }
}

testServerStatus().catch(console.error);
