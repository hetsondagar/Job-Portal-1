require('dotenv').config();
const https = require('https');
const http = require('http');

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

async function testProfileFix() {
  console.log('🔍 Testing Profile Endpoint Fix...\n');
  
  try {
    // First login to get a token
    const loginResponse = await makeRequest('http://localhost:8000/api/auth/login', {
      method: 'POST',
      body: {
        email: 'testemployer@example.com',
        password: 'TestPass123'
      }
    });
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful, testing profile...');
      
      // Test profile endpoint
      const profileResponse = await makeRequest('http://localhost:8000/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Profile Response Status:', profileResponse.status);
      console.log('📊 Profile Response Data:', JSON.stringify(profileResponse.data, null, 2));
      
      if (profileResponse.status === 200 && profileResponse.data.success) {
        console.log('✅ Profile loaded successfully');
        console.log('👤 User Type:', profileResponse.data.data.userType);
        console.log('🏢 Company ID:', profileResponse.data.data.companyId);
        
        if (profileResponse.data.data.userType === 'employer') {
          console.log('🎉 SUCCESS: Profile endpoint now returns correct userType!');
        } else {
          console.log('❌ FAILED: Profile endpoint still has wrong userType');
        }
      } else {
        console.log('❌ Profile failed:', profileResponse.data.message);
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testProfileFix();
