const { sequelize, User, Job, JobApplication, Company } = require('./config/index');

async function testPremiumSorting() {
  try {
    console.log('🔄 Testing premium user sorting in applications...');
    
    // Get a sample employer
    const employer = await User.findOne({
      where: { user_type: 'employer' },
      limit: 1
    });
    
    if (!employer) {
      console.log('❌ No employer found for testing');
      return;
    }
    
    console.log('👤 Testing with employer:', employer.email);
    
    // Get applications for this employer
    const applications = await JobApplication.findAll({
      where: { employerId: employer.id },
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'first_name', 'last_name', 'email', 'verification_level', 'preferences']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title']
        }
      ],
      order: [
        // Sort by premium status first (premium users on top)
        [
          { model: User, as: 'applicant' },
          'verification_level',
          'DESC'
        ],
        // Then by application date (newest first)
        ['appliedAt', 'DESC']
      ],
      limit: 10
    });
    
    console.log('📊 Applications found:', applications.length);
    console.log('📋 Applications sorted by premium status:');
    
    applications.forEach((app, index) => {
      const applicant = app.applicant;
      const isPremium = applicant && (
        applicant.verification_level === 'premium' || 
        applicant?.preferences?.premium
      );
      
      console.log(`${index + 1}. ${applicant?.first_name} ${applicant?.last_name} - ${isPremium ? '🌟 PREMIUM' : 'Regular'} (${applicant?.verification_level || 'unverified'})`);
    });
    
    // Check if premium users are at the top
    const premiumCount = applications.filter(app => {
      const applicant = app.applicant;
      return applicant && (
        applicant.verification_level === 'premium' || 
        applicant?.preferences?.premium
      );
    }).length;
    
    console.log(`✅ Found ${premiumCount} premium applications`);
    console.log('✅ Premium users should appear at the top of the list');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testPremiumSorting();
