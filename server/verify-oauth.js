require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 OAuth Implementation Verification');
console.log('===================================\n');

// Check environment variables
console.log('1️⃣ Environment Variables:');
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'FRONTEND_URL',
  'BACKEND_URL',
  'SESSION_SECRET',
  'JWT_SECRET'
];

let allVarsSet = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    allVarsSet = false;
  }
});

// Check OAuth routes implementation
console.log('\n2️⃣ OAuth Routes Implementation:');
const oauthRoutesPath = path.join(__dirname, 'routes', 'oauth.js');
if (fs.existsSync(oauthRoutesPath)) {
  console.log('✅ OAuth routes file exists');
  
  const oauthContent = fs.readFileSync(oauthRoutesPath, 'utf8');
  
  // Check for key OAuth functionality
  const checks = [
    { name: 'Google OAuth initiation', pattern: 'router.get.*google.*passport.authenticate' },
    { name: 'Google OAuth callback', pattern: 'router.get.*google.*callback' },
    { name: 'Facebook OAuth initiation', pattern: 'router.get.*facebook.*passport.authenticate' },
    { name: 'Facebook OAuth callback', pattern: 'router.get.*facebook.*callback' },
    { name: 'OAuth URLs endpoint', pattern: 'router.get.*urls' },
    { name: 'State parameter handling', pattern: 'state.*employer' },
    { name: 'User type detection', pattern: 'user.user_type.*employer' },
    { name: 'Employer callback redirect', pattern: 'employer-oauth-callback' },
    { name: 'Jobseeker callback redirect', pattern: 'oauth-callback' },
    { name: 'Dashboard redirection logic', pattern: 'dashboardPath.*employer.*dashboard' }
  ];
  
  checks.forEach(check => {
    if (oauthContent.match(check.pattern)) {
      console.log(`✅ ${check.name}: Found`);
    } else {
      console.log(`❌ ${check.name}: Missing`);
    }
  });
} else {
  console.log('❌ OAuth routes file not found');
}

// Check frontend callback pages
console.log('\n3️⃣ Frontend Callback Pages:');
const frontendDir = path.join(__dirname, '..', 'client', 'app');

const callbackPages = [
  { name: 'Jobseeker OAuth callback', path: 'oauth-callback/page.tsx' },
  { name: 'Employer OAuth callback', path: 'employer-oauth-callback/page.tsx' }
];

callbackPages.forEach(page => {
  const pagePath = path.join(frontendDir, page.path);
  if (fs.existsSync(pagePath)) {
    console.log(`✅ ${page.name}: Exists`);
    
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check for redirection logic
    if (page.name.includes('Jobseeker')) {
      if (pageContent.includes('/dashboard')) {
        console.log(`✅ ${page.name}: Redirects to /dashboard`);
      } else {
        console.log(`❌ ${page.name}: Missing /dashboard redirect`);
      }
    } else if (page.name.includes('Employer')) {
      if (pageContent.includes('/employer-dashboard')) {
        console.log(`✅ ${page.name}: Redirects to /employer-dashboard`);
      } else {
        console.log(`❌ ${page.name}: Missing /employer-dashboard redirect`);
      }
    }
  } else {
    console.log(`❌ ${page.name}: Not found`);
  }
});

// Check login pages
console.log('\n4️⃣ Login Pages:');
const loginPages = [
  { name: 'Jobseeker login', path: 'login/page.tsx' },
  { name: 'Employer login', path: 'employer-login/page.tsx' }
];

loginPages.forEach(page => {
  const pagePath = path.join(frontendDir, page.path);
  if (fs.existsSync(pagePath)) {
    console.log(`✅ ${page.name}: Exists`);
    
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check for OAuth buttons
    if (pageContent.includes('handleOAuthLogin')) {
      console.log(`✅ ${page.name}: Has OAuth login functionality`);
    } else {
      console.log(`❌ ${page.name}: Missing OAuth login functionality`);
    }
    
    // Check for user type parameter
    if (page.name.includes('Jobseeker')) {
      if (pageContent.includes('jobseeker') || pageContent.includes('getOAuthUrls')) {
        console.log(`✅ ${page.name}: Uses jobseeker user type`);
      } else {
        console.log(`❌ ${page.name}: Missing jobseeker user type`);
      }
    } else if (page.name.includes('Employer')) {
      if (pageContent.includes('employer') || pageContent.includes('getOAuthUrls')) {
        console.log(`✅ ${page.name}: Uses employer user type`);
      } else {
        console.log(`❌ ${page.name}: Missing employer user type`);
      }
    }
  } else {
    console.log(`❌ ${page.name}: Not found`);
  }
});

// Check API service
console.log('\n5️⃣ API Service:');
const apiServicePath = path.join(__dirname, '..', 'client', 'lib', 'api.ts');
if (fs.existsSync(apiServicePath)) {
  console.log('✅ API service file exists');
  
  const apiContent = fs.readFileSync(apiServicePath, 'utf8');
  
  if (apiContent.includes('getOAuthUrls')) {
    console.log('✅ API service has getOAuthUrls method');
  } else {
    console.log('❌ API service missing getOAuthUrls method');
  }
  
  if (apiContent.includes('userType')) {
    console.log('✅ API service accepts userType parameter');
  } else {
    console.log('❌ API service missing userType parameter');
  }
} else {
  console.log('❌ API service file not found');
}

console.log('\n📋 Summary:');
console.log('===========');
if (allVarsSet) {
  console.log('✅ Environment variables are properly configured');
} else {
  console.log('❌ Environment variables need to be configured');
}

console.log('\n🎯 Expected OAuth Flow:');
console.log('=======================');
console.log('For Jobseekers:');
console.log('1. User clicks "Sign in with Google" on /login');
console.log('2. Frontend calls apiService.getOAuthUrls("jobseeker")');
console.log('3. Backend returns: http://localhost:8000/api/oauth/google');
console.log('4. User redirected to Google OAuth');
console.log('5. Google redirects to: http://localhost:8000/api/oauth/google/callback');
console.log('6. Backend detects user.user_type !== "employer"');
console.log('7. Backend redirects to: /oauth-callback');
console.log('8. Frontend redirects to: /dashboard ✅');

console.log('\nFor Employers:');
console.log('1. User clicks "Sign in with Google" on /employer-login');
console.log('2. Frontend calls apiService.getOAuthUrls("employer")');
console.log('3. Backend returns: http://localhost:8000/api/oauth/google?state=employer');
console.log('4. User redirected to Google OAuth with state parameter');
console.log('5. Google redirects to: http://localhost:8000/api/oauth/google/callback');
console.log('6. Backend detects user.user_type === "employer" OR state === "employer"');
console.log('7. Backend redirects to: /employer-oauth-callback');
console.log('8. Frontend redirects to: /employer-dashboard ✅');

console.log('\n🔧 Next Steps:');
console.log('==============');
console.log('1. Ensure server is running: npm start');
console.log('2. Test OAuth flow in browser');
console.log('3. Check server logs for OAuth callback messages');
console.log('4. Verify user type detection and redirection');
console.log('5. Test with both new and existing Google accounts');
