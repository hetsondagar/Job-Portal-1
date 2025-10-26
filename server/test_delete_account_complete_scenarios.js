const axios = require('axios');
const { sequelize } = require('./config/sequelize');
const { User, Company, Job, JobApplication, JobBookmark, JobAlert, Resume, CoverLetter, Education, WorkExperience, CompanyFollow, Notification, SearchHistory, UserSession, UserActivityLog, UserDashboard, Conversation, Subscription, EmployerQuota, FeaturedJob, SecureJobTap, Analytics, CandidateLike, ViewTracking, Requirement, JobPreference, AdminNotification, Interview, Message, Payment, CompanyReview } = require('./models');

const API_BASE_URL = 'http://localhost:8000';

// Helper function to create test user
async function createTestUser(userData = {}) {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
    phone: '+1234567890',
    user_type: 'employer',
    is_email_verified: true,
    is_phone_verified: true,
    is_active: true,
    account_status: 'active',
    region: 'india'
  };
  
  const user = await User.create({ ...defaultData, ...userData });
  console.log(`✅ Created user: ${user.email} (${user.user_type}) with ID: ${user.id}`);
  return user;
}

// Helper function to create test company
async function createTestCompany(companyData = {}) {
  const defaultData = {
    name: `Test Company ${Date.now()}`,
    slug: `test-company-${Date.now()}`,
    email: `company-${Date.now()}@example.com`,
    phone: '+1234567890',
    country: 'India',
    is_active: true,
    company_status: 'active'
  };
  
  const company = await Company.create({ ...defaultData, ...companyData });
  console.log(`✅ Created company: ${company.name} with ID: ${company.id}`);
  return company;
}

