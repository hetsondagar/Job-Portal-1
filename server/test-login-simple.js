#!/usr/bin/env node

/**
 * Simple Login Test
 * Test the login response structure
 */

const http = require('http');

function testLogin() {
  const postData = JSON.stringify({
    email: 'admin@campus.com',
    password: 'admin@123'
  });

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n📋 Login Response:');
        console.log('Success:', response.success);
        console.log('Message:', response.message);
        
        if (response.data) {
          console.log('\n📋 Response Data:');
          console.log('User Type:', response.data.user?.userType);
          console.log('Redirect To:', response.data.redirectTo);
          console.log('Token Present:', !!response.data.token);
          
          if (response.data.user) {
            console.log('\n📋 User Details:');
            console.log('ID:', response.data.user.id);
            console.log('Email:', response.data.user.email);
            console.log('User Type:', response.data.user.userType);
          }
        }
        
        if (response.data?.redirectTo === '/admin/dashboard') {
          console.log('\n✅ Correct redirect URL for superadmin!');
        } else {
          console.log('\n❌ Wrong redirect URL:', response.data?.redirectTo);
        }
        
      } catch (error) {
        console.error('Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Run the test
if (require.main === module) {
  testLogin();
}

module.exports = { testLogin };
