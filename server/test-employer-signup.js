const fetch = require('node-fetch');

async function testEmployerSignup() {
  const testData = {
    fullName: "Test Employer",
    email: `test-employer-${Date.now()}@example.com`,
    password: "TestPassword123",
    companyName: `Test Company ${Date.now()}`,
    phone: "1234567890",
    companySize: "1-50",
    industry: "technology",
    website: "https://testcompany.com",
    agreeToTerms: true,
    subscribeUpdates: true
  };

  try {
    console.log('Testing employer signup with data:', {
      ...testData,
      password: '[HIDDEN]'
    });

    const response = await fetch('http://localhost:8000/api/auth/employer-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', result);

    if (response.ok && result.success) {
      console.log('✅ Employer signup test PASSED');
      console.log('User ID:', result.data.user.id);
      console.log('Company ID:', result.data.company.id);
      console.log('User Type:', result.data.user.userType);
    } else {
      console.log('❌ Employer signup test FAILED');
      console.log('Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testEmployerSignup();
