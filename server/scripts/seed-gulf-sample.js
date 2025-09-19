'use strict';

require('dotenv').config();

const { sequelize } = require('../config/sequelize');
const Company = require('../models/Company');
const Job = require('../models/Job');
const User = require('../models/User');

(async () => {
  try {
    console.log('🌱 Seeding Gulf sample data...');

    // Ensure connection
    await sequelize.authenticate();

    // Create or find Gulf company
    const [company] = await Company.findOrCreate({
      where: { name: 'GulfTech Solutions' },
      defaults: {
        name: 'GulfTech Solutions',
        slug: 'gulftech-solutions',
        description: 'Leading technology solutions provider in the GCC region',
        region: 'gulf',
        city: 'Dubai',
        country: 'UAE',
        website: 'https://gulftech.example.com',
        industry: 'Technology',
      },
    });

    console.log('🏢 Company:', company.id, company.name, company.region);

    // Create or find a Gulf employer user
    const [employer] = await User.findOrCreate({
      where: { email: 'employer@gulftech.example.com' },
      defaults: {
        email: 'employer@gulftech.example.com',
        user_type: 'employer',
        company_id: company.id,
        region: 'gulf',
        is_email_verified: true,
        oauth_provider: 'google'
      }
    });
    console.log('👤 Employer:', employer.id, employer.email, employer.user_type, employer.region);

    // Create a Gulf job
    const title = 'Senior Software Engineer (Node.js)';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const job = await Job.create({
      title,
      slug,
      description: 'Build scalable services for GulfTech clients across GCC.',
      location: 'Dubai, UAE',
      city: 'Dubai',
      country: 'UAE',
      region: 'gulf',
      companyId: company.id,
      employerId: employer.id,
      salaryMin: 18000,
      salaryMax: 28000,
      salaryCurrency: 'AED',
      experienceLevel: 'senior',
      jobType: 'full-time',
      status: 'active',
      isFeatured: true
    });

    console.log('📄 Job:', job.id, job.title, job.region);

    console.log('✅ Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
})();