// Helper function to create test data for user
async function createTestDataForUser(userId, companyId) {
  console.log(`🔧 Creating test data for user ${userId}...`);
  
  // Create job
  const job = await Job.create({
    title: 'Test Job',
    slug: `test-job-${Date.now()}`,
    description: 'Test job description',
    location: 'Test Location',
    companyId: companyId,
    employerId: userId,
    locationType: 'on-site',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: 50000,
    salaryMax: 70000,
    salaryCurrency: 'USD',
    status: 'active'
  });
  
  // Create job application
  await JobApplication.create({
    userId: userId,
    jobId: job.id,
    employerId: userId, // For employer users, they are applying to their own job
    status: 'applied',
    coverLetter: 'Test cover letter',
    appliedAt: new Date(),
    lastUpdatedAt: new Date()
  });
  
  // Create job bookmark
  await JobBookmark.create({
    userId: userId,
    jobId: job.id
  });
  
  // Create job alert
  await JobAlert.create({
    userId: userId,
    name: 'Test Job Alert',
    keywords: ['test', 'job'],
    location: 'Test Location',
    isActive: true
  });
  
  // Create resume
  await Resume.create({
    userId: userId,
    title: 'Test Resume',
    filePath: '/test/resume.pdf',
    isDefault: true,
    lastUpdated: new Date()
  });
  
  // Create cover letter
  await CoverLetter.create({
    userId: userId,
    title: 'Test Cover Letter',
    content: 'Test cover letter content'
  });
  
  // Create education
  await Education.create({
    userId: userId,
    institution: 'Test University',
    degree: 'Bachelor',
    fieldOfStudy: 'Computer Science',
    startDate: new Date('2020-01-01'),
    endDate: new Date('2024-01-01')
  });
  
  // Create work experience
  await WorkExperience.create({
    userId: userId,
    company: 'Test Company',
    position: 'Software Engineer',
    startDate: new Date('2024-01-01'),
    endDate: null,
    isCurrent: true
  });
  
  // Create company follow
  await CompanyFollow.create({
    userId: userId,
    companyId: companyId
  });
  
  // Create notification
  await Notification.create({
    userId: userId,
    type: 'job_alert',
    title: 'Test Notification',
    message: 'Test notification message',
    isRead: false
  });
  
  // Create search history
  await SearchHistory.create({
    userId: userId,
    query: 'test search',
    resultsCount: 10
  });
  
  // Create user session
  await UserSession.create({
    userId: userId,
    sessionToken: 'test-session-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  
  // Create user activity log
  await UserActivityLog.create({
    userId: userId,
    activityType: 'login',
    description: 'User logged in',
    metadata: { ip: '127.0.0.1' }
  });
  
  // Create user dashboard
  await UserDashboard.create({
    userId: userId,
    widgets: ['recent_jobs', 'applications'],
    layout: 'default'
  });
  
  // Create subscription
  await Subscription.create({
    userId: userId,
    planId: 'basic',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  
  // Create employer quota
  await EmployerQuota.create({
    userId: userId,
    quotaType: 'job_posts',
    limit: 10,
    used: 2
  });
  
  // Create secure job tap
  await SecureJobTap.create({
    userId: userId,
    jobId: job.id,
    isActive: true
  });
  
  // Create analytics
  await Analytics.create({
    userId: userId,
    eventType: 'job_view',
    eventData: { jobId: job.id },
    timestamp: new Date()
  });
  
  // Create candidate like
  await CandidateLike.create({
    employerId: userId,
    candidateId: userId, // Self-like for testing
    isLiked: true
  });
  
  // Create view tracking
  await ViewTracking.create({
    viewerId: userId,
    viewedUserId: userId, // Self-view for testing
    viewType: 'profile_view',
    ipAddress: '127.0.0.1'
  });
  
  // Create requirement
  await Requirement.create({
    title: 'Test Requirement',
    description: 'Test requirement description',
    companyId: companyId,
    createdBy: userId,
    experienceMin: 2,
    experienceMax: 5
  });
  
  // Create job preference
  await JobPreference.create({
    userId: userId,
    preferredLocations: ['Test Location'],
    preferredJobTypes: ['full-time'],
    preferredSalaryMin: 50000
  });
  
  // Create admin notification
  await AdminNotification.create({
    type: 'new_employer_registration',
    title: 'New Employer Registration',
    message: 'A new employer has registered',
    relatedUserId: userId,
    priority: 'medium'
  });
  
  // Create interview
  await Interview.create({
    jobId: job.id,
    candidateId: userId,
    employerId: userId,
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'scheduled'
  });
  
  // Create message
  await Message.create({
    senderId: userId,
    receiverId: userId, // Self-message for testing
    content: 'Test message',
    messageType: 'text'
  });
  
  // Create payment
  await Payment.create({
    userId: userId,
    amount: 100.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'credit_card'
  });
  
  // Create company review
  await CompanyReview.create({
    companyId: companyId,
    userId: userId,
    rating: 5,
    title: 'Great Company',
    review: 'This is a great company to work for',
    status: 'approved'
  });
  
  console.log(`✅ Created comprehensive test data for user ${userId}`);
  return { job };
}

// Helper function to test login
async function testLogin(user) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email: user.email,
    password: 'TestPassword123!'
  });
  
  if (response.data.success) {
    console.log(`✅ Login successful for ${user.email}`);
    return response.data.data.token;
  } else {
    throw new Error('Login failed');
  }
}

// Helper function to test delete account
async function testDeleteAccount(authToken) {
  const response = await axios.delete(`${API_BASE_URL}/api/user/account`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      currentPassword: 'TestPassword123!',
      confirmationText: 'DELETE MY ACCOUNT'
    }
  });
  
  if (response.data.success) {
    console.log('✅ Delete account API call successful');
    console.log('📋 Delete response:', response.data);
    return response.data;
  } else {
    throw new Error(`Delete account failed: ${response.data.message}`);
  }
}

