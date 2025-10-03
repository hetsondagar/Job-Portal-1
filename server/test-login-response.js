#!/usr/bin/env node

/**
 * Test Login Response
 * This script tests the login response to see the redirect URL
 */

const fetch = require('node-fetch');

async function testLoginResponse() {
  try {
    console.log('🔧 Testing login response...');
    
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@campus.com',
        password: 'admin@123'
      })
    });
    
    const data = await response.json();
    
    console.log('📋 Login Response:');
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Message:', data.message);
    
    if (data.data) {
      console.log('\n📋 Response Data:');
      console.log('User Type:', data.data.user?.userType);
      console.log('Redirect To:', data.data.redirectTo);
      console.log('Token:', data.data.token ? 'Present' : 'Missing');
      
      if (data.data.user) {
        console.log('\n📋 User Data:');
        console.log('ID:', data.data.user.id);
        console.log('Email:', data.data.user.email);
        console.log('User Type:', data.data.user.userType);
      }
    }
    
    if (data.data?.redirectTo) {
      console.log('\n✅ Redirect URL found:', data.data.redirectTo);
    } else {
      console.log('\n❌ No redirect URL in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing login response:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testLoginResponse();
}

module.exports = { testLoginResponse };
