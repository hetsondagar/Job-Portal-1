require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailService() {
  try {
    console.log('🧪 Testing Email Service...\n');

    // Test 1: Check environment variables
    console.log('1. Checking Email Configuration...');
    console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('   SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '❌ Not set');
    console.log('   SENDGRID_FROM_NAME:', process.env.SENDGRID_FROM_NAME || '❌ Not set');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

    // Test 2: Test email service
    console.log('\n2. Testing Email Service...');
    const testResult = await emailService.testEmailService();
    
    if (testResult.success) {
      console.log('✅ Email service test successful:', testResult.message);
    } else {
      console.log('❌ Email service test failed:', testResult.message);
    }

    // Test 3: Test password reset email
    console.log('\n3. Testing Password Reset Email...');
    try {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const result = await emailService.sendPasswordResetEmail(
        testEmail, 
        'test-reset-token-123', 
        'Test User'
      );
      
      console.log('✅ Password reset email sent successfully!');
      console.log('   Method:', result.method);
      console.log('   To:', testEmail);
      
      if (result.messageId) {
        console.log('   Message ID:', result.messageId);
      }
      
    } catch (error) {
      console.log('❌ Password reset email failed:', error.message);
    }

    console.log('\n🎉 Email service test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEmailService();
