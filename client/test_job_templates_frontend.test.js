/**
 * Frontend Tests for Job Templates
 * These tests cover the job templates page functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import JobTemplatesPage from './app/employer-dashboard/job-templates/page';

// Mock the API service
jest.mock('./lib/api', () => ({
  apiService: {
    getJobTemplates: jest.fn(),
    createJobTemplate: jest.fn(),
    updateJobTemplate: jest.fn(),
    deleteJobTemplate: jest.fn(),
    toggleTemplatePublic: jest.fn(),
    useJobTemplate: jest.fn(),
    createJobFromTemplate: jest.fn()
  }
}));

// Mock the auth hook
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      companyId: 'test-company-id',
      firstName: 'Test',
      lastName: 'User'
    },
    loading: false
  })
}));

// Mock the auth guard
jest.mock('./components/employer-auth-guard', () => {
  return function MockAuthGuard({ children }) {
    return children;
  };
});

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('Job Templates Page', () => {
  const mockTemplates = [
    {
      id: 'template-1',
      name: 'Senior Software Engineer Template',
      description: 'Template for senior software engineer positions',
      category: 'technical',
      isPublic: false,
      usageCount: 5,
      lastUsedAt: '2024-01-15T10:00:00Z',
      tags: ['engineering', 'senior', 'software'],
      templateData: {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Mumbai, India',
        type: 'full-time',
        experience: 'senior',
        salary: '15-25 LPA',
        description: 'We are looking for a senior software engineer...',
        requirements: '5+ years of experience in software development...',
        benefits: 'Health insurance, flexible hours, remote work',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        keywords: ['senior', 'software', 'engineer', 'full-stack']
      },
      createdBy: 'test-user-id',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template-2',
      name: 'Marketing Manager Template',
      description: 'Template for marketing manager positions',
      category: 'non-technical',
      isPublic: true,
      usageCount: 3,
      lastUsedAt: '2024-01-10T10:00:00Z',
      tags: ['marketing', 'manager'],
      templateData: {
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'Delhi, India',
        type: 'full-time',
        experience: 'mid',
        salary: '8-12 LPA',
        description: 'We are looking for a marketing manager...',
        requirements: '3+ years of marketing experience...',
        benefits: 'Health insurance, performance bonus',
        skills: ['Digital Marketing', 'SEO', 'Social Media'],
        keywords: ['marketing', 'manager', 'digital']
      },
      createdBy: 'other-user-id',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    require('./lib/api').apiService.getJobTemplates.mockResolvedValue({
      success: true,
      data: mockTemplates
    });
  });

  describe('Template List Display', () => {
    test('should render templates list correctly', async () => {
      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer Template')).toBeInTheDocument();
        expect(screen.getByText('Marketing Manager Template')).toBeInTheDocument();
      });

      // Check category badges
      expect(screen.getByText('technical')).toBeInTheDocument();
      expect(screen.getByText('non-technical')).toBeInTheDocument();

      // Check usage counts
      expect(screen.getByText('Used 5 times')).toBeInTheDocument();
      expect(screen.getByText('Used 3 times')).toBeInTheDocument();

      // Check ownership indicators
      expect(screen.getByText('My Template')).toBeInTheDocument();
      expect(screen.getByText('Shared')).toBeInTheDocument();
    });

    test('should show empty state when no templates', async () => {
      require('./lib/api').apiService.getJobTemplates.mockResolvedValue({
        success: true,
        data: []
      });

      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('No templates found')).toBeInTheDocument();
        expect(screen.getByText('Create your first job template to get started')).toBeInTheDocument();
      });
    });

    test('should handle loading state', () => {
      require('./lib/api').apiService.getJobTemplates.mockImplementation(() => new Promise(() => {}));
      
      render(<JobTemplatesPage />);
      
      expect(screen.getByText('Loading templates...')).toBeInTheDocument();
    });
  });

  describe('Template Creation', () => {
    test('should open create template dialog', async () => {
      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Template')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Template');
      fireEvent.click(createButton);

      expect(screen.getByText('Create New Template')).toBeInTheDocument();
      expect(screen.getByText('Template Information')).toBeInTheDocument();
      expect(screen.getByText('Job Information')).toBeInTheDocument();
    });

    test('should create template with valid data', async () => {
      require('./lib/api').apiService.createJobTemplate.mockResolvedValue({
        success: true,
        data: { id: 'new-template-id' }
      });

      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Template')).toBeInTheDocument();
      });

      // Open create dialog
      fireEvent.click(screen.getByText('Create Template'));

      // Fill form
      fireEvent.change(screen.getByLabelText('Template Name *'), {
        target: { value: 'New Template' }
      });
      fireEvent.change(screen.getByLabelText('Category *'), {
        target: { value: 'technical' }
      });
      fireEvent.change(screen.getByLabelText('Job Title *'), {
        target: { value: 'Test Job' }
      });
      fireEvent.change(screen.getByLabelText('Department *'), {
        target: { value: 'Engineering' }
      });
      fireEvent.change(screen.getByLabelText('Location *'), {
        target: { value: 'Mumbai, India' }
      });
      fireEvent.change(screen.getByLabelText('Job Type *'), {
        target: { value: 'full-time' }
      });
      fireEvent.change(screen.getByLabelText('Experience Level *'), {
        target: { value: 'senior' }
      });
      fireEvent.change(screen.getByLabelText('Job Description *'), {
        target: { value: 'Test job description' }
      });
      fireEvent.change(screen.getByLabelText('Requirements *'), {
        target: { value: 'Test requirements' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Create Template'));

      await waitFor(() => {
        expect(require('./lib/api').apiService.createJobTemplate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Template',
            category: 'technical',
            templateData: expect.objectContaining({
              title: 'Test Job',
              department: 'Engineering',
              location: 'Mumbai, India',
              type: 'full-time',
              experience: 'senior',
              description: 'Test job description',
              requirements: 'Test requirements'
            })
          })
        );
      });
    });

    test('should show validation errors for missing required fields', async () => {
      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Template')).toBeInTheDocument();
      });

      // Open create dialog
      fireEvent.click(screen.getByText('Create Template'));

      // Try to submit without filling required fields
      fireEvent.click(screen.getByText('Create Template'));

      // Should show validation error
      expect(require('sonner').toast.error).toHaveBeenCalledWith(
        'Please fill in all required fields'
      );
    });
  });

  describe('Template Editing', () => {
    test('should open edit dialog for own templates', async () => {
      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer Template')).toBeInTheDocument();
      });

      // Find edit button for own template
      const editButtons = screen.getAllByTitle('Edit Template');
      expect(editButtons).toHaveLength(1); // Only own template should have edit button

      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Edit Template')).toBeInTheDocument();
    });

    test('should not show edit button for other users templates', async () => {
      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Marketing Manager Template')).toBeInTheDocument();
      });

      // Should not have edit button for other user's template
      const editButtons = screen.queryAllByTitle('Edit Template');
      expect(editButtons).toHaveLength(1); // Only own template
    });
  });

  describe('Template Actions', () => {
    test('should delete template with confirmation', async () => {
      // Mock window.confirm
      window.confirm = jest.fn(() => true);
      
      require('./lib/api').apiService.deleteJobTemplate.mockResolvedValue({
        success: true
      });

      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer Template')).toBeInTheDocument();
      });

      // Find delete button for own template
      const deleteButtons = screen.getAllByTitle('Delete Template');
      expect(deleteButtons).toHaveLength(1);

      fireEvent.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this template?');
      expect(require('./lib/api').apiService.deleteJobTemplate).toHaveBeenCalledWith('template-1');
    });

    test('should toggle template visibility', async () => {
      require('./lib/api').apiService.toggleTemplatePublic.mockResolvedValue({
        success: true,
        message: 'Template is now public'
      });

      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer Template')).toBeInTheDocument();
      });

      // Find toggle visibility button for own template
      const toggleButtons = screen.getAllByTitle('Make Public');
      expect(toggleButtons).toHaveLength(1);

      fireEvent.click(toggleButtons[0]);

      expect(require('./lib/api').apiService.toggleTemplatePublic).toHaveBeenCalledWith('template-1');
    });

    test('should create job from template', async () => {
      require('./lib/api').apiService.createJobFromTemplate.mockResolvedValue({
        success: true,
        data: {
          prefill: {
            title: 'Senior Software Engineer',
            department: 'Engineering'
          }
        }
      });

      // Mock window.location.href
      delete window.location;
      window.location = { href: '' };

      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer Template')).toBeInTheDocument();
      });

      // Find create job button
      const createJobButtons = screen.getAllByText('Create Job from Template');
      expect(createJobButtons).toHaveLength(2); // One for each template

      fireEvent.click(createJobButtons[0]);

      expect(require('./lib/api').apiService.createJobFromTemplate).toHaveBeenCalledWith('template-1');
    });
  });

  describe('Search and Filtering', () => {
    test('should filter templates by category', async () => {
      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer Template')).toBeInTheDocument();
      });

      // Select technical category
      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.click(categorySelect);
      
      const technicalOption = screen.getByText('Technical');
      fireEvent.click(technicalOption);

      expect(require('./lib/api').apiService.getJobTemplates).toHaveBeenCalledWith({
        category: 'technical',
        search: undefined
      });
    });

    test('should search templates by name', async () => {
      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer Template')).toBeInTheDocument();
      });

      // Enter search query
      const searchInput = screen.getByPlaceholderText('Search templates...');
      fireEvent.change(searchInput, { target: { value: 'Senior' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      expect(require('./lib/api').apiService.getJobTemplates).toHaveBeenCalledWith({
        category: 'all',
        search: 'Senior'
      });
    });
  });

  describe('Skills and Keywords Management', () => {
    test('should add and remove skills', async () => {
      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Template')).toBeInTheDocument();
      });

      // Open create dialog
      fireEvent.click(screen.getByText('Create Template'));

      // Add skill
      const skillInput = screen.getByPlaceholderText('Add a skill...');
      fireEvent.change(skillInput, { target: { value: 'JavaScript' } });
      fireEvent.click(screen.getByText('Add'));

      expect(screen.getByText('JavaScript')).toBeInTheDocument();

      // Remove skill
      const removeButton = screen.getByText('×');
      fireEvent.click(removeButton);

      expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    });

    test('should add and remove keywords', async () => {
      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Template')).toBeInTheDocument();
      });

      // Open create dialog
      fireEvent.click(screen.getByText('Create Template'));

      // Add keyword
      const keywordInput = screen.getByPlaceholderText('Add a keyword...');
      fireEvent.change(keywordInput, { target: { value: 'senior' } });
      fireEvent.click(screen.getByText('Add'));

      expect(screen.getByText('senior')).toBeInTheDocument();

      // Remove keyword
      const removeButtons = screen.getAllByText('×');
      const keywordRemoveButton = removeButtons.find(button => 
        button.closest('.flex.items-center')?.textContent?.includes('senior')
      );
      fireEvent.click(keywordRemoveButton);

      expect(screen.queryByText('senior')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      require('./lib/api').apiService.getJobTemplates.mockRejectedValue(new Error('API Error'));

      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(require('sonner').toast.error).toHaveBeenCalledWith('Failed to fetch templates');
      });
    });

    test('should handle template creation errors', async () => {
      require('./lib/api').apiService.createJobTemplate.mockResolvedValue({
        success: false,
        message: 'Creation failed'
      });

      render(<JobTemplatesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Template')).toBeInTheDocument();
      });

      // Open create dialog and fill form
      fireEvent.click(screen.getByText('Create Template'));
      
      fireEvent.change(screen.getByLabelText('Template Name *'), {
        target: { value: 'Test Template' }
      });
      fireEvent.change(screen.getByLabelText('Category *'), {
        target: { value: 'technical' }
      });
      fireEvent.change(screen.getByLabelText('Job Title *'), {
        target: { value: 'Test Job' }
      });
      fireEvent.change(screen.getByLabelText('Department *'), {
        target: { value: 'Engineering' }
      });
      fireEvent.change(screen.getByLabelText('Location *'), {
        target: { value: 'Mumbai, India' }
      });
      fireEvent.change(screen.getByLabelText('Job Type *'), {
        target: { value: 'full-time' }
      });
      fireEvent.change(screen.getByLabelText('Experience Level *'), {
        target: { value: 'senior' }
      });
      fireEvent.change(screen.getByLabelText('Job Description *'), {
        target: { value: 'Test job description' }
      });
      fireEvent.change(screen.getByLabelText('Requirements *'), {
        target: { value: 'Test requirements' }
      });

      fireEvent.click(screen.getByText('Create Template'));

      await waitFor(() => {
        expect(require('sonner').toast.error).toHaveBeenCalledWith('Creation failed');
      });
    });
  });
});
