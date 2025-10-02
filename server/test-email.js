/**
 * Email Configuration Test Script
 * 
 * This script tests your email configuration without running the full server.
 * Run with: node test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🧪 Email Configuration Test\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Checking environment variables:');
console.log('-----------------------------------');

const checks = {
  'GMAIL_USER': process.env.GMAIL_USER,
  'GMAIL_APP_PASSWORD': process.env.GMAIL_APP_PASSWORD ? '***' + process.env.GMAIL_APP_PASSWORD.slice(-4) : undefined,
  'YAHOO_USER': process.env.YAHOO_USER,
  'YAHOO_APP_PASSWORD': process.env.YAHOO_APP_PASSWORD ? '***' + process.env.YAHOO_APP_PASSWORD.slice(-4) : undefined,
  'SMTP_HOST': process.env.SMTP_HOST,
  'SMTP_USER': process.env.SMTP_USER,
  'EMAIL_FROM': process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'noreply@jobportal.com',
  'FROM_NAME': process.env.FROM_NAME || 'Job Portal'
};

for (const [key, value] of Object.entries(checks)) {
  if (value) {
    console.log(`✓ ${key}: ${value}`);
  } else {
    console.log(`✗ ${key}: NOT SET`);
  }
}

// Test configurations
async function testEmailProvider(config) {
  console.log(`\n🔧 Testing ${config.name}...`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Secure: ${config.secure}`);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    debug: true,
    logger: true
  });

  try {
    console.log('   Verifying connection...');
    await transporter.verify();
    console.log(`✅ ${config.name} - Connection successful!`);
    return { success: true, provider: config.name };
  } catch (error) {
    console.log(`❌ ${config.name} - Connection failed`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    return { success: false, provider: config.name, error: error.message };
  }
}

async function runTests() {
  console.log('\n\n🚀 Starting connection tests...');
  console.log('=' .repeat(50));

  const configurations = [];

  // Gmail configuration
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    configurations.push({
      name: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    });
  }

  // Yahoo configurations
  if (process.env.YAHOO_USER && process.env.YAHOO_APP_PASSWORD) {
    configurations.push({
      name: 'Yahoo (Port 587)',
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false,
      user: process.env.YAHOO_USER,
      pass: process.env.YAHOO_APP_PASSWORD
    });

    configurations.push({
      name: 'Yahoo (Port 465)',
      host: 'smtp.mail.yahoo.com',
      port: 465,
      secure: true,
      user: process.env.YAHOO_USER,
      pass: process.env.YAHOO_APP_PASSWORD
    });
  }

  // Custom SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    configurations.push({
      name: 'Custom SMTP',
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    });
  }

  if (configurations.length === 0) {
    console.log('\n❌ No email configurations found in .env file!');
    console.log('\n📝 Please add one of the following to your .env file:');
    console.log('\nOption 1 - Gmail:');
    console.log('GMAIL_USER=your-email@gmail.com');
    console.log('GMAIL_APP_PASSWORD=your-16-char-app-password');
    console.log('\nOption 2 - Yahoo:');
    console.log('YAHOO_USER=your-email@yahoo.com');
    console.log('YAHOO_APP_PASSWORD=your-yahoo-app-password');
    console.log('\nSee server/QUICK_EMAIL_SETUP.md for detailed instructions');
    process.exit(1);
  }

  const results = [];
  for (const config of configurations) {
    const result = await testEmailProvider(config);
    results.push(result);
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n\n📊 Test Results Summary');
  console.log('=' .repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  if (successful.length > 0) {
    console.log('\n✅ Successful Connections:');
    successful.forEach(r => console.log(`   - ${r.provider}`));
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Connections:');
    failed.forEach(r => console.log(`   - ${r.provider}: ${r.error}`));
  }

  console.log('\n' + '=' .repeat(50));

  if (successful.length > 0) {
    console.log('\n🎉 SUCCESS! Your email is configured correctly!');
    console.log(`\n✅ ${successful[0].provider} will be used to send emails`);
    console.log('\nYou can now:');
    console.log('1. Start your server: npm start');
    console.log('2. Test forgot password on your website');
    console.log('3. Emails should arrive in inbox (check spam folder)');
  } else {
    console.log('\n❌ All email providers failed!');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your .env file has correct credentials');
    console.log('2. Make sure you\'re using App Password (not regular password)');
    console.log('3. Remove any spaces from passwords');
    console.log('4. Try Gmail instead of Yahoo (more reliable)');
    console.log('5. See server/QUICK_EMAIL_SETUP.md for help');
  }

  console.log('\n');
  process.exit(successful.length > 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

