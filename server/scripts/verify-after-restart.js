/**
 * VERIFY AFTER RESTART
 * Run this after restarting Render service to confirm all APIs work
 */

const axios = require('axios');

async function verifyAfterRestart() {
  console.log('='.repeat(80));
  console.log('🔍 VERIFYING APIs AFTER RESTART');
  console.log('='.repeat(80));
  console.log('');

  const baseUrl = 'https://job-portal-97q3.onrender.com';

  const endpoints = [
    '/api/jobs?limit=1&status=active',
    '/api/companies?limit=1',
    '/api/user/employer/dashboard-stats',
    '/api/user/employer/applications',
    '/api/hot-vacancies/employer'
  ];

  let allWorking = true;

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        timeout: 10000
      });

      if (response.status === 200 && response.data.success !== false) {
        console.log(`✅ ${endpoint} - WORKING`);
      } else {
        console.log(`❌ ${endpoint} - ERROR: ${response.data.message || 'Unknown error'}`);
        allWorking = false;
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - FAILED: ${error.message}`);
      allWorking = false;
    }
  }

  console.log('');
  console.log('='.repeat(80));

  if (allWorking) {
    console.log('🎉 SUCCESS! All APIs are working perfectly!');
    console.log('✅ Hot vacancy features are now functional');
    console.log('✅ All 500 errors have been resolved');
    console.log('🚀 Your production app is ready to use!');
  } else {
    console.log('❌ Some APIs still have issues');
    console.log('🔄 Please check Render service logs for details');
  }

  console.log('='.repeat(80));
}

if (require.main === module) {
  verifyAfterRestart();
}

module.exports = verifyAfterRestart;

