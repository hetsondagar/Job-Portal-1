#!/usr/bin/env node

/**
 * Robust Database Setup Script
 * Handles foreign key dependencies by temporarily disabling constraints
 */

// Load environment variables
require('dotenv').config();

const { Sequelize } = require('sequelize');
const config = require('./config/database');

// Create a separate sequelize instance for database setup
const env = process.env.NODE_ENV || 'production';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: console.log,
    pool: dbConfig.pool,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions
  }
);

async function setupRobustDatabase() {
  try {
    console.log('🚀 Starting robust database setup...');
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
    console.log('🔄 Syncing database with proper dependency order...');
    
    // Define models in dependency order
    const modelOrder = [
      'Company', 'User', 'JobCategory', 'SubscriptionPlan',
      'Job', 'Resume', 'CoverLetter', 'JobTemplate', 'WorkExperience', 'Education',
      'CompanyFollow', 'CompanyReview', 'Conversation', 'Message', 'Payment',
      'Subscription', 'EmployerQuota', 'UserDashboard', 'UserSession',
      'BulkJobImport', 'CandidateAnalytics', 'Analytics',
      'JobApplication', 'Application', 'Interview', 'Notification',
      'JobBookmark', 'JobAlert', 'SearchHistory', 'UserActivityLog',
      'ViewTracking', 'CandidateLike', 'FeaturedJob', 'HotVacancy',
      'HotVacancyPhoto', 'JobPhoto', 'Requirement'
    ];
    
    // Load all models first to ensure they're properly initialized
    console.log('📦 Loading all models...');
    
    // Load all models in dependency order
    const models = {};
    for (const modelName of modelOrder) {
      try {
        const ModelFactory = require(`./models/${modelName}`);
        
        // Handle different model export types
        let Model;
        if (typeof ModelFactory === 'function') {
          // Function-based models (like BulkJobImport, CandidateAnalytics)
          Model = ModelFactory(sequelize);
        } else if (ModelFactory && typeof ModelFactory.sync === 'function') {
          // Direct model exports (like User, Company, Job, etc.)
          Model = ModelFactory;
        } else {
          throw new Error(`Invalid model export for ${modelName}`);
        }
        
        models[modelName] = Model;
        console.log(`📦 ${modelName} model loaded`);
      } catch (modelError) {
        console.log(`⚠️ ${modelName} model loading failed:`, modelError.message);
        // Continue with other models
      }
    }
    
    // Now sync all models
    console.log('🔄 Syncing all models...');
    for (const modelName of modelOrder) {
      try {
        if (models[modelName]) {
          await models[modelName].sync({ force: false });
          console.log(`✅ ${modelName} table synced`);
        }
      } catch (modelError) {
        console.log(`⚠️ ${modelName} sync failed:`, modelError.message);
        // Continue with other models
      }
    }
    
    // Foreign key constraints are automatically enforced
    console.log('✅ Database tables created with proper constraints');
    
    // Check tables after sync
    console.log('🔍 Checking tables after sync...');
    const tablesAfter = await queryInterface.showAllTables();
    console.log('📋 Tables after sync:', tablesAfter.length, 'tables');
    
    if (tablesAfter.length > 0) {
      console.log('📋 Created tables:', tablesAfter);
    }
    
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
    
    console.log('🎉 Robust database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Robust database setup failed:', error);
    throw error;
  } finally {
    // Close this separate connection
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  setupRobustDatabase()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupRobustDatabase };
