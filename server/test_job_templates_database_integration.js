/**
 * Job Template Database Integration Test Suite
 * Tests database operations, constraints, and data integrity
 */

const { JobTemplate, User, Company, sequelize } = require('./models');
const { Op } = require('sequelize');

describe('Job Template Database Integration Tests', () => {
  let testUser;
  let testCompany;
  let testTemplate;

  beforeAll(async () => {
    // Ensure database is clean and synced
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: 'dbtest@employer.com',
      password: 'hashedpassword',
      firstName: 'DB',
      lastName: 'Test',
      userType: 'employer',
      isEmailVerified: true
    });

    // Create test company
    testCompany = await Company.create({
      name: 'DB Test Company',
      industry: 'Technology',
      size: '51-200',
      website: 'https://dbtestcompany.com',
      description: 'DB test company description',
      userId: testUser.id
    });
  });

  afterEach(async () => {
    // Clean up test data
    await JobTemplate.destroy({ where: {} });
    await Company.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('Template Creation and Validation', () => {
    test('should create template with all required fields', async () => {
      const templateData = {
        name: 'Complete Template',
        description: 'Template with all fields',
        category: 'technical',
        isPublic: true,
        tags: ['engineering', 'senior'],
        templateData: {
          title: 'Senior Developer',
          location: 'San Francisco',
          description: 'Senior developer position',
          requirements: '5+ years experience',
          benefits: 'Health insurance, 401k',
          skills: 'React, Node.js, TypeScript',
          salaryMin: '120000',
          salaryMax: '180000',
          currency: 'USD',
          employmentType: 'Full Time, Permanent',
          experience: 'senior',
          department: 'Engineering',
          industryType: 'Technology',
          roleCategory: 'Software Development',
          remoteWork: 'hybrid',
          shiftTiming: 'day',
          travelRequired: 'no',
          noticePeriod: '30'
        },
        createdBy: testUser.id,
        companyId: testCompany.id
      };

      const template = await JobTemplate.create(templateData);

      expect(template.id).toBeDefined();
      expect(template.name).toBe(templateData.name);
      expect(template.description).toBe(templateData.description);
      expect(template.category).toBe(templateData.category);
      expect(template.isPublic).toBe(templateData.isPublic);
      expect(template.tags).toEqual(templateData.tags);
      expect(template.templateData).toEqual(templateData.templateData);
      expect(template.createdBy).toBe(testUser.id);
      expect(template.companyId).toBe(testCompany.id);
      expect(template.usageCount).toBe(0);
      expect(template.isActive).toBe(true);
      expect(template.createdAt).toBeDefined();
      expect(template.updatedAt).toBeDefined();

      testTemplate = template;
    });

    test('should enforce required field constraints', async () => {
      // Test missing name
      await expect(
        JobTemplate.create({
          description: 'Template without name',
          category: 'technical',
          createdBy: testUser.id,
          companyId: testCompany.id,
          templateData: {}
        })
      ).rejects.toThrow();

      // Test missing category
      await expect(
        JobTemplate.create({
          name: 'Template without category',
          description: 'Template description',
          createdBy: testUser.id,
          companyId: testCompany.id,
          templateData: {}
        })
      ).rejects.toThrow();

      // Test missing createdBy
      await expect(
        JobTemplate.create({
          name: 'Template without creator',
          description: 'Template description',
          category: 'technical',
          companyId: testCompany.id,
          templateData: {}
        })
      ).rejects.toThrow();

      // Test missing companyId
      await expect(
        JobTemplate.create({
          name: 'Template without company',
          description: 'Template description',
          category: 'technical',
          createdBy: testUser.id,
          templateData: {}
        })
      ).rejects.toThrow();
    });

    test('should validate field lengths and formats', async () => {
      // Test name too long
      await expect(
        JobTemplate.create({
          name: 'A'.repeat(256), // Exceeds 255 character limit
          description: 'Template description',
          category: 'technical',
          createdBy: testUser.id,
          companyId: testCompany.id,
          templateData: {}
        })
      ).rejects.toThrow();

      // Test empty name
      await expect(
        JobTemplate.create({
          name: '',
          description: 'Template description',
          category: 'technical',
          createdBy: testUser.id,
          companyId: testCompany.id,
          templateData: {}
        })
      ).rejects.toThrow();
    });

    test('should handle JSONB fields correctly', async () => {
      const complexTemplateData = {
        name: 'JSONB Test Template',
        description: 'Template for testing JSONB fields',
        category: 'technical',
        tags: ['tag1', 'tag2', 'tag3'],
        templateData: {
          title: 'Complex Job',
          location: 'Complex Location',
          description: 'Complex description',
          requirements: ['Requirement 1', 'Requirement 2'],
          benefits: {
            health: 'Health insurance',
            retirement: '401k matching',
            vacation: 'Unlimited PTO'
          },
          skills: {
            technical: ['React', 'Node.js', 'TypeScript'],
            soft: ['Communication', 'Leadership']
          },
          salary: {
            min: 120000,
            max: 180000,
            currency: 'USD',
            equity: true
          }
        },
        createdBy: testUser.id,
        companyId: testCompany.id
      };

      const template = await JobTemplate.create(complexTemplateData);

      expect(template.tags).toEqual(complexTemplateData.tags);
      expect(template.templateData).toEqual(complexTemplateData.templateData);
      expect(template.templateData.benefits).toEqual(complexTemplateData.templateData.benefits);
      expect(template.templateData.skills).toEqual(complexTemplateData.templateData.skills);
    });
  });

  describe('Template Queries and Filtering', () => {
    beforeEach(async () => {
      // Create multiple templates for testing queries
      const templates = [
        {
          name: 'Technical Template 1',
          description: 'First technical template',
          category: 'technical',
          isPublic: true,
          tags: ['engineering', 'senior'],
          templateData: { title: 'Senior Engineer', location: 'SF' },
          createdBy: testUser.id,
          companyId: testCompany.id
        },
        {
          name: 'Technical Template 2',
          description: 'Second technical template',
          category: 'technical',
          isPublic: false,
          tags: ['engineering', 'junior'],
          templateData: { title: 'Junior Engineer', location: 'NYC' },
          createdBy: testUser.id,
          companyId: testCompany.id
        },
        {
          name: 'Marketing Template',
          description: 'Marketing template',
          category: 'marketing',
          isPublic: true,
          tags: ['marketing', 'content'],
          templateData: { title: 'Marketing Manager', location: 'LA' },
          createdBy: testUser.id,
          companyId: testCompany.id
        }
      ];

      await JobTemplate.bulkCreate(templates);
    });

    test('should filter by category', async () => {
      const technicalTemplates = await JobTemplate.findAll({
        where: { category: 'technical' }
      });

      expect(technicalTemplates).toHaveLength(2);
      technicalTemplates.forEach(template => {
        expect(template.category).toBe('technical');
      });
    });

    test('should filter by public/private status', async () => {
      const publicTemplates = await JobTemplate.findAll({
        where: { isPublic: true }
      });

      const privateTemplates = await JobTemplate.findAll({
        where: { isPublic: false }
      });

      expect(publicTemplates).toHaveLength(2);
      expect(privateTemplates).toHaveLength(1);

      publicTemplates.forEach(template => {
        expect(template.isPublic).toBe(true);
      });

      privateTemplates.forEach(template => {
        expect(template.isPublic).toBe(false);
      });
    });

    test('should search by name and description', async () => {
      const searchResults = await JobTemplate.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: '%Technical%' } },
            { description: { [Op.iLike]: '%Technical%' } }
          ]
        }
      });

      expect(searchResults).toHaveLength(2);
      searchResults.forEach(template => {
        const searchText = template.name + ' ' + template.description;
        expect(searchText.toLowerCase()).toContain('technical');
      });
    });

    test('should search by tags', async () => {
      const engineeringTemplates = await JobTemplate.findAll({
        where: {
          tags: { [Op.contains]: ['engineering'] }
        }
      });

      expect(engineeringTemplates).toHaveLength(2);
      engineeringTemplates.forEach(template => {
        expect(template.tags).toContain('engineering');
      });
    });

    test('should filter by creator', async () => {
      const userTemplates = await JobTemplate.findAll({
        where: { createdBy: testUser.id }
      });

      expect(userTemplates).toHaveLength(3);
      userTemplates.forEach(template => {
        expect(template.createdBy).toBe(testUser.id);
      });
    });

    test('should filter by company', async () => {
      const companyTemplates = await JobTemplate.findAll({
        where: { companyId: testCompany.id }
      });

      expect(companyTemplates).toHaveLength(3);
      companyTemplates.forEach(template => {
        expect(template.companyId).toBe(testCompany.id);
      });
    });

    test('should combine multiple filters', async () => {
      const results = await JobTemplate.findAll({
        where: {
          category: 'technical',
          isPublic: true,
          createdBy: testUser.id
        }
      });

      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('technical');
      expect(results[0].isPublic).toBe(true);
      expect(results[0].createdBy).toBe(testUser.id);
    });
  });

  describe('Template Updates and Usage Tracking', () => {
    beforeEach(async () => {
      testTemplate = await JobTemplate.create({
        name: 'Update Test Template',
        description: 'Template for testing updates',
        category: 'technical',
        isPublic: true,
        tags: ['test'],
        templateData: { title: 'Test Job', location: 'Test Location' },
        createdBy: testUser.id,
        companyId: testCompany.id
      });
    });

    test('should update template fields', async () => {
      const updateData = {
        name: 'Updated Template Name',
        description: 'Updated description',
        tags: ['updated', 'test'],
        templateData: {
          title: 'Updated Job Title',
          location: 'Updated Location',
          salary: '100000'
        }
      };

      await testTemplate.update(updateData);

      const updatedTemplate = await JobTemplate.findByPk(testTemplate.id);
      expect(updatedTemplate.name).toBe(updateData.name);
      expect(updatedTemplate.description).toBe(updateData.description);
      expect(updatedTemplate.tags).toEqual(updateData.tags);
      expect(updatedTemplate.templateData).toEqual(updateData.templateData);
      expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThan(updatedTemplate.createdAt.getTime());
    });

    test('should increment usage count', async () => {
      const initialCount = testTemplate.usageCount;
      const initialLastUsed = testTemplate.lastUsedAt;

      await testTemplate.update({
        usageCount: testTemplate.usageCount + 1,
        lastUsedAt: new Date()
      });

      const updatedTemplate = await JobTemplate.findByPk(testTemplate.id);
      expect(updatedTemplate.usageCount).toBe(initialCount + 1);
      expect(updatedTemplate.lastUsedAt).not.toEqual(initialLastUsed);
      expect(updatedTemplate.lastUsedAt.getTime()).toBeGreaterThan(initialLastUsed?.getTime() || 0);
    });

    test('should toggle public/private status', async () => {
      expect(testTemplate.isPublic).toBe(true);

      await testTemplate.update({ isPublic: false });
      let updatedTemplate = await JobTemplate.findByPk(testTemplate.id);
      expect(updatedTemplate.isPublic).toBe(false);

      await updatedTemplate.update({ isPublic: true });
      updatedTemplate = await JobTemplate.findByPk(testTemplate.id);
      expect(updatedTemplate.isPublic).toBe(true);
    });

    test('should soft delete template', async () => {
      await testTemplate.update({ isActive: false });

      const activeTemplates = await JobTemplate.findAll({
        where: { isActive: true }
      });

      const allTemplates = await JobTemplate.findAll({
        where: {},
        paranoid: false // Include soft-deleted records
      });

      expect(activeTemplates).toHaveLength(0);
      expect(allTemplates).toHaveLength(1);
      expect(allTemplates[0].isActive).toBe(false);
    });
  });

  describe('Database Constraints and Relationships', () => {
    test('should maintain referential integrity with user', async () => {
      // Create template with valid user
      const template = await JobTemplate.create({
        name: 'Referential Test',
        description: 'Testing referential integrity',
        category: 'technical',
        createdBy: testUser.id,
        companyId: testCompany.id,
        templateData: {}
      });

      expect(template.createdBy).toBe(testUser.id);

      // Try to create template with non-existent user
      await expect(
        JobTemplate.create({
          name: 'Invalid User Template',
          description: 'Template with invalid user',
          category: 'technical',
          createdBy: '00000000-0000-0000-0000-000000000000',
          companyId: testCompany.id,
          templateData: {}
        })
      ).rejects.toThrow();
    });

    test('should maintain referential integrity with company', async () => {
      // Create template with valid company
      const template = await JobTemplate.create({
        name: 'Company Test',
        description: 'Testing company referential integrity',
        category: 'technical',
        createdBy: testUser.id,
        companyId: testCompany.id,
        templateData: {}
      });

      expect(template.companyId).toBe(testCompany.id);

      // Try to create template with non-existent company
      await expect(
        JobTemplate.create({
          name: 'Invalid Company Template',
          description: 'Template with invalid company',
          category: 'technical',
          createdBy: testUser.id,
          companyId: '00000000-0000-0000-0000-000000000000',
          templateData: {}
        })
      ).rejects.toThrow();
    });

    test('should handle cascade operations', async () => {
      // Create template
      const template = await JobTemplate.create({
        name: 'Cascade Test',
        description: 'Testing cascade operations',
        category: 'technical',
        createdBy: testUser.id,
        companyId: testCompany.id,
        templateData: {}
      });

      // Delete user (should handle template appropriately)
      await User.destroy({ where: { id: testUser.id } });

      // Template should still exist but creator reference might be null
      const remainingTemplate = await JobTemplate.findByPk(template.id);
      expect(remainingTemplate).toBeDefined();
    });
  });

  describe('Performance and Indexing', () => {
    beforeEach(async () => {
      // Create many templates for performance testing
      const templates = [];
      for (let i = 0; i < 1000; i++) {
        templates.push({
          name: `Performance Template ${i}`,
          description: `Template ${i} for performance testing`,
          category: i % 2 === 0 ? 'technical' : 'marketing',
          isPublic: i % 3 === 0,
          tags: [`tag${i % 10}`, `category${i % 5}`],
          templateData: {
            title: `Job ${i}`,
            location: `Location ${i}`,
            description: `Description ${i}`
          },
          createdBy: testUser.id,
          companyId: testCompany.id,
          usageCount: Math.floor(Math.random() * 100)
        });
      }

      await JobTemplate.bulkCreate(templates);
    });

    test('should efficiently query by category with index', async () => {
      const startTime = Date.now();
      const technicalTemplates = await JobTemplate.findAll({
        where: { category: 'technical' }
      });
      const endTime = Date.now();

      expect(technicalTemplates).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast with index
    });

    test('should efficiently query by public status with index', async () => {
      const startTime = Date.now();
      const publicTemplates = await JobTemplate.findAll({
        where: { isPublic: true }
      });
      const endTime = Date.now();

      expect(publicTemplates).toHaveLength(334); // Approximately 1/3 are public
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('should efficiently query by creator with index', async () => {
      const startTime = Date.now();
      const userTemplates = await JobTemplate.findAll({
        where: { createdBy: testUser.id }
      });
      const endTime = Date.now();

      expect(userTemplates).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('should efficiently search with text indexes', async () => {
      const startTime = Date.now();
      const searchResults = await JobTemplate.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: '%Template%' } },
            { description: { [Op.iLike]: '%Template%' } }
          ]
        }
      });
      const endTime = Date.now();

      expect(searchResults).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(200);
    });

    test('should efficiently sort by usage count', async () => {
      const startTime = Date.now();
      const popularTemplates = await JobTemplate.findAll({
        order: [['usageCount', 'DESC']],
        limit: 10
      });
      const endTime = Date.now();

      expect(popularTemplates).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(100);

      // Verify sorting
      for (let i = 1; i < popularTemplates.length; i++) {
        expect(popularTemplates[i-1].usageCount).toBeGreaterThanOrEqual(popularTemplates[i].usageCount);
      }
    });
  });

  describe('Data Consistency and Transactions', () => {
    test('should maintain data consistency during concurrent updates', async () => {
      const template = await JobTemplate.create({
        name: 'Concurrency Test',
        description: 'Testing concurrent updates',
        category: 'technical',
        createdBy: testUser.id,
        companyId: testCompany.id,
        templateData: { title: 'Test Job' }
      });

      // Simulate concurrent updates
      const updatePromises = Array(10).fill().map(async (_, index) => {
        const t = await sequelize.transaction();
        try {
          const currentTemplate = await JobTemplate.findByPk(template.id, { transaction: t });
          await currentTemplate.update({
            usageCount: currentTemplate.usageCount + 1,
            lastUsedAt: new Date()
          }, { transaction: t });
          await t.commit();
          return { success: true, index };
        } catch (error) {
          await t.rollback();
          return { success: false, index, error: error.message };
        }
      });

      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter(r => r.success);

      // At least some updates should succeed
      expect(successfulUpdates.length).toBeGreaterThan(0);

      // Verify final state
      const finalTemplate = await JobTemplate.findByPk(template.id);
      expect(finalTemplate.usageCount).toBeGreaterThan(0);
    });

    test('should handle transaction rollback on error', async () => {
      const template = await JobTemplate.create({
        name: 'Transaction Test',
        description: 'Testing transaction rollback',
        category: 'technical',
        createdBy: testUser.id,
        companyId: testCompany.id,
        templateData: { title: 'Test Job' }
      });

      const initialUsageCount = template.usageCount;

      const transaction = await sequelize.transaction();
      try {
        // Update template
        await template.update({
          usageCount: template.usageCount + 1,
          lastUsedAt: new Date()
        }, { transaction });

        // Simulate an error
        throw new Error('Simulated error');

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
      }

      // Verify rollback worked
      const finalTemplate = await JobTemplate.findByPk(template.id);
      expect(finalTemplate.usageCount).toBe(initialUsageCount);
    });
  });
});
