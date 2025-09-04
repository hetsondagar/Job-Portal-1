const { apiService } = require('./client/lib/api');

async function testJobTemplates() {
  console.log('🧪 Testing Job Templates API...\n');

  try {
    // Test 1: Get all templates
    console.log('1. Testing getJobTemplates...');
    const templatesResponse = await apiService.getJobTemplates();
    console.log('✅ Templates response:', templatesResponse);
    
    if (templatesResponse.success && templatesResponse.data) {
      console.log(`📊 Found ${templatesResponse.data.length} templates`);
      
      // Test 2: Get template by ID
      if (templatesResponse.data.length > 0) {
        const firstTemplate = templatesResponse.data[0];
        console.log('\n2. Testing getJobTemplateById...');
        const templateResponse = await apiService.getJobTemplateById(firstTemplate.id);
        console.log('✅ Template by ID response:', templateResponse);
      }
      
      // Test 3: Create a new template
      console.log('\n3. Testing createJobTemplate...');
      const newTemplate = {
        name: 'Test Template',
        description: 'A test template for testing purposes',
        category: 'technical',
        isPublic: false,
        templateData: {
          title: 'Test Job',
          department: 'engineering',
          location: 'Remote',
          type: 'full-time',
          experience: 'mid',
          salary: '₹10-20 LPA',
          description: 'Test job description',
          requirements: 'Test requirements',
          benefits: 'Test benefits',
          skills: ['Test', 'Skills']
        },
        tags: ['test', 'template']
      };
      
      const createResponse = await apiService.createJobTemplate(newTemplate);
      console.log('✅ Create template response:', createResponse);
      
      if (createResponse.success) {
        const createdTemplate = createResponse.data;
        
        // Test 4: Update template
        console.log('\n4. Testing updateJobTemplate...');
        const updateResponse = await apiService.updateJobTemplate(createdTemplate.id, {
          description: 'Updated test template description'
        });
        console.log('✅ Update template response:', updateResponse);
        
        // Test 5: Toggle public status
        console.log('\n5. Testing toggleTemplatePublic...');
        const toggleResponse = await apiService.toggleTemplatePublic(createdTemplate.id);
        console.log('✅ Toggle public response:', toggleResponse);
        
        // Test 6: Use template
        console.log('\n6. Testing useJobTemplate...');
        const useResponse = await apiService.useJobTemplate(createdTemplate.id);
        console.log('✅ Use template response:', useResponse);
        
        // Test 7: Delete template
        console.log('\n7. Testing deleteJobTemplate...');
        const deleteResponse = await apiService.deleteJobTemplate(createdTemplate.id);
        console.log('✅ Delete template response:', deleteResponse);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testJobTemplates();