// Helper function to verify data deletion
async function verifyDataDeletion(userId, expectedCompanyStatus = null) {
  console.log('🔍 Verifying data deletion...');
  
  const checks = [
    { name: 'Job Bookmarks', model: JobBookmark, field: 'userId', expected: 0 },
    { name: 'Job Alerts', model: JobAlert, field: 'userId', expected: 0 },
    { name: 'Resumes', model: Resume, field: 'userId', expected: 0 },
    { name: 'Cover Letters', model: CoverLetter, field: 'userId', expected: 0 },
    { name: 'Education', model: Education, field: 'userId', expected: 0 },
    { name: 'Work Experience', model: WorkExperience, field: 'userId', expected: 0 },
    { name: 'Company Follows', model: CompanyFollow, field: 'userId', expected: 0 },
    { name: 'Notifications', model: Notification, field: 'userId', expected: 0 },
    { name: 'Search History', model: SearchHistory, field: 'userId', expected: 0 },
    { name: 'User Sessions', model: UserSession, field: 'userId', expected: 0 },
    { name: 'User Activity Logs', model: UserActivityLog, field: 'userId', expected: 0 },
    { name: 'User Dashboard', model: UserDashboard, field: 'userId', expected: 0 },
    { name: 'Subscriptions', model: Subscription, field: 'userId', expected: 0 },
    { name: 'Employer Quotas', model: EmployerQuota, field: 'userId', expected: 0 },
    { name: 'Secure Job Taps', model: SecureJobTap, field: 'userId', expected: 0 },
    { name: 'Analytics', model: Analytics, field: 'userId', expected: 0 },
    { name: 'Job Preferences', model: JobPreference, field: 'userId', expected: 0 },
    { name: 'Job Applications', model: JobApplication, field: 'userId', expected: 0 },
    { name: 'Interviews (Candidate)', model: Interview, field: 'candidateId', expected: 0 },
    { name: 'Messages (Sender)', model: Message, field: 'senderId', expected: 0 },
    { name: 'Payments', model: Payment, field: 'userId', expected: 0 },
    { name: 'Company Reviews', model: CompanyReview, field: 'userId', expected: 0 }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const count = await check.model.count({
        where: { [check.field]: userId }
      });
      
      const passed = count === check.expected;
      const status = passed ? '✅' : '❌';
      
      console.log(`${status} ${check.name}: ${count} records (expected: ${check.expected})`);
      
      if (!passed) {
        allPassed = false;
      }
    } catch (error) {
      console.log(`⚠️ ${check.name}: Error - ${error.message}`);
      allPassed = false;
    }
  }
  
  // Check user account status
  try {
    const user = await User.findByPk(userId);
    if (user) {
      const userDeleted = user.account_status === 'deleted';
      const status = userDeleted ? '✅' : '❌';
      console.log(`${status} User Account: Soft deleted (status: ${user.account_status})`);
      
      if (!userDeleted) {
        allPassed = false;
      }
    } else {
      console.log('❌ User Account: Not found');
      allPassed = false;
    }
  } catch (error) {
    console.log(`⚠️ User Account: Error - ${error.message}`);
    allPassed = false;
  }
  
  // Check company status if provided
  if (expectedCompanyStatus) {
    try {
      const user = await User.findByPk(userId);
      if (user && user.companyId) {
        const company = await Company.findByPk(user.companyId);
        if (company) {
          const companyStatusCorrect = company.companyStatus === expectedCompanyStatus;
          const status = companyStatusCorrect ? '✅' : '❌';
          console.log(`${status} Company Status: ${company.companyStatus} (expected: ${expectedCompanyStatus})`);
          
          if (!companyStatusCorrect) {
            allPassed = false;
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Company Status: Error - ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Scenario 1: Admin user deletes account
async function testScenario1_AdminDeleteAccount() {
  console.log('\n🚀 SCENARIO 1: Admin User Deletes Account');
  console.log('================================================');
  
  let adminUser = null;
  let testCompany = null;
  
  try {
    // Create admin user
    adminUser = await createTestUser({
      user_type: 'admin',
      email: `admin-${Date.now()}@example.com`
    });
    
    // Create company
    testCompany = await createTestCompany();
    
    // Associate admin with company
    await adminUser.update({ companyId: testCompany.id });
    
    // Create test data
    await createTestDataForUser(adminUser.id, testCompany.id);
    
    // Test login
    const authToken = await testLogin(adminUser);
    
    // Test delete account
    const deleteResult = await testDeleteAccount(authToken);
    
    // Verify data deletion
    const dataDeleted = await verifyDataDeletion(adminUser.id, 'inactive');
    
    if (dataDeleted && deleteResult.data.companyHandling === 'Company marked as inactive (only member)') {
      console.log('✅ SCENARIO 1 PASSED: Admin account deleted, company marked as inactive');
      return true;
    } else {
      console.log('❌ SCENARIO 1 FAILED: Data deletion or company handling incorrect');
      return false;
    }
    
  } catch (error) {
    console.error('❌ SCENARIO 1 ERROR:', error.message);
    return false;
  } finally {
    // Cleanup
    if (adminUser) {
      try {
        await User.destroy({ where: { id: adminUser.id } });
        console.log('✅ Admin user cleaned up');
      } catch (error) {
        console.log('⚠️ Error cleaning up admin user:', error.message);
      }
    }
    if (testCompany) {
      try {
        await Company.destroy({ where: { id: testCompany.id } });
        console.log('✅ Company cleaned up');
      } catch (error) {
        console.log('⚠️ Error cleaning up company:', error.message);
      }
    }
  }
}

// Scenario 2: Employer user deletes account (only member)
async function testScenario2_EmployerOnlyMember() {
  console.log('\n🚀 SCENARIO 2: Employer User Deletes Account (Only Member)');
  console.log('==========================================================');
  
  let employerUser = null;
  let testCompany = null;
  
  try {
    // Create employer user
    employerUser = await createTestUser({
      user_type: 'employer',
      email: `employer-only-${Date.now()}@example.com`
    });
    
    // Create company
    testCompany = await createTestCompany();
    
    // Associate employer with company
    await employerUser.update({ companyId: testCompany.id });
    
    // Create test data
    await createTestDataForUser(employerUser.id, testCompany.id);
    
    // Test login
    const authToken = await testLogin(employerUser);
    
    // Test delete account
    const deleteResult = await testDeleteAccount(authToken);
    
    // Verify data deletion
    const dataDeleted = await verifyDataDeletion(employerUser.id, 'inactive');
    
    if (dataDeleted && deleteResult.data.companyHandling === 'Company marked as inactive (only member)') {
      console.log('✅ SCENARIO 2 PASSED: Employer account deleted, company marked as inactive');
      return true;
    } else {
      console.log('❌ SCENARIO 2 FAILED: Data deletion or company handling incorrect');
      return false;
    }
    
  } catch (error) {
    console.error('❌ SCENARIO 2 ERROR:', error.message);
    return false;
  } finally {
    // Cleanup
    if (employerUser) {
      try {
        await User.destroy({ where: { id: employerUser.id } });
        console.log('✅ Employer user cleaned up');
      } catch (error) {
        console.log('⚠️ Error cleaning up employer user:', error.message);
      }
    }
    if (testCompany) {
      try {
        await Company.destroy({ where: { id: testCompany.id } });
        console.log('✅ Company cleaned up');
      } catch (error) {
        console.log('⚠️ Error cleaning up company:', error.message);
      }
    }
  }
}

// Scenario 3: Employer user deletes account (multiple members)
async function testScenario3_EmployerMultipleMembers() {
  console.log('\n🚀 SCENARIO 3: Employer User Deletes Account (Multiple Members)');
  console.log('==============================================================');
  
  let employerUser1 = null;
  let employerUser2 = null;
  let testCompany = null;
  
  try {
    // Create first employer user
    employerUser1 = await createTestUser({
      user_type: 'employer',
      email: `employer1-${Date.now()}@example.com`
    });
    
    // Create second employer user
    employerUser2 = await createTestUser({
      user_type: 'employer',
      email: `employer2-${Date.now()}@example.com`
    });
    
    // Create company
    testCompany = await createTestCompany();
    
    // Associate both employers with company
    await employerUser1.update({ companyId: testCompany.id });
    await employerUser2.update({ companyId: testCompany.id });
    
    // Create test data for first employer
    await createTestDataForUser(employerUser1.id, testCompany.id);
    
    // Test login with first employer
    const authToken = await testLogin(employerUser1);
    
    // Test delete account
    const deleteResult = await testDeleteAccount(authToken);
    
    // Verify data deletion
    const dataDeleted = await verifyDataDeletion(employerUser1.id, 'active');
    
    // Verify second employer still exists
    const secondEmployerExists = await User.findByPk(employerUser2.id);
    const secondEmployerActive = secondEmployerExists && secondEmployerExists.account_status === 'active';
    
    if (dataDeleted && 
        deleteResult.data.companyHandling === 'Company preserved (other members exist)' &&
        secondEmployerActive) {
      console.log('✅ SCENARIO 3 PASSED: First employer deleted, company preserved, second employer active');
      return true;
    } else {
      console.log('❌ SCENARIO 3 FAILED: Data deletion or company handling incorrect');
      return false;
    }
    
  } catch (error) {
    console.error('❌ SCENARIO 3 ERROR:', error.message);
    return false;
  } finally {
    // Cleanup
    if (employerUser1) {
      try {
        await User.destroy({ where: { id: employerUser1.id } });
        console.log('✅ First employer user cleaned up');
      } catch (error) {
        console.log('⚠️ Error cleaning up first employer user:', error.message);
      }
    }
    if (employerUser2) {
      try {
        await User.destroy({ where: { id: employerUser2.id } });
        console.log('✅ Second employer user cleaned up');
      } catch (error) {
        console.log('⚠️ Error cleaning up second employer user:', error.message);
      }
    }
    if (testCompany) {
      try {
        await Company.destroy({ where: { id: testCompany.id } });
        console.log('✅ Company cleaned up');
      } catch (error) {
        console.log('⚠️ Error cleaning up company:', error.message);
      }
    }
  }
}

// Scenario 4: Jobseeker user deletes account
async function testScenario4_JobseekerDeleteAccount() {
  console.log('\n🚀 SCENARIO 4: Jobseeker User Deletes Account');
  console.log('==============================================');
  
  let jobseekerUser = null;
  let testCompany = null;
  
  try {
    // Create jobseeker user
    jobseekerUser = await createTestUser({
      user_type: 'jobseeker',
      email: `jobseeker-${Date.now()}@example.com`
    });
    
    // Create company (for job applications)
    testCompany = await createTestCompany();
    
    // Create test data
    await createTestDataForUser(jobseekerUser.id, testCompany.id);
    
    // Test login
    const authToken = await testLogin(jobseekerUser);
    
    // Test delete account
    const deleteResult = await testDeleteAccount(authToken);
    
    // Verify data deletion
    const dataDeleted = await verifyDataDeletion(jobseekerUser.id);
    
    if (dataDeleted && deleteResult.data.companyHandling === null) {
      console.log('✅ SCENARIO 4 PASSED: Jobseeker account deleted, no company handling needed');
      return true;
    } else {
      console.log('❌ SCENARIO 4 FAILED: Data deletion or company handling incorrect');
      return false;
    }
    
  } catch (error) {
    console.error('❌ SCENARIO 4 ERROR:', error.message);
    return false;
  } finally {
    // Cleanup
    if (jobseekerUser) {
      try {
        await User.destroy({ where: { id: jobseekerUser.id } });
        console.log('✅ Jobseeker user cleaned up');
      } catch (error) {
        console.log('⚠️ Error cleaning up jobseeker user:', error.message);
      }
    }
    if (testCompany) {
      try {
        await Company.destroy({ where: { id: testCompany.id } });
        console.log('✅ Company cleaned up');
      } catch (error) {
        console.log('⚠️ Error cleaning up company:', error.message);
      }
    }
  }
}

// Main test function
async function runCompleteScenariosTest() {
  console.log('🚀 Starting Complete Delete Account Scenarios Test');
  console.log('🎯 Testing all scenarios for delete account functionality');
  console.log('================================================================================');
  
  const results = [];
  
  try {
    // Run all scenarios
    results.push(await testScenario1_AdminDeleteAccount());
    results.push(await testScenario2_EmployerOnlyMember());
    results.push(await testScenario3_EmployerMultipleMembers());
    results.push(await testScenario4_JobseekerDeleteAccount());
    
    // Calculate results
    const passed = results.filter(r => r === true).length;
    const total = results.length;
    
    console.log('\n================================================================================');
    console.log('📊 FINAL RESULTS');
    console.log('================================================================================');
    console.log(`✅ Passed: ${passed}/${total} scenarios`);
    console.log(`❌ Failed: ${total - passed}/${total} scenarios`);
    
    if (passed === total) {
      console.log('🎉 ALL SCENARIOS PASSED! 🎉');
      console.log('✅ Delete account functionality is working perfectly for all user types!');
    } else {
      console.log('❌ SOME SCENARIOS FAILED!');
      console.log('⚠️ Please review the failed scenarios above.');
    }
    
    return passed === total;
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
if (require.main === module) {
  runCompleteScenariosTest()
    .then((success) => {
      if (success) {
        console.log('\n✅ Complete scenarios test completed successfully');
        process.exit(0);
      } else {
        console.log('\n❌ Complete scenarios test failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runCompleteScenariosTest };
