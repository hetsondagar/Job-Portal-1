// Server-side test script for avatar upload functionality
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing avatar upload functionality on server...');

// Test 1: Check if uploads directory exists
const testUploadsDirectory = () => {
  console.log('🔍 Testing uploads directory...');
  const uploadsDir = path.join(__dirname, 'uploads');
  const avatarsDir = path.join(__dirname, 'uploads/avatars');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Uploads directory does not exist');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
  } else {
    console.log('✅ Uploads directory exists');
  }
  
  if (!fs.existsSync(avatarsDir)) {
    console.log('❌ Avatars directory does not exist');
    fs.mkdirSync(avatarsDir, { recursive: true });
    console.log('✅ Created avatars directory');
  } else {
    console.log('✅ Avatars directory exists');
  }
  
  return true;
};

// Test 2: Check directory permissions
const testDirectoryPermissions = () => {
  console.log('🔍 Testing directory permissions...');
  const avatarsDir = path.join(__dirname, 'uploads/avatars');
  
  try {
    // Try to create a test file
    const testFile = path.join(avatarsDir, 'test-permissions.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Directory is writable');
    return true;
  } catch (error) {
    console.log('❌ Directory is not writable:', error.message);
    return false;
  }
};

// Test 3: Check static file serving configuration
const testStaticFileServing = () => {
  console.log('🔍 Testing static file serving configuration...');
  
  // Check if the server index.js has the static file serving middleware
  const serverFile = path.join(__dirname, 'index.js');
  
  if (fs.existsSync(serverFile)) {
    const content = fs.readFileSync(serverFile, 'utf8');
    if (content.includes('/uploads') && content.includes('express.static')) {
      console.log('✅ Static file serving is configured');
      return true;
    } else {
      console.log('❌ Static file serving is not configured');
      return false;
    }
  } else {
    console.log('❌ Server file not found');
    return false;
  }
};

// Test 4: Check User model avatar field
const testUserModel = () => {
  console.log('🔍 Testing User model...');
  const userModelFile = path.join(__dirname, 'models/User.js');
  
  if (fs.existsSync(userModelFile)) {
    const content = fs.readFileSync(userModelFile, 'utf8');
    if (content.includes('avatar:') && content.includes('DataTypes.STRING')) {
      console.log('✅ Avatar field is defined in User model');
      return true;
    } else {
      console.log('❌ Avatar field is not defined in User model');
      return false;
    }
  } else {
    console.log('❌ User model file not found');
    return false;
  }
};

// Test 5: Check avatar upload route
const testAvatarRoute = () => {
  console.log('🔍 Testing avatar upload route...');
  const userRoutesFile = path.join(__dirname, 'routes/user.js');
  
  if (fs.existsSync(userRoutesFile)) {
    const content = fs.readFileSync(userRoutesFile, 'utf8');
    if (content.includes('/avatar') && content.includes('avatarUpload.single')) {
      console.log('✅ Avatar upload route is configured');
      return true;
    } else {
      console.log('❌ Avatar upload route is not configured');
      return false;
    }
  } else {
    console.log('❌ User routes file not found');
    return false;
  }
};

// Test 6: Check multer configuration
const testMulterConfig = () => {
  console.log('🔍 Testing multer configuration...');
  const userRoutesFile = path.join(__dirname, 'routes/user.js');
  
  if (fs.existsSync(userRoutesFile)) {
    const content = fs.readFileSync(userRoutesFile, 'utf8');
    if (content.includes('avatarStorage') && content.includes('avatarUpload')) {
      console.log('✅ Multer configuration is present');
      return true;
    } else {
      console.log('❌ Multer configuration is missing');
      return false;
    }
  } else {
    console.log('❌ User routes file not found');
    return false;
  }
};

// Run all tests
const runAllTests = () => {
  console.log('🚀 Starting server-side avatar upload tests...');
  
  const results = {
    uploadsDirectory: testUploadsDirectory(),
    directoryPermissions: testDirectoryPermissions(),
    staticFileServing: testStaticFileServing(),
    userModel: testUserModel(),
    avatarRoute: testAvatarRoute(),
    multerConfig: testMulterConfig()
  };
  
  console.log('\n📊 Test Results:');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All server-side tests passed!');
  } else {
    console.log('⚠️ Some server-side tests failed. Check the issues above.');
  }
  
  return results;
};

// Run tests
runAllTests();

console.log('\n💡 Server Setup Tips:');
console.log('1. Ensure server is running: npm run dev');
console.log('2. Check database connection');
console.log('3. Verify uploads directory permissions');
console.log('4. Test static file serving');
console.log('5. Check CORS configuration');
console.log('6. Verify authentication middleware');

console.log('\n🔧 Common Server Issues:');
console.log('- Database not connected: Check database configuration');
console.log('- Directory permissions: Ensure write access to uploads folder');
console.log('- Static file serving: Verify /uploads route is configured');
console.log('- CORS issues: Check CORS configuration for frontend domain');
console.log('- Authentication: Verify JWT token validation');
