/**
 * Simple Job Template Test Suite
 * Tests job template functionality without external dependencies
 */

const request = require('supertest');
const { app } = require('./index');
const { JobTemplate, User, Company } = require('./models');

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🚀 Starting Job Template Tests...\n');
    
    for (const test of this.tests) {
      try {
        console.log(`📋 Running: ${test.name}`);
        await test.fn();
        console.log(`✅ PASSED: ${test.name}\n`);
        this.passed++;
      } catch (error) {
        console.log(`❌ FAILED: ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
        this.failed++;
      }
    }

    console.log('='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.tests.length}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All tests passed! Job template functionality is working perfectly.');
    } else {
      console.log(`\n⚠️  ${this.failed} test(s) failed. Please check the errors above.`);
    }
  }
}

async function runTests() {
  const runner = new TestRunner();
  let authToken;
  let testUser;
  let testCompany;
  let createdTemplate;

  // Setup
  runner.test('Setup test data', async () => {
    // Create test user
    testUser = await User.create({
      email: 'test@employer.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'Employer',
      userType: 'employer',
      isEmailVerified: true
    });

    // Create test company
    testCompany = await Company.create({
      name: 'Test Company',
      industry: 'Technology',
      size: '51-200',
      website: 'https://testcompany.com',
      description: 'Test company description',
      userId: testUser.id
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@employer.com',
        password: 'password123'
      });

    if (loginResponse.status !== 200) {
      throw new Error('Failed to login test user');
    }

    authToken = loginResponse.body.token;
    if (!authToken) {
      throw new Error('No auth token received');
    }
  });

  // Template Creation Tests
  runner.test('Create complete job template', async () => {
    const templateData = {
      name: 'Senior Software Engineer Template',
      description: 'Complete template for senior software engineer positions',
      category: 'technical',
      isPublic: true,
      tags: ['engineering', 'senior', 'full-stack'],
      templateData: {
        title: 'Senior Software Engineer',
        companyName: 'Tech Corp Inc',
        department: 'Engineering',
        industryType: 'Technology',
        roleCategory: 'Software Development',
        location: 'San Francisco, CA',
        employmentType: 'Full Time, Permanent',
        experience: 'senior',
        salaryMin: '120000',
        salaryMax: '180000',
        currency: 'USD',
        description: 'We are looking for a senior software engineer...',
        requirements: '5+ years of experience\nProficiency in React and Node.js',
        benefits: 'Competitive salary\nHealth insurance\n401k matching',
        skills: 'React, Node.js, TypeScript, AWS, Docker',
        remoteWork: 'hybrid',
        shiftTiming: 'day',
        travelRequired: 'no',
        noticePeriod: '30'
      }
    };

    const response = await request(app)
      .post('/api/job-templates')
      .set('Authorization', `Bearer ${authToken}`)
      .send(templateData);

    if (response.status !== 201) {
      throw new Error(`Expected 201, got ${response.status}: ${response.body.message}`);
    }

    if (!response.body.success) {
      throw new Error(`Template creation failed: ${response.body.message}`);
    }

    createdTemplate = response.body.data;
    if (!createdTemplate.id) {
      throw new Error('Template ID not returned');
    }
  });

  runner.test('Create minimal job template', async () => {
    const minimalData = {
      name: 'Minimal Template',
      description: 'Basic template',
      category: 'technical',
      templateData: {
        title: 'Software Developer',
        location: 'Remote',
        description: 'Basic job description'
      }
    };

    const response = await request(app)
      .post('/api/job-templates')
      .set('Authorization', `Bearer ${authToken}`)
      .send(minimalData);

    if (response.status !== 201) {
      throw new Error(`Expected 201, got ${response.status}: ${response.body.message}`);
    }

    if (!response.body.success) {
      throw new Error(`Minimal template creation failed: ${response.body.message}`);
    }
  });

  runner.test('Validate required fields', async () => {
    const invalidData = {
      // Missing required fields
      description: 'Template without name'
    };

    const response = await request(app)
      .post('/api/job-templates')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidData);

    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}`);
    }

    if (response.body.success !== false) {
      throw new Error('Expected success to be false for invalid data');
    }
  });

  // Template Listing Tests
  runner.test('Get all templates', async () => {
    const response = await request(app)
      .get('/api/job-templates')
      .set('Authorization', `Bearer ${authToken}`);

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}: ${response.body.message}`);
    }

    if (!response.body.success) {
      throw new Error(`Failed to get templates: ${response.body.message}`);
    }

    if (!Array.isArray(response.body.data)) {
      throw new Error('Templates data should be an array');
    }

    if (response.body.data.length < 2) {
      throw new Error(`Expected at least 2 templates, got ${response.body.data.length}`);
    }
  });

  runner.test('Filter templates by category', async () => {
    const response = await request(app)
      .get('/api/job-templates?category=technical')
      .set('Authorization', `Bearer ${authToken}`);

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!response.body.success) {
      throw new Error(`Failed to filter templates: ${response.body.message}`);
    }

    // All returned templates should be technical
    response.body.data.forEach(template => {
      if (template.category !== 'technical') {
        throw new Error(`Expected technical category, got ${template.category}`);
      }
    });
  });

  runner.test('Search templates by name', async () => {
    const response = await request(app)
      .get('/api/job-templates?search=Senior')
      .set('Authorization', `Bearer ${authToken}`);

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!response.body.success) {
      throw new Error(`Failed to search templates: ${response.body.message}`);
    }

    // At least one template should contain "Senior"
    const hasSeniorTemplate = response.body.data.some(template => 
      template.name.toLowerCase().includes('senior')
    );
    
    if (!hasSeniorTemplate) {
      throw new Error('No template found containing "Senior"');
    }
  });

  // Template Usage Tests
  runner.test('Use template to get job data', async () => {
    if (!createdTemplate) {
      throw new Error('No template created to test usage');
    }

    const response = await request(app)
      .post(`/api/job-templates/${createdTemplate.id}/use`)
      .set('Authorization', `Bearer ${authToken}`);

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}: ${response.body.message}`);
    }

    if (!response.body.success) {
      throw new Error(`Failed to use template: ${response.body.message}`);
    }

    if (!response.body.data.templateData) {
      throw new Error('Template data not returned');
    }

    if (response.body.data.templateData.title !== 'Senior Software Engineer') {
      throw new Error('Template data title mismatch');
    }
  });

  runner.test('Update template usage count', async () => {
    if (!createdTemplate) {
      throw new Error('No template created to test usage count');
    }

    const initialCount = createdTemplate.usageCount || 0;

    await request(app)
      .post(`/api/job-templates/${createdTemplate.id}/use`)
      .set('Authorization', `Bearer ${authToken}`);

    // Get updated template
    const response = await request(app)
      .get(`/api/job-templates/${createdTemplate.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const updatedTemplate = response.body.data;
    if (updatedTemplate.usageCount <= initialCount) {
      throw new Error(`Usage count should have increased from ${initialCount} to ${updatedTemplate.usageCount}`);
    }
  });

  // Template Update Tests
  runner.test('Update template', async () => {
    if (!createdTemplate) {
      throw new Error('No template created to test update');
    }

    const updateData = {
      name: 'Updated Template Name',
      description: 'Updated description',
      templateData: {
        ...createdTemplate.templateData,
        title: 'Updated Job Title',
        salaryMin: '150000',
        salaryMax: '200000'
      }
    };

    const response = await request(app)
      .put(`/api/job-templates/${createdTemplate.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}: ${response.body.message}`);
    }

    if (!response.body.success) {
      throw new Error(`Failed to update template: ${response.body.message}`);
    }

    if (response.body.data.name !== 'Updated Template Name') {
      throw new Error('Template name not updated correctly');
    }
  });

  // Public Templates Tests
  runner.test('Get public templates without auth', async () => {
    const response = await request(app)
      .get('/api/job-templates/public');

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}: ${response.body.message}`);
    }

    if (!response.body.success) {
      throw new Error(`Failed to get public templates: ${response.body.message}`);
    }

    if (!Array.isArray(response.body.data)) {
      throw new Error('Public templates data should be an array');
    }

    // All returned templates should be public
    response.body.data.forEach(template => {
      if (template.isPublic !== true) {
        throw new Error(`Expected public template, got isPublic: ${template.isPublic}`);
      }
    });
  });

  // Error Handling Tests
  runner.test('Handle non-existent template', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    
    const response = await request(app)
      .get(`/api/job-templates/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`);
    }

    if (response.body.success !== false) {
      throw new Error('Expected success to be false for non-existent template');
    }
  });

  runner.test('Handle missing authorization', async () => {
    const response = await request(app)
      .get('/api/job-templates');

    if (response.status !== 401) {
      throw new Error(`Expected 401, got ${response.status}`);
    }

    if (response.body.success !== false) {
      throw new Error('Expected success to be false for missing auth');
    }
  });

  // Cleanup
  runner.test('Cleanup test data', async () => {
    // Delete all test templates
    await JobTemplate.destroy({ where: { createdBy: testUser.id } });
    
    // Delete test company
    await Company.destroy({ where: { id: testCompany.id } });
    
    // Delete test user
    await User.destroy({ where: { id: testUser.id } });
  });

  await runner.run();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Test runner failed:', error.message);
  process.exit(1);
});
