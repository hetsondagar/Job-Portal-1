const axios = require('axios');
const { sequelize } = require('./config/sequelize');
const { User, Company, Job, JobApplication, JobBookmark, JobAlert, Resume, CoverLetter, Education, WorkExperience, CompanyFollow, Notification, SearchHistory, UserSession, UserActivityLog, UserDashboard, Conversation, Subscription, EmployerQuota, FeaturedJob, SecureJobTap, BulkJobImport, Analytics, CandidateAnalytics, CandidateLike, ViewTracking, Requirement, Application, JobPreference, AgencyClientAuthorization, AdminNotification, Interview, Message, Payment, CompanyReview } = require('./models');

const API_BASE_URL = 'http://localhost:8000';

async function createTestUser() {
  console.log('🔧 Creating test user...');
  
  const testUser = await User.create({
    email: `test-delete-${Date.now()}@example.com`,
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
  });
  
  console.log('✅ Test user created with ID:', testUser.id);
  return testUser;
}

async function createTestCompany(userId) {
  console.log('🏢 Creating test company...');
  
  const testCompany = await Company.create({
    name: `Test Company ${Date.now()}`,
    slug: `test-company-${Date.now()}`,
    email: `company-${Date.now()}@example.com`,
    phone: '+1234567890',
    country: 'India',
    is_active: true,
    company_status: 'active'
  });
  
  // Associate user with company
  await User.update({ companyId: testCompany.id }, { where: { id: userId } });
  
  console.log('✅ Test company created with ID:', testCompany.id);
  return testCompany;
}

