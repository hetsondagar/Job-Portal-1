require('dotenv').config();
const { sequelize } = require('../config/sequelize');
const { exec } = require('child_process');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Test database connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    await runMigrations();
    console.log('✅ Migrations completed successfully');
    
    // Sync models (this will create any missing tables and sync with models)
    console.log('🔄 Syncing models with database...');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced successfully');
    
    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

function runMigrations() {
  return new Promise((resolve, reject) => {
    const migrationCommand = 'npx sequelize-cli db:migrate';
    
    exec(migrationCommand, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error('Migration error:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn('Migration warnings:', stderr);
      }
      
      console.log('Migration output:', stdout);
      resolve();
    });
  });
}

// Run the initialization
initializeDatabase(); 