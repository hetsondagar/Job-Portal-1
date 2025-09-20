#!/usr/bin/env node

/**
 * Production Setup Script
 * This script helps set up the production environment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up production environment...');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Creating one from template...');
  
  const envTemplate = `# Production Environment Configuration
# Database Configuration (Render PostgreSQL)
DB_HOST=dpg-d372gajuibrs738lnm5g-a.singapore-postgres.render.com
DB_PORT=5432
DB_USER=jobportal_dev_0u1u_user
DB_PASSWORD=yK9WCII787btQrSqZJVdq0Cx61rZoTsc
DB_NAME=jobportal_dev_0u1u

# Server Configuration
NODE_ENV=production
PORT=8000
JWT_SECRET=pL7nX2rQv9aJ4tGd8bE6wYcM5oF1uZsH3kD0jVxN7qR2lC8mT4gP9yK6hW3sA0z
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-key-make-it-very-long-and-secure-for-production-use

# CORS Configuration (Update with your actual URLs)
FRONTEND_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.onrender.com
CORS_ORIGIN=https://your-frontend-url.vercel.app

# Email Configuration (SendGrid) - Add your actual keys
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@jobportal.com
SENDGRID_FROM_NAME=JobPortal

# OAuth Configuration - Add your actual keys
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/oauth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://your-backend-url.onrender.com/api/oauth/facebook/callback

# File Upload (Cloudinary) - Add your actual keys
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Payment Gateway (Razorpay) - Add your actual keys
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# SMS Configuration (Twilio) - Add your actual keys
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info`;

  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env file created successfully!');
    console.log('📝 Please update the URLs and API keys in the .env file');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
} else {
  console.log('✅ .env file already exists');
}

// Check package.json dependencies
console.log('🔍 Checking dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredDeps = ['sequelize', 'sequelize-cli', 'pg', 'pg-hstore', 'dotenv'];
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
  console.log('⚠️  Missing dependencies:', missingDeps.join(', '));
  console.log('💡 Run: npm install to install missing dependencies');
} else {
  console.log('✅ All required dependencies are present');
}

// Test database connection
console.log('🔍 Testing database connection...');
try {
  const { testConnection } = require('./config/sequelize');
  testConnection().then(() => {
    console.log('✅ Database connection test completed');
    console.log('🎉 Production setup completed successfully!');
  }).catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Make sure your database credentials are correct');
  });
} catch (error) {
  console.error('❌ Failed to test database connection:', error.message);
}

console.log('📋 Next steps:');
console.log('1. Update the .env file with your actual URLs and API keys');
console.log('2. Deploy to Render with the environment variables');
console.log('3. Test the deployment with the health check endpoint');