async function createComprehensiveTestData(userId, companyId) {
  console.log('📊 Creating comprehensive test data for 100% GDPR compliance...');
  
  const testData = {};
  
  try {
    // Create job
    const job = await Job.create({
      title: 'Test Job',
      slug: `test-job-${Date.now()}`,
      description: 'Test job description',
      companyId: companyId,
      employerId: userId,
      location: 'Test City',
      country: 'India',
      status: 'active',
      jobType: 'full-time',
      experienceLevel: 'mid',
      salaryMin: 40000,
      salaryMax: 60000,
      salaryCurrency: 'USD',
      locationType: 'on-site'
    });
    testData.job = job;
    
    // Create job application
    const jobApplication = await JobApplication.create({
      jobId: job.id,
      userId: userId,
      employerId: userId,
      status: 'applied',
      cover_letter: 'Test cover letter',
      expected_salary_currency: 'USD',
      is_willing_to_relocate: true,
      source: 'website',
      applied_at: new Date(),
      last_updated_at: new Date()
    });
    testData.jobApplication = jobApplication;
    
    // Create job bookmark
    const jobBookmark = await JobBookmark.create({
      userId: userId,
      jobId: job.id,
      folder: 'favorites',
      priority: 'high'
    });
    testData.jobBookmark = jobBookmark;
    
    // Create job alert
    const jobAlert = await JobAlert.create({
      userId: userId,
      name: 'Test Alert',
      keywords: ['test', 'job'],
      locations: ['Test City'],
      categories: ['Technology'],
      experience_level: 'mid',
      salary_min: 40000,
      salary_max: 60000,
      job_type: 'full-time',
      frequency: 'daily',
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      is_active: true,
      salary_currency: 'USD',
      location_type: 'on-site'
    });
    testData.jobAlert = jobAlert;
    
    // Create resume
    const resume = await Resume.create({
      title: 'Test Resume',
      skills: ['JavaScript', 'Node.js', 'React'],
      userId: userId,
      is_primary: true,
      is_public: true,
      view_count: 0,
      download_count: 0,
      last_updated: new Date()
    });
    testData.resume = resume;
    
    // Create cover letter
    const coverLetter = await CoverLetter.create({
      userId: userId,
      title: 'Test Cover Letter',
      content: 'Test cover letter content',
      isDefault: true,
      isPublic: true,
      views: 0,
      downloads: 0,
      lastUpdated: new Date()
    });
    testData.coverLetter = coverLetter;
    
    // Create education
    const education = await Education.create({
      userId: userId,
      institution: 'Test University',
      degree: 'Bachelor of Technology',
      field_of_study: 'Computer Science',
      start_date: new Date('2020-01-01'),
      end_date: new Date('2024-01-01'),
      gpa: 3.5,
      is_current: false
    });
    testData.education = education;
    
    // Create work experience
    const workExperience = await WorkExperience.create({
      userId: userId,
      company_name: 'Test Company',
      position: 'Software Engineer',
      start_date: new Date('2024-01-01'),
      end_date: null,
      is_current: true,
      description: 'Test work experience'
    });
    testData.workExperience = workExperience;
    
    // Create company follow
    const companyFollow = await CompanyFollow.create({
      userId: userId,
      companyId: companyId,
      followed_at: new Date()
    });
    testData.companyFollow = companyFollow;
    
    // Create notification
    const notification = await Notification.create({
      userId: userId,
      type: 'job_application',
      title: 'Test Notification',
      message: 'Test notification message',
      is_read: false,
      priority: 'medium'
    });
    testData.notification = notification;
    
    // Create search history
    const searchHistory = await SearchHistory.create({
      userId: userId,
      search_query: 'test job search',
      filters: { location: 'Test City', experience: 'mid' },
      results_count: 10,
      search_date: new Date()
    });
    testData.searchHistory = searchHistory;
    
    // Create user session
    const userSession = await UserSession.create({
      userId: userId,
      sessionToken: `test-session-${Date.now()}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent'
    });
    testData.userSession = userSession;
    
    // Create user activity log
    const userActivityLog = await UserActivityLog.create({
      userId: userId,
      activity_type: 'login',
      description: 'User logged in',
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent',
      metadata: { browser: 'Chrome', os: 'Windows' }
    });
    testData.userActivityLog = userActivityLog;
    
    // Create user dashboard
    const userDashboard = await UserDashboard.create({
      userId: userId,
      totalApplications: 1,
      applicationsUnderReview: 1,
      applicationsShortlisted: 0,
      applicationsRejected: 0,
      applicationsAccepted: 0,
      totalBookmarks: 1,
      totalSearches: 1,
      savedSearches: 0,
      totalResumes: 1,
      hasDefaultResume: true,
      totalJobAlerts: 1,
      activeJobAlerts: 1,
      profileViews: 0,
      lastActivityDate: new Date(),
      totalLoginCount: 1,
      dashboardLayout: 'default',
      favoriteActions: [],
      metadata: {}
    });
    testData.userDashboard = userDashboard;
    
    // Create conversation
    const conversation = await Conversation.create({
      userId: userId,
      type: 'job_application',
      title: 'Test Conversation',
      last_message_at: new Date(),
      is_active: true
    });
    testData.conversation = conversation;
    
    // Create subscription
    const subscription = await Subscription.create({
      userId: userId,
      plan_name: 'Premium',
      status: 'active',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: 99.99,
      currency: 'USD'
    });
    testData.subscription = subscription;
    
    // Create employer quota
    const employerQuota = await EmployerQuota.create({
      userId: userId,
      quota_type: 'job_posts',
      total_quota: 10,
      used_quota: 1,
      reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    testData.employerQuota = employerQuota;
    
    // Create featured job
    const featuredJob = await FeaturedJob.create({
      userId: userId,
      jobId: job.id,
      featured_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      is_active: true
    });
    testData.featuredJob = featuredJob;
    
    // Create secure job tap
    const secureJobTap = await SecureJobTap.create({
      userId: userId,
      jobId: job.id,
      tap_type: 'view',
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent'
    });
    testData.secureJobTap = secureJobTap;
    
    // Create bulk job import
    const bulkJobImport = await BulkJobImport.create({
      userId: userId,
      file_name: 'test_jobs.csv',
      total_jobs: 10,
      imported_jobs: 8,
      failed_jobs: 2,
      status: 'completed',
      import_date: new Date()
    });
    testData.bulkJobImport = bulkJobImport;
    
    // Create analytics
    const analytics = await Analytics.create({
      userId: userId,
      event_type: 'page_view',
      event_category: 'job_search',
      search_query: 'test job',
      filters: { location: 'Test City' },
      custom_parameters: { source: 'test' }
    });
    testData.analytics = analytics;
    
    // Create candidate analytics
    const candidateAnalytics = await CandidateAnalytics.create({
      userId: userId,
      profile_views: 5,
      application_views: 3,
      search_appearances: 10,
      last_updated: new Date()
    });
    testData.candidateAnalytics = candidateAnalytics;
    
    // Create candidate like
    const candidateLike = await CandidateLike.create({
      userId: userId,
      liked_by: userId,
      like_type: 'profile',
      created_at: new Date()
    });
    testData.candidateLike = candidateLike;
    
    // Create view tracking
    const viewTracking = await ViewTracking.create({
      userId: userId,
      viewed_item_type: 'job',
      viewed_item_id: job.id,
      view_date: new Date(),
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent'
    });
    testData.viewTracking = viewTracking;
    
    // Create requirement
    const requirement = await Requirement.create({
      userId: userId,
      title: 'Test Requirement',
      description: 'Test requirement description',
      skills_required: ['JavaScript', 'Node.js'],
      experience_level: 'mid',
      location: 'Test City',
      budget_min: 50000,
      budget_max: 80000,
      currency: 'USD',
      status: 'active'
    });
    testData.requirement = requirement;
    
    // Create application
    const application = await Application.create({
      userId: userId,
      requirementId: requirement.id,
      status: 'applied',
      cover_letter: 'Test application cover letter',
      applied_at: new Date()
    });
    testData.application = application;
    
    // Create job preference
    const jobPreference = await JobPreference.create({
      userId: userId,
      preferred_locations: ['Test City'],
      preferred_industries: ['Technology'],
      preferred_job_types: ['full-time'],
      preferred_salary_min: 50000,
      preferred_salary_max: 80000,
      currency: 'USD',
      experience_level: 'mid'
    });
    testData.jobPreference = jobPreference;
    
    // Create agency client authorization
    const agencyClientAuthorization = await AgencyClientAuthorization.create({
      userId: userId,
      agency_id: userId,
      client_id: userId,
      authorization_type: 'job_posting',
      is_active: true,
      authorized_at: new Date()
    });
    testData.agencyClientAuthorization = agencyClientAuthorization;
    
    // Create admin notification
    const adminNotification = await AdminNotification.create({
      userId: userId,
      type: 'account_verification',
      title: 'Test Admin Notification',
      message: 'Test admin notification message',
      is_read: false,
      priority: 'high'
    });
    testData.adminNotification = adminNotification;
    
    // Create interview
    const interview = await Interview.create({
      jobApplicationId: jobApplication.id,
      employerId: userId,
      candidateId: userId,
      jobId: job.id,
      title: 'Test Interview',
      description: 'Test interview description',
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 60,
      interview_type: 'video',
      status: 'scheduled'
    });
    testData.interview = interview;
    
    // Create message
    const message = await Message.create({
      conversationId: conversation.id,
      senderId: userId,
      receiverId: userId,
      messageType: 'text',
      content: 'Test message content',
      is_read: false
    });
    testData.message = message;
    
    // Create payment
    const payment = await Payment.create({
      userId: userId,
      paymentType: 'subscription',
      amount: 99.99,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'credit_card',
      transaction_id: `txn_${Date.now()}`,
      payment_date: new Date()
    });
    testData.payment = payment;
    
    // Create company review
    const companyReview = await CompanyReview.create({
      companyId: companyId,
      userId: userId,
      rating: 5,
      title: 'Great Company',
      review: 'Test company review',
      pros: 'Good work environment',
      cons: 'None',
      is_verified: true,
      is_public: true
    });
    testData.companyReview = companyReview;
    
    console.log('✅ Comprehensive test data created successfully');
    return testData;
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
}

async function testLogin(user) {
  console.log('🔐 Testing Login API...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: user.email,
      password: 'TestPassword123!'
    });
    
    if (response.data.success) {
      console.log('✅ Login API test successful');
      return response.data.data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('❌ Login API test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testDeleteAccount(authToken) {
  console.log('🧪 Testing Delete Account API...');
  
  try {
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
  } catch (error) {
    console.error('❌ Delete account API test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function verify100PercentGDPRCompliance(userId) {
  console.log('🔍 Verifying 100% GDPR Compliance...');
  console.log('================================================================================');
  
  const verificationResults = [];
  
  // Define all tables that should be checked
  const tablesToCheck = [
    { name: 'USERS', model: User, field: 'id', value: userId, shouldExist: false, description: 'User account soft deleted' },
    { name: 'JOB_BOOKMARKS', model: JobBookmark, field: 'userId', value: userId, shouldExist: false, description: 'All job bookmarks deleted' },
    { name: 'JOB_ALERTS', model: JobAlert, field: 'userId', value: userId, shouldExist: false, description: 'All job alerts deleted' },
    { name: 'RESUMES', model: Resume, field: 'userId', value: userId, shouldExist: false, description: 'All resumes deleted' },
    { name: 'COVER_LETTERS', model: CoverLetter, field: 'userId', value: userId, shouldExist: false, description: 'All cover letters deleted' },
    { name: 'EDUCATIONS', model: Education, field: 'userId', value: userId, shouldExist: false, description: 'All education records deleted' },
    { name: 'WORK_EXPERIENCES', model: WorkExperience, field: 'userId', value: userId, shouldExist: false, description: 'All work experience records deleted' },
    { name: 'COMPANY_FOLLOWS', model: CompanyFollow, field: 'userId', value: userId, shouldExist: false, description: 'All company follows deleted' },
    { name: 'NOTIFICATIONS', model: Notification, field: 'userId', value: userId, shouldExist: false, description: 'All notifications deleted' },
    { name: 'SEARCH_HISTORY', model: SearchHistory, field: 'userId', value: userId, shouldExist: false, description: 'All search history deleted' },
    { name: 'USER_SESSIONS', model: UserSession, field: 'userId', value: userId, shouldExist: false, description: 'All user sessions deleted' },
    { name: 'USER_ACTIVITY_LOGS', model: UserActivityLog, field: 'userId', value: userId, shouldExist: false, description: 'All user activity logs deleted' },
    { name: 'USER_DASHBOARD', model: UserDashboard, field: 'userId', value: userId, shouldExist: false, description: 'All user dashboard data deleted' },
    { name: 'CONVERSATIONS', model: Conversation, field: 'userId', value: userId, shouldExist: false, description: 'All conversations deleted' },
    { name: 'SUBSCRIPTIONS', model: Subscription, field: 'userId', value: userId, shouldExist: false, description: 'All subscriptions deleted' },
    { name: 'EMPLOYER_QUOTAS', model: EmployerQuota, field: 'userId', value: userId, shouldExist: false, description: 'All employer quotas deleted' },
    { name: 'FEATURED_JOBS', model: FeaturedJob, field: 'userId', value: userId, shouldExist: false, description: 'All featured jobs deleted' },
    { name: 'SECURE_JOB_TAPS', model: SecureJobTap, field: 'userId', value: userId, shouldExist: false, description: 'All secure job taps deleted' },
    { name: 'BULK_JOB_IMPORTS', model: BulkJobImport, field: 'userId', value: userId, shouldExist: false, description: 'All bulk job imports deleted' },
    { name: 'ANALYTICS', model: Analytics, field: 'userId', value: userId, shouldExist: false, description: 'All analytics deleted' },
    { name: 'CANDIDATE_ANALYTICS', model: CandidateAnalytics, field: 'userId', value: userId, shouldExist: false, description: 'All candidate analytics deleted' },
    { name: 'CANDIDATE_LIKES', model: CandidateLike, field: 'userId', value: userId, shouldExist: false, description: 'All candidate likes deleted' },
    { name: 'VIEW_TRACKING', model: ViewTracking, field: 'userId', value: userId, shouldExist: false, description: 'All view tracking deleted' },
    { name: 'REQUIREMENTS', model: Requirement, field: 'userId', value: userId, shouldExist: false, description: 'All requirements deleted' },
    { name: 'APPLICATIONS', model: Application, field: 'userId', value: userId, shouldExist: false, description: 'All applications deleted' },
    { name: 'JOB_PREFERENCES', model: JobPreference, field: 'userId', value: userId, shouldExist: false, description: 'All job preferences deleted' },
    { name: 'AGENCY_CLIENT_AUTHORIZATIONS', model: AgencyClientAuthorization, field: 'userId', value: userId, shouldExist: false, description: 'All agency authorizations deleted' },
    { name: 'ADMIN_NOTIFICATIONS', model: AdminNotification, field: 'userId', value: userId, shouldExist: false, description: 'All admin notifications deleted' },
    { name: 'JOB_APPLICATIONS', model: JobApplication, field: 'userId', value: userId, shouldExist: false, description: 'All job applications deleted' },
    { name: 'INTERVIEWS', model: Interview, field: 'candidateId', value: userId, shouldExist: false, description: 'All interviews deleted' },
    { name: 'MESSAGES', model: Message, field: 'senderId', value: userId, shouldExist: false, description: 'All messages deleted' },
    { name: 'PAYMENTS', model: Payment, field: 'userId', value: userId, shouldExist: false, description: 'All payments deleted' },
    { name: 'COMPANY_REVIEWS', model: CompanyReview, field: 'userId', value: userId, shouldExist: false, description: 'All company reviews deleted' }
  ];
  
  let passedCount = 0;
  let totalCount = tablesToCheck.length;
  
  for (const table of tablesToCheck) {
    try {
      const count = await table.model.count({
        where: { [table.field]: table.value }
      });
      
      const passed = table.shouldExist ? count > 0 : count === 0;
      const status = passed ? '✅' : '❌';
      
      console.log(`📊 Table: ${table.name}`);
      console.log(`   ${status} ${table.description}`);
      console.log(`   Current Records: ${count}`);
      
      verificationResults.push({
        table: table.name,
        passed: passed,
        count: count,
        description: table.description
      });
      
      if (passed) passedCount++;
      
    } catch (error) {
      console.log(`📊 Table: ${table.name}`);
      console.log(`   ⚠️ Could not verify: ${error.message}`);
      
      verificationResults.push({
        table: table.name,
        passed: false,
        count: 'Error',
        description: table.description,
        error: error.message
      });
    }
  }
  
  console.log('================================================================================');
  console.log(`📊 GDPR Compliance Score: ${passedCount}/${totalCount} (${Math.round((passedCount/totalCount)*100)}%)`);
  
  if (passedCount === totalCount) {
    console.log('🎉 100% GDPR COMPLIANCE ACHIEVED! 🎉');
    return true;
  } else {
    console.log('❌ GDPR compliance verification failed');
    return false;
  }
}

async function cleanupTestData(userId, companyId, testData) {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Delete user
    await User.destroy({ where: { id: userId } });
    console.log('✅ User deleted');
    
    // Delete company
    await Company.destroy({ where: { id: companyId } });
    console.log('✅ Company deleted');
    
    // Delete job if it exists
    if (testData.job) {
      await Job.destroy({ where: { id: testData.job.id } });
      console.log('✅ Job deleted');
    }
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('⚠️ Error during cleanup:', error.message);
  }
}

async function run100PercentGDPRTest() {
  console.log('🚀 Starting 100% GDPR COMPLIANCE TEST for Delete Account Functionality');
  console.log('🎯 Testing /employer-dashboard/settings page delete account feature');
  console.log('================================================================================');
  
  let testUser = null;
  let testCompany = null;
  let testData = null;
  
  try {
    // Create test user
    testUser = await createTestUser();
    
    // Create test company
    testCompany = await createTestCompany(testUser.id);
    
    // Create comprehensive test data
    testData = await createComprehensiveTestData(testUser.id, testCompany.id);
    
    // Test login
    const authToken = await testLogin(testUser);
    
    // Test delete account
    await testDeleteAccount(authToken);
    
    // Verify 100% GDPR compliance
    const isCompliant = await verify100PercentGDPRCompliance(testUser.id);
    
    if (isCompliant) {
      console.log('🎉 100% GDPR COMPLIANCE TEST PASSED! 🎉');
      console.log('✅ Delete account functionality is PERFECT and GDPR compliant!');
    } else {
      console.log('❌ 100% GDPR COMPLIANCE TEST FAILED!');
      throw new Error('GDPR compliance verification failed');
    }
    
  } catch (error) {
    console.error('❌ 100% GDPR COMPLIANCE TEST FAILED:', error.message);
    throw error;
  } finally {
    // Cleanup
    if (testUser) {
      await cleanupTestData(testUser.id, testCompany?.id, testData);
    }
  }
  
  console.log('🏁 100% GDPR compliance test completed');
}

// Run the test
if (require.main === module) {
  run100PercentGDPRTest()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { run100PercentGDPRTest };
