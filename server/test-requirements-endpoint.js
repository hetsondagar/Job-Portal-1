const { sequelize } = require('./config/sequelize');
const Requirement = require('./models/Requirement');

async function testRequirementsEndpoint() {
  try {
    console.log('🧪 Testing Requirements Endpoint...');
    
    // Test if we can fetch requirements without column errors
    console.log('\n📋 Step 1: Testing Requirement.findAll...');
    
    const requirements = await Requirement.findAll({
      where: {
        companyId: '8db23e48-3457-4ae5-8ec6-3ce2e4e073d7'
      },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    console.log(`✅ Successfully fetched ${requirements.length} requirements`);
    
    if (requirements.length > 0) {
      const req = requirements[0];
      console.log('📊 Sample requirement:', {
        id: req.id,
        title: req.title,
        status: req.status,
        companyId: req.companyId,
        createdAt: req.createdAt
      });
    }
    
    console.log('\n📋 Step 2: Testing Requirement.count...');
    
    const totalCount = await Requirement.count({
      where: {
        companyId: '8db23e48-3457-4ae5-8ec6-3ce2e4e073d7'
      }
    });
    
    console.log(`✅ Total requirements count: ${totalCount}`);
    
    console.log('\n🎉 Requirements endpoint test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing requirements endpoint:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } finally {
    await sequelize.close();
  }
}

testRequirementsEndpoint();
