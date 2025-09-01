// Test script to verify avatar upload functionality
// Run this in the browser console to test avatar upload

console.log('🧪 Testing avatar upload functionality...');

// Test 1: Check if user has avatar
const testAvatarDisplay = () => {
  console.log('🔍 Testing avatar display...');
  
  // Check if user object exists
  if (typeof window !== 'undefined' && window.localStorage) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('✅ User found:', user.firstName, user.lastName);
      console.log('🔍 Avatar URL:', user.avatar);
      
      if (user.avatar) {
        console.log('✅ User has avatar');
        // Test if avatar URL is accessible
        const avatarUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar}`;
        console.log('🔍 Full avatar URL:', avatarUrl);
        
        // Test image loading
        const img = new Image();
        img.onload = () => {
          console.log('✅ Avatar image loads successfully');
        };
        img.onerror = () => {
          console.log('❌ Avatar image failed to load');
        };
        img.src = avatarUrl;
      } else {
        console.log('⚠️ User has no avatar');
      }
    } else {
      console.log('❌ No user found in localStorage');
    }
  }
};

// Test 2: Check API service
const testApiService = () => {
  console.log('🔍 Testing API service...');
  
  if (typeof window !== 'undefined' && window.apiService) {
    console.log('✅ API service available');
    console.log('🔍 uploadAvatar method:', typeof window.apiService.uploadAvatar);
  } else {
    console.log('❌ API service not available');
  }
};

// Test 3: Check file input
const testFileInput = () => {
  console.log('🔍 Testing file input...');
  
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    console.log('✅ File input found');
    console.log('🔍 Accept attribute:', fileInput.accept);
    console.log('🔍 Multiple attribute:', fileInput.multiple);
  } else {
    console.log('❌ File input not found');
  }
};

// Test 4: Check avatar display elements
const testAvatarElements = () => {
  console.log('🔍 Testing avatar display elements...');
  
  const avatarImage = document.querySelector('[data-testid="avatar-image"]') || document.querySelector('.avatar img');
  const avatarFallback = document.querySelector('[data-testid="avatar-fallback"]') || document.querySelector('.avatar-fallback');
  
  if (avatarImage) {
    console.log('✅ Avatar image element found');
    console.log('🔍 Avatar image src:', avatarImage.src);
  } else {
    console.log('❌ Avatar image element not found');
  }
  
  if (avatarFallback) {
    console.log('✅ Avatar fallback element found');
  } else {
    console.log('❌ Avatar fallback element not found');
  }
};

// Run all tests
console.log('🚀 Starting avatar upload tests...');
testAvatarDisplay();
testApiService();
testFileInput();
testAvatarElements();

console.log('📋 Test Summary:');
console.log('1. Check if user has avatar');
console.log('2. Check if API service is available');
console.log('3. Check if file input is present');
console.log('4. Check if avatar display elements are present');
console.log('5. Test avatar image loading');

console.log('💡 Tips for debugging:');
console.log('- Check browser network tab for failed requests');
console.log('- Check browser console for errors');
console.log('- Verify server is running on port 8000');
console.log('- Check if uploads directory exists on server');
console.log('- Verify static file serving is configured');
