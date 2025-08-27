const fetch = require('node-fetch');

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
      const response = await fetch('http://localhost:8000/api/auth/employer-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response:', result);

      if (response.ok && result.success) {
        console.log('✅ Test PASSED');
      } else {
        console.log('❌ Test FAILED');
        if (result.errors) {
          console.log('Validation errors:');
          result.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.path}: ${error.msg}`);
          });
        }
      }
    } catch (error) {
      console.error('❌ Test failed with error:', error.message);
    }
  }
}

// Run the test
testEmployerValidation();
