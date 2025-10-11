#!/usr/bin/env node

/**
 * Gmail SMTP Setup Script
 * 
 * This script helps you set up Gmail SMTP for reliable email sending.
 * Gmail is more reliable than Yahoo in production environments.
 */

console.log('\n📧 Gmail SMTP Setup Guide');
console.log('========================\n');

console.log('🔧 Step 1: Enable 2-Factor Authentication');
console.log('1. Go to https://myaccount.google.com/security');
console.log('2. Click "2-Step Verification"');
console.log('3. Follow the setup process\n');

console.log('🔑 Step 2: Generate App Password');
console.log('1. Go to https://myaccount.google.com/apppasswords');
console.log('2. Select "Mail" and "Other (Custom name)"');
console.log('3. Enter "Job Portal" as the name');
console.log('4. Copy the 16-character password (e.g., abcd efgh ijkl mnop)\n');

console.log('⚙️ Step 3: Update Environment Variables');
console.log('Add these to your Render.com environment variables:\n');

console.log('GMAIL_USER=your-gmail-address@gmail.com');
console.log('GMAIL_APP_PASSWORD=your-16-character-app-password');
console.log('EMAIL_FROM=your-gmail-address@gmail.com');
console.log('FROM_NAME=Job Portal\n');

console.log('🚀 Step 4: Test the Configuration');
console.log('After updating the environment variables:');
console.log('1. Restart your Render.com service');
console.log('2. Try the forgot password functionality');
console.log('3. Check the logs for successful email sending\n');

console.log('✅ Benefits of Gmail SMTP:');
console.log('- More reliable than Yahoo in production');
console.log('- Better deliverability');
console.log('- Faster connection times');
console.log('- Less likely to be blocked by hosting providers\n');

console.log('🔍 Troubleshooting:');
console.log('- Make sure there are NO SPACES in the app password');
console.log('- Use the 16-character app password, not your regular password');
console.log('- Ensure 2FA is enabled before generating app password\n');

console.log('📞 Need Help?');
console.log('If you continue having issues, consider using:');
console.log('- SendGrid (recommended for production)');
console.log('- Mailgun');
console.log('- Amazon SES\n');

console.log('🎯 Quick Test Command:');
console.log('curl -X POST https://your-app.onrender.com/api/auth/test-email \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"email":"your-test-email@gmail.com"}\'\n');
