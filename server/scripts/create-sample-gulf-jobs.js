const { sequelize } = require('../config/sequelize');
const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');

const sampleGulfJobs = [
  {
    title: 'Senior Software Engineer',
    slug: 'senior-software-engineer-dubai-tech-innovations',
    description: 'We are looking for a Senior Software Engineer to join our dynamic team in Dubai. You will be responsible for developing and maintaining high-quality software solutions.',
    shortDescription: 'Join our Dubai tech team as a Senior Software Engineer',
    requirements: 'Bachelor\'s degree in Computer Science, 5+ years experience, proficiency in JavaScript, React, Node.js',
    responsibilities: 'Develop and maintain software applications, collaborate with cross-functional teams, mentor junior developers',
    location: 'Dubai, UAE',
    city: 'Dubai',
    state: 'Dubai',
    country: 'UAE',
    region: 'gulf',
    jobType: 'full-time',
    experienceLevel: 'senior',
    experienceMin: 5,
    experienceMax: 8,
    salary: 'AED 25,000 - 35,000 per month',
    salaryMin: 25000,
    salaryMax: 35000,
    currency: 'AED',
    status: 'active',
    isRemote: false,
    isUrgent: false,
    isFeatured: true,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    benefits: 'Health insurance, annual flight tickets, housing allowance',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS']
  },
  {
    title: 'Marketing Manager',
    slug: 'marketing-manager-doha-digital-solutions',
    description: 'Lead our marketing initiatives in the Qatar market. Develop and execute comprehensive marketing strategies to drive business growth.',
    shortDescription: 'Lead marketing initiatives in Qatar market',
    requirements: 'Bachelor\'s degree in Marketing, 4+ years experience, digital marketing expertise',
    responsibilities: 'Develop marketing strategies, manage campaigns, analyze market trends',
    location: 'Doha, Qatar',
    city: 'Doha',
    state: 'Doha',
    country: 'Qatar',
    region: 'gulf',
    jobType: 'full-time',
    experienceLevel: 'mid',
    experienceMin: 4,
    experienceMax: 6,
    salary: 'QAR 18,000 - 25,000 per month',
    salaryMin: 18000,
    salaryMax: 25000,
    currency: 'QAR',
    status: 'active',
    isRemote: false,
    isUrgent: true,
    isFeatured: false,
    applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    benefits: 'Health insurance, transportation allowance, annual bonus',
    skills: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics', 'Content Creation']
  },
  {
    title: 'Financial Analyst',
    slug: 'financial-analyst-riyadh-investment-group',
    description: 'Join our investment team in Riyadh. Analyze financial data, prepare reports, and provide investment recommendations.',
    shortDescription: 'Financial analysis role in Riyadh investment firm',
    requirements: 'Bachelor\'s degree in Finance, 3+ years experience, CFA preferred',
    responsibilities: 'Analyze financial data, prepare investment reports, monitor market trends',
    location: 'Riyadh, Saudi Arabia',
    city: 'Riyadh',
    state: 'Riyadh',
    country: 'Saudi Arabia',
    region: 'gulf',
    jobType: 'full-time',
    experienceLevel: 'mid',
    experienceMin: 3,
    experienceMax: 5,
    salary: 'SAR 15,000 - 22,000 per month',
    salaryMin: 15000,
    salaryMax: 22000,
    currency: 'SAR',
    status: 'active',
    isRemote: false,
    isUrgent: false,
    isFeatured: true,
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    benefits: 'Health insurance, housing allowance, performance bonus',
    skills: ['Financial Analysis', 'Excel', 'Bloomberg', 'Risk Management', 'Investment Research']
  },
  {
    title: 'Project Manager',
    slug: 'project-manager-kuwait-construction',
    description: 'Manage large-scale construction projects in Kuwait. Coordinate with teams, ensure project delivery on time and within budget.',
    shortDescription: 'Lead construction projects in Kuwait',
    requirements: 'Bachelor\'s degree in Engineering, 6+ years experience, PMP certification preferred',
    responsibilities: 'Manage project timelines, coordinate teams, ensure quality standards',
    location: 'Kuwait City, Kuwait',
    city: 'Kuwait City',
    state: 'Kuwait',
    country: 'Kuwait',
    region: 'gulf',
    jobType: 'full-time',
    experienceLevel: 'senior',
    experienceMin: 6,
    experienceMax: 10,
    salary: 'KWD 1,200 - 1,800 per month',
    salaryMin: 1200,
    salaryMax: 1800,
    currency: 'KWD',
    status: 'active',
    isRemote: false,
    isUrgent: true,
    isFeatured: false,
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    benefits: 'Health insurance, transportation, housing allowance',
    skills: ['Project Management', 'Construction', 'Budget Management', 'Team Leadership', 'Risk Assessment']
  },
  {
    title: 'Data Scientist',
    slug: 'data-scientist-bahrain-fintech',
    description: 'Join our fintech team in Bahrain. Develop machine learning models, analyze large datasets, and drive data-driven decisions.',
    shortDescription: 'Data science role in Bahrain fintech company',
    requirements: 'Master\'s degree in Data Science, 3+ years experience, Python, R, SQL',
    responsibilities: 'Develop ML models, analyze data, create insights, collaborate with product teams',
    location: 'Manama, Bahrain',
    city: 'Manama',
    state: 'Manama',
    country: 'Bahrain',
    region: 'gulf',
    jobType: 'full-time',
    experienceLevel: 'mid',
    experienceMin: 3,
    experienceMax: 6,
    salary: 'BHD 1,500 - 2,200 per month',
    salaryMin: 1500,
    salaryMax: 2200,
    currency: 'BHD',
    status: 'active',
    isRemote: false,
    isUrgent: false,
    isFeatured: true,
    applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
    benefits: 'Health insurance, annual leave, professional development',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Data Visualization']
  },
  {
    title: 'Sales Executive',
    slug: 'sales-executive-oman-retail',
    description: 'Drive sales growth in the Oman market. Build relationships with clients, achieve sales targets, and expand market presence.',
    shortDescription: 'Sales role in Oman retail sector',
    requirements: 'Bachelor\'s degree in Business, 2+ years sales experience, Arabic language skills',
    responsibilities: 'Meet sales targets, build client relationships, market analysis',
    location: 'Muscat, Oman',
    city: 'Muscat',
    state: 'Muscat',
    country: 'Oman',
    region: 'gulf',
    jobType: 'full-time',
    experienceLevel: 'junior',
    experienceMin: 2,
    experienceMax: 4,
    salary: 'OMR 800 - 1,200 per month',
    salaryMin: 800,
    salaryMax: 1200,
    currency: 'OMR',
    status: 'active',
    isRemote: false,
    isUrgent: true,
    isFeatured: false,
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    benefits: 'Commission, health insurance, transportation',
    skills: ['Sales', 'Customer Relations', 'Arabic', 'Negotiation', 'Market Analysis']
  }
];

