const fetch = require('node-fetch');

async function testOAuthFlow() {
  console.log('🔍 Testing OAuth flow...');
  
  // Test 1: Check if server is running
  try {
    const response = await fetch('http://localhost:8000/api/oauth/urls?userType=jobseeker');
    const data = await response.json();
    console.log('✅ Server is running, OAuth URLs:', data);
  } catch (error) {
    console.error('❌ Server not running or OAuth not configured:', error.message);
    return;
  }
  
  // Test 2: Check if user profile endpoint works with a test token
  try {
    const testToken = 'test-token';
    const response = await fetch('http://localhost:8000/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔍 Profile endpoint response status:', response.status);
    const data = await response.json();
    console.log('🔍 Profile endpoint response:', data);
    
    if (response.status === 401) {
      console.log('✅ Profile endpoint is working (correctly rejecting invalid token)');
    } else {
      console.log('⚠️ Unexpected response from profile endpoint');
    }
  } catch (error) {
    console.error('❌ Error testing profile endpoint:', error.message);
  }
  
  // Test 3: Check if the OAuth callback URL is accessible
  try {
    const response = await fetch('http://localhost:8000/api/oauth/google/callback?error=test');
    console.log('🔍 OAuth callback response status:', response.status);
    console.log('✅ OAuth callback endpoint is accessible');
  } catch (error) {
    console.error('❌ Error testing OAuth callback:', error.message);
  }
}

testOAuthFlow().catch(console.error);
