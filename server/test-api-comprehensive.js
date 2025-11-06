/**
 * COMPREHENSIVE API TEST - Test actual API endpoints
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = 'hxx@gmail.com';
const TEST_PASSWORD = 'Player@123';

let authToken = null;

async function login() {
  try {
    console.log('\n🔐 STEP 1: LOGIN');
    console.log('='.repeat(100));
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.error('❌ Login failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function testGetRequirements() {
  try {
    console.log('\n📋 STEP 2: GET ALL REQUIREMENTS');
    console.log('='.repeat(100));
    
    const response = await axios.get(`${BASE_URL}/api/requirements`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      const requirements = response.data.data || [];
      console.log(`✅ Found ${requirements.length} requirements`);
      
      requirements.forEach((req, i) => {
        console.log(`\n${i + 1}. ${req.title} (ID: ${req.id})`);
        console.log(`   Candidates: ${req.totalCandidates || 0}`);
        console.log(`   Accessed: ${req.accessedCandidates || 0}`);
      });
      
      return requirements;
    } else {
      console.error('❌ Failed:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return [];
  }
}

async function testGetStats(requirementId) {
  try {
    console.log(`\n📊 STEP 3: GET STATS FOR ${requirementId}`);
    console.log('='.repeat(100));
    
    const response = await axios.get(`${BASE_URL}/api/requirements/${requirementId}/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      const stats = response.data.data || {};
      console.log('✅ Stats Response:');
      console.log(JSON.stringify(stats, null, 2));
      return stats;
    } else {
      console.error('❌ Failed:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetCandidates(requirementId) {
  try {
    console.log(`\n👥 STEP 4: GET CANDIDATES FOR ${requirementId}`);
    console.log('='.repeat(100));
    
    const response = await axios.get(`${BASE_URL}/api/requirements/${requirementId}/candidates`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { page: 1, limit: 50 }
    });
    
    if (response.data.success) {
      const data = response.data.data || {};
      const candidates = data.candidates || [];
      const total = data.requirement?.totalCandidates || data.pagination?.total || 0;
      
      console.log('✅ Candidates Response:');
      console.log(`   Total Candidates: ${total}`);
      console.log(`   Candidates on Page: ${candidates.length}`);
      console.log(`   Pagination:`, data.pagination);
      console.log(`   Applied Filters:`, data.requirement?.appliedFilters);
      
      if (candidates.length > 0) {
        console.log('\n📋 Sample Candidates:');
        candidates.slice(0, 3).forEach((c, i) => {
          console.log(`   ${i + 1}. ${c.name} - ${c.headline}`);
          console.log(`      Experience: ${c.experience}, Salary: ${c.salary || 'N/A'}`);
        });
      } else {
        console.log('\n❌ NO CANDIDATES RETURNED!');
      }
      
      return { candidates, total, data };
    } else {
      console.error('❌ Failed:', response.data);
      return { candidates: [], total: 0, data: null };
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Full error:', JSON.stringify(error.response.data, null, 2));
    }
    return { candidates: [], total: 0, data: null };
  }
}

async function runTests() {
  console.log('🧪 COMPREHENSIVE API TESTING');
  console.log('='.repeat(100));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Account: ${TEST_EMAIL}`);
  
  // Step 1: Login
  const loggedIn = await login();
  if (!loggedIn) {
    console.error('\n❌ Cannot proceed without authentication');
    return;
  }
  
  // Step 2: Get all requirements
  const requirements = await testGetRequirements();
  
  if (requirements.length === 0) {
    console.log('\n⚠️  No requirements found. Cannot test further.');
    return;
  }
  
  // Test the AI ENGINNER requirement
  const testRequirement = requirements.find(r => r.title && r.title.includes('AI ENGINNER')) || requirements[0];
  const testRequirementId = testRequirement.id;
  
  console.log(`\n🎯 Testing Requirement: ${testRequirement.title} (${testRequirementId})`);
  
  // Step 3: Get stats
  const stats = await testGetStats(testRequirementId);
  
  // Step 4: Get candidates
  const candidatesResult = await testGetCandidates(testRequirementId);
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(100));
  console.log(`Requirement: ${testRequirement.title}`);
  console.log(`Stats API - Total: ${stats?.totalCandidates || 0}`);
  console.log(`Candidates API - Total: ${candidatesResult.total}`);
  console.log(`Candidates API - Returned: ${candidatesResult.candidates.length}`);
  
  if (stats?.totalCandidates === 0 && candidatesResult.total === 0) {
    console.log('\n❌ PROBLEM: Both APIs return 0 candidates!');
    console.log('   But database test found 1 candidate.');
    console.log('   This means the API query is incorrect or filtering is too strict.');
  } else if (stats?.totalCandidates !== candidatesResult.total) {
    console.log('\n⚠️  MISMATCH: Stats and Candidates APIs return different counts!');
  } else if (candidatesResult.total > 0) {
    console.log('\n✅ SUCCESS: Candidates are being returned!');
  }
}

// Check if server is running
axios.get(`${BASE_URL}/health`).catch(() => {
  console.error(`\n❌ Server is not running at ${BASE_URL}`);
  console.error('   Please start the server first: npm start');
  process.exit(1);
}).then(() => {
  runTests().catch(err => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  });
});


