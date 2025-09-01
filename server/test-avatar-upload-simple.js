// Simple test to verify avatar upload functionality
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing avatar upload functionality...');

// Test 1: Check if uploads directory exists and is writable
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
  
  // Test if directory is writable
  try {
    const testFile = path.join(avatarsDir, 'test-write.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Directory is writable');
    return true;
  } catch (error) {
    console.log('❌ Directory is not writable:', error.message);
    return false;
  }
};

// Test 2: Check if server configuration files are correct
const testServerConfiguration = () => {
  console.log('🔍 Testing server configuration...');
  
  // Check if index.js has static file serving
  const indexFile = path.join(__dirname, 'index.js');
  if (fs.existsSync(indexFile)) {
    const content = fs.readFileSync(indexFile, 'utf8');
    if (content.includes('/uploads') && content.includes('express.static')) {
      console.log('✅ Static file serving is configured');
    } else {
      console.log('❌ Static file serving is not configured');
      return false;
    }
  } else {
    console.log('❌ index.js file not found');
    return false;
  }
  
  // Check if user routes have avatar upload endpoint
  const userRoutesFile = path.join(__dirname, 'routes/user.js');
  if (fs.existsSync(userRoutesFile)) {
    const content = fs.readFileSync(userRoutesFile, 'utf8');
    if (content.includes('/avatar') && content.includes('avatarUpload.single')) {
      console.log('✅ Avatar upload endpoint is configured');
    } else {
      console.log('❌ Avatar upload endpoint is not configured');
      return false;
    }
  } else {
    console.log('❌ user.js routes file not found');
    return false;
  }
  
  return true;
};

// Test 3: Check if User model has avatar field
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

// Test 4: Check if multer configuration is correct
const testMulterConfiguration = () => {
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

// Test 5: Check if there are any existing avatar files
const testExistingAvatars = () => {
  console.log('🔍 Testing existing avatar files...');
  const avatarsDir = path.join(__dirname, 'uploads/avatars');
  
  if (fs.existsSync(avatarsDir)) {
    const files = fs.readdirSync(avatarsDir);
    if (files.length > 0) {
      console.log(`✅ Found ${files.length} existing avatar files:`, files);
    } else {
      console.log('ℹ️ No existing avatar files found');
    }
    return true;
  } else {
    console.log('❌ Avatars directory not found');
    return false;
  }
};

// Run all tests
const runTests = () => {
  console.log('🚀 Starting avatar upload tests...');
  
  const results = {
    uploadsDirectory: testUploadsDirectory(),
    serverConfiguration: testServerConfiguration(),
    userModel: testUserModel(),
    multerConfiguration: testMulterConfiguration(),
    existingAvatars: testExistingAvatars()
  };
  
  console.log('\n📊 Test Results:');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Avatar upload should work.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
  }
  
  return results;
};

// Run tests
runTests();

console.log('\n💡 Next Steps:');
console.log('1. If all tests pass, try uploading an avatar from the frontend');
console.log('2. Check browser console for any errors during upload');
console.log('3. Check server console for any errors during upload');
console.log('4. Verify the avatar URL is being saved to the database');
console.log('5. Check if the avatar image is accessible via the URL');
