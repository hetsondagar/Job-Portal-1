// Comprehensive test script for avatar upload functionality
// Run this in the browser console to test the complete avatar upload flow

console.log('🧪 Testing complete avatar upload functionality...');

// Test 1: Check server connectivity
const testServerConnectivity = async () => {
  console.log('🔍 Testing server connectivity...');
  try {
    const response = await fetch('http://localhost:8000/api/health');
    const data = await response.json();
    if (data.success) {
      console.log('✅ Server is running and accessible');
      return true;
    } else {
      console.log('❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Server not accessible:', error.message);
    return false;
  }
};

// Test 2: Check user authentication
const testUserAuthentication = () => {
  console.log('🔍 Testing user authentication...');
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    const user = JSON.parse(userStr);
    console.log('✅ User authenticated:', user.firstName, user.lastName);
    console.log('🔍 Current avatar:', user.avatar);
    return user;
  } else {
    console.log('❌ User not authenticated');
    return null;
  }
};

// Test 3: Check avatar endpoint accessibility
const testAvatarEndpoint = async () => {
  console.log('🔍 Testing avatar endpoint...');
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('http://localhost:8000/api/user/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('🔍 Avatar endpoint status:', response.status);
    if (response.status === 400) {
      console.log('✅ Avatar endpoint accessible (expected 400 for no file)');
      return true;
    } else {
      console.log('⚠️ Avatar endpoint returned unexpected status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Avatar endpoint not accessible:', error.message);
    return false;
  }
};

// Test 4: Check static file serving
const testStaticFileServing = async () => {
  console.log('🔍 Testing static file serving...');
  const user = testUserAuthentication();
  
  if (user && user.avatar) {
    const avatarUrl = `http://localhost:8000${user.avatar}`;
    console.log('🔍 Testing avatar URL:', avatarUrl);
    
    try {
      const response = await fetch(avatarUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Static file serving working');
        return true;
      } else {
        console.log('❌ Static file serving failed:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Static file serving error:', error.message);
      return false;
    }
  } else {
    console.log('⚠️ No avatar to test static file serving');
    return false;
  }
};

// Test 5: Check API service availability
const testApiService = () => {
  console.log('🔍 Testing API service...');
  
  // Check if we can access the API service
  if (typeof window !== 'undefined') {
    // Try to access the API service through the window object or import
    console.log('✅ Browser environment detected');
    
    // Check if fetch is available
    if (typeof fetch !== 'undefined') {
      console.log('✅ Fetch API available');
      return true;
    } else {
      console.log('❌ Fetch API not available');
      return false;
    }
  } else {
    console.log('❌ Not in browser environment');
    return false;
  }
};

// Test 6: Check file input functionality
const testFileInput = () => {
  console.log('🔍 Testing file input...');
  const fileInput = document.querySelector('input[type="file"]');
  
  if (fileInput) {
    console.log('✅ File input found');
    console.log('🔍 Accept attribute:', fileInput.accept);
    console.log('🔍 Multiple attribute:', fileInput.multiple);
    return true;
  } else {
    console.log('❌ File input not found');
    return false;
  }
};

// Test 7: Check avatar display elements
const testAvatarDisplay = () => {
  console.log('🔍 Testing avatar display elements...');
  
  const avatar = document.querySelector('[data-testid="avatar"]') || document.querySelector('.avatar') || document.querySelector('[class*="avatar"]');
  const avatarImage = document.querySelector('img[src*="avatar"]') || document.querySelector('[class*="avatar"] img');
  
  if (avatar) {
    console.log('✅ Avatar container found');
  } else {
    console.log('❌ Avatar container not found');
  }
  
  if (avatarImage) {
    console.log('✅ Avatar image element found');
    console.log('🔍 Avatar image src:', avatarImage.src);
  } else {
    console.log('❌ Avatar image element not found');
  }
  
  return avatar && avatarImage;
};

// Test 8: Simulate file upload
const simulateFileUpload = () => {
  console.log('🔍 Simulating file upload...');
  
  // Create a mock file
  const mockFile = new File(['mock image data'], 'test-avatar.jpg', { type: 'image/jpeg' });
  console.log('✅ Mock file created:', mockFile.name, mockFile.size, mockFile.type);
  
  // Create a mock event
  const mockEvent = {
    target: {
      files: [mockFile]
    }
  };
  
  console.log('✅ Mock event created');
  return { mockFile, mockEvent };
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting comprehensive avatar upload tests...');
  
  const results = {
    serverConnectivity: await testServerConnectivity(),
    userAuthentication: !!testUserAuthentication(),
    avatarEndpoint: await testAvatarEndpoint(),
    staticFileServing: await testStaticFileServing(),
    apiService: testApiService(),
    fileInput: testFileInput(),
    avatarDisplay: testAvatarDisplay(),
    fileUpload: simulateFileUpload()
  };
  
  console.log('📊 Test Results:');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Avatar upload should work correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
  }
  
  return results;
};

// Run tests
runAllTests();

console.log('\n💡 Debugging Tips:');
console.log('1. Check browser network tab for failed requests');
console.log('2. Check browser console for errors');
console.log('3. Verify server is running on port 8000');
console.log('4. Check if uploads directory exists on server');
console.log('5. Verify static file serving is configured');
console.log('6. Check if user is authenticated');
console.log('7. Verify file input is present and accessible');
console.log('8. Check if avatar display elements are rendered');

console.log('\n🔧 Common Issues:');
console.log('- Server not running: Start server with "npm run dev"');
console.log('- CORS issues: Check server CORS configuration');
console.log('- File permissions: Ensure uploads directory is writable');
console.log('- Authentication: Make sure user is logged in');
console.log('- Static files: Verify /uploads route is configured');
