#!/usr/bin/env node

/**
 * Production Deployment Script
 * This script handles the complete production deployment process
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🚀 Starting Production Deployment...');

async function deployProduction() {
  try {
    // Step 1: Reset database state (optional - uncomment if needed)
    // console.log('🔄 Step 1: Resetting database state...');
    // try {
    //   const { resetDatabaseState } = require('./reset-database-state');
    //   await resetDatabaseState();
    //   console.log('✅ Database state reset completed');
    // } catch (error) {
    //   console.log('⚠️ Database reset failed, continuing:', error.message);
    // }
    
    // Step 2: Fix migration dependencies
    console.log('🔧 Step 2: Fixing migration dependencies...');
    try {
      const { fixMigrationDependencies } = require('./fix-migration-dependencies');
      await fixMigrationDependencies();
      console.log('✅ Migration dependencies fixed');
    } catch (error) {
      console.log('⚠️ Migration dependency fix failed, continuing:', error.message);
    }
    
    // Step 3: Run migrations safely
    console.log('🔄 Step 3: Running migrations safely...');
    try {
      const { runMigrationsSafely } = require('./run-migrations-safely');
      await runMigrationsSafely();
      console.log('✅ Migrations completed');
    } catch (error) {
      console.log('⚠️ Migration failed, continuing:', error.message);
    }
    
    // Step 4: Fix all database issues
    console.log('🔧 Step 4: Fixing all database issues...');
    try {
      await execAsync('node fix-all-database-issues.js', { cwd: __dirname });
      console.log('✅ Database issues fixed');
    } catch (error) {
      console.log('⚠️ Database fix failed, continuing:', error.message);
    }
    
    // Step 5: Start the production server
    console.log('🚀 Step 5: Starting production server...');
    try {
      const { spawn } = require('child_process');
      const serverProcess = spawn('node', ['production-start.js'], {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      serverProcess.on('error', (error) => {
        console.error('❌ Server startup error:', error);
        process.exit(1);
      });
      
      serverProcess.on('exit', (code) => {
        if (code !== 0) {
          console.error(`❌ Server exited with code ${code}`);
          process.exit(code);
        }
      });
      
      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        console.log('📴 SIGTERM received, shutting down server...');
        serverProcess.kill('SIGTERM');
      });
      
      process.on('SIGINT', () => {
        console.log('📴 SIGINT received, shutting down server...');
        serverProcess.kill('SIGINT');
      });
      
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the deployment
if (require.main === module) {
  deployProduction()
    .then(() => {
      console.log('🎉 Production deployment completed successfully!');
    })
    .catch((error) => {
      console.error('💥 Production deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deployProduction };
