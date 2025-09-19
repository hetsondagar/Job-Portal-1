'use strict';

require('dotenv').config();

const axios = require('axios').default;

const BASE = 'http://localhost:8000/api';
const email = 'gulf.jobseeker@example.com';
const password = 'Test@1234';

async function main() {
  try {
    console.log('🔐 Logging in jobseeker...');
    const loginResp = await axios.post(`${BASE}/auth/login`, { email, password });
    const token = loginResp.data?.data?.token;
    if (!loginResp.data?.success || !token) {
      throw new Error('Login failed: ' + JSON.stringify(loginResp.data));
    }
    console.log('✅ Logged in.');

    const auth = { headers: { Authorization: `Bearer ${token}` } };

    console.log('📄 Fetching Gulf jobs...');
    const jobsResp = await axios.get(`${BASE}/gulf/jobs`);
    console.log('✅ Jobs response ok. Count =', jobsResp.data?.data?.pagination?.total ?? 0);
    const firstJob = jobsResp.data?.data?.jobs?.[0];
    if (!firstJob) throw new Error('No Gulf jobs found to test');
    const jobId = firstJob.id;
    console.log('🆔 Using job id:', jobId);

    console.log('⭐ Adding bookmark...');
    await axios.post(`${BASE}/gulf/jobs/${jobId}/bookmark`, {}, auth);
    console.log('✅ Bookmark added');

    console.log('📚 Listing bookmarks...');
    const bmResp = await axios.get(`${BASE}/gulf/bookmarks`, auth);
    console.log('✅ Bookmarks count:', bmResp.data?.data?.bookmarks?.length ?? 0);

    console.log('🗑️ Removing bookmark...');
    await axios.delete(`${BASE}/gulf/jobs/${jobId}/bookmark`, auth);
    console.log('✅ Bookmark removed');

    console.log('🔔 Creating Gulf job alert...');
    const alertResp = await axios.post(`${BASE}/gulf/alerts`, {
      name: 'Dubai Node Senior Alert',
      keywords: 'Dubai Node.js',
      location: 'Dubai',
      jobType: 'full-time',
      experienceLevel: 'senior',
      salaryMin: 10000,
      salaryMax: 30000,
      isActive: true
    }, auth);
    const alertId = alertResp.data?.data?.id;
    console.log('✅ Alert created:', alertId);

    console.log('📬 Listing alerts...');
    const listAlerts = await axios.get(`${BASE}/gulf/alerts`, auth);
    console.log('✅ Alerts count:', listAlerts.data?.data?.alerts?.length ?? 0);

    console.log('✏️ Updating alert (deactivate)...');
    await axios.put(`${BASE}/gulf/alerts/${alertId}`, { isActive: false }, auth);
    console.log('✅ Alert updated');

    console.log('🗑️ Deleting alert...');
    await axios.delete(`${BASE}/gulf/alerts/${alertId}`, auth);
    console.log('✅ Alert deleted');

    console.log('📊 Fetching dashboard stats...');
    const stats = await axios.get(`${BASE}/gulf/dashboard/stats`, auth);
    console.log('✅ Stats ok:', JSON.stringify(stats.data?.data ?? {}, null, 2));

    console.log('🎉 All Gulf features tested successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message || err);
    process.exit(1);
  }
}

main();


