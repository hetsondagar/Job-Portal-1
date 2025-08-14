require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

async function testRealEmail() {
  try {
    console.log('🧪 Testing Real Email Sending...\n');

    // Replace this with your actual email address
    const testEmail = 'your-actual-email@gmail.com'; // CHANGE THIS TO YOUR EMAIL
    
    console.log('📧 Testing forgot password with email:', testEmail);
    console.log('⚠️  Make sure to update the email address in the script first!\n');

    // Test forgot password
    console.log('1. Sending forgot password request...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: testEmail
      });
      
      console.log('✅ Forgot password request successful!');
      console.log('   Response:', response.data.message);
      console.log('\n📧 Check your email inbox for the password reset link!');
      console.log('   (Also check spam folder if not in inbox)');
      
    } catch (error) {
      console.log('❌ Forgot password request failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Real email test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRealEmail();
