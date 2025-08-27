require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔧 OAuth Quick Fix Script');
console.log('========================\n');

// Check environment variables
console.log('1️⃣ Checking Environment Variables...');
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'FRONTEND_URL',
  'BACKEND_URL',
  'SESSION_SECRET'
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

if (!allVarsSet) {
  console.log('\n⚠️ Missing environment variables detected!');
  console.log('Please check your .env file and ensure all required variables are set.');
}

// Check .env file
console.log('\n2️⃣ Checking .env File...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for common issues
  if (envContent.includes('your-google-client-id-here')) {
    console.log('❌ Google Client ID is still using placeholder value');
  }
  if (envContent.includes('your-google-client-secret-here')) {
    console.log('❌ Google Client Secret is still using placeholder value');
  }
  if (!envContent.includes('SESSION_SECRET=')) {
    console.log('❌ SESSION_SECRET is missing');
  }
} else {
  console.log('❌ .env file not found');
}

// Check server status
console.log('\n3️⃣ Checking Server Status...');
const http = require('http');

function checkServer(url, name) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'GET', timeout: 5000 }, (res) => {
      console.log(`✅ ${name}: Running (Status: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log(`❌ ${name}: Not running`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`❌ ${name}: Timeout`);
      resolve(false);
    });
    
    req.end();
  });
}

async function checkServers() {
  const frontendRunning = await checkServer('http://localhost:3000', 'Frontend (port 3000)');
  const backendRunning = await checkServer('http://localhost:8000', 'Backend (port 8000)');
  
  if (!frontendRunning || !backendRunning) {
    console.log('\n⚠️ Server issues detected!');
    if (!frontendRunning) {
      console.log('Frontend is not running. Start it with: cd Job-Portal/client && npm run dev');
    }
    if (!backendRunning) {
      console.log('Backend is not running. Start it with: cd Job-Portal/server && npm start');
    }
  }
}

checkServers().then(() => {
  console.log('\n4️⃣ OAuth Configuration Summary:');
  console.log('===============================');
  
  if (allVarsSet) {
    console.log('✅ Environment variables are properly configured');
  } else {
    console.log('❌ Environment variables need to be configured');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. If environment variables are missing, update your .env file');
  console.log('2. Restart the server after making changes');
  console.log('3. Test OAuth flow in browser');
  console.log('4. Check browser console for any JavaScript errors');
  console.log('5. Monitor server logs for OAuth callback errors');
  
  console.log('\n🔗 Useful Commands:');
  console.log('- Test OAuth: node test-oauth-real-flow.js');
  console.log('- Check env vars: node -e "require(\'dotenv\').config(); console.log(process.env.GOOGLE_CLIENT_ID ? \'Set\' : \'Not set\')"');
  console.log('- Restart server: npm start');
  
  console.log('\n📖 Documentation:');
  console.log('- OAuth Debug Guide: OAUTH_DEBUG_GUIDE.md');
  console.log('- Google OAuth Setup: GOOGLE_OAUTH_SETUP_GUIDE.md');
});
