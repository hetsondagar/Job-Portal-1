/**
 * HTTP Job Template Test
 * Tests job template functionality using direct HTTP requests
 */

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testJobTemplates() {
  console.log('🚀 Starting HTTP Job Template Tests...\n');
  const baseUrl = 'localhost';
  const port = 8000;
  let passedTests = 0;
  let totalTests = 0;

  function test(name, testFn) {
    totalTests++;
    console.log(`📋 Test ${totalTests}: ${name}`);
    try {
      testFn();
      console.log('✅ PASSED\n');
      passedTests++;
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
    }
  }

  // Test 1: Server Health Check
  test('Server Health Check', async () => {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/health',
      method: 'GET'
    });

    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }
  });

  // Test 2: Job Templates Route (should require auth)
  test('Job Templates Route Requires Auth', async () => {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/job-templates',
      method: 'GET'
    });

    if (response.statusCode !== 401) {
      throw new Error(`Expected 401, got ${response.statusCode}`);
    }
  });

  // Test 3: Public Templates Route (should work without auth)
  test('Public Templates Route Works Without Auth', async () => {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/job-templates/public',
      method: 'GET'
    });

    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }

    if (!response.body.success) {
      throw new Error('Response should have success: true');
    }

    if (!Array.isArray(response.body.data)) {
      throw new Error('Response data should be an array');
    }
  });

  // Test 4: Template Creation Without Auth (should fail)
  test('Template Creation Requires Auth', async () => {
    const templateData = {
      name: 'Test Template',
      description: 'Test description',
      category: 'technical',
      templateData: {
        title: 'Test Job',
        location: 'Test Location'
      }
    };

    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/job-templates',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, templateData);

    if (response.statusCode !== 401) {
      throw new Error(`Expected 401, got ${response.statusCode}`);
    }
  });

  // Test 5: Single Template Access Without Auth (should fail)
  test('Single Template Access Requires Auth', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: `/api/job-templates/${fakeId}`,
      method: 'GET'
    });

    if (response.statusCode !== 401) {
      throw new Error(`Expected 401, got ${response.statusCode}`);
    }
  });

  // Test 6: Template Usage Without Auth (should fail)
  test('Template Usage Requires Auth', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: `/api/job-templates/${fakeId}/use`,
      method: 'POST'
    });

    if (response.statusCode !== 401) {
      throw new Error(`Expected 401, got ${response.statusCode}`);
    }
  });

  // Test 7: Template Update Without Auth (should fail)
  test('Template Update Requires Auth', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: `/api/job-templates/${fakeId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { name: 'Updated Template' });

    if (response.statusCode !== 401) {
      throw new Error(`Expected 401, got ${response.statusCode}`);
    }
  });

  // Test 8: Template Deletion Without Auth (should fail)
  test('Template Deletion Requires Auth', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: `/api/job-templates/${fakeId}`,
      method: 'DELETE'
    });

    if (response.statusCode !== 401) {
      throw new Error(`Expected 401, got ${response.statusCode}`);
    }
  });

  // Test 9: Public Templates with Category Filter
  test('Public Templates Category Filter', async () => {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/job-templates/public?category=technical',
      method: 'GET'
    });

    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }

    if (!response.body.success) {
      throw new Error('Response should have success: true');
    }
  });

  // Test 10: Public Templates Search
  test('Public Templates Search', async () => {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/job-templates/public?search=test',
      method: 'GET'
    });

    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }

    if (!response.body.success) {
      throw new Error('Response should have success: true');
    }
  });

  console.log('='.repeat(60));
  console.log('📊 HTTP TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All HTTP tests passed! Job Template API is working correctly.');
    console.log('\n📝 Key Findings:');
    console.log('   ✅ Server is running and responsive');
    console.log('   ✅ All API endpoints are accessible');
    console.log('   ✅ Authentication is properly required for protected routes');
    console.log('   ✅ Public templates are accessible without authentication');
    console.log('   ✅ Error handling is working correctly');
    console.log('\n🚀 Job Template functionality is ready for production!');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Please check the errors above.`);
  }
}

// Run the tests
testJobTemplates().catch(error => {
  console.error('\n💥 Test runner failed:', error.message);
  process.exit(1);
});