const sampleGulfCompanies = [
  {
    name: 'Dubai Tech Innovations',
    slug: 'dubai-tech-innovations',
    description: 'Leading technology company in Dubai specializing in software development and digital solutions.',
    shortDescription: 'Dubai-based technology company',
    industry: 'Technology',
    sector: 'Software Development',
    companySize: '201-500',
    foundedYear: 2015,
    website: 'https://dubaitech.ae',
    email: 'careers@dubaitech.ae',
    phone: '+971-4-123-4567',
    address: 'Dubai Internet City, Dubai, UAE',
    city: 'Dubai',
    state: 'Dubai',
    country: 'UAE',
    region: 'gulf',
    pincode: '12345',
    status: 'active',
    isVerified: true
  },
  {
    name: 'Doha Digital Solutions',
    slug: 'doha-digital-solutions',
    description: 'Digital marketing and technology solutions provider in Qatar.',
    shortDescription: 'Qatar digital solutions company',
    industry: 'Marketing',
    sector: 'Digital Marketing',
    companySize: '51-200',
    foundedYear: 2018,
    website: 'https://dohadigital.qa',
    email: 'hr@dohadigital.qa',
    phone: '+974-1234-5678',
    address: 'West Bay, Doha, Qatar',
    city: 'Doha',
    state: 'Doha',
    country: 'Qatar',
    region: 'gulf',
    pincode: '12345',
    status: 'active',
    isVerified: true
  },
  {
    name: 'Riyadh Investment Group',
    slug: 'riyadh-investment-group',
    description: 'Leading investment and financial services company in Saudi Arabia.',
    shortDescription: 'Saudi investment company',
    industry: 'Finance',
    sector: 'Investment',
    companySize: '500-1000',
    foundedYear: 2010,
    website: 'https://riyadhinvestment.sa',
    email: 'careers@riyadhinvestment.sa',
    phone: '+966-11-123-4567',
    address: 'King Fahd Road, Riyadh, Saudi Arabia',
    city: 'Riyadh',
    state: 'Riyadh',
    country: 'Saudi Arabia',
    region: 'gulf',
    pincode: '12345',
    status: 'active',
    isVerified: true
  },
  {
    name: 'Kuwait Construction Ltd',
    slug: 'kuwait-construction-ltd',
    description: 'Major construction and infrastructure development company in Kuwait.',
    shortDescription: 'Kuwait construction company',
    industry: 'Construction',
    sector: 'Infrastructure',
    companySize: '1000+',
    foundedYear: 2005,
    website: 'https://kuwaitconstruction.kw',
    email: 'jobs@kuwaitconstruction.kw',
    phone: '+965-1234-5678',
    address: 'Kuwait City, Kuwait',
    city: 'Kuwait City',
    state: 'Kuwait',
    country: 'Kuwait',
    region: 'gulf',
    pincode: '12345',
    status: 'active',
    isVerified: true
  },
  {
    name: 'Bahrain Fintech Solutions',
    slug: 'bahrain-fintech-solutions',
    description: 'Innovative fintech company providing digital financial solutions in Bahrain.',
    shortDescription: 'Bahrain fintech company',
    industry: 'Finance',
    sector: 'Fintech',
    companySize: '51-200',
    foundedYear: 2019,
    website: 'https://bahrainfintech.bh',
    email: 'careers@bahrainfintech.bh',
    phone: '+973-1234-5678',
    address: 'Manama, Bahrain',
    city: 'Manama',
    state: 'Manama',
    country: 'Bahrain',
    region: 'gulf',
    pincode: '12345',
    status: 'active',
    isVerified: true
  },
  {
    name: 'Oman Retail Group',
    slug: 'oman-retail-group',
    description: 'Leading retail and consumer goods company in Oman.',
    shortDescription: 'Oman retail company',
    industry: 'Retail',
    sector: 'Consumer Goods',
    companySize: '201-500',
    foundedYear: 2012,
    website: 'https://omanretail.om',
    email: 'hr@omanretail.om',
    phone: '+968-1234-5678',
    address: 'Muscat, Oman',
    city: 'Muscat',
    state: 'Muscat',
    country: 'Oman',
    region: 'gulf',
    pincode: '12345',
    status: 'active',
    isVerified: true
  }
];

