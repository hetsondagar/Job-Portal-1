const axios = require('axios');

const BASE_URL = 'https://job-portal-97q3.onrender.com';

async function testAdminEndpoints() {
  try {
    console.log('🔍 Testing admin endpoints after association fixes...');
    
    // First, login as superadmin
    console.log('📝 Logging in as superadmin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/api/admin-auth/admin-login`, {
      email: 'admin@campus.com',
      password: 'admin@123'
    });
    
    if (!adminLoginResponse.data.success) {
      throw new Error('Admin login failed');
    }
    
    const adminToken = adminLoginResponse.data.token || adminLoginResponse.data.data?.token;
    console.log('✅ Admin login successful');
    
    const headers = {
      'Authorization': `Bearer ${adminToken}`
    };
    
    // Test 1: Admin stats
    console.log('\n📊 Testing admin stats...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/admin/stats`, { headers });
      if (statsResponse.data.success) {
        console.log('✅ Admin stats endpoint working');
      } else {
        console.log('❌ Admin stats endpoint failed:', statsResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Admin stats endpoint error:', error.response?.data?.message || error.message);
    }
    
    // Test 2: Get users
    console.log('\n👥 Testing users endpoint...');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/api/admin/users?page=1&limit=5`, { headers });
      if (usersResponse.data.success && usersResponse.data.data.users.length > 0) {
        console.log('✅ Users endpoint working');
        const testUserId = usersResponse.data.data.users[0].id;
        
        // Test 3: User details
        console.log('\n👤 Testing user details endpoint...');
        try {
          const userDetailsResponse = await axios.get(`${BASE_URL}/api/admin/users/${testUserId}/details`, { headers });
          if (userDetailsResponse.data.success) {
            console.log('✅ User details endpoint working');
          } else {
            console.log('❌ User details endpoint failed:', userDetailsResponse.data.message);
          }
        } catch (error) {
          console.log('❌ User details endpoint error:', error.response?.data?.message || error.message);
        }
      } else {
        console.log('❌ Users endpoint failed');
      }
    } catch (error) {
      console.log('❌ Users endpoint error:', error.response?.data?.message || error.message);
    }
    
    // Test 4: Get companies
    console.log('\n🏢 Testing companies endpoint...');
    try {
      const companiesResponse = await axios.get(`${BASE_URL}/api/admin/companies?page=1&limit=5`, { headers });
      if (companiesResponse.data.success && companiesResponse.data.data.companies.length > 0) {
        console.log('✅ Companies endpoint working');
        const testCompanyId = companiesResponse.data.data.companies[0].id;
        
        // Test 5: Company details
        console.log('\n🏢 Testing company details endpoint...');
        try {
          const companyDetailsResponse = await axios.get(`${BASE_URL}/api/admin/companies/${testCompanyId}/details`, { headers });
          if (companyDetailsResponse.data.success) {
            console.log('✅ Company details endpoint working');
          } else {
            console.log('❌ Company details endpoint failed:', companyDetailsResponse.data.message);
          }
        } catch (error) {
          console.log('❌ Company details endpoint error:', error.response?.data?.message || error.message);
        }
      } else {
        console.log('❌ Companies endpoint failed');
      }
    } catch (error) {
      console.log('❌ Companies endpoint error:', error.response?.data?.message || error.message);
    }
    
    // Test 6: Get jobs
    console.log('\n💼 Testing jobs endpoint...');
    try {
      const jobsResponse = await axios.get(`${BASE_URL}/api/admin/jobs?page=1&limit=5`, { headers });
      if (jobsResponse.data.success && jobsResponse.data.data.jobs.length > 0) {
        console.log('✅ Jobs endpoint working');
        const testJobId = jobsResponse.data.data.jobs[0].id;
        
        // Test 7: Job details
        console.log('\n💼 Testing job details endpoint...');
        try {
          const jobDetailsResponse = await axios.get(`${BASE_URL}/api/admin/jobs/${testJobId}/details`, { headers });
          if (jobDetailsResponse.data.success) {
            console.log('✅ Job details endpoint working');
          } else {
            console.log('❌ Job details endpoint failed:', jobDetailsResponse.data.message);
          }
        } catch (error) {
          console.log('❌ Job details endpoint error:', error.response?.data?.message || error.message);
        }
      } else {
        console.log('❌ Jobs endpoint failed');
      }
    } catch (error) {
      console.log('❌ Jobs endpoint error:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Admin endpoints testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAdminEndpoints();
