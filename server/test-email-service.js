#!/usr/bin/env node
require('dotenv').config();

const emailService = require('./services/simpleEmailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...');
  console.log('📧 SMTP Configuration:');
  console.log('  Host:', process.env.SMTP_HOST);
  console.log('  Port:', process.env.SMTP_PORT);
  console.log('  User:', process.env.SMTP_USER);
  console.log('  From:', process.env.EMAIL_FROM);
  console.log('  Pass:', process.env.SMTP_PASS ? '***hidden***' : 'NOT SET');
  
  try {
    // Test sending a password reset email
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const testToken = 'test-token-' + Date.now();
    
    console.log('\n🚀 Sending test password reset email...');
    console.log('  To:', testEmail);
    
    const result = await emailService.sendPasswordResetEmail(testEmail, testToken, 'Test User');
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('  Method:', result.method);
      console.log('  Message ID:', result.messageId);
      
      if (result.previewUrl) {
        console.log('  Preview URL:', result.previewUrl);
      }
    } else {
      console.log('❌ Email sending failed');
    }
    
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testEmailService().then(() => {
  console.log('\n🏁 Email service test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
