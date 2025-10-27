/**
 * Complete End-to-End Job Template Test Suite
 * Tests the entire job template workflow from creation to job posting
 */

const request = require('supertest');
const { app } = require('./index');
const { JobTemplate, User, Company, Job } = require('./models');
const { Op } = require('sequelize');

describe('Complete Job Template E2E Test Suite', () => {
  let authToken;
  let testUser;
  let testCompany;
  let createdTemplate;

  beforeAll(async () => {
    // Create test user and company
    testUser = await User.create({
      email: 'e2etest@employer.com',
      password: 'hashedpassword',
      firstName: 'E2E',
      lastName: 'Test',
      userType: 'employer',
      isEmailVerified: true
    });

    testCompany = await Company.create({
      name: 'E2E Test Company',
      industry: 'Technology',
      size: '51-200',
      website: 'https://e2etestcompany.com',
      description: 'E2E test company description',
      userId: testUser.id
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'e2etest@employer.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await Job.destroy({ where: { companyId: testCompany.id } });
    await JobTemplate.destroy({ where: { createdBy: testUser.id } });
    await Company.destroy({ where: { id: testCompany.id } });
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('Complete Template Creation Workflow', () => {
    test('should create a comprehensive job template', async () => {
      const comprehensiveTemplateData = {
        name: 'Complete E2E Template',
        description: 'Comprehensive template for end-to-end testing',
        category: 'technical',
        isPublic: true,
        tags: ['e2e', 'comprehensive', 'testing'],
        templateData: {
          // Basic job information
          title: 'Senior Full Stack Developer',
          companyName: 'E2E Test Company',
          department: 'Engineering',
          industryType: 'Technology',
          roleCategory: 'Software Development',
          location: 'San Francisco, CA',
          
          // Employment details
          employmentType: 'Full Time, Permanent',
          experience: 'senior',
          remoteWork: 'hybrid',
          shiftTiming: 'day',
          travelRequired: 'no',
          noticePeriod: '30',
          
          // Compensation
          salaryMin: '150000',
          salaryMax: '200000',
          currency: 'USD',
          
          // Job content
          description: `We are seeking a Senior Full Stack Developer to join our dynamic engineering team. 
          You will be responsible for developing and maintaining our web applications using modern technologies.
          
          Key Responsibilities:
          - Design and develop scalable web applications
          - Collaborate with cross-functional teams
          - Mentor junior developers
          - Participate in code reviews and technical discussions`,
          
          requirements: `Required Qualifications:
          - 5+ years of full-stack development experience
          - Proficiency in React, Node.js, and TypeScript
          - Experience with cloud platforms (AWS, Azure, or GCP)
          - Strong understanding of database design and optimization
          - Experience with CI/CD pipelines
          - Bachelor's degree in Computer Science or related field
          
          Preferred Qualifications:
          - Experience with microservices architecture
          - Knowledge of containerization (Docker, Kubernetes)
          - Experience with testing frameworks (Jest, Cypress)
          - Previous startup experience`,
          
          benefits: `What We Offer:
          - Competitive salary and equity package
          - Comprehensive health, dental, and vision insurance
          - 401(k) with company matching
          - Unlimited PTO and flexible work arrangements
          - Professional development budget
          - Top-tier equipment and home office setup
          - Team building events and company retreats
          - Stock options for all employees`,
          
          skills: 'React, Node.js, TypeScript, AWS, Docker, Kubernetes, PostgreSQL, Redis, Jest, Cypress, Git, Agile',
          
          // Additional fields
          applicationDeadline: '2024-12-31',
          startDate: '2024-01-15',
          numberOfOpenings: '2',
          workEnvironment: 'Hybrid (3 days in office, 2 days remote)',
          teamSize: '8-10 engineers',
          reportingManager: 'Engineering Manager',
          growthOpportunities: 'Technical leadership, team lead, architecture roles'
        }
      };

      const response = await request(app)
        .post('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(comprehensiveTemplateData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(comprehensiveTemplateData.name);
      expect(response.body.data.templateData.title).toBe(comprehensiveTemplateData.templateData.title);
      expect(response.body.data.usageCount).toBe(0);
      expect(response.body.data.isPublic).toBe(true);

      createdTemplate = response.body.data;
    });

    test('should validate template data completeness', async () => {
      const template = await JobTemplate.findByPk(createdTemplate.id);
      
      expect(template).toBeDefined();
      expect(template.name).toBe('Complete E2E Template');
      expect(template.templateData.title).toBe('Senior Full Stack Developer');
      expect(template.templateData.location).toBe('San Francisco, CA');
      expect(template.templateData.salaryMin).toBe('150000');
      expect(template.templateData.salaryMax).toBe('200000');
      expect(template.templateData.description).toContain('Senior Full Stack Developer');
      expect(template.templateData.requirements).toContain('5+ years');
      expect(template.templateData.benefits).toContain('Competitive salary');
      expect(template.templateData.skills).toContain('React, Node.js, TypeScript');
    });
  });

  describe('Template Management and Search', () => {
    test('should list templates with proper filtering', async () => {
      const response = await request(app)
        .get('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Find our created template
      const ourTemplate = response.body.data.find(t => t.id === createdTemplate.id);
      expect(ourTemplate).toBeDefined();
      expect(ourTemplate.name).toBe('Complete E2E Template');
    });

    test('should search templates by various criteria', async () => {
      // Search by name
      const nameSearchResponse = await request(app)
        .get('/api/job-templates?search=Complete')
        .set('Authorization', `Bearer ${authToken}`);

      expect(nameSearchResponse.status).toBe(200);
      expect(nameSearchResponse.body.data.some(t => t.name.includes('Complete'))).toBe(true);

      // Search by category
      const categorySearchResponse = await request(app)
        .get('/api/job-templates?category=technical')
        .set('Authorization', `Bearer ${authToken}`);

      expect(categorySearchResponse.status).toBe(200);
      categorySearchResponse.body.data.forEach(template => {
        expect(template.category).toBe('technical');
      });

      // Search by public status
      const publicSearchResponse = await request(app)
        .get('/api/job-templates?isPublic=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(publicSearchResponse.status).toBe(200);
      publicSearchResponse.body.data.forEach(template => {
        expect(template.isPublic).toBe(true);
      });
    });

    test('should update template successfully', async () => {
      const updateData = {
        name: 'Updated E2E Template',
        description: 'Updated comprehensive template',
        templateData: {
          ...createdTemplate.templateData,
          title: 'Senior Full Stack Engineer (Updated)',
          salaryMin: '160000',
          salaryMax: '210000',
          description: 'Updated job description with new requirements and responsibilities.'
        }
      };

      const response = await request(app)
        .put(`/api/job-templates/${createdTemplate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.templateData.title).toBe(updateData.templateData.title);
      expect(response.body.data.templateData.salaryMin).toBe(updateData.templateData.salaryMin);
    });
  });

  describe('Template Usage and Job Creation', () => {
    test('should use template to create a job posting', async () => {
      // First, use the template
      const useTemplateResponse = await request(app)
        .post(`/api/job-templates/${createdTemplate.id}/use`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(useTemplateResponse.status).toBe(200);
      expect(useTemplateResponse.body.success).toBe(true);
      expect(useTemplateResponse.body.data.templateData).toBeDefined();

      // Verify usage count increased
      const updatedTemplate = await JobTemplate.findByPk(createdTemplate.id);
      expect(updatedTemplate.usageCount).toBe(1);
      expect(updatedTemplate.lastUsedAt).toBeDefined();

      // Now create a job using the template data
      const jobData = {
        ...useTemplateResponse.body.data.templateData,
        // Add any additional fields required for job creation
        status: 'draft',
        isActive: true,
        companyId: testCompany.id,
        createdBy: testUser.id
      };

      const createJobResponse = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(jobData);

      expect(createJobResponse.status).toBe(201);
      expect(createJobResponse.body.success).toBe(true);
      expect(createJobResponse.body.data.title).toBe(jobData.title);
      expect(createJobResponse.body.data.location).toBe(jobData.location);
      expect(createJobResponse.body.data.description).toBe(jobData.description);
    });

    test('should handle template usage with partial data', async () => {
      // Create a minimal template
      const minimalTemplateData = {
        name: 'Minimal E2E Template',
        description: 'Minimal template for testing',
        category: 'technical',
        isPublic: true,
        templateData: {
          title: 'Junior Developer',
          location: 'Remote',
          description: 'Basic job description',
          requirements: 'Basic requirements',
          skills: 'JavaScript, HTML, CSS'
        }
      };

      const createMinimalResponse = await request(app)
        .post('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(minimalTemplateData);

      expect(createMinimalResponse.status).toBe(201);
      const minimalTemplate = createMinimalResponse.body.data;

      // Use the minimal template
      const useMinimalResponse = await request(app)
        .post(`/api/job-templates/${minimalTemplate.id}/use`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(useMinimalResponse.status).toBe(200);
      expect(useMinimalResponse.body.data.templateData.title).toBe('Junior Developer');
      expect(useMinimalResponse.body.data.templateData.location).toBe('Remote');

      // Clean up
      await JobTemplate.destroy({ where: { id: minimalTemplate.id } });
    });
  });

  describe('Template Sharing and Public Access', () => {
    test('should make template public and accessible', async () => {
      // Update template to be public
      const updateResponse = await request(app)
        .put(`/api/job-templates/${createdTemplate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isPublic: true });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.isPublic).toBe(true);

      // Access public templates without authentication
      const publicResponse = await request(app)
        .get('/api/job-templates/public');

      expect(publicResponse.status).toBe(200);
      expect(publicResponse.body.success).toBe(true);
      
      const publicTemplate = publicResponse.body.data.find(t => t.id === createdTemplate.id);
      expect(publicTemplate).toBeDefined();
      expect(publicTemplate.isPublic).toBe(true);
    });

    test('should filter public templates by category', async () => {
      const publicTechnicalResponse = await request(app)
        .get('/api/job-templates/public?category=technical');

      expect(publicTechnicalResponse.status).toBe(200);
      publicTechnicalResponse.body.data.forEach(template => {
        expect(template.category).toBe('technical');
        expect(template.isPublic).toBe(true);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle template not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const getResponse = await request(app)
        .get(`/api/job-templates/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);

      const useResponse = await request(app)
        .post(`/api/job-templates/${fakeId}/use`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(useResponse.status).toBe(404);
    });

    test('should handle unauthorized access', async () => {
      // Create another user
      const otherUser = await User.create({
        email: 'other@employer.com',
        password: 'hashedpassword',
        firstName: 'Other',
        lastName: 'User',
        userType: 'employer',
        isEmailVerified: true
      });

      const otherLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@employer.com',
          password: 'password123'
        });

      const otherAuthToken = otherLoginResponse.body.token;

      // Try to access private template
      const privateTemplate = await JobTemplate.create({
        name: 'Private Template',
        description: 'Private template for testing',
        category: 'technical',
        isPublic: false,
        createdBy: testUser.id,
        companyId: testCompany.id,
        templateData: { title: 'Private Job', location: 'Private Location' }
      });

      const accessResponse = await request(app)
        .get(`/api/job-templates/${privateTemplate.id}`)
        .set('Authorization', `Bearer ${otherAuthToken}`);

      expect(accessResponse.status).toBe(403);

      // Clean up
      await JobTemplate.destroy({ where: { id: privateTemplate.id } });
      await User.destroy({ where: { id: otherUser.id } });
    });

    test('should handle malformed template data', async () => {
      const malformedData = {
        name: 'Malformed Template',
        description: 'Template with malformed data',
        category: 'technical',
        templateData: {
          // Missing required fields
          description: 'Job without title'
        }
      };

      const response = await request(app)
        .post('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(malformedData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle very large template data', async () => {
      const largeTemplateData = {
        name: 'Large Template',
        description: 'Template with large data',
        category: 'technical',
        templateData: {
          title: 'Large Job',
          location: 'Large Location',
          description: 'A'.repeat(50000), // Very large description
          requirements: 'B'.repeat(50000), // Very large requirements
          benefits: 'C'.repeat(50000) // Very large benefits
        }
      };

      const response = await request(app)
        .post('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeTemplateData);

      // Should either succeed or fail gracefully
      expect([201, 400, 413]).toContain(response.status);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent template operations', async () => {
      const concurrentOperations = Array(10).fill().map(async (_, index) => {
        const templateData = {
          name: `Concurrent Template ${index}`,
          description: `Template ${index} for concurrent testing`,
          category: 'technical',
          templateData: {
            title: `Concurrent Job ${index}`,
            location: `Location ${index}`,
            description: `Description ${index}`
          }
        };

        return request(app)
          .post('/api/job-templates')
          .set('Authorization', `Bearer ${authToken}`)
          .send(templateData);
      });

      const results = await Promise.all(concurrentOperations);
      
      // Most operations should succeed
      const successCount = results.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(5);

      // Clean up
      await JobTemplate.destroy({ where: { name: { [Op.like]: 'Concurrent Template%' } } });
    });

    test('should efficiently search through many templates', async () => {
      // Create many templates
      const templates = [];
      for (let i = 0; i < 100; i++) {
        templates.push({
          name: `Search Test Template ${i}`,
          description: `Template ${i} for search testing`,
          category: i % 2 === 0 ? 'technical' : 'marketing',
          isPublic: i % 3 === 0,
          createdBy: testUser.id,
          companyId: testCompany.id,
          templateData: {
            title: `Search Job ${i}`,
            location: `Search Location ${i}`,
            description: `Search description ${i}`
          }
        });
      }

      await JobTemplate.bulkCreate(templates);

      // Test search performance
      const startTime = Date.now();
      const searchResponse = await request(app)
        .get('/api/job-templates?search=Search')
        .set('Authorization', `Bearer ${authToken}`);
      const endTime = Date.now();

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.data.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      // Clean up
      await JobTemplate.destroy({ where: { name: { [Op.like]: 'Search Test Template%' } } });
    });
  });

  describe('Data Integrity and Consistency', () => {
    test('should maintain data consistency across operations', async () => {
      const template = await JobTemplate.findByPk(createdTemplate.id);
      const initialUsageCount = template.usageCount;

      // Use template multiple times
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post(`/api/job-templates/${createdTemplate.id}/use`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      // Verify usage count
      const updatedTemplate = await JobTemplate.findByPk(createdTemplate.id);
      expect(updatedTemplate.usageCount).toBe(initialUsageCount + 5);
      expect(updatedTemplate.lastUsedAt).toBeDefined();
    });

    test('should handle template updates without affecting usage data', async () => {
      const template = await JobTemplate.findByPk(createdTemplate.id);
      const initialUsageCount = template.usageCount;
      const initialLastUsed = template.lastUsedAt;

      // Update template
      await request(app)
        .put(`/api/job-templates/${createdTemplate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Template Name',
          description: 'Updated description'
        });

      // Verify usage data is preserved
      const updatedTemplate = await JobTemplate.findByPk(createdTemplate.id);
      expect(updatedTemplate.usageCount).toBe(initialUsageCount);
      expect(updatedTemplate.lastUsedAt).toEqual(initialLastUsed);
      expect(updatedTemplate.name).toBe('Updated Template Name');
    });
  });
});
