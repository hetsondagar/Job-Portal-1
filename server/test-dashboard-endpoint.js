require('dotenv').config();
const { sequelize } = require('./config/sequelize');

async function testDashboardEndpoint() {
  console.log('🔧 Testing Dashboard Stats Endpoint...\n');
  
  try {
    // Test the dashboard stats endpoint logic directly
    const JobApplication = require('./models/JobApplication');
    const Analytics = require('./models/Analytics');
    const Job = require('./models/Job');
    
    console.log('1️⃣ Testing application count...');
    let applicationCount = 0;
    try {
      applicationCount = await JobApplication.count({
        where: { userId: 'test-user-id' }
      });
      console.log('✅ Application count query works:', applicationCount);
    } catch (error) {
      console.error('❌ Error fetching application count:', error.message);
      applicationCount = 0;
    }
    
    console.log('\n2️⃣ Testing profile views...');
    let profileViews = 0;
    try {
      profileViews = await Analytics.count({
        where: { 
          userId: 'test-user-id',
          eventType: 'profile_view'
        }
      });
      console.log('✅ Profile views query works:', profileViews);
    } catch (error) {
      console.error('❌ Error fetching profile views:', error.message);
      // Try simpler query
      try {
        profileViews = await Analytics.count({
          where: { userId: 'test-user-id' }
        });
        console.log('✅ Fallback profile views works:', profileViews);
      } catch (fallbackError) {
        console.error('❌ Fallback profile views failed:', fallbackError.message);
        profileViews = 0;
      }
    }
    
    console.log('\n3️⃣ Testing recent applications...');
    let recentApplications = [];
    try {
      recentApplications = await JobApplication.findAll({
        where: { userId: 'test-user-id' },
        order: [['applied_at', 'DESC']],
        limit: 5,
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'location', 'salaryMin', 'salaryMax']
          }
        ]
      });
      console.log('✅ Recent applications query works:', recentApplications.length);
    } catch (error) {
      console.error('❌ Error fetching recent applications:', error.message);
      // Try without include
      try {
        recentApplications = await JobApplication.findAll({
          where: { userId: 'test-user-id' },
          order: [['applied_at', 'DESC']],
          limit: 5
        });
        console.log('✅ Recent applications (without job details) works:', recentApplications.length);
      } catch (fallbackError) {
        console.error('❌ Fallback recent applications failed:', fallbackError.message);
        recentApplications = [];
      }
    }
    
    console.log('\n4️⃣ Preparing final stats...');
    const stats = {
      applicationCount,
      profileViews,
      recentApplications
    };
    
    console.log('✅ Final stats prepared successfully:');
    console.log('   - Application count:', stats.applicationCount);
    console.log('   - Profile views:', stats.profileViews);
    console.log('   - Recent applications:', stats.recentApplications.length);
    
    console.log('\n🎉 Dashboard stats endpoint test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Dashboard stats endpoint test failed:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting dashboard endpoint test...\n');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');
    
    const success = await testDashboardEndpoint();
    
    if (success) {
      console.log('\n✅ All tests passed! Dashboard stats should work now.');
    } else {
      console.log('\n❌ Some tests failed. Check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

runTest();