async function createSampleGulfData() {
  try {
    console.log('🚀 Creating sample Gulf companies and jobs...');

    // Create companies first
    const createdCompanies = [];
    for (const companyData of sampleGulfCompanies) {
      const [company, created] = await Company.findOrCreate({
        where: { slug: companyData.slug },
        defaults: companyData
      });
      createdCompanies.push(company);
      console.log(`${created ? '✅ Created' : '⚠️ Already exists'}: ${company.name}`);
    }

    // Get a sample employer user (assuming there's at least one employer in the system)
    const employer = await User.findOne({
      where: { user_type: 'employer' }
    });

    if (!employer) {
      console.log('❌ No employer user found. Please create an employer user first.');
      return;
    }

    // Create jobs
    for (let i = 0; i < sampleGulfJobs.length; i++) {
      const jobData = sampleGulfJobs[i];
      const company = createdCompanies[i % createdCompanies.length];
      
      const [job, created] = await Job.findOrCreate({
        where: { slug: jobData.slug },
        defaults: {
          ...jobData,
          companyId: company.id,
          employerId: employer.id
        }
      });
      
      console.log(`${created ? '✅ Created' : '⚠️ Already exists'}: ${job.title} at ${company.name}`);
    }

    console.log('🎉 Sample Gulf data created successfully!');
    console.log(`📊 Created ${createdCompanies.length} companies and ${sampleGulfJobs.length} jobs`);

  } catch (error) {
    console.error('❌ Error creating sample Gulf data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
createSampleGulfData();
