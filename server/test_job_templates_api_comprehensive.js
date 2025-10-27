/**
 * Comprehensive Job Template API Test Suite
 * Tests all backend API endpoints for job templates
 */

const request = require('supertest');
const { app } = require('./index');
const { JobTemplate, User, Company } = require('./models');
const { Op } = require('sequelize');

describe('Job Template API Comprehensive Test Suite', () => {
  let authToken;
  let testUser;
  let testCompany;
  let testTemplate;

  beforeAll(async () => {
    // Create test user and company
    testUser = await User.create({
      email: 'test@employer.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'Employer',
      userType: 'employer',
      isEmailVerified: true
    });

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

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await JobTemplate.destroy({ where: { createdBy: testUser.id } });
    await Company.destroy({ where: { id: testCompany.id } });
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('POST /api/job-templates - Create Template', () => {
    test('should create a complete job template with all fields', async () => {
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

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(templateData.name);
      expect(response.body.data.templateData.title).toBe(templateData.templateData.title);
      expect(response.body.data.usageCount).toBe(0);
      expect(response.body.data.isPublic).toBe(true);

      testTemplate = response.body.data;
    });

    test('should create template with minimal required fields', async () => {
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

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(minimalData.name);
    });

    test('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        description: 'Template without name'
      };

      const response = await request(app)
        .post('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Template name is required');
    });

    test('should validate template data structure', async () => {
      const invalidData = {
        name: 'Invalid Template',
        description: 'Template with invalid data',
        category: 'technical',
        templateData: {
          // Missing required job fields
          description: 'Job without title'
        }
      };

      const response = await request(app)
        .post('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle duplicate template names', async () => {
      const duplicateData = {
        name: 'Senior Software Engineer Template', // Same as first test
        description: 'Duplicate template',
        category: 'technical',
        templateData: {
          title: 'Different Job',
          location: 'Different Location',
          description: 'Different description'
        }
      };

      const response = await request(app)
        .post('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData);

      // Should either allow duplicates or return specific error
      expect([201, 409]).toContain(response.status);
    });
  });

  describe('GET /api/job-templates - List Templates', () => {
    test('should get all templates for authenticated user', async () => {
      const response = await request(app)
        .get('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should filter templates by category', async () => {
      const response = await request(app)
        .get('/api/job-templates?category=technical')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // All returned templates should be technical
      response.body.data.forEach(template => {
        expect(template.category).toBe('technical');
      });
    });

    test('should search templates by name and description', async () => {
      const response = await request(app)
        .get('/api/job-templates?search=Senior')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // All returned templates should contain "Senior"
      response.body.data.forEach(template => {
        const searchText = template.name + ' ' + template.description;
        expect(searchText.toLowerCase()).toContain('senior');
      });
    });

    test('should filter by public/private templates', async () => {
      const publicResponse = await request(app)
        .get('/api/job-templates?isPublic=true')
        .set('Authorization', `Bearer ${authToken}`);

      const privateResponse = await request(app)
        .get('/api/job-templates?isPublic=false')
        .set('Authorization', `Bearer ${authToken}`);

      expect(publicResponse.status).toBe(200);
      expect(privateResponse.status).toBe(200);

      publicResponse.body.data.forEach(template => {
        expect(template.isPublic).toBe(true);
      });

      privateResponse.body.data.forEach(template => {
        expect(template.isPublic).toBe(false);
      });
    });

    test('should paginate results correctly', async () => {
      const page1Response = await request(app)
        .get('/api/job-templates?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      const page2Response = await request(app)
        .get('/api/job-templates?page=2&limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(page1Response.status).toBe(200);
      expect(page2Response.status).toBe(200);

      // Results should be different (if more than 1 template exists)
      if (page1Response.body.data.length > 0 && page2Response.body.data.length > 0) {
        expect(page1Response.body.data[0].id).not.toBe(page2Response.body.data[0].id);
      }
    });

    test('should include creator and company information', async () => {
      const response = await request(app)
        .get('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const template = response.body.data[0];
      expect(template.creator).toBeDefined();
      expect(template.creator.first_name).toBeDefined();
      expect(template.creator.last_name).toBeDefined();
      expect(template.creator.email).toBeDefined();
    });
  });

  describe('GET /api/job-templates/:id - Get Single Template', () => {
    test('should get template by ID', async () => {
      const response = await request(app)
        .get(`/api/job-templates/${testTemplate.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testTemplate.id);
      expect(response.body.data.name).toBe(testTemplate.name);
    });

    test('should return 404 for non-existent template', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/job-templates/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should return 403 for private template owned by different user', async () => {
      // Create another user and template
      const otherUser = await User.create({
        email: 'other@employer.com',
        password: 'hashedpassword',
        firstName: 'Other',
        lastName: 'Employer',
        userType: 'employer',
        isEmailVerified: true
      });

      const privateTemplate = await JobTemplate.create({
        name: 'Private Template',
        description: 'Private template',
        category: 'technical',
        isPublic: false,
        createdBy: otherUser.id,
        companyId: testCompany.id,
        templateData: {
          title: 'Private Job',
          location: 'Private Location',
          description: 'Private description'
        }
      });

      const response = await request(app)
        .get(`/api/job-templates/${privateTemplate.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);

      // Clean up
      await JobTemplate.destroy({ where: { id: privateTemplate.id } });
      await User.destroy({ where: { id: otherUser.id } });
    });
  });

  describe('PUT /api/job-templates/:id - Update Template', () => {
    test('should update template successfully', async () => {
      const updateData = {
        name: 'Updated Template Name',
        description: 'Updated description',
        templateData: {
          ...testTemplate.templateData,
          title: 'Updated Job Title',
          salaryMin: '150000',
          salaryMax: '200000'
        }
      };

      const response = await request(app)
        .put(`/api/job-templates/${testTemplate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.templateData.title).toBe(updateData.templateData.title);
    });

    test('should validate update data', async () => {
      const invalidUpdate = {
        name: '', // Empty name
        templateData: {
          title: 'A'.repeat(300) // Too long title
        }
      };

      const response = await request(app)
        .put(`/api/job-templates/${testTemplate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 403 for updating other user\'s template', async () => {
      // Create another user and template
      const otherUser = await User.create({
        email: 'other2@employer.com',
        password: 'hashedpassword',
        firstName: 'Other2',
        lastName: 'Employer',
        userType: 'employer',
        isEmailVerified: true
      });

      const otherTemplate = await JobTemplate.create({
        name: 'Other User Template',
        description: 'Other user template',
        category: 'technical',
        isPublic: true,
        createdBy: otherUser.id,
        companyId: testCompany.id,
        templateData: {
          title: 'Other Job',
          location: 'Other Location',
          description: 'Other description'
        }
      });

      const response = await request(app)
        .put(`/api/job-templates/${otherTemplate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked Template' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);

      // Clean up
      await JobTemplate.destroy({ where: { id: otherTemplate.id } });
      await User.destroy({ where: { id: otherUser.id } });
    });
  });

  describe('DELETE /api/job-templates/:id - Delete Template', () => {
    test('should delete template successfully', async () => {
      // Create a template to delete
      const templateToDelete = await JobTemplate.create({
        name: 'Template to Delete',
        description: 'This template will be deleted',
        category: 'technical',
        isPublic: true,
        createdBy: testUser.id,
        companyId: testCompany.id,
        templateData: {
          title: 'Job to Delete',
          location: 'Delete Location',
          description: 'Delete description'
        }
      });

      const response = await request(app)
        .delete(`/api/job-templates/${templateToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify template is deleted
      const deletedTemplate = await JobTemplate.findByPk(templateToDelete.id);
      expect(deletedTemplate).toBeNull();
    });

    test('should return 403 for deleting other user\'s template', async () => {
      // Create another user and template
      const otherUser = await User.create({
        email: 'other3@employer.com',
        password: 'hashedpassword',
        firstName: 'Other3',
        lastName: 'Employer',
        userType: 'employer',
        isEmailVerified: true
      });

      const otherTemplate = await JobTemplate.create({
        name: 'Other User Template 2',
        description: 'Other user template 2',
        category: 'technical',
        isPublic: true,
        createdBy: otherUser.id,
        companyId: testCompany.id,
        templateData: {
          title: 'Other Job 2',
          location: 'Other Location 2',
          description: 'Other description 2'
        }
      });

      const response = await request(app)
        .delete(`/api/job-templates/${otherTemplate.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);

      // Clean up
      await JobTemplate.destroy({ where: { id: otherTemplate.id } });
      await User.destroy({ where: { id: otherUser.id } });
    });
  });

  describe('POST /api/job-templates/:id/use - Use Template', () => {
    test('should increment usage count when template is used', async () => {
      const initialCount = testTemplate.usageCount;

      const response = await request(app)
        .post(`/api/job-templates/${testTemplate.id}/use`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.usageCount).toBe(initialCount + 1);

      // Verify in database
      const updatedTemplate = await JobTemplate.findByPk(testTemplate.id);
      expect(updatedTemplate.usageCount).toBe(initialCount + 1);
      expect(updatedTemplate.lastUsedAt).toBeDefined();
    });

    test('should return template data for job posting', async () => {
      const response = await request(app)
        .post(`/api/job-templates/${testTemplate.id}/use`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.templateData).toBeDefined();
      expect(response.body.data.templateData.title).toBeDefined();
      expect(response.body.data.templateData.location).toBeDefined();
    });
  });

  describe('GET /api/job-templates/public - Public Templates', () => {
    test('should get public templates without authentication', async () => {
      const response = await request(app)
        .get('/api/job-templates/public');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned templates should be public
      response.body.data.forEach(template => {
        expect(template.isPublic).toBe(true);
      });
    });

    test('should filter public templates by category', async () => {
      const response = await request(app)
        .get('/api/job-templates/public?category=technical');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      response.body.data.forEach(template => {
        expect(template.category).toBe('technical');
        expect(template.isPublic).toBe(true);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });

    test('should handle missing authorization header', async () => {
      const response = await request(app)
        .get('/api/job-templates');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should handle invalid authorization token', async () => {
      const response = await request(app)
        .get('/api/job-templates')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
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
          description: 'A'.repeat(10000), // Very large description
          requirements: 'B'.repeat(10000), // Very large requirements
          benefits: 'C'.repeat(10000) // Very large benefits
        }
      };

      const response = await request(app)
        .post('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeTemplateData);

      // Should either succeed or fail gracefully
      expect([201, 400, 413]).toContain(response.status);
    });

    test('should handle concurrent template creation', async () => {
      const templateData = {
        name: 'Concurrent Template',
        description: 'Template created concurrently',
        category: 'technical',
        templateData: {
          title: 'Concurrent Job',
          location: 'Concurrent Location',
          description: 'Concurrent description'
        }
      };

      // Create multiple requests simultaneously
      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/job-templates')
          .set('Authorization', `Bearer ${authToken}`)
          .send(templateData)
      );

      const responses = await Promise.all(promises);

      // At least one should succeed
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large number of templates efficiently', async () => {
      // Create many templates
      const templates = [];
      for (let i = 0; i < 100; i++) {
        templates.push({
          name: `Performance Template ${i}`,
          description: `Template ${i} for performance testing`,
          category: 'technical',
          isPublic: i % 2 === 0,
          createdBy: testUser.id,
          companyId: testCompany.id,
          templateData: {
            title: `Job ${i}`,
            location: `Location ${i}`,
            description: `Description ${i}`
          }
        });
      }

      await JobTemplate.bulkCreate(templates);

      // Test listing performance
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/job-templates')
        .set('Authorization', `Bearer ${authToken}`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      // Clean up
      await JobTemplate.destroy({ where: { name: { [Op.like]: 'Performance Template%' } } });
    });

    test('should handle complex search queries efficiently', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/job-templates?search=Senior&category=technical&isPublic=true')
        .set('Authorization', `Bearer ${authToken}`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });
});
