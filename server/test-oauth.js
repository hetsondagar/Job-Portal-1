#!/usr/bin/env node

/**
 * Test OAuth endpoint
 */

require('dotenv').config();

async function testOAuthEndpoint() {
  console.log('🧪 Testing OAuth endpoint...');
  
  try {
    // Test the OAuth URLs endpoint
    const response = await fetch('https://job-portal-97q3.onrender.com/api/oauth/urls?userType=jobseeker', {
      method: 'GET',
      headers: {
        'Origin': 'https://job-portal-nine-rouge.vercel.app',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OAuth endpoint working!');
      console.log('📋 Response data:', data);
    } else {
      console.log('❌ OAuth endpoint failed');
      const errorText = await response.text();
      console.log('📋 Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOAuthEndpoint();
