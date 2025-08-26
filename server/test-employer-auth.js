const { sequelize } = require('./config/sequelize');
const User = require('./models/User');
const Company = require('./models/Company');
const bcrypt = require('bcryptjs');

async function testEmployerAuth() {
  try {
    console.log('🔍 Testing Employer Authentication...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');
    
    // Test data
    const testEmployerData = {
      fullName: 'John Doe',
      email: 'john.doe@testcompany.com',
      password: 'TestPassword123',
      companyName: 'Test Company Ltd',
      phone: '+919876543210',
      companySize: '51-200',
      industry: 'technology',
      website: 'https://testcompany.com'
    };
    
    console.log('\n📝 Testing Employer Registration...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: testEmployerData.email } });
    if (existingUser) {
      console.log('⚠️  Test user already exists, deleting...');
      await existingUser.destroy();
    }
    
    // Check if company already exists
    const existingCompany = await Company.findOne({ where: { email: testEmployerData.email } });
    if (existingCompany) {
      console.log('⚠️  Test company already exists, deleting...');
      await existingCompany.destroy();
    }
    
    // Simulate employer registration
    const transaction = await sequelize.transaction();
    
    try {
      // Generate slug from company name
      const generateSlug = (name) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .substring(0, 50);
      };

      const companySlug = generateSlug(testEmployerData.companyName);
      
      // Create company
      const company = await Company.create({
        name: testEmployerData.companyName,
        slug: companySlug,
        industry: testEmployerData.industry,
        companySize: testEmployerData.companySize,
        website: testEmployerData.website,
        email: testEmployerData.email,
        phone: testEmployerData.phone,
        contactPerson: testEmployerData.fullName,
        contactEmail: testEmployerData.email,
        contactPhone: testEmployerData.phone,
        companyStatus: 'active',
        isActive: true
      }, { transaction });
      
      console.log('✅ Company created:', company.id);
      
      // Create employer user
      const nameParts = testEmployerData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const user = await User.create({
        email: testEmployerData.email,
        password: testEmployerData.password,
        first_name: firstName,
        last_name: lastName,
        phone: testEmployerData.phone,
        user_type: 'employer',
        account_status: 'active',
        is_email_verified: false,
        company_id: company.id,
        oauth_provider: 'local'
      }, { transaction });
      
      console.log('✅ Employer user created:', user.id);
      
      await transaction.commit();
      console.log('✅ Transaction committed successfully');
      
      // Test login
      console.log('\n🔐 Testing Employer Login...');
      
      const loginUser = await User.findOne({ where: { email: testEmployerData.email } });
      if (!loginUser) {
        throw new Error('User not found after creation');
      }
      
      console.log('✅ User found for login:', loginUser.email);
      
      // Test password comparison
      const isPasswordValid = await loginUser.comparePassword(testEmployerData.password);
      if (isPasswordValid) {
        console.log('✅ Password verification successful');
      } else {
        throw new Error('Password verification failed');
      }
      
      // Test user type
      if (loginUser.user_type === 'employer') {
        console.log('✅ User type is employer');
      } else {
        throw new Error('User type is not employer');
      }
      
      // Test account status
      if (loginUser.account_status === 'active') {
        console.log('✅ Account status is active');
      } else {
        throw new Error('Account status is not active');
      }
      
      // Test company association
      if (loginUser.company_id) {
        const associatedCompany = await Company.findByPk(loginUser.company_id);
        if (associatedCompany) {
          console.log('✅ Company association verified:', associatedCompany.name);
        } else {
          throw new Error('Company association failed');
        }
      } else {
        throw new Error('No company ID associated with user');
      }
      
      console.log('\n🎉 All employer authentication tests passed!');
      
      // Clean up test data
      console.log('\n🧹 Cleaning up test data...');
      await loginUser.destroy();
      await associatedCompany.destroy();
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
}

testEmployerAuth();
