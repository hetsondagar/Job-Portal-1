require('dotenv').config();
const emailService = require('./services/simpleEmailService');

async function testSimpleEmailService() {
  try {
    console.log('🧪 Testing Simple Email Service...\n');

    // Test 1: Test email service
    console.log('1. Testing Email Service...');
    const testResult = await emailService.testEmailService();
    
    if (testResult.success) {
      console.log('✅ Email service test successful:', testResult.message);
      if (testResult.previewUrl) {
        console.log('📧 Email preview URL:', testResult.previewUrl);
      }
    } else {
      console.log('❌ Email service test failed:', testResult.message);
    }

    // Test 2: Test password reset email
    console.log('\n2. Testing Password Reset Email...');
    try {
      const result = await emailService.sendPasswordResetEmail(
        'your-email@example.com', 
        'test-reset-token-123', 
        'Test User'
      );
      
      console.log('✅ Password reset email sent successfully!');
      console.log('   Method:', result.method);
      console.log('   Message ID:', result.messageId);
      
      if (result.previewUrl) {
        console.log('📧 Email preview URL:', result.previewUrl);
        console.log('\n🎉 SUCCESS! You can view the email at the preview URL above.');
      }
      
    } catch (error) {
      console.log('❌ Password reset email failed:', error.message);
    }

    console.log('\n🎉 Simple email service test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSimpleEmailService();
