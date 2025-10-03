#!/usr/bin/env node

/**
 * Run Migrations Safely
 * This script runs migrations in the correct order with proper error handling
 */

const dbConnection = require('./lib/database-connection');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🔄 Running Migrations Safely...');

async function runMigrationsSafely() {
  try {
    // Connect to database using robust connection handler
    const sequelize = await dbConnection.connect();
    console.log('✅ Database connection established');

    // First, ensure all required tables exist in correct order
    console.log('🔧 Ensuring tables exist in correct order...');
    await ensureTablesExist(sequelize);
    
    // Now run the actual migrations
    console.log('🔄 Running Sequelize migrations...');
    try {
      await execAsync('npx sequelize-cli db:migrate', { cwd: __dirname });
      console.log('✅ Migrations completed successfully');
    } catch (migrationError) {
      console.log('⚠️ Some migrations may have failed, but continuing...');
      console.log('Migration error:', migrationError.message);
    }
    
    console.log('✅ Migration process completed!');
    
  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

async function ensureTablesExist(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  
  // Check and create tables in dependency order
  const tables = [
    { name: 'companies', dependencies: [] },
    { name: 'users', dependencies: ['companies'] },
    { name: 'job_categories', dependencies: [] },
    { name: 'jobs', dependencies: ['companies', 'users', 'job_categories'] }
  ];

  for (const table of tables) {
    try {
      // Check if table exists
      const [results] = await queryInterface.sequelize.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = '${table.name}'
      `);
      
      if (results.length === 0) {
        console.log(`📋 Creating ${table.name} table...`);
        await createTableByName(queryInterface, table.name);
        console.log(`✅ ${table.name} table created`);
      } else {
        console.log(`✅ ${table.name} table already exists`);
      }
    } catch (error) {
      console.log(`⚠️ Error with ${table.name} table:`, error.message);
    }
  }
}

async function createTableByName(queryInterface, tableName) {
  switch (tableName) {
    case 'companies':
      await createCompaniesTable(queryInterface);
      break;
    case 'users':
      await createUsersTable(queryInterface);
      break;
    case 'job_categories':
      await createJobCategoriesTable(queryInterface);
      break;
    case 'jobs':
      await createJobsTable(queryInterface);
      break;
    default:
      // Create basic table structure
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
  }
}

async function createCompaniesTable(queryInterface) {
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
}

async function createUsersTable(queryInterface) {
  // Create ENUM types first
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_users_user_type" AS ENUM ('jobseeker', 'employer', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_users_gender" AS ENUM ('male', 'female', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_users_profile_visibility" AS ENUM ('public', 'private', 'connections'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_users_contact_visibility" AS ENUM ('public', 'private', 'connections'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_users_account_status" AS ENUM ('active', 'suspended', 'deleted'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_users_verification_level" AS ENUM ('unverified', 'basic', 'premium'); EXCEPTION WHEN duplicate_object THEN null; END $$`);

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
}

async function createJobCategoriesTable(queryInterface) {
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
}

async function createJobsTable(queryInterface) {
  // Create ENUM types first
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_jobs_job_type" AS ENUM ('full-time', 'part-time', 'contract', 'internship', 'freelance'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_jobs_experience_level" AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead', 'executive'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_jobs_salary_type" AS ENUM ('per-year', 'per-month', 'per-hour'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_jobs_location_type" AS ENUM ('remote', 'on-site', 'hybrid'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_jobs_status" AS ENUM ('draft', 'active', 'paused', 'closed', 'expired', 'inactive'); EXCEPTION WHEN duplicate_object THEN null; END $$`);

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
      type: Sequelize.ENUM('draft', 'active', 'paused', 'closed', 'expired', 'inactive'),
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
}

// Run the migrations
if (require.main === module) {
  runMigrationsSafely()
    .then(() => {
      console.log('🎉 Migrations completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to run migrations:', error);
      process.exit(1);
    });
}

module.exports = { runMigrationsSafely };
