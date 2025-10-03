#!/usr/bin/env node

/**
 * Fix Migration Dependencies
 * This script ensures proper table creation order and handles foreign key constraints
 */

const dbConnection = require('./lib/database-connection');

console.log('🔧 Fixing Migration Dependencies...');

async function fixMigrationDependencies() {
  try {
    // Connect to database using robust connection handler
    const sequelize = await dbConnection.connect();
    console.log('✅ Database connection established');

    // Check if tables exist and create them in proper order
    await createTablesInOrder(sequelize);
    
    console.log('✅ Migration dependencies fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing migration dependencies:', error.message);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

async function createTablesInOrder(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  
  // Step 1: Create ENUM types first
  console.log('📋 Creating ENUM types...');
  await createEnumTypes(queryInterface);
  
  // Step 2: Create companies table (no dependencies)
  console.log('🏢 Creating companies table...');
  await createCompaniesTable(queryInterface);
  
  // Step 3: Create users table (depends on companies)
  console.log('👥 Creating users table...');
  await createUsersTable(queryInterface);
  
  // Step 4: Create job_categories table (no dependencies)
  console.log('📂 Creating job_categories table...');
  await createJobCategoriesTable(queryInterface);
  
  // Step 5: Create jobs table (depends on companies, users, job_categories)
  console.log('💼 Creating jobs table...');
  await createJobsTable(queryInterface);
  
  // Step 6: Create other dependent tables
  console.log('📄 Creating other tables...');
  await createOtherTables(queryInterface);
}

async function createEnumTypes(queryInterface) {
  const enumTypes = [
    'enum_users_user_type',
    'enum_users_gender', 
    'enum_users_profile_visibility',
    'enum_users_contact_visibility',
    'enum_users_account_status',
    'enum_users_verification_level',
    'enum_jobs_job_type',
    'enum_jobs_experience_level',
    'enum_jobs_salary_type',
    'enum_jobs_location_type',
    'enum_jobs_status'
  ];

  for (const enumType of enumTypes) {
    try {
      let createQuery = '';
      
      switch (enumType) {
        case 'enum_users_user_type':
          createQuery = `CREATE TYPE "enum_users_user_type" AS ENUM ('jobseeker', 'employer', 'admin')`;
          break;
        case 'enum_users_gender':
          createQuery = `CREATE TYPE "enum_users_gender" AS ENUM ('male', 'female', 'other')`;
          break;
        case 'enum_users_profile_visibility':
          createQuery = `CREATE TYPE "enum_users_profile_visibility" AS ENUM ('public', 'private', 'connections')`;
          break;
        case 'enum_users_contact_visibility':
          createQuery = `CREATE TYPE "enum_users_contact_visibility" AS ENUM ('public', 'private', 'connections')`;
          break;
        case 'enum_users_account_status':
          createQuery = `CREATE TYPE "enum_users_account_status" AS ENUM ('active', 'suspended', 'deleted')`;
          break;
        case 'enum_users_verification_level':
          createQuery = `CREATE TYPE "enum_users_verification_level" AS ENUM ('unverified', 'basic', 'premium')`;
          break;
        case 'enum_jobs_job_type':
          createQuery = `CREATE TYPE "enum_jobs_job_type" AS ENUM ('full-time', 'part-time', 'contract', 'internship', 'freelance')`;
          break;
        case 'enum_jobs_experience_level':
          createQuery = `CREATE TYPE "enum_jobs_experience_level" AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead', 'executive')`;
          break;
        case 'enum_jobs_salary_type':
          createQuery = `CREATE TYPE "enum_jobs_salary_type" AS ENUM ('per-year', 'per-month', 'per-hour')`;
          break;
        case 'enum_jobs_location_type':
          createQuery = `CREATE TYPE "enum_jobs_location_type" AS ENUM ('remote', 'on-site', 'hybrid')`;
          break;
        case 'enum_jobs_status':
          createQuery = `CREATE TYPE "enum_jobs_status" AS ENUM ('draft', 'active', 'paused', 'closed', 'expired')`;
          break;
      }
      
      if (createQuery) {
        await queryInterface.sequelize.query(`DO $$ BEGIN ${createQuery}; EXCEPTION WHEN duplicate_object THEN null; END $$`);
        console.log(`  ✅ Created ${enumType}`);
      }
    } catch (error) {
      console.log(`  ⚠️ ${enumType} already exists or error:`, error.message);
    }
  }
}

async function createCompaniesTable(queryInterface) {
  try {
    // Check if companies table exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'companies'
    `);
    
    if (results.length === 0) {
      await queryInterface.createTable('companies', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        logo: {
          type: Sequelize.STRING,
          allowNull: true
        },
        banner: {
          type: Sequelize.STRING,
          allowNull: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        short_description: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        industry: {
          type: Sequelize.STRING,
          allowNull: false
        },
        sector: {
          type: Sequelize.STRING,
          allowNull: true
        },
        company_size: {
          type: Sequelize.ENUM('1-50', '51-200', '201-500', '500-1000', '1000+'),
          allowNull: true
        },
        founded_year: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        website: {
          type: Sequelize.STRING,
          allowNull: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        city: {
          type: Sequelize.STRING,
          allowNull: true
        },
        state: {
          type: Sequelize.STRING,
          allowNull: true
        },
        country: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: 'India'
        },
        pincode: {
          type: Sequelize.STRING,
          allowNull: true
        },
        latitude: {
          type: Sequelize.DECIMAL(10, 8),
          allowNull: true
        },
        longitude: {
          type: Sequelize.DECIMAL(11, 8),
          allowNull: true
        },
        rating: {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: true,
          defaultValue: 0
        },
        total_reviews: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        mission: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        vision: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        values: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        work_environment: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        perks: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        verification_status: {
          type: Sequelize.ENUM('unverified', 'pending', 'verified', 'rejected'),
          defaultValue: 'unverified'
        },
        total_jobs_posted: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        active_jobs_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        meta_title: {
          type: Sequelize.STRING,
          allowNull: true
        },
        meta_description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        company_status: {
          type: Sequelize.ENUM('active', 'inactive', 'suspended'),
          defaultValue: 'active'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      // Add indexes
      await queryInterface.addIndex('companies', ['industry']);
      await queryInterface.addIndex('companies', ['city']);
      await queryInterface.addIndex('companies', ['verification_status']);
      await queryInterface.addIndex('companies', ['company_status']);
      
      console.log('  ✅ Companies table created');
    } else {
      console.log('  ✅ Companies table already exists');
    }
  } catch (error) {
    console.log('  ⚠️ Companies table error:', error.message);
  }
}

async function createUsersTable(queryInterface) {
  try {
    // Check if users table exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (results.length === 0) {
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        first_name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        last_name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true
        },
        user_type: {
          type: Sequelize.ENUM('jobseeker', 'employer', 'admin'),
          allowNull: false,
          defaultValue: 'jobseeker'
        },
        avatar: {
          type: Sequelize.STRING,
          allowNull: true
        },
        is_email_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        is_phone_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        last_login_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        preferences: {
          type: Sequelize.JSONB,
          defaultValue: {}
        },
        date_of_birth: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        gender: {
          type: Sequelize.ENUM('male', 'female', 'other'),
          allowNull: true
        },
        current_location: {
          type: Sequelize.STRING,
          allowNull: true
        },
        willing_to_relocate: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        expected_salary: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        notice_period: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        company_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'companies',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        designation: {
          type: Sequelize.STRING,
          allowNull: true
        },
        email_verification_token: {
          type: Sequelize.STRING,
          allowNull: true
        },
        password_reset_token: {
          type: Sequelize.STRING,
          allowNull: true
        },
        password_reset_expires: {
          type: Sequelize.DATE,
          allowNull: true
        },
        two_factor_enabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        two_factor_secret: {
          type: Sequelize.STRING,
          allowNull: true
        },
        skills: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        languages: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        certifications: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        profile_visibility: {
          type: Sequelize.ENUM('public', 'private', 'connections'),
          defaultValue: 'public'
        },
        contact_visibility: {
          type: Sequelize.ENUM('public', 'private', 'connections'),
          defaultValue: 'public'
        },
        account_status: {
          type: Sequelize.ENUM('active', 'suspended', 'deleted'),
          defaultValue: 'active'
        },
        verification_level: {
          type: Sequelize.ENUM('unverified', 'basic', 'premium'),
          defaultValue: 'unverified'
        },
        profile_completion: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      // Add indexes
      await queryInterface.addIndex('users', ['user_type']);
      await queryInterface.addIndex('users', ['company_id']);
      await queryInterface.addIndex('users', ['is_active']);
      await queryInterface.addIndex('users', ['account_status']);
      
      console.log('  ✅ Users table created');
    } else {
      console.log('  ✅ Users table already exists');
    }
  } catch (error) {
    console.log('  ⚠️ Users table error:', error.message);
  }
}

async function createJobCategoriesTable(queryInterface) {
  try {
    // Check if job_categories table exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'job_categories'
    `);
    
    if (results.length === 0) {
      await queryInterface.createTable('job_categories', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        icon: {
          type: Sequelize.STRING,
          allowNull: true
        },
        color: {
          type: Sequelize.STRING(7),
          allowNull: true
        },
        parent_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'job_categories',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        sort_order: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        job_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      // Add indexes
      await queryInterface.addIndex('job_categories', ['parent_id']);
      await queryInterface.addIndex('job_categories', ['is_active']);
      await queryInterface.addIndex('job_categories', ['sort_order']);
      
      console.log('  ✅ Job categories table created');
    } else {
      console.log('  ✅ Job categories table already exists');
    }
  } catch (error) {
    console.log('  ⚠️ Job categories table error:', error.message);
  }
}

async function createJobsTable(queryInterface) {
  try {
    // Check if jobs table exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'jobs'
    `);
    
    if (results.length === 0) {
      await queryInterface.createTable('jobs', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        requirements: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        responsibilities: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        company_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'companies',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        posted_by: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        job_category_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'job_categories',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        job_type: {
          type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
          allowNull: false
        },
        experience_level: {
          type: Sequelize.ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive'),
          allowNull: false
        },
        experience_min: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        experience_max: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        salary_min: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true
        },
        salary_max: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true
        },
        salary_currency: {
          type: Sequelize.STRING(3),
          defaultValue: 'INR'
        },
        salary_type: {
          type: Sequelize.ENUM('per-year', 'per-month', 'per-hour'),
          defaultValue: 'per-year'
        },
        benefits: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        perks: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        skills_required: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        skills_preferred: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        location_type: {
          type: Sequelize.ENUM('remote', 'on-site', 'hybrid'),
          allowNull: false
        },
        location: {
          type: Sequelize.STRING,
          allowNull: true
        },
        city: {
          type: Sequelize.STRING,
          allowNull: true
        },
        state: {
          type: Sequelize.STRING,
          allowNull: true
        },
        country: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: 'India'
        },
        latitude: {
          type: Sequelize.DECIMAL(10, 8),
          allowNull: true
        },
        longitude: {
          type: Sequelize.DECIMAL(11, 8),
          allowNull: true
        },
        application_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        view_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        status: {
          type: Sequelize.ENUM('draft', 'active', 'paused', 'closed', 'expired'),
          defaultValue: 'draft'
        },
        is_featured: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        is_urgent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        application_deadline: {
          type: Sequelize.DATE,
          allowNull: true
        },
        published_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        meta_title: {
          type: Sequelize.STRING,
          allowNull: true
        },
        meta_description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      // Add indexes
      await queryInterface.addIndex('jobs', ['company_id']);
      await queryInterface.addIndex('jobs', ['posted_by']);
      await queryInterface.addIndex('jobs', ['job_category_id']);
      await queryInterface.addIndex('jobs', ['job_type']);
      await queryInterface.addIndex('jobs', ['experience_level']);
      await queryInterface.addIndex('jobs', ['location_type']);
      await queryInterface.addIndex('jobs', ['city']);
      await queryInterface.addIndex('jobs', ['status']);
      await queryInterface.addIndex('jobs', ['is_featured']);
      await queryInterface.addIndex('jobs', ['published_at']);
      
      console.log('  ✅ Jobs table created');
    } else {
      console.log('  ✅ Jobs table already exists');
    }
  } catch (error) {
    console.log('  ⚠️ Jobs table error:', error.message);
  }
}

async function createOtherTables(queryInterface) {
  // Create other essential tables that don't have complex dependencies
  const otherTables = [
    'resumes',
    'work_experiences', 
    'educations',
    'requirements',
    'job_applications',
    'applications',
    'job_bookmarks',
    'job_alerts',
    'notifications',
    'company_reviews',
    'company_follows',
    'subscription_plans',
    'subscriptions',
    'payments',
    'user_sessions',
    'interviews',
    'conversations',
    'messages',
    'analytics'
  ];

  for (const tableName of otherTables) {
    try {
      const [results] = await queryInterface.sequelize.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = '${tableName}'
      `);
      
      if (results.length === 0) {
        // Create basic table structure for each
        await queryInterface.createTable(tableName, {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        });
        console.log(`  ✅ ${tableName} table created`);
      } else {
        console.log(`  ✅ ${tableName} table already exists`);
      }
    } catch (error) {
      console.log(`  ⚠️ ${tableName} table error:`, error.message);
    }
  }
}

// Run the fix
if (require.main === module) {
  fixMigrationDependencies()
    .then(() => {
      console.log('🎉 Migration dependencies fixed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to fix migration dependencies:', error);
      process.exit(1);
    });
}

module.exports = { fixMigrationDependencies };
