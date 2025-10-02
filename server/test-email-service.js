#!/usr/bin/env node
require('dotenv').config();

const emailService = require('./services/simpleEmailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration with Gmail/Yahoo Fallback...');
  console.log('📧 Gmail Configuration:');
  console.log('  Gmail User:', process.env.GMAIL_USER || 'NOT SET');
  console.log('  Gmail Pass:', process.env.GMAIL_PASS ? '***hidden***' : 'NOT SET');
  console.log('\n📧 Yahoo Configuration:');
  console.log('  Yahoo User:', process.env.SMTP_USER || process.env.YAHOO_USER || 'NOT SET');
  console.log('  Yahoo Pass:', (process.env.SMTP_PASS || process.env.YAHOO_PASS) ? '***hidden***' : 'NOT SET');
  console.log('\n📧 General Configuration:');
  console.log('  From Email:', process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'NOT SET');
  console.log('  Frontend URL:', process.env.FRONTEND_URL || 'NOT SET');
  
  try {
    // Test sending a password reset email
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const testToken = 'test-token-' + Date.now();
    
    console.log('\n🚀 Sending test password reset email...');
    console.log('  To:', testEmail);
    console.log('  Fallback Strategy: Gmail → Yahoo → Custom SMTP');
    
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
