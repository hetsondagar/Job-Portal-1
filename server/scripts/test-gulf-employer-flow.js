'use strict';

require('dotenv').config();

const axios = require('axios').default;
const { sequelize } = require('../config/sequelize');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');

const BASE = 'http://localhost:8000/api';

async function ensureGulfEmployer() {
  await sequelize.authenticate();

  // Ensure company
  const [company] = await Company.findOrCreate({
    where: { name: 'GulfTech Solutions' },
    defaults: {
      name: 'GulfTech Solutions',
      slug: 'gulftech-solutions',
      description: 'Leading technology solutions provider in the GCC region',
      industry: 'Technology',
      website: 'https://gulftech.example.com',
      city: 'Dubai',
      country: 'UAE',
      region: 'gulf',
      isActive: true
    }
  });

  // Ensure employer with local password
  const [employer] = await User.findOrCreate({
    where: { email: 'employer.local@gulftech.example.com' },
    defaults: {
      email: 'employer.local@gulftech.example.com',
      user_type: 'employer',
      region: 'gulf',
      is_email_verified: true,
      password: 'Test@1234',
      oauth_provider: 'local',
      company_id: company.id
    }
  });

  return { employer, company };
}

async function login(email, password) {
  const resp = await axios.post(`${BASE}/auth/login`, { email, password });
  if (!resp.data?.success) throw new Error('Login failed');
  return resp.data.data.token;
}

async function ensureGulfJob(employer, company) {
  // Create job directly to DB to avoid endpoint requirements variability
  const title = `QA Engineer Gulf ${Date.now()}`;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const job = await Job.create({
    title,
    slug,
    description: 'QA role for Gulf region systems.',
    location: 'Dubai, UAE',
    city: 'Dubai',
    country: 'UAE',
    region: 'gulf',
    companyId: company.id,
    employerId: employer.id,
    jobType: 'full-time',
    experienceLevel: 'mid',
    status: 'active',
    isFeatured: false
  });
  return job;
}

async function loginJobseeker() {
  // Seeded earlier in other script
  const email = 'gulf.jobseeker@example.com';
  const password = 'Test@1234';
  const resp = await axios.post(`${BASE}/auth/login`, { email, password });
  if (!resp.data?.success) throw new Error('Jobseeker login failed');
  return resp.data.data.token;
}

async function main() {
  try {
    console.log('🔧 Ensuring Gulf employer and company...');
    const { employer, company } = await ensureGulfEmployer();
    console.log('✅ Employer:', employer.id, 'Company:', company.id);

    console.log('🔐 Logging in employer...');
    const employerToken = await login('employer.local@gulftech.example.com', 'Test@1234');
    console.log('✅ Employer logged in');

    console.log('🧾 Creating Gulf job...');
    const job = await ensureGulfJob(employer, company);
    console.log('✅ Job created:', job.id);

    console.log('🔐 Logging in Gulf jobseeker...');
    const seekerToken = await loginJobseeker();
    console.log('✅ Jobseeker logged in');

    console.log('📝 Applying to job via API...');
    await axios.post(`${BASE}/jobs/${job.id}/apply`, {
      coverLetter: 'Interested in the QA role.',
      expectedSalary: 15000
    }, { headers: { Authorization: `Bearer ${seekerToken}` } });
    console.log('✅ Application submitted');

    console.log('📥 Fetching employer applications...');
    const appsResp = await axios.get(`${BASE}/user/employer/applications`, { headers: { Authorization: `Bearer ${employerToken}` } });
    console.log('✅ Employer applications found:', Array.isArray(appsResp.data?.data) ? appsResp.data.data.length : 0);

    console.log('📊 Fetching employer dashboard...');
    const dashResp = await axios.get(`${BASE}/user/employer/dashboard`, { headers: { Authorization: `Bearer ${employerToken}` } });
    console.log('✅ Employer dashboard stats totalApplications:', dashResp.data?.data?.totalApplications ?? '(n/a)');

    console.log('🎉 Gulf employer flow verified');
    process.exit(0);
  } catch (err) {
    console.error('❌ Employer flow failed:', err.response?.data || err.message || err);
    process.exit(1);
  }
}

main();


