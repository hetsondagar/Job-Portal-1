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

async function testCompleteEmployerValidation() {
  console.log('🧪 Testing Complete Employer Registration Validation');
  console.log('===================================================');

  const timestamp = Date.now();
  
  // Test case 1: Perfect data
  console.log('\n1️⃣ Testing with perfect data...');
  const perfectData = {
    fullName: "John Doe",
    email: `perfect-employer-${timestamp}@example.com`,
    password: "StrongPassword123!",
    companyName: "Tech Solutions Inc",
    phone: "+1 (555) 123-4567",
    companySize: "51-200",
    industry: "technology",
    website: "https://techsolutions.com",
    agreeToTerms: true,
    subscribeUpdates: false
  };

  const perfectResult = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
    body: perfectData
  });

  if (perfectResult.success) {
    console.log('✅ Perfect data: PASSED');
    console.log('   User ID:', perfectResult.data.user?.id);
    console.log('   Company ID:', perfectResult.data.company?.id);
  } else {
    console.log('❌ Perfect data: FAILED');
    console.log('   Status:', perfectResult.status);
    console.log('   Error:', perfectResult.message);
    console.log('   Data:', JSON.stringify(perfectResult.data, null, 2));
    if (perfectResult.errors && perfectResult.errors.length > 0) {
      console.log('   Validation errors:');
      perfectResult.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }
  }

  // Test case 2: Minimal required data
  console.log('\n2️⃣ Testing with minimal required data...');
  const minimalData = {
    fullName: "Jane Smith",
    email: `minimal-employer-${timestamp}@example.com`,
    password: "Password123",
    companyName: "Startup Co",
    phone: "1234567890",
    companySize: "1-50",
    industry: "other",
    website: "",
    agreeToTerms: true,
    subscribeUpdates: false
  };

  const minimalResult = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
    body: minimalData
  });

  if (minimalResult.success) {
    console.log('✅ Minimal data: PASSED');
  } else {
    console.log('❌ Minimal data: FAILED');
    console.log('   Error:', minimalResult.message);
    if (minimalResult.errors && minimalResult.errors.length > 0) {
      console.log('   Validation errors:');
      minimalResult.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }
  }

  // Test case 3: Check for hidden validation issues
  console.log('\n3️⃣ Testing for hidden validation issues...');
  const hiddenIssuesData = {
    fullName: "Test User",
    email: `hidden-issues-${timestamp}@example.com`,
    password: "TestPassword123",
    companyName: "Test Company",
    phone: "+1-555-123-4567",
    companySize: "1-50",
    industry: "technology",
    website: "http://test.com",
    agreeToTerms: true,
    subscribeUpdates: true
  };

  const hiddenIssuesResult = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
    body: hiddenIssuesData
  });

  if (hiddenIssuesResult.success) {
    console.log('✅ Hidden issues test: PASSED');
  } else {
    console.log('❌ Hidden issues test: FAILED');
    console.log('   Error:', hiddenIssuesResult.message);
    if (hiddenIssuesResult.errors && hiddenIssuesResult.errors.length > 0) {
      console.log('   Validation errors:');
      hiddenIssuesResult.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }
  }

  // Test case 4: Check database constraints
  console.log('\n4️⃣ Testing database constraint validation...');
  const dbConstraintData = {
    fullName: "Database Test",
    email: `db-test-${timestamp}@example.com`,
    password: "TestPass123",
    companyName: "Database Company",
    phone: "5551234567",
    companySize: "1-50",
    industry: "technology",
    website: "https://dbcompany.com",
    agreeToTerms: true,
    subscribeUpdates: false
  };

  const dbConstraintResult = await makeRequest(`${API_BASE_URL}/auth/employer-signup`, {
    body: dbConstraintData
  });

  if (dbConstraintResult.success) {
    console.log('✅ Database constraints: PASSED');
  } else {
    console.log('❌ Database constraints: FAILED');
    console.log('   Error:', dbConstraintResult.message);
    if (dbConstraintResult.errors && dbConstraintResult.errors.length > 0) {
      console.log('   Validation errors:');
      dbConstraintResult.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }
  }

  console.log('\n🎯 Summary:');
  console.log('===========');
  const tests = [
    { name: 'Perfect data', result: perfectResult },
    { name: 'Minimal data', result: minimalResult },
    { name: 'Hidden issues', result: hiddenIssuesResult },
    { name: 'Database constraints', result: dbConstraintResult }
  ];

  tests.forEach(test => {
    const status = test.result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${test.name}`);
  });
}

// Run the test
testCompleteEmployerValidation().catch(console.error);
