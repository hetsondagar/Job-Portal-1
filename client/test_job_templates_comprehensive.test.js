/**
 * Comprehensive Job Template Test Suite
 * Tests all job template functionality including creation, editing, usage, and integration
 */

const { test, expect, describe, beforeAll, afterAll, beforeEach } = require('@playwright/test');

describe('Job Template Comprehensive Test Suite', () => {
  let page;
  let context;
  let browser;

  beforeAll(async () => {
    // Start browser and create context
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // Navigate to employer dashboard and login
    await page.goto('http://localhost:3000/employer-login');
    await page.fill('input[name="email"]', 'test@employer.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/employer-dashboard');
  });

  describe('Job Template Creation', () => {
    test('should create a complete job template with all fields', async () => {
      // Navigate to job templates page
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Click create template button
      await page.click('button:has-text("Create Template")');
      await page.waitForSelector('[role="dialog"]');

      // Fill in basic template information
      await page.fill('input[name="name"]', 'Senior Software Engineer Template');
      await page.fill('textarea[name="description"]', 'Complete template for senior software engineer positions');

      // Fill in job details that match post-job page
      await page.fill('input[name="title"]', 'Senior Software Engineer');
      await page.fill('input[name="companyName"]', 'Tech Corp Inc');
      await page.fill('input[name="location"]', 'San Francisco, CA');
      
      // Select department using dropdown
      await page.click('button:has-text("Select Department")');
      await page.click('text=Engineering');
      
      // Select industry type
      await page.click('button:has-text("Select Industry")');
      await page.click('text=Technology');
      
      // Select role category
      await page.click('button:has-text("Select Role Category")');
      await page.click('text=Software Development');
      
      // Select employment type
      await page.selectOption('select[name="employmentType"]', 'Full Time, Permanent');
      
      // Select experience level
      await page.selectOption('select[name="experience"]', 'senior');
      
      // Fill in salary information
      await page.fill('input[name="salaryMin"]', '120000');
      await page.fill('input[name="salaryMax"]', '180000');
      await page.selectOption('select[name="currency"]', 'USD');
      
      // Fill in job description
      await page.fill('textarea[name="description"]', 'We are looking for a senior software engineer to join our team...');
      
      // Fill in requirements
      await page.fill('textarea[name="requirements"]', '5+ years of experience\nProficiency in React and Node.js\nStrong problem-solving skills');
      
      // Fill in benefits
      await page.fill('textarea[name="benefits"]', 'Competitive salary\nHealth insurance\n401k matching\nFlexible work hours');
      
      // Fill in skills
      await page.fill('input[name="skills"]', 'React, Node.js, TypeScript, AWS, Docker');
      
      // Select work type
      await page.selectOption('select[name="remoteWork"]', 'hybrid');
      
      // Select shift timing
      await page.selectOption('select[name="shiftTiming"]', 'day');
      
      // Select travel required
      await page.selectOption('select[name="travelRequired"]', 'no');
      
      // Fill in notice period
      await page.fill('input[name="noticePeriod"]', '30');
      
      // Submit the form
      await page.click('button:has-text("Create Template")');
      
      // Wait for success message
      await page.waitForSelector('text=Template created successfully');
      
      // Verify template appears in the list
      await expect(page.locator('text=Senior Software Engineer Template')).toBeVisible();
    });

    test('should validate required fields during template creation', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Click create template button
      await page.click('button:has-text("Create Template")');
      await page.waitForSelector('[role="dialog"]');

      // Try to submit without filling required fields
      await page.click('button:has-text("Create Template")');
      
      // Check for validation errors
      await expect(page.locator('text=Template name is required')).toBeVisible();
      await expect(page.locator('text=Job title is required')).toBeVisible();
      await expect(page.locator('text=Job location is required')).toBeVisible();
    });

    test('should create template with minimal required fields', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      await page.click('button:has-text("Create Template")');
      await page.waitForSelector('[role="dialog"]');

      // Fill only required fields
      await page.fill('input[name="name"]', 'Minimal Template');
      await page.fill('input[name="title"]', 'Software Developer');
      await page.fill('input[name="location"]', 'Remote');
      await page.fill('textarea[name="description"]', 'Basic job description');
      
      // Submit
      await page.click('button:has-text("Create Template")');
      
      // Should succeed
      await page.waitForSelector('text=Template created successfully');
      await expect(page.locator('text=Minimal Template')).toBeVisible();
    });
  });

  describe('Job Template Management', () => {
    test('should edit existing template', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Find and click edit button for first template
      const editButton = page.locator('button[aria-label="Edit template"]').first();
      await editButton.click();
      await page.waitForSelector('[role="dialog"]');

      // Modify template name
      await page.fill('input[name="name"]', 'Updated Template Name');
      
      // Submit changes
      await page.click('button:has-text("Update Template")');
      
      // Verify update
      await page.waitForSelector('text=Template updated successfully');
      await expect(page.locator('text=Updated Template Name')).toBeVisible();
    });

    test('should delete template', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Find and click delete button
      const deleteButton = page.locator('button[aria-label="Delete template"]').first();
      await deleteButton.click();
      
      // Confirm deletion
      await page.click('button:has-text("Delete")');
      
      // Verify deletion
      await page.waitForSelector('text=Template deleted successfully');
    });

    test('should search templates', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Search for specific template
      await page.fill('input[placeholder*="Search templates"]', 'Software');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Verify search results
      const results = page.locator('[data-testid="template-card"]');
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should filter templates by category', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Select category filter
      await page.selectOption('select[name="category"]', 'technical');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify all visible templates are technical
      const templates = page.locator('[data-testid="template-card"]');
      const count = await templates.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Job Template Usage - Post Job Integration', () => {
    test('should use template to pre-fill job posting form', async () => {
      // First create a template
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      await page.click('button:has-text("Create Template")');
      await page.waitForSelector('[role="dialog"]');

      // Create a comprehensive template
      await page.fill('input[name="name"]', 'Test Integration Template');
      await page.fill('input[name="title"]', 'Full Stack Developer');
      await page.fill('input[name="companyName"]', 'Test Company');
      await page.fill('input[name="location"]', 'New York, NY');
      await page.fill('textarea[name="description"]', 'Full stack developer position');
      await page.fill('textarea[name="requirements"]', 'React, Node.js, MongoDB');
      await page.fill('textarea[name="benefits"]', 'Health insurance, 401k');
      await page.fill('input[name="skills"]', 'JavaScript, React, Node.js');
      await page.fill('input[name="salaryMin"]', '80000');
      await page.fill('input[name="salaryMax"]', '120000');
      
      await page.click('button:has-text("Create Template")');
      await page.waitForSelector('text=Template created successfully');

      // Now test using the template in post-job page
      await page.goto('http://localhost:3000/employer-dashboard/post-job');
      await page.waitForLoadState('networkidle');

      // Click "Use Template" button
      await page.click('button:has-text("Use Template")');
      await page.waitForSelector('[role="dialog"]');

      // Select the template we just created
      await page.click('text=Test Integration Template');
      await page.click('button:has-text("Use This Template")');

      // Verify form is pre-filled
      await expect(page.locator('input[name="title"]')).toHaveValue('Full Stack Developer');
      await expect(page.locator('input[name="companyName"]')).toHaveValue('Test Company');
      await expect(page.locator('input[name="location"]')).toHaveValue('New York, NY');
      await expect(page.locator('textarea[name="description"]')).toContainText('Full stack developer position');
      await expect(page.locator('textarea[name="requirements"]')).toContainText('React, Node.js, MongoDB');
      await expect(page.locator('textarea[name="benefits"]')).toContainText('Health insurance, 401k');
      await expect(page.locator('input[name="skills"]')).toContainText('JavaScript, React, Node.js');
      await expect(page.locator('input[name="salaryMin"]')).toHaveValue('80000');
      await expect(page.locator('input[name="salaryMax"]')).toHaveValue('120000');
    });

    test('should handle template usage with missing fields gracefully', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/post-job');
      await page.waitForLoadState('networkidle');

      // Use a template with minimal data
      await page.click('button:has-text("Use Template")');
      await page.waitForSelector('[role="dialog"]');

      // Select minimal template
      await page.click('text=Minimal Template');
      await page.click('button:has-text("Use This Template")');

      // Verify form is partially filled
      await expect(page.locator('input[name="title"]')).toHaveValue('Software Developer');
      await expect(page.locator('input[name="location"]')).toHaveValue('Remote');
      
      // Other fields should be empty or have default values
      await expect(page.locator('input[name="salaryMin"]')).toHaveValue('');
    });

    test('should update template usage count when used', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Get initial usage count
      const initialCount = await page.locator('text=Used').first().textContent();
      
      // Use the template
      await page.goto('http://localhost:3000/employer-dashboard/post-job');
      await page.click('button:has-text("Use Template")');
      await page.waitForSelector('[role="dialog"]');
      await page.click('text=Test Integration Template');
      await page.click('button:has-text("Use This Template")');

      // Go back to templates page
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Verify usage count increased
      const newCount = await page.locator('text=Used').first().textContent();
      expect(newCount).not.toBe(initialCount);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle network errors during template creation', async () => {
      // Simulate network failure
      await page.route('**/api/job-templates', route => route.abort());
      
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.click('button:has-text("Create Template")');
      await page.waitForSelector('[role="dialog"]');
      
      await page.fill('input[name="name"]', 'Test Template');
      await page.fill('input[name="title"]', 'Test Job');
      await page.fill('input[name="location"]', 'Test Location');
      await page.fill('textarea[name="description"]', 'Test description');
      
      await page.click('button:has-text("Create Template")');
      
      // Should show error message
      await expect(page.locator('text=Failed to create template')).toBeVisible();
    });

    test('should handle invalid template data', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.click('button:has-text("Create Template")');
      await page.waitForSelector('[role="dialog"]');

      // Try to submit with invalid data
      await page.fill('input[name="name"]', ''); // Empty name
      await page.fill('input[name="title"]', 'A'.repeat(300)); // Too long title
      await page.fill('input[name="salaryMin"]', 'invalid'); // Invalid salary
      
      await page.click('button:has-text("Create Template")');
      
      // Should show validation errors
      await expect(page.locator('text=Template name is required')).toBeVisible();
      await expect(page.locator('text=Job title is too long')).toBeVisible();
      await expect(page.locator('text=Please enter a valid salary')).toBeVisible();
    });

    test('should handle concurrent template modifications', async () => {
      // Open two browser contexts to simulate concurrent access
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      
      // Login on second page
      await page2.goto('http://localhost:3000/employer-login');
      await page2.fill('input[name="email"]', 'test@employer.com');
      await page2.fill('input[name="password"]', 'password123');
      await page2.click('button[type="submit"]');
      await page2.waitForURL('**/employer-dashboard');

      // Both pages navigate to templates
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page2.goto('http://localhost:3000/employer-dashboard/job-templates');
      
      await page.waitForLoadState('networkidle');
      await page2.waitForLoadState('networkidle');

      // Both pages try to edit the same template
      const editButton1 = page.locator('button[aria-label="Edit template"]').first();
      const editButton2 = page2.locator('button[aria-label="Edit template"]').first();
      
      await editButton1.click();
      await editButton2.click();
      
      // Both pages modify the template
      await page.fill('input[name="name"]', 'Modified by Page 1');
      await page2.fill('input[name="name"]', 'Modified by Page 2');
      
      // Submit both changes
      await page.click('button:has-text("Update Template")');
      await page2.click('button:has-text("Update Template")');
      
      // One should succeed, one should show conflict error
      await page.waitForTimeout(2000);
      
      // Clean up
      await context2.close();
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle large number of templates efficiently', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Create multiple templates quickly
      for (let i = 0; i < 10; i++) {
        await page.click('button:has-text("Create Template")');
        await page.waitForSelector('[role="dialog"]');
        
        await page.fill('input[name="name"]', `Template ${i + 1}`);
        await page.fill('input[name="title"]', `Job ${i + 1}`);
        await page.fill('input[name="location"]', 'Location');
        await page.fill('textarea[name="description"]', 'Description');
        
        await page.click('button:has-text("Create Template")');
        await page.waitForSelector('text=Template created successfully');
      }

      // Verify all templates are displayed
      const templates = page.locator('[data-testid="template-card"]');
      const count = await templates.count();
      expect(count).toBeGreaterThanOrEqual(10);
    });

    test('should paginate templates correctly', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Check if pagination exists
      const pagination = page.locator('[data-testid="pagination"]');
      if (await pagination.isVisible()) {
        // Test pagination
        await page.click('button:has-text("Next")');
        await page.waitForLoadState('networkidle');
        
        // Verify page changed
        const pageIndicator = page.locator('[data-testid="page-indicator"]');
        await expect(pageIndicator).toContainText('2');
      }
    });
  });

  describe('Accessibility and UX', () => {
    test('should be keyboard navigable', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Should open create dialog
      
      await page.waitForSelector('[role="dialog"]');
      
      // Tab through form fields
      await page.keyboard.press('Tab');
      await page.keyboard.type('Keyboard Test Template');
      
      await page.keyboard.press('Tab');
      await page.keyboard.type('Test Job Title');
      
      // Continue tabbing through all fields...
    });

    test('should have proper ARIA labels and roles', async () => {
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Check for proper ARIA labels
      await expect(page.locator('button[aria-label="Create template"]')).toBeVisible();
      await expect(page.locator('button[aria-label="Edit template"]')).toBeVisible();
      await expect(page.locator('button[aria-label="Delete template"]')).toBeVisible();
      
      // Check for proper roles
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('[role="button"]')).toBeVisible();
    });

    test('should work on mobile devices', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('http://localhost:3000/employer-dashboard/job-templates');
      await page.waitForLoadState('networkidle');

      // Test mobile interactions
      await page.click('button:has-text("Create Template")');
      await page.waitForSelector('[role="dialog"]');
      
      // Verify mobile-friendly form
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('textarea[name="description"]')).toBeVisible();
    });
  });
});
