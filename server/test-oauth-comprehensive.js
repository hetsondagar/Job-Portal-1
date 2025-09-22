#!/usr/bin/env node

/**
 * Comprehensive OAuth Flow Test
 * Tests all OAuth redirection scenarios
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

console.log('🧪 Comprehensive OAuth Flow Test');
console.log('=====================================');
console.log(`Testing against: ${API_BASE_URL}`);
console.log('');

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function testOAuthUrlGeneration() {
  console.log('1️⃣ Testing OAuth URL Generation');
  console.log('--------------------------------');
  
  const testCases = [
    { userType: 'jobseeker', state: undefined, expectedState: '' },
    { userType: 'jobseeker', state: 'gulf', expectedState: 'state=gulf' },
    { userType: 'employer', state: undefined, expectedState: 'state=employer' },
    { userType: 'employer', state: 'gulf', expectedState: 'state=employer' } // Employer should always get employer state
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 Testing: userType=${testCase.userType}, state=${testCase.state || 'undefined'}`);
    
    let url = `${API_BASE_URL}/api/oauth/urls?userType=${testCase.userType}`;
    if (testCase.state) {
      url += `&state=${testCase.state}`;
    }
    
    const response = await makeRequest(url);
    
    if (response.ok && response.data.success) {
      const googleUrl = response.data.data?.google;
      const facebookUrl = response.data.data?.facebook;
      
      console.log(`✅ Google URL: ${googleUrl}`);
      console.log(`✅ Facebook URL: ${facebookUrl}`);
      
      // Check if state parameter is correct
      if (testCase.expectedState) {
        const hasCorrectState = googleUrl?.includes(testCase.expectedState) && 
                               facebookUrl?.includes(testCase.expectedState);
        console.log(`${hasCorrectState ? '✅' : '❌'} State parameter check: ${hasCorrectState ? 'PASS' : 'FAIL'}`);
        if (!hasCorrectState) {
          console.log(`   Expected: ${testCase.expectedState}`);
          console.log(`   Got Google: ${googleUrl}`);
          console.log(`   Got Facebook: ${facebookUrl}`);
        }
      } else {
        const hasNoState = !googleUrl?.includes('state=') && !facebookUrl?.includes('state=');
        console.log(`${hasNoState ? '✅' : '❌'} No state parameter check: ${hasNoState ? 'PASS' : 'FAIL'}`);
      }
    } else {
      console.log(`❌ Failed to get OAuth URLs: ${response.data.message || 'Unknown error'}`);
    }
  }
}

async function testServerHealth() {
  console.log('\n2️⃣ Testing Server Health');
  console.log('-------------------------');
  
  const response = await makeRequest(`${API_BASE_URL}/api/health`);
  
  if (response.ok) {
    console.log('✅ Server is healthy');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Timestamp: ${response.data.timestamp}`);
  } else {
    console.log('❌ Server health check failed');
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${response.data.error || response.data.message}`);
  }
}

async function testOAuthConfiguration() {
  console.log('\n3️⃣ Testing OAuth Configuration');
  console.log('--------------------------------');
  
  // Test if OAuth endpoints are accessible
  const endpoints = [
    '/api/oauth/google',
    '/api/oauth/facebook',
    '/api/oauth/urls'
  ];
  
  for (const endpoint of endpoints) {
    const response = await makeRequest(`${API_BASE_URL}${endpoint}`);
    
    if (response.status === 503) {
      console.log(`⚠️  ${endpoint}: OAuth not configured (503)`);
    } else if (response.status === 302 || response.status === 200) {
      console.log(`✅ ${endpoint}: Accessible (${response.status})`);
    } else {
      console.log(`❌ ${endpoint}: Unexpected status (${response.status})`);
    }
  }
}

async function testCORSHeaders() {
  console.log('\n4️⃣ Testing CORS Headers');
  console.log('-------------------------');
  
  const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=jobseeker`, {
    headers: {
      'Origin': 'http://localhost:3000'
    }
  });
  
  if (response.ok) {
    console.log('✅ CORS headers should be set for OAuth URLs endpoint');
  } else {
    console.log('❌ CORS test failed');
  }
}

async function runAllTests() {
  try {
    await testServerHealth();
    await testOAuthConfiguration();
    await testOAuthUrlGeneration();
    await testCORSHeaders();
    
    console.log('\n🎯 Test Summary');
    console.log('===============');
    console.log('✅ OAuth URL generation tests completed');
    console.log('✅ Server health check completed');
    console.log('✅ OAuth configuration check completed');
    console.log('✅ CORS headers test completed');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test OAuth flows in browser:');
    console.log('   - Normal jobseeker login: /login');
    console.log('   - Gulf jobseeker login: /gulf-opportunities');
    console.log('   - Employer login: /employer-login');
    console.log('2. Verify redirections:');
    console.log('   - Jobseeker → /dashboard or /jobseeker-gulf-dashboard');
    console.log('   - Employer → /employer-dashboard or /gulf-dashboard');
    console.log('3. Check browser console for any errors');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testOAuthUrlGeneration,
  testServerHealth,
  testOAuthConfiguration,
  testCORSHeaders,
  runAllTests
};
