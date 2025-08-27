const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

async function testEmployerValidation() {
  // Test cases with different validation scenarios
  const testCases = [
    {
      name: "Valid employer signup",
      data: {
        fullName: "Test Employer",
        email: `test-employer-${Date.now()}@example.com`,
        password: "TestPassword123",
        companyName: "Test Company",
        phone: "+1234567890", // Try with country code
        companySize: "1-50",
        industry: "technology",
        website: "https://testcompany.com",
        agreeToTerms: true,
        subscribeUpdates: true
      }
    },
    {
      name: "Invalid phone format",
      data: {
        fullName: "Test Employer",
        email: `test-employer-${Date.now()}@example.com`,
        password: "TestPassword123",
        companyName: "Test Company",
        phone: "123", // Invalid phone
        companySize: "1-50",
        industry: "technology",
        website: "https://testcompany.com",
        agreeToTerms: true,
        subscribeUpdates: true
      }
    },
    {
      name: "Missing required fields",
      data: {
        fullName: "Test Employer",
        email: `test-employer-${Date.now()}@example.com`,
        password: "TestPassword123",
        companyName: "Test Company",
        // Missing phone
        companySize: "1-50",
        industry: "technology",
        website: "https://testcompany.com",
        agreeToTerms: true,
        subscribeUpdates: true
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('Data:', {
      ...testCase.data,
      password: '[HIDDEN]'
    });

    try {
      const response = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
        method: 'POST',
        body: testCase.data
      });

      if (response.success) {
        console.log('✅ Test passed - Registration successful');
        console.log('User ID:', response.data?.user?.id);
        console.log('Company ID:', response.data?.company?.id);
      } else {
        console.log('❌ Test failed - Registration failed');
        console.log('Error:', response.message);
        if (response.errors) {
          console.log('Validation errors:', response.errors);
        }
      }
    } catch (error) {
      console.log('❌ Test failed with error:', error.message);
    }
  }
}

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const https = require('https');
    const { URL } = require('url');
    
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
        'User-Agent': 'Job-Portal-Test/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: jsonData.success,
            data: jsonData.data,
            message: jsonData.message,
            errors: jsonData.errors
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            data: data,
            message: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

testEmployerValidation();
