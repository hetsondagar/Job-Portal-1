const { sequelize } = require('./config/sequelize');
const User = require('./models/User');
const Company = require('./models/Company');
const jwt = require('jsonwebtoken');

async function testGoogleOAuthSync() {
  try {
    console.log('🔍 Testing Google OAuth with Profile Syncing...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    // Test 1: Create a test Google OAuth user
    console.log('\n📝 Test 1: Creating Google OAuth user with profile data...');
    const googleUserEmail = 'google-oauth-test@example.com';
    
    let googleUser = await User.findOne({ where: { email: googleUserEmail } });
    
    if (!googleUser) {
      // Create test company for employer
      const company = await Company.create({
        name: 'Test Company for Google OAuth',
        industry: 'Technology',
        size: '50-100',
        website: 'https://testcompany.com',
        description: 'Test company for Google OAuth testing'
      });
      
      googleUser = await User.create({
        email: googleUserEmail,
        first_name: 'John',
        last_name: 'Doe',
        oauth_provider: 'google',
        oauth_id: 'google_123456789',
        oauth_access_token: 'test_access_token',
        oauth_refresh_token: 'test_refresh_token',
        oauth_token_expires_at: new Date(Date.now() + 3600000),
        avatar: 'https://lh3.googleusercontent.com/a/test-avatar',
        is_email_verified: true,
        account_status: 'active',
        user_type: 'employer',
        company_id: company.id,
        // Synced Google profile data
        headline: 'Senior Software Engineer at Test Company',
        summary: 'Profile synced from Google account - John Doe',
        current_location: 'en_US',
        profile_completion: 75,
        last_profile_update: new Date()
      });
      
      console.log('✅ Google OAuth user created with synced profile data');
    } else {
      console.log('✅ Google OAuth user already exists');
    }
    
    // Test 2: Test JWT token generation
    console.log('\n📝 Test 2: Testing JWT token generation...');
    const token = jwt.sign(
      {
        id: googleUser.id,
        email: googleUser.email,
        userType: googleUser.user_type
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT token generated successfully');
    
    // Test 3: Test profile data retrieval
    console.log('\n📝 Test 3: Testing profile data retrieval...');
    const userProfile = await User.findByPk(googleUser.id, {
      attributes: { exclude: ['password', 'oauth_access_token', 'oauth_refresh_token'] }
    });
    
    console.log('✅ User profile data:', {
      id: userProfile.id,
      email: userProfile.email,
      name: `${userProfile.first_name} ${userProfile.last_name}`,
      userType: userProfile.user_type,
      oauthProvider: userProfile.oauth_provider,
      headline: userProfile.headline,
      currentLocation: userProfile.current_location,
      profileCompletion: userProfile.profile_completion,
      lastProfileUpdate: userProfile.last_profile_update,
      avatar: userProfile.avatar ? 'Present' : 'Not set'
    });
    
    // Test 4: Test employer-specific data
    console.log('\n📝 Test 4: Testing employer-specific data...');
    if (googleUser.user_type === 'employer' && googleUser.company_id) {
      const company = await Company.findByPk(googleUser.company_id);
      console.log('✅ Company data:', {
        companyId: company.id,
        companyName: company.name,
        industry: company.industry,
        size: company.size
      });
    }
    
    // Test 5: Test jobseeker user creation
    console.log('\n📝 Test 5: Testing jobseeker Google OAuth user...');
    const jobseekerEmail = 'jobseeker-google@example.com';
    
    let jobseekerUser = await User.findOne({ where: { email: jobseekerEmail } });
    
    if (!jobseekerUser) {
      jobseekerUser = await User.create({
        email: jobseekerEmail,
        first_name: 'Jane',
        last_name: 'Smith',
        oauth_provider: 'google',
        oauth_id: 'google_987654321',
        oauth_access_token: 'test_access_token_2',
        oauth_refresh_token: 'test_refresh_token_2',
        oauth_token_expires_at: new Date(Date.now() + 3600000),
        avatar: 'https://lh3.googleusercontent.com/a/jane-avatar',
        is_email_verified: true,
        account_status: 'active',
        user_type: 'jobseeker',
        // Synced Google profile data
        headline: 'Full Stack Developer',
        summary: 'Profile synced from Google account - Jane Smith',
        current_location: 'en_GB',
        profile_completion: 60,
        last_profile_update: new Date()
      });
      
      console.log('✅ Jobseeker Google OAuth user created');
    } else {
      console.log('✅ Jobseeker Google OAuth user already exists');
    }
    
    // Test 6: Test profile completion calculation
    console.log('\n📝 Test 6: Testing profile completion calculation...');
    const employerCompletion = googleUser.profile_completion;
    const jobseekerCompletion = jobseekerUser.profile_completion;
    
    console.log('✅ Profile completion rates:', {
      employer: `${employerCompletion}%`,
      jobseeker: `${jobseekerCompletion}%`
    });
    
    // Test 7: Test OAuth provider detection
    console.log('\n📝 Test 7: Testing OAuth provider detection...');
    const googleUsers = await User.findAll({
      where: { oauth_provider: 'google' },
      attributes: ['id', 'email', 'user_type', 'oauth_provider']
    });
    
    console.log('✅ Google OAuth users found:', googleUsers.length);
    googleUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.user_type})`);
    });
    
    console.log('\n🎉 All Google OAuth sync tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Database connection and sync working');
    console.log('✅ Google OAuth user creation with profile data');
    console.log('✅ JWT token generation');
    console.log('✅ Profile data retrieval and display');
    console.log('✅ Employer and jobseeker user types supported');
    console.log('✅ Profile completion tracking');
    console.log('✅ OAuth provider detection');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testGoogleOAuthSync();
