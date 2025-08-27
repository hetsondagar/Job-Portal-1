const fs = require('fs');
const path = require('path');

console.log('🔧 Google OAuth Setup Helper');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');
  
  // Read existing .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if OAuth variables are already set
  const hasGoogleClientId = envContent.includes('GOOGLE_CLIENT_ID=');
  const hasGoogleClientSecret = envContent.includes('GOOGLE_CLIENT_SECRET=');
  
  if (hasGoogleClientId && hasGoogleClientSecret) {
    console.log('✅ Google OAuth credentials are already configured');
    console.log('💡 If OAuth is still not working, check that the credentials are correct');
  } else {
    console.log('⚠️ Google OAuth credentials are missing from .env file');
    console.log('\n📝 Add the following to your .env file:');
    console.log('GOOGLE_CLIENT_ID=your-google-client-id-here');
    console.log('GOOGLE_CLIENT_SECRET=your-google-client-secret-here');
    console.log('GOOGLE_CALLBACK_URL=http://localhost:8000/api/oauth/google/callback');
  }
} else {
  console.log('❌ .env file not found');
  console.log('\n📝 Create a .env file in the server directory with the following content:');
  console.log('');
  console.log('# OAuth Configuration');
  console.log('GOOGLE_CLIENT_ID=your-google-client-id-here');
  console.log('GOOGLE_CLIENT_SECRET=your-google-client-secret-here');
  console.log('GOOGLE_CALLBACK_URL=http://localhost:8000/api/oauth/google/callback');
  console.log('');
  console.log('# Frontend URL for OAuth redirects');
  console.log('FRONTEND_URL=http://localhost:3000');
  console.log('BACKEND_URL=http://localhost:8000');
  console.log('');
  console.log('# Database Configuration');
  console.log('DB_HOST=localhost');
  console.log('DB_PORT=5432');
  console.log('DB_USER=postgres');
  console.log('DB_PASSWORD=password');
  console.log('DB_NAME=jobportal_dev');
  console.log('');
  console.log('# Server Configuration');
  console.log('NODE_ENV=development');
  console.log('PORT=8000');
  console.log('JWT_SECRET=your-super-secret-jwt-key-here');
  console.log('JWT_EXPIRES_IN=7d');
  console.log('');
  console.log('# Session Configuration');
  console.log('SESSION_SECRET=your-session-secret-key');
}

console.log('\n📋 Next Steps:');
console.log('1. Follow the Google OAuth Setup Guide: GOOGLE_OAUTH_SETUP_GUIDE.md');
console.log('2. Get your Google Client ID and Secret from Google Cloud Console');
console.log('3. Add them to your .env file');
console.log('4. Restart the server');
console.log('5. Test OAuth with: node test-oauth-complete-flow.js');

console.log('\n🔗 Useful Links:');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- OAuth Setup Guide: GOOGLE_OAUTH_SETUP_GUIDE.md');
console.log('- Test Script: test-oauth-complete-flow.js');
