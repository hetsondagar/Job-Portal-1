require('dotenv').config();
const { sequelize, syncDatabase } = require('../config');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Import all models
const {
  User,
  Company,
  Job,
  JobCategory,
  JobApplication,
  JobBookmark,
  JobAlert,
  Requirement,
  RequirementApplication,
  Resume,
  WorkExperience,
  Education,
  Notification,
  CompanyReview,
  CompanyFollow,
  Subscription,
  SubscriptionPlan,
  UserSession,
  Interview,
  Message,
  Conversation,
  Payment,
  Analytics
} = require('../config');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Sync database (create tables)
    await syncDatabase(true);
    
    console.log('📊 Creating sample data...');
    
    // Create Job Categories
    const categories = await JobCategory.bulkCreate([
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Software development, IT, and technology roles',
        icon: '💻',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        name: 'Finance',
        slug: 'finance',
        description: 'Banking, accounting, and financial services',
        icon: '💰',
        color: 'from-green-500 to-emerald-500'
      },
      {
        name: 'Healthcare',
        slug: 'healthcare',
        description: 'Medical, pharmaceutical, and healthcare roles',
        icon: '🏥',
        color: 'from-red-500 to-pink-500'
      },
      {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Digital marketing, advertising, and PR',
        icon: '📢',
        color: 'from-purple-500 to-pink-500'
      },
      {
        name: 'Sales',
        slug: 'sales',
        description: 'Sales, business development, and account management',
        icon: '📈',
        color: 'from-orange-500 to-red-500'
      },
      {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design, graphic design, and creative roles',
        icon: '🎨',
        color: 'from-indigo-500 to-purple-500'
      }
    ]);
    
    // Create Subscription Plans
    const plans = await SubscriptionPlan.bulkCreate([
      {
        name: 'Free',
        slug: 'free',
        description: 'Basic features for small businesses',
        planType: 'free',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: {
          jobPostings: 1,
          candidateViews: 50,
          resumeDownloads: 5,
          advancedAnalytics: false,
          prioritySupport: false,
          customBranding: false
        },
        maxJobPostings: 1,
        maxCandidateViews: 50,
        maxResumeDownloads: 5
      },
      {
        name: 'Basic',
        slug: 'basic',
        description: 'Essential features for growing companies',
        planType: 'basic',
        monthlyPrice: 999,
        yearlyPrice: 9999,
        features: {
          jobPostings: 5,
          candidateViews: 200,
          resumeDownloads: 25,
          advancedAnalytics: false,
          prioritySupport: false,
          customBranding: false
        },
        maxJobPostings: 5,
        maxCandidateViews: 200,
        maxResumeDownloads: 25
      },
      {
        name: 'Premium',
        slug: 'premium',
        description: 'Advanced features for established companies',
        planType: 'premium',
        monthlyPrice: 2499,
        yearlyPrice: 24999,
        features: {
          jobPostings: 20,
          candidateViews: 1000,
          resumeDownloads: 100,
          advancedAnalytics: true,
          prioritySupport: true,
          customBranding: false
        },
        maxJobPostings: 20,
        maxCandidateViews: 1000,
        maxResumeDownloads: 100,
        hasAdvancedAnalytics: true,
        hasPrioritySupport: true,
        isPopular: true
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'Custom solutions for large organizations',
        planType: 'enterprise',
        monthlyPrice: 4999,
        yearlyPrice: 49999,
        features: {
          jobPostings: -1, // unlimited
          candidateViews: -1,
          resumeDownloads: -1,
          advancedAnalytics: true,
          prioritySupport: true,
          customBranding: true,
          apiAccess: true,
          bulkOperations: true
        },
        maxJobPostings: -1,
        maxCandidateViews: -1,
        maxResumeDownloads: -1,
        hasAdvancedAnalytics: true,
        hasPrioritySupport: true,
        hasCustomBranding: true,
        hasAPIAccess: true,
        hasBulkOperations: true
      }
    ]);
    
    // Create Companies
    const companies = await Company.bulkCreate([
      {
        name: 'TechCorp Solutions',
        slug: 'techcorp-solutions',
        industry: 'Technology',
        sector: 'technology',
        description: 'Leading technology company specializing in innovative software solutions',
        website: 'https://techcorp.com',
        logo: '/placeholder-logo.png',
        location: 'Bangalore, Karnataka',
        employees: '500-1000',
        founded: '2015',
        revenue: '$50-100 million',
        ceo: 'Rajesh Kumar',
        companyType: 'Product Based',
        benefits: [
          'Health Insurance',
          'Flexible Hours',
          'Remote Work',
          'Learning Budget',
          'Stock Options'
        ],
        rating: 4.2,
        reviewCount: 234,
        followerCount: 1567,
        jobCount: 24
      },
      {
        name: 'FinanceFirst Bank',
        slug: 'financefirst-bank',
        industry: 'Banking & Finance',
        sector: 'finance',
        description: 'One of India\'s leading private sector banks',
        website: 'https://financefirst.com',
        logo: '/placeholder-logo.png',
        location: 'Mumbai, Maharashtra',
        employees: '10000+',
        founded: '1994',
        revenue: '$1-5 billion',
        ceo: 'Priya Sharma',
        companyType: 'Fortune 500',
        benefits: [
          'Medical Insurance',
          'Provident Fund',
          'Performance Bonus',
          'Training Programs'
        ],
        rating: 4.1,
        reviewCount: 1567,
        followerCount: 8900,
        jobCount: 89
      },
      {
        name: 'Apollo Hospitals',
        slug: 'apollo-hospitals',
        industry: 'Healthcare',
        sector: 'healthcare',
        description: 'Leading healthcare provider in India',
        website: 'https://apollohospitals.com',
        logo: '/placeholder-logo.png',
        location: 'Chennai, Tamil Nadu',
        employees: '5000+',
        founded: '1983',
        revenue: '$500M-1B',
        ceo: 'Dr. Prathap C. Reddy',
        companyType: 'Healthcare',
        benefits: [
          'Health Insurance',
          'Medical Benefits',
          'Professional Development',
          'Work-Life Balance'
        ],
        rating: 4.5,
        reviewCount: 892,
        followerCount: 3400,
        jobCount: 145
      }
    ]);
    
    // Create Users (Job Seekers)
    const jobSeekers = await User.bulkCreate([
      {
        firstName: 'Amit',
        lastName: 'Kumar',
        email: 'amit.kumar@email.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+91 98765 43210',
        role: 'jobseeker',
        location: 'Bangalore, Karnataka',
        experience: '3-5 years',
        currentSalary: '800000',
        expectedSalary: '1200000',
        noticePeriod: 60,
        isWillingToRelocate: true,
        preferredLocations: ['Bangalore', 'Mumbai', 'Pune'],
        skills: ['React', 'Node.js', 'JavaScript', 'TypeScript'],
        isActive: true
      },
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@email.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+91 98765 43211',
        role: 'jobseeker',
        location: 'Mumbai, Maharashtra',
        experience: '5-8 years',
        currentSalary: '1500000',
        expectedSalary: '2000000',
        noticePeriod: 30,
        isWillingToRelocate: false,
        preferredLocations: ['Mumbai'],
        skills: ['Product Management', 'Analytics', 'Leadership'],
        isActive: true
      },
      {
        firstName: 'Rahul',
        lastName: 'Verma',
        email: 'rahul.verma@email.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+91 98765 43212',
        role: 'jobseeker',
        location: 'Delhi, NCR',
        experience: '1-3 years',
        currentSalary: '500000',
        expectedSalary: '800000',
        noticePeriod: 15,
        isWillingToRelocate: true,
        preferredLocations: ['Delhi', 'Gurgaon', 'Noida'],
        skills: ['Python', 'Machine Learning', 'Data Science'],
        isActive: true
      }
    ]);
    
    // Create Users (Employers)
    const employers = await User.bulkCreate([
      {
        firstName: 'Keshav',
        lastName: 'Encon',
        email: 'keshav.encon@techcorp.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+91 98765 43213',
        role: 'employer',
        companyId: companies[0].id,
        designation: 'Senior HR Manager',
        isActive: true
      },
      {
        firstName: 'Meera',
        lastName: 'Patel',
        email: 'meera.patel@financefirst.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+91 98765 43214',
        role: 'employer',
        companyId: companies[1].id,
        designation: 'HR Director',
        isActive: true
      }
    ]);
    
    // Create Jobs
    const jobs = await Job.bulkCreate([
      {
        title: 'Senior Full Stack Developer',
        companyId: companies[0].id,
        employerId: employers[0].id,
        categoryId: categories[0].id,
        location: 'Bangalore, Karnataka',
        experience: '4-7 years',
        salary: '1500000-2500000',
        currency: 'INR',
        jobType: 'full-time',
        remoteWork: 'hybrid',
        department: 'Engineering',
        description: 'We are looking for a skilled Full Stack Developer to join our dynamic team.',
        requirements: [
          'Bachelor\'s degree in Computer Science',
          '4+ years of experience in full-stack development',
          'Strong proficiency in React, Node.js, and JavaScript',
          'Experience with cloud platforms (AWS preferred)'
        ],
        skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'AWS', 'MongoDB'],
        benefits: [
          'Health Insurance',
          'Flexible Working Hours',
          'Remote Work Options',
          'Learning & Development Budget'
        ],
        status: 'active',
        isUrgent: true,
        isFeatured: true,
        applicationCount: 45,
        viewCount: 234,
        bookmarkCount: 12
      },
      {
        title: 'Product Manager - Growth',
        companyId: companies[0].id,
        employerId: employers[0].id,
        categoryId: categories[0].id,
        location: 'Mumbai, Maharashtra',
        experience: '5-8 years',
        salary: '2000000-3500000',
        currency: 'INR',
        jobType: 'full-time',
        remoteWork: 'hybrid',
        department: 'Product',
        description: 'Lead product strategy and growth initiatives for our platform.',
        requirements: [
          '5+ years of product management experience',
          'Strong analytical and strategic thinking',
          'Experience with growth hacking and user acquisition',
          'Excellent communication and leadership skills'
        ],
        skills: ['Product Strategy', 'Analytics', 'Leadership', 'Growth Hacking'],
        benefits: [
          'Competitive salary',
          'Stock options',
          'Health insurance',
          'Professional development'
        ],
        status: 'active',
        isUrgent: false,
        isFeatured: true,
        applicationCount: 32,
        viewCount: 189,
        bookmarkCount: 8
      },
      {
        title: 'Investment Banking Analyst',
        companyId: companies[1].id,
        employerId: employers[1].id,
        categoryId: categories[1].id,
        location: 'Mumbai, Maharashtra',
        experience: '2-4 years',
        salary: '1800000-3000000',
        currency: 'INR',
        jobType: 'full-time',
        remoteWork: 'on_site',
        department: 'Investment Banking',
        description: 'Join our investment banking team and work on high-profile deals.',
        requirements: [
          'MBA from top-tier institution',
          '2+ years of investment banking experience',
          'Strong financial modeling skills',
          'Excellent Excel and PowerPoint skills'
        ],
        skills: ['Financial Modeling', 'Valuation', 'Excel', 'PowerPoint', 'M&A'],
        benefits: [
          'Competitive compensation',
          'Performance bonuses',
          'Health insurance',
          'Professional development'
        ],
        status: 'active',
        isUrgent: true,
        isFeatured: false,
        applicationCount: 67,
        viewCount: 456,
        bookmarkCount: 23
      }
    ]);
    
    // Create Resumes
    const resumes = await Resume.bulkCreate([
      {
        userId: jobSeekers[0].id,
        title: 'Software Developer Resume',
        summary: 'Experienced full-stack developer with expertise in React and Node.js',
        skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'AWS'],
        experience: '3-5 years',
        education: 'B.Tech in Computer Science',
        isDefault: true,
        isPublic: true
      },
      {
        userId: jobSeekers[1].id,
        title: 'Product Manager Resume',
        summary: 'Senior product manager with experience in B2B SaaS products',
        skills: ['Product Strategy', 'Analytics', 'Leadership', 'User Research'],
        experience: '5-8 years',
        education: 'MBA in Business Administration',
        isDefault: true,
        isPublic: true
      }
    ]);
    
    // Create Work Experience
    await WorkExperience.bulkCreate([
      {
        userId: jobSeekers[0].id,
        resumeId: resumes[0].id,
        company: 'TechStart Inc',
        position: 'Full Stack Developer',
        location: 'Bangalore, India',
        startDate: '2021-01-01',
        endDate: '2023-12-31',
        isCurrent: false,
        description: 'Developed and maintained web applications using React and Node.js'
      },
      {
        userId: jobSeekers[1].id,
        resumeId: resumes[1].id,
        company: 'SaaS Solutions',
        position: 'Senior Product Manager',
        location: 'Mumbai, India',
        startDate: '2020-03-01',
        endDate: null,
        isCurrent: true,
        description: 'Led product strategy and growth initiatives for B2B SaaS platform'
      }
    ]);
    
    // Create Education
    await Education.bulkCreate([
      {
        userId: jobSeekers[0].id,
        resumeId: resumes[0].id,
        institution: 'IIT Delhi',
        degree: 'B.Tech in Computer Science',
        field: 'Computer Science',
        startDate: '2017-08-01',
        endDate: '2021-05-31',
        grade: '8.5/10',
        isCurrent: false
      },
      {
        userId: jobSeekers[1].id,
        resumeId: resumes[1].id,
        institution: 'IIM Bangalore',
        degree: 'MBA',
        field: 'Business Administration',
        startDate: '2018-06-01',
        endDate: '2020-03-31',
        grade: '3.8/4.0',
        isCurrent: false
      }
    ]);
    
    // Create Job Applications
    await JobApplication.bulkCreate([
      {
        jobId: jobs[0].id,
        userId: jobSeekers[0].id,
        employerId: employers[0].id,
        status: 'applied',
        coverLetter: 'I am excited to apply for the Senior Full Stack Developer position...',
        expectedSalary: '2000000',
        noticePeriod: 60,
        isWillingToRelocate: true,
        resumeId: resumes[0].id
      },
      {
        jobId: jobs[1].id,
        userId: jobSeekers[1].id,
        employerId: employers[0].id,
        status: 'shortlisted',
        coverLetter: 'With my experience in product management and growth...',
        expectedSalary: '2800000',
        noticePeriod: 30,
        isWillingToRelocate: false,
        resumeId: resumes[1].id
      }
    ]);
    
    // Create Job Bookmarks
    await JobBookmark.bulkCreate([
      {
        userId: jobSeekers[0].id,
        jobId: jobs[0].id,
        folder: 'favorites',
        priority: 'high',
        notes: 'Great opportunity with good tech stack'
      },
      {
        userId: jobSeekers[1].id,
        jobId: jobs[1].id,
        folder: 'applied',
        priority: 'medium',
        isApplied: true
      }
    ]);
    
    // Create Job Alerts
    await JobAlert.bulkCreate([
      {
        userId: jobSeekers[0].id,
        name: 'React Developer Jobs',
        keywords: ['React', 'JavaScript', 'Frontend'],
        locations: ['Bangalore', 'Mumbai', 'Pune'],
        experienceLevel: 'mid',
        frequency: 'weekly'
      },
      {
        userId: jobSeekers[1].id,
        name: 'Product Manager Roles',
        keywords: ['Product Manager', 'Product Strategy'],
        locations: ['Mumbai', 'Bangalore'],
        experienceLevel: 'senior',
        frequency: 'daily'
      }
    ]);
    
    // Create Company Reviews
    await CompanyReview.bulkCreate([
      {
        companyId: companies[0].id,
        userId: jobSeekers[0].id,
        rating: 4,
        title: 'Great place to work',
        review: 'Excellent work culture and learning opportunities',
        pros: 'Good work-life balance, learning opportunities',
        cons: 'Sometimes long hours during releases',
        employmentStatus: 'current',
        employmentDuration: '2 years',
        isVerified: true
      },
      {
        companyId: companies[1].id,
        userId: jobSeekers[1].id,
        rating: 3,
        title: 'Decent company',
        review: 'Good benefits but bureaucratic processes',
        pros: 'Good benefits, job security',
        cons: 'Slow decision making, bureaucracy',
        employmentStatus: 'former',
        employmentDuration: '1 year',
        isVerified: true
      }
    ]);
    
    // Create Company Follows
    await CompanyFollow.bulkCreate([
      {
        userId: jobSeekers[0].id,
        companyId: companies[0].id,
        notificationPreferences: {
          newJobs: true,
          companyUpdates: true,
          email: true,
          push: true
        }
      },
      {
        userId: jobSeekers[1].id,
        companyId: companies[1].id,
        notificationPreferences: {
          newJobs: true,
          companyUpdates: false,
          email: true,
          push: false
        }
      }
    ]);
    
    // Create Subscriptions
    await Subscription.bulkCreate([
      {
        userId: employers[0].id,
        planId: plans[2].id, // Premium plan
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        billingCycle: 'yearly',
        amount: 24999,
        nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        features: {
          jobPostings: 20,
          candidateViews: 1000,
          resumeDownloads: 100,
          advancedAnalytics: true,
          prioritySupport: true
        }
      },
      {
        userId: employers[1].id,
        planId: plans[1].id, // Basic plan
        status: 'trial',
        startDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        billingCycle: 'monthly',
        amount: 999,
        features: {
          jobPostings: 5,
          candidateViews: 200,
          resumeDownloads: 25
        }
      }
    ]);
    
    // Create Notifications
    await Notification.bulkCreate([
      {
        userId: jobSeekers[0].id,
        type: 'job_application',
        title: 'Application Status Updated',
        message: 'Your application for Senior Full Stack Developer has been reviewed',
        data: { jobId: jobs[0].id, status: 'reviewing' },
        isRead: false
      },
      {
        userId: jobSeekers[1].id,
        type: 'job_alert',
        title: 'New Job Alert',
        message: 'New Product Manager position matches your criteria',
        data: { jobId: jobs[1].id },
        isRead: false
      }
    ]);

    // Create User Sessions
    await UserSession.bulkCreate([
      {
        userId: jobSeekers[0].id,
        sessionToken: 'session_token_1',
        deviceType: 'web',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        loginMethod: 'email',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: employers[0].id,
        sessionToken: 'session_token_2',
        deviceType: 'mobile',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        loginMethod: 'email',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Create Interviews
    await Interview.bulkCreate([
      {
        jobApplicationId: jobApplications[0].id,
        employerId: employers[0].id,
        candidateId: jobSeekers[0].id,
        jobId: jobs[0].id,
        title: 'Technical Interview - Senior Full Stack Developer',
        description: 'Technical assessment and coding challenge',
        interviewType: 'technical',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: 90,
        timezone: 'Asia/Kolkata',
        location: {
          type: 'video',
          platform: 'Zoom',
          link: 'https://zoom.us/j/123456789'
        },
        interviewers: [
          {
            name: 'John Doe',
            role: 'Senior Developer',
            email: 'john.doe@techcorp.com'
          }
        ]
      },
      {
        jobApplicationId: jobApplications[1].id,
        employerId: employers[1].id,
        candidateId: jobSeekers[1].id,
        jobId: jobs[1].id,
        title: 'HR Interview - Product Manager',
        description: 'Cultural fit and experience discussion',
        interviewType: 'hr',
        status: 'confirmed',
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        duration: 60,
        timezone: 'Asia/Kolkata',
        location: {
          type: 'in_person',
          address: 'Tech Park, Whitefield, Bangalore'
        }
      }
    ]);

    // Create Conversations
    const conversations = await Conversation.bulkCreate([
      {
        participant1Id: jobSeekers[0].id,
        participant2Id: employers[0].id,
        jobApplicationId: jobApplications[0].id,
        jobId: jobs[0].id,
        conversationType: 'application',
        title: 'Senior Full Stack Developer Application',
        lastMessageAt: new Date()
      },
      {
        participant1Id: jobSeekers[1].id,
        participant2Id: employers[1].id,
        jobApplicationId: jobApplications[1].id,
        jobId: jobs[1].id,
        conversationType: 'application',
        title: 'Product Manager Application',
        lastMessageAt: new Date()
      }
    ]);

    // Create Messages
    await Message.bulkCreate([
      {
        conversationId: conversations[0].id,
        senderId: employers[0].id,
        receiverId: jobSeekers[0].id,
        messageType: 'text',
        content: 'Hi! We have reviewed your application and would like to schedule an interview.',
        isRead: true,
        isDelivered: true
      },
      {
        conversationId: conversations[0].id,
        senderId: jobSeekers[0].id,
        receiverId: employers[0].id,
        messageType: 'text',
        content: 'Thank you! I would be happy to attend the interview.',
        isRead: true,
        isDelivered: true
      },
      {
        conversationId: conversations[1].id,
        senderId: employers[1].id,
        receiverId: jobSeekers[1].id,
        messageType: 'interview_invite',
        content: 'We would like to invite you for an HR interview.',
        isRead: false,
        isDelivered: true
      }
    ]);

    // Create Payments
    await Payment.bulkCreate([
      {
        userId: employers[0].id,
        subscriptionId: subscriptions[0].id,
        paymentType: 'subscription',
        amount: 24999,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'credit_card',
        paymentGateway: 'razorpay',
        gatewayTransactionId: 'txn_123456789',
        description: 'Premium Plan - Yearly Subscription',
        processedAt: new Date()
      },
      {
        userId: employers[1].id,
        subscriptionId: subscriptions[1].id,
        paymentType: 'subscription',
        amount: 999,
        currency: 'INR',
        status: 'pending',
        paymentMethod: 'upi',
        paymentGateway: 'razorpay',
        description: 'Basic Plan - Monthly Subscription'
      }
    ]);

    // Create Analytics
    await Analytics.bulkCreate([
      {
        userId: jobSeekers[0].id,
        sessionId: 'session_1',
        eventType: 'job_view',
        eventCategory: 'job_interaction',
        pageUrl: '/jobs/1',
        jobId: jobs[0].id,
        deviceType: 'desktop',
        browser: 'Chrome',
        operatingSystem: 'Windows',
        duration: 120
      },
      {
        userId: jobSeekers[0].id,
        sessionId: 'session_1',
        eventType: 'job_apply',
        eventCategory: 'application_process',
        pageUrl: '/jobs/1/apply',
        jobId: jobs[0].id,
        deviceType: 'desktop',
        browser: 'Chrome',
        operatingSystem: 'Windows'
      },
      {
        userId: employers[0].id,
        sessionId: 'session_2',
        eventType: 'page_view',
        eventCategory: 'user_engagement',
        pageUrl: '/employer-dashboard',
        deviceType: 'mobile',
        browser: 'Safari',
        operatingSystem: 'iOS'
      }
    ]);
    
    console.log('✅ Database initialized successfully!');
    console.log(`📊 Created ${categories.length} job categories`);
    console.log(`📊 Created ${plans.length} subscription plans`);
    console.log(`📊 Created ${companies.length} companies`);
    console.log(`📊 Created ${jobSeekers.length} job seekers`);
    console.log(`📊 Created ${employers.length} employers`);
    console.log(`📊 Created ${jobs.length} jobs`);
    console.log(`📊 Created ${resumes.length} resumes`);
    console.log(`📊 Created sample applications, bookmarks, alerts, reviews, subscriptions, sessions, interviews, conversations, messages, payments, and analytics`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 