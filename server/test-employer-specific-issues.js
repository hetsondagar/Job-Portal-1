const http = require('http');
const https = require('https');
const { URL } = require('url');

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

async function makeRequest(url, options = {}) {
  const defaultOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: finalOptions.method,
      headers: finalOptions.headers,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: jsonData,
            errors: jsonData.errors || [],
            message: jsonData.message || jsonData.error || 'Unknown error'
          });
        } catch (error) {
          resolve({
            success: false,
            status: res.statusCode,
            data: null,
            errors: [],
            message: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        status: 0,
        data: null,
        errors: [],
        message: error.message
      });
    });

    if (finalOptions.body) {
      req.write(finalOptions.body);
    }
    req.end();
  });
}

async function testSpecificIssues() {
  console.log('🧪 Testing Specific Employer Registration Issues');
  console.log('===============================================');

  const timestamp = Date.now();
  
  // Test case 1: Missing agreeToTerms
  console.log('\n1️⃣ Testing missing agreeToTerms...');
  const missingTermsData = {
    fullName: "Test User",
    email: `missing-terms-${timestamp}@example.com`,
    password: "TestPassword123",
    companyName: "Test Company",
    phone: "+1234567890",
    companySize: "1-50",
    industry: "technology",
    website: "https://test.com",
    subscribeUpdates: true
    // Missing agreeToTerms
  };

  const missingTermsResult = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
    body: missingTermsData
  });

  if (missingTermsResult.success) {
    console.log('❌ Missing terms: SHOULD FAIL but PASSED');
  } else {
    console.log('✅ Missing terms: Correctly failed');
    console.log('   Error:', missingTermsResult.message);
    if (missingTermsResult.errors && missingTermsResult.errors.length > 0) {
      console.log('   Validation errors:');
      missingTermsResult.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }
  }

  // Test case 2: agreeToTerms as false
  console.log('\n2️⃣ Testing agreeToTerms as false...');
  const falseTermsData = {
    fullName: "Test User",
    email: `false-terms-${timestamp}@example.com`,
    password: "TestPassword123",
    companyName: "Test Company",
    phone: "+1234567890",
    companySize: "1-50",
    industry: "technology",
    website: "https://test.com",
    agreeToTerms: false,
    subscribeUpdates: true
  };

  const falseTermsResult = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
    body: falseTermsData
  });

  if (falseTermsResult.success) {
    console.log('❌ False terms: SHOULD FAIL but PASSED');
  } else {
    console.log('✅ False terms: Correctly failed');
    console.log('   Error:', falseTermsResult.message);
    if (falseTermsResult.errors && falseTermsResult.errors.length > 0) {
      console.log('   Validation errors:');
      falseTermsResult.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }
  }

  // Test case 3: Weak password
  console.log('\n3️⃣ Testing weak password...');
  const weakPasswordData = {
    fullName: "Test User",
    email: `weak-password-${timestamp}@example.com`,
    password: "123", // Too weak
    companyName: "Test Company",
    phone: "+1234567890",
    companySize: "1-50",
    industry: "technology",
    website: "https://test.com",
    agreeToTerms: true,
    subscribeUpdates: true
  };

  const weakPasswordResult = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
    body: weakPasswordData
  });

  if (weakPasswordResult.success) {
    console.log('❌ Weak password: SHOULD FAIL but PASSED');
  } else {
    console.log('✅ Weak password: Correctly failed');
    console.log('   Error:', weakPasswordResult.message);
    if (weakPasswordResult.errors && weakPasswordResult.errors.length > 0) {
      console.log('   Validation errors:');
      weakPasswordResult.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }
  }

  // Test case 4: Invalid email format
  console.log('\n4️⃣ Testing invalid email...');
  const invalidEmailData = {
    fullName: "Test User",
    email: "invalid-email", // Invalid format
    password: "TestPassword123",
    companyName: "Test Company",
    phone: "+1234567890",
    companySize: "1-50",
    industry: "technology",
    website: "https://test.com",
    agreeToTerms: true,
    subscribeUpdates: true
  };

  const invalidEmailResult = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
    body: invalidEmailData
  });

  if (invalidEmailResult.success) {
    console.log('❌ Invalid email: SHOULD FAIL but PASSED');
  } else {
    console.log('✅ Invalid email: Correctly failed');
    console.log('   Error:', invalidEmailResult.message);
    if (invalidEmailResult.errors && invalidEmailResult.errors.length > 0) {
      console.log('   Validation errors:');
      invalidEmailResult.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }
  }

  // Test case 5: Valid data with all fields
  console.log('\n5️⃣ Testing valid data with all fields...');
  const validData = {
    fullName: "Test User",
    email: `valid-data-${timestamp}@example.com`,
    password: "TestPassword123",
    companyName: "Test Company",
    phone: "+1234567890",
    companySize: "1-50",
    industry: "technology",
    website: "https://test.com",
    agreeToTerms: true,
    subscribeUpdates: true
  };

  const validResult = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
    body: validData
  });

  if (validResult.success) {
    console.log('✅ Valid data: PASSED');
    console.log('   User ID:', validResult.data.user?.id);
    console.log('   Company ID:', validResult.data.company?.id);
  } else {
    console.log('❌ Valid data: FAILED');
    console.log('   Status:', validResult.status);
    console.log('   Error:', validResult.message);
    console.log('   Full response:', JSON.stringify(validResult.data, null, 2));
    if (validResult.errors && validResult.errors.length > 0) {
      console.log('   Validation errors:');
      validResult.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }
  }

  console.log('\n🎯 Summary:');
  console.log('===========');
  const tests = [
    { name: 'Missing agreeToTerms', result: missingTermsResult, shouldFail: true },
    { name: 'False agreeToTerms', result: falseTermsResult, shouldFail: true },
    { name: 'Weak password', result: weakPasswordResult, shouldFail: true },
    { name: 'Invalid email', result: invalidEmailResult, shouldFail: true },
    { name: 'Valid data', result: validResult, shouldFail: false }
  ];

  tests.forEach(test => {
    const expected = test.shouldFail ? 'FAIL' : 'PASS';
    const actual = test.result.success ? 'PASS' : 'FAIL';
    const status = (test.shouldFail && !test.result.success) || (!test.shouldFail && test.result.success) ? '✅' : '❌';
    console.log(`${status} ${test.name}: Expected ${expected}, Got ${actual}`);
  });
}

// Run the test
testSpecificIssues().catch(console.error);
