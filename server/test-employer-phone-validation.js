const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

async function testEmployerPhoneValidation() {
  console.log('🧪 Testing Employer Registration with Various Phone Formats');
  console.log('==========================================================');

  // Test cases with different phone formats
  const testCases = [
    {
      name: "Valid phone with country code",
      data: {
        fullName: "Test Employer",
        email: `test-employer-${Date.now()}@example.com`,
        password: "TestPassword123",
        companyName: "Test Company",
        phone: "+1234567890",
        companySize: "1-50",
        industry: "technology",
        website: "https://testcompany.com",
        agreeToTerms: true,
        subscribeUpdates: true
      }
    },
    {
      name: "Valid phone with spaces and dashes",
      data: {
        fullName: "Test Employer",
        email: `test-employer-${Date.now()}@example.com`,
        password: "TestPassword123",
        companyName: "Test Company",
        phone: "+1 (234) 567-8900",
        companySize: "1-50",
        industry: "technology",
        website: "https://testcompany.com",
        agreeToTerms: true,
        subscribeUpdates: true
      }
    },
    {
      name: "Valid phone with dots",
      data: {
        fullName: "Test Employer",
        email: `test-employer-${Date.now()}@example.com`,
        password: "TestPassword123",
        companyName: "Test Company",
        phone: "+1.234.567.8900",
        companySize: "1-50",
        industry: "technology",
        website: "https://testcompany.com",
        agreeToTerms: true,
        subscribeUpdates: true
      }
    },
    {
      name: "Valid phone without country code",
      data: {
        fullName: "Test Employer",
        email: `test-employer-${Date.now()}@example.com`,
        password: "TestPassword123",
        companyName: "Test Company",
        phone: "1234567890",
        companySize: "1-50",
        industry: "technology",
        website: "https://testcompany.com",
        agreeToTerms: true,
        subscribeUpdates: true
      }
    },
    {
      name: "Invalid phone - too short",
      data: {
        fullName: "Test Employer",
        email: `test-employer-${Date.now()}@example.com`,
        password: "TestPassword123",
        companyName: "Test Company",
        phone: "123",
        companySize: "1-50",
        industry: "technology",
        website: "https://testcompany.com",
        agreeToTerms: true,
        subscribeUpdates: true
      }
    },
    {
      name: "Invalid phone - contains letters",
      data: {
        fullName: "Test Employer",
        email: `test-employer-${Date.now()}@example.com`,
        password: "TestPassword123",
        companyName: "Test Company",
        phone: "123-ABC-4567",
        companySize: "1-50",
        industry: "technology",
        website: "https://testcompany.com",
        agreeToTerms: true,
        subscribeUpdates: true
      }
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('Phone:', testCase.data.phone);

    try {
      const response = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
        method: 'POST',
        body: testCase.data
      });

      if (response.success) {
        console.log('✅ Test PASSED - Registration successful');
        console.log('User ID:', response.data?.user?.id);
        console.log('Company ID:', response.data?.company?.id);
        passedTests++;
      } else {
        console.log('❌ Test FAILED - Registration failed');
        console.log('Error:', response.message);
        if (response.errors) {
          console.log('Validation errors:', response.errors.map((err) => `${err.path}: ${err.msg}`).join(', '));
        }
      }
    } catch (error) {
      console.log('❌ Test FAILED with error:', error.message);
    }
  }

  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Employer registration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the validation logic.');
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

testEmployerPhoneValidation();
