// Simple test to verify avatar upload endpoint
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🧪 Testing avatar upload endpoint...');

// Test 1: Check if server is running
const testServerRunning = () => {
  console.log('🔍 Testing if server is running...');
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.success) {
            console.log('✅ Server is running');
            resolve(true);
          } else {
            console.log('❌ Server health check failed');
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Invalid JSON response');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Server not accessible:', error.message);
      resolve(false);
    });
    
    req.end();
  });
};

// Test 2: Check avatar endpoint without file
const testAvatarEndpoint = () => {
  console.log('🔍 Testing avatar endpoint without file...');
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/user/avatar',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      console.log('🔍 Avatar endpoint status:', res.statusCode);
      if (res.statusCode === 400) {
        console.log('✅ Avatar endpoint accessible (expected 400 for no file)');
        resolve(true);
      } else {
        console.log('⚠️ Avatar endpoint returned unexpected status:', res.statusCode);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log('❌ Avatar endpoint not accessible:', error.message);
      resolve(false);
    });
    
    req.end();
  });
};

// Test 3: Check uploads directory
const testUploadsDirectory = () => {
  console.log('🔍 Testing uploads directory...');
  const uploadsDir = path.join(__dirname, 'uploads');
  const avatarsDir = path.join(__dirname, 'uploads/avatars');
  
  if (fs.existsSync(uploadsDir)) {
    console.log('✅ Uploads directory exists');
  } else {
    console.log('❌ Uploads directory does not exist');
    return false;
  }
  
  if (fs.existsSync(avatarsDir)) {
    console.log('✅ Avatars directory exists');
  } else {
    console.log('❌ Avatars directory does not exist');
    return false;
  }
  
  return true;
};

// Test 4: Check static file serving
const testStaticFileServing = () => {
  console.log('🔍 Testing static file serving...');
  
  // Create a test file
  const testFile = path.join(__dirname, 'uploads/avatars/test.txt');
  fs.writeFileSync(testFile, 'test');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/uploads/avatars/test.txt',
      method: 'GET'
    }, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Static file serving working');
        fs.unlinkSync(testFile); // Clean up
        resolve(true);
      } else {
        console.log('❌ Static file serving failed:', res.statusCode);
        fs.unlinkSync(testFile); // Clean up
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log('❌ Static file serving error:', error.message);
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile); // Clean up
      }
      resolve(false);
    });
    
    req.end();
  });
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting avatar endpoint tests...');
  
  const results = {
    serverRunning: await testServerRunning(),
    avatarEndpoint: await testAvatarEndpoint(),
    uploadsDirectory: testUploadsDirectory(),
    staticFileServing: await testStaticFileServing()
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
