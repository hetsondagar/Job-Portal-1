require('dotenv').config();
const https = require('https');
const http = require('http');

console.log('🔍 Employer Redirect Debug Script');
console.log('==================================\n');

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
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
      },
      timeout: 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testEmployerRegistration() {
  console.log('1️⃣ Testing Employer Registration...');
  
  const testEmployer = {
    fullName: 'Test Employer',
    email: 'testemployer@example.com',
    password: 'TestPass123',
    companyName: 'Test Company',
    phone: '1234567890',
    companySize: '1-50',
    industry: 'technology',
    agreeToTerms: true
  };
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/employer-signup`, {
      method: 'POST',
      body: testEmployer
    });
    
    console.log('📊 Registration Response Status:', response.status);
    console.log('📊 Registration Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Employer registration successful');
      console.log('👤 User Type:', response.data.data.user.userType);
      console.log('🏢 Company ID:', response.data.data.user.companyId);
      return response.data.data.token;
    } else {
      console.log('❌ Employer registration failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Registration test failed:', error.message);
    return null;
  }
}

async function testEmployerLogin(token = null) {
  console.log('\n2️⃣ Testing Employer Login...');
  
  const loginData = {
    email: 'testemployer@example.com',
    password: 'TestPass123'
  };
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: loginData
    });
    
    console.log('📊 Login Response Status:', response.status);
    console.log('📊 Login Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Employer login successful');
      console.log('👤 User Type:', response.data.data.user.userType);
      console.log('🏢 Company ID:', response.data.data.user.companyId);
      return response.data.data.token;
    } else {
      console.log('❌ Employer login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
    return null;
  }
}

async function testUserProfile(token) {
  console.log('\n3️⃣ Testing User Profile...');
  
  if (!token) {
    console.log('❌ No token available for profile test');
    return;
  }
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Profile Response Status:', response.status);
    console.log('📊 Profile Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ User profile loaded successfully');
      console.log('👤 User Type:', response.data.data.userType);
      console.log('🏢 Company ID:', response.data.data.companyId);
    } else {
      console.log('❌ User profile failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Profile test failed:', error.message);
  }
}

async function testOAuthUrls() {
  console.log('\n4️⃣ Testing OAuth URLs for Employer...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/oauth/urls?userType=employer`);
    
    console.log('📊 OAuth URLs Response Status:', response.status);
    console.log('📊 OAuth URLs Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ OAuth URLs loaded successfully');
      console.log('🔗 Google URL:', response.data.data.google);
      console.log('🔗 Facebook URL:', response.data.data.facebook);
    } else {
      console.log('❌ OAuth URLs failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ OAuth URLs test failed:', error.message);
  }
}

async function runDebugTests() {
  console.log('🚀 Starting employer redirect debug tests...\n');
  
  // Test OAuth URLs first
  await testOAuthUrls();
  
  // Test registration and login
  const token = await testEmployerRegistration();
  if (token) {
    await testUserProfile(token);
  } else {
    await testEmployerLogin();
  }
  
  console.log('\n📋 Debug Summary:');
  console.log('==================');
  console.log('1. Check if OAuth URLs are working for employer');
  console.log('2. Check if employer registration sets userType correctly');
  console.log('3. Check if employer login returns correct userType');
  console.log('4. Check if user profile shows correct userType');
  
  console.log('\n🔍 Manual Testing Steps:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Try regular login with employer credentials');
  console.log('3. Check browser console for userType value');
  console.log('4. Try Google OAuth login');
  console.log('5. Check if redirect goes to /employer-dashboard');
  
  console.log('\n🐛 Common Issues:');
  console.log('- User type not set correctly in database');
  console.log('- OAuth callback not setting user type');
  console.log('- Frontend expecting different field name');
  console.log('- Race condition in user type update');
}

// Run the debug tests
runDebugTests().catch(console.error);
