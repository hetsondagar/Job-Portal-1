const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:8000/health');
    console.log('✅ Health endpoint:', healthResponse.data);
    console.log('');

    // Test signup endpoint
    console.log('2. Testing signup endpoint...');
    const signupData = {
      email: 'test@example.com',
      password: 'TestPass123',
      fullName: 'Test User',
      phone: '1234567890',
      experience: 'fresher'
    };

    try {
      const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, signupData);
      console.log('✅ Signup successful:', signupResponse.data);
      console.log('');

      // Test login endpoint
      console.log('3. Testing login endpoint...');
      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123'
      };

      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      console.log('✅ Login successful:', loginResponse.data);
      console.log('');

      // Test get profile endpoint
      console.log('4. Testing get profile endpoint...');
      const token = loginResponse.data.data.token;
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Get profile successful:', profileResponse.data);

    } catch (signupError) {
      if (signupError.response) {
        console.log('❌ Signup failed:', signupError.response.status, signupError.response.data);
      } else {
        console.log('❌ Signup failed:', signupError.message);
      }
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server with: npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testAPI();
