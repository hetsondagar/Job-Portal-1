/**
 * Create Job Preferences Table
 * Used by index.js to ensure job preferences table exists
 */

const { sequelize } = require('../config/sequelize');

async function createJobPreferencesTable() {
  try {
    console.log('🔧 Checking job preferences table...');

    // Check if table already exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'job_preferences';
    `);

    if (tables && tables.length > 0) {
      console.log('✅ job_preferences table already exists');
      return true;
    }

    console.log('📝 Creating job_preferences table...');
    
    // Create table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS job_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        preferred_locations TEXT[],
        preferred_job_types TEXT[],
        preferred_departments TEXT[],
        preferred_roles TEXT[],
        min_salary DECIMAL(10,2),
        max_salary DECIMAL(10,2),
        remote_work_preference VARCHAR(20),
        experience_level VARCHAR(20),
        preferred_skills TEXT[],
        notification_preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `);

    console.log('✅ job_preferences table created successfully');
    return true;

  } catch (error) {
    console.error('❌ Error creating job preferences table:', error);
    // Don't throw - this is optional functionality
    return false;
  }
}

module.exports = { createJobPreferencesTable };

