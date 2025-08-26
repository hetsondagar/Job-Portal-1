const { sequelize } = require('./config/sequelize');
const User = require('./models/User');
const Company = require('./models/Company');
const bcrypt = require('bcryptjs');

async function testAuth() {
  try {
    console.log('🔍 Testing authentication system...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    // Test user creation
    const testEmail = 'test@example.com';
    
    // Check if test user exists
    let user = await User.findOne({ where: { email: testEmail } });
    
    if (!user) {
      console.log('📝 Creating test user...');
      
      // Create test company first
      const company = await Company.create({
        name: 'Test Company',
        slug: 'test-company',
        industry: 'Technology',
        companySize: '1-50',
        email: testEmail,
        phone: '1234567890',
        contactPerson: 'Test User',
        contactEmail: testEmail,
        contactPhone: '1234567890',
        companyStatus: 'active',
        isActive: true
      });
      
      console.log('✅ Test company created:', company.id);
      
      // Create test employer user
      user = await User.create({
        email: testEmail,
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
        phone: '1234567890',
        user_type: 'employer',
        account_status: 'active',
        is_email_verified: false,
        company_id: company.id,
        oauth_provider: 'local'
      });
      
      console.log('✅ Test user created:', user.id);
    } else {
      console.log('✅ Test user already exists:', user.id);
    }
    
    // Test password comparison
    const isPasswordValid = await user.comparePassword('TestPassword123!');
    console.log('✅ Password comparison test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    // Test invalid password
    const isInvalidPasswordValid = await user.comparePassword('WrongPassword');
    console.log('✅ Invalid password test:', !isInvalidPasswordValid ? 'PASSED' : 'FAILED');
    
    // Test user data
    console.log('📊 User data:', {
      id: user.id,
      email: user.email,
      userType: user.user_type,
      accountStatus: user.account_status,
      companyId: user.company_id
    });
    
    console.log('✅ Authentication system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testAuth();
