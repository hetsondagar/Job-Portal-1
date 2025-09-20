#!/usr/bin/env node

/**
 * Production Database Setup Script
 * This script runs on Render to set up the database
 */

// Load environment variables
require('dotenv').config();

const { sequelize } = require('./config/sequelize');

async function setupProductionDatabase() {
  try {
    console.log('🚀 Starting production database setup...');
    console.log('📋 Environment:', process.env.NODE_ENV);
    console.log('🗄️ Database:', process.env.DB_HOST);
    
    // Test connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check existing tables
    console.log('🔍 Checking existing tables...');
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('📋 Existing tables:', tables.length, 'tables found');
    
    if (tables.length > 0) {
      console.log('📋 Table names:', tables);
    }
    
    // Sync database (create tables if they don't exist)
    console.log('🔄 Syncing database...');
    try {
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Database sync completed');
    } catch (syncError) {
      console.log('⚠️ Sync error, trying individual model sync:', syncError.message);
      
      // Try syncing individual models
      try {
        const User = require('./models/User');
        await User.sync({ force: false });
        console.log('✅ User table synced');
        
        const Company = require('./models/Company');
        await Company.sync({ force: false });
        console.log('✅ Company table synced');
        
        const Job = require('./models/Job');
        await Job.sync({ force: false });
        console.log('✅ Job table synced');
        
        const Application = require('./models/Application');
        await Application.sync({ force: false });
        console.log('✅ Application table synced');
        
        const JobApplication = require('./models/JobApplication');
        await JobApplication.sync({ force: false });
        console.log('✅ JobApplication table synced');
        
        const Resume = require('./models/Resume');
        await Resume.sync({ force: false });
        console.log('✅ Resume table synced');
        
        const Interview = require('./models/Interview');
        await Interview.sync({ force: false });
        console.log('✅ Interview table synced');
        
        const Notification = require('./models/Notification');
        await Notification.sync({ force: false });
        console.log('✅ Notification table synced');
        
        const JobBookmark = require('./models/JobBookmark');
        await JobBookmark.sync({ force: false });
        console.log('✅ JobBookmark table synced');
        
        const JobAlert = require('./models/JobAlert');
        await JobAlert.sync({ force: false });
        console.log('✅ JobAlert table synced');
        
        const SearchHistory = require('./models/SearchHistory');
        await SearchHistory.sync({ force: false });
        console.log('✅ SearchHistory table synced');
        
        const UserActivityLog = require('./models/UserActivityLog');
        await UserActivityLog.sync({ force: false });
        console.log('✅ UserActivityLog table synced');
        
        const ViewTracking = require('./models/ViewTracking');
        await ViewTracking.sync({ force: false });
        console.log('✅ ViewTracking table synced');
        
        const CandidateLike = require('./models/CandidateLike');
        await CandidateLike.sync({ force: false });
        console.log('✅ CandidateLike table synced');
        
        const FeaturedJob = require('./models/FeaturedJob');
        await FeaturedJob.sync({ force: false });
        console.log('✅ FeaturedJob table synced');
        
        const HotVacancy = require('./models/HotVacancy');
        await HotVacancy.sync({ force: false });
        console.log('✅ HotVacancy table synced');
        
        const HotVacancyPhoto = require('./models/HotVacancyPhoto');
        await HotVacancyPhoto.sync({ force: false });
        console.log('✅ HotVacancyPhoto table synced');
        
        const JobPhoto = require('./models/JobPhoto');
        await JobPhoto.sync({ force: false });
        console.log('✅ JobPhoto table synced');
        
        const JobTemplate = require('./models/JobTemplate');
        await JobTemplate.sync({ force: false });
        console.log('✅ JobTemplate table synced');
        
        const Requirement = require('./models/Requirement');
        await Requirement.sync({ force: false });
        console.log('✅ Requirement table synced');
        
        const WorkExperience = require('./models/WorkExperience');
        await WorkExperience.sync({ force: false });
        console.log('✅ WorkExperience table synced');
        
        const Education = require('./models/Education');
        await Education.sync({ force: false });
        console.log('✅ Education table synced');
        
        const CoverLetter = require('./models/CoverLetter');
        await CoverLetter.sync({ force: false });
        console.log('✅ CoverLetter table synced');
        
        const CompanyFollow = require('./models/CompanyFollow');
        await CompanyFollow.sync({ force: false });
        console.log('✅ CompanyFollow table synced');
        
        const CompanyReview = require('./models/CompanyReview');
        await CompanyReview.sync({ force: false });
        console.log('✅ CompanyReview table synced');
        
        const Conversation = require('./models/Conversation');
        await Conversation.sync({ force: false });
        console.log('✅ Conversation table synced');
        
        const Message = require('./models/Message');
        await Message.sync({ force: false });
        console.log('✅ Message table synced');
        
        const Payment = require('./models/Payment');
        await Payment.sync({ force: false });
        console.log('✅ Payment table synced');
        
        const Subscription = require('./models/Subscription');
        await Subscription.sync({ force: false });
        console.log('✅ Subscription table synced');
        
        const SubscriptionPlan = require('./models/SubscriptionPlan');
        await SubscriptionPlan.sync({ force: false });
        console.log('✅ SubscriptionPlan table synced');
        
        const EmployerQuota = require('./models/EmployerQuota');
        await EmployerQuota.sync({ force: false });
        console.log('✅ EmployerQuota table synced');
        
        const UserDashboard = require('./models/UserDashboard');
        await UserDashboard.sync({ force: false });
        console.log('✅ UserDashboard table synced');
        
        const UserSession = require('./models/UserSession');
        await UserSession.sync({ force: false });
        console.log('✅ UserSession table synced');
        
        const JobCategory = require('./models/JobCategory');
        await JobCategory.sync({ force: false });
        console.log('✅ JobCategory table synced');
        
        const BulkJobImport = require('./models/BulkJobImport');
        await BulkJobImport.sync({ force: false });
        console.log('✅ BulkJobImport table synced');
        
        const CandidateAnalytics = require('./models/CandidateAnalytics');
        await CandidateAnalytics.sync({ force: false });
        console.log('✅ CandidateAnalytics table synced');
        
        const Analytics = require('./models/Analytics');
        await Analytics.sync({ force: false });
        console.log('✅ Analytics table synced');
        
        console.log('✅ All individual tables synced successfully');
        
      } catch (individualSyncError) {
        console.log('❌ Individual sync failed:', individualSyncError.message);
        throw individualSyncError;
      }
    }
    
    // Check tables after sync
    console.log('🔍 Checking tables after sync...');
    const tablesAfter = await queryInterface.showAllTables();
    console.log('📋 Tables after sync:', tablesAfter.length, 'tables');
    
    // Test key models
    console.log('🔍 Testing key models...');
    
    try {
      const User = require('./models/User');
      const userCount = await User.count();
      console.log('✅ User model working, count:', userCount);
    } catch (userError) {
      console.log('❌ User model error:', userError.message);
    }
    
    try {
      const Company = require('./models/Company');
      const companyCount = await Company.count();
      console.log('✅ Company model working, count:', companyCount);
    } catch (companyError) {
      console.log('❌ Company model error:', companyError.message);
    }
    
    try {
      const Job = require('./models/Job');
      const jobCount = await Job.count();
      console.log('✅ Job model working, count:', jobCount);
    } catch (jobError) {
      console.log('❌ Job model error:', jobError.message);
    }
    
    console.log('🎉 Production database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Production database setup failed:', error);
    throw error;
  } finally {
    // Don't close the connection as it's used by the main server
    // await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionDatabase };
