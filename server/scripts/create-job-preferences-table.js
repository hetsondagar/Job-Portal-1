const { sequelize } = require('../config/sequelize');

async function createJobPreferencesTable() {
  try {
    console.log('🔧 Checking if job_preferences table exists...');
    
    // Check if table exists
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'job_preferences'
      );
    `);
    
    const tableExists = results[0].exists;
    
    if (tableExists) {
      console.log('✅ job_preferences table already exists');
      return;
    }
    
    console.log('📝 Creating job_preferences table...');
    
    // Create the table
    await sequelize.query(`
      CREATE TABLE job_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL,
        "preferredJobTitles" JSONB DEFAULT '[]',
        "preferredLocations" JSONB DEFAULT '[]',
        "preferredJobTypes" JSONB DEFAULT '[]',
        "preferredExperienceLevels" JSONB DEFAULT '[]',
        "preferredSalaryMin" DECIMAL(10,2),
        "preferredSalaryMax" DECIMAL(10,2),
        "preferredSalaryCurrency" VARCHAR(10) DEFAULT 'INR',
        "preferredSkills" JSONB DEFAULT '[]',
        "preferredWorkMode" JSONB DEFAULT '[]',
        "preferredShiftTiming" JSONB DEFAULT '[]',
        "willingToRelocate" BOOLEAN DEFAULT false,
        "willingToTravel" BOOLEAN DEFAULT false,
        "noticePeriod" INTEGER,
        "emailAlerts" BOOLEAN DEFAULT true,
        "pushNotifications" BOOLEAN DEFAULT true,
        "region" VARCHAR(20) DEFAULT 'india',
        "isActive" BOOLEAN DEFAULT true,
        "lastUpdated" TIMESTAMP DEFAULT NOW(),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("userId")
      );
    `);
    
    // Add foreign key constraint
    await sequelize.query(`
      ALTER TABLE job_preferences 
      ADD CONSTRAINT fk_job_preferences_user 
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
    `);
    
    console.log('✅ job_preferences table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating job_preferences table:', error);
    // Don't throw error - let the app continue even if table creation fails
  }
}

module.exports = { createJobPreferencesTable };
