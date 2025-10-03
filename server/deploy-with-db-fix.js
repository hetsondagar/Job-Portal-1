#!/usr/bin/env node

/**
 * Deploy with Database Fix
 * Comprehensive deployment script that handles database connection issues
 */

const dbConnection = require('./lib/robust-database-connection');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🚀 Starting Deployment with Database Fix...');

async function deployWithDbFix() {
  try {
    // Step 1: Test database connection first
    console.log('🔍 Step 1: Testing database connection...');
    const connectionSuccess = await dbConnection.testConnection();
    
    if (!connectionSuccess) {
      console.error('❌ Database connection failed. Cannot proceed with deployment.');
      process.exit(1);
    }
    
    await dbConnection.disconnect();
    
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
    
    // Step 4: Fix enum jobs status
    console.log('🔧 Step 4: Fixing enum jobs status...');
    try {
      const { fixEnumJobsStatus } = require('./fix-enum-jobs-status');
      await fixEnumJobsStatus();
      console.log('✅ Enum jobs status fixed');
    } catch (error) {
      console.log('⚠️ Enum jobs status fix failed, continuing:', error.message);
    }

    // Step 5: Fix database schema issues
    console.log('🔧 Step 5: Fixing database schema issues...');
    try {
      const { fixDatabaseSchemaIssues } = require('./fix-database-schema-issues');
      await fixDatabaseSchemaIssues();
      console.log('✅ Database schema issues fixed');
    } catch (error) {
      console.log('⚠️ Database schema issues fix failed, continuing:', error.message);
    }

    // Step 5.5: Fix all remaining issues
    console.log('🔧 Step 5.5: Fixing all remaining issues...');
    try {
      const { fixAllRemainingIssues } = require('./fix-all-remaining-issues');
      await fixAllRemainingIssues();
      console.log('✅ All remaining issues fixed');
    } catch (error) {
      console.log('⚠️ All remaining issues fix failed, continuing:', error.message);
    }

    // Step 6: Fix admin stats endpoint
    console.log('🔧 Step 6: Fixing admin stats endpoint...');
    try {
      const { fixAdminStatsEndpoint } = require('./fix-admin-stats-endpoint');
      await fixAdminStatsEndpoint();
      console.log('✅ Admin stats endpoint fixed');
    } catch (error) {
      console.log('⚠️ Admin stats endpoint fix failed, continuing:', error.message);
    }
    
    // Step 7: Fix all database issues
    console.log('🔧 Step 7: Fixing all database issues...');
    try {
      await execAsync('node fix-all-database-issues.js', { cwd: __dirname });
      console.log('✅ Database issues fixed');
    } catch (error) {
      console.log('⚠️ Database fix failed, continuing:', error.message);
    }
    
    // Step 8: Final connection test
    console.log('🔍 Step 8: Final database connection test...');
    const finalTest = await dbConnection.testConnection();
    
    if (finalTest) {
      console.log('✅ Final database test passed');
    } else {
      console.log('⚠️ Final database test failed, but continuing with server start');
    }
    
    await dbConnection.disconnect();
    
    // Step 9: Fix CompanyPhoto model registration
    console.log('🔧 Step 9: Fixing CompanyPhoto model registration...');
    try {
      const { fixCompanyPhotoModel } = require('./fix-company-photo-model');
      await fixCompanyPhotoModel();
      console.log('✅ CompanyPhoto model registration fixed');
    } catch (error) {
      console.log('⚠️ CompanyPhoto model fix failed, continuing:', error.message);
    }

    // Step 10: Optimize for production
    console.log('🚀 Step 10: Optimizing for production...');
    try {
      const { optimizeProduction } = require('./optimize-production');
      await optimizeProduction();
      console.log('✅ Production optimization completed');
    } catch (error) {
      console.log('⚠️ Production optimization failed, continuing:', error.message);
    }
    
    // Step 11: Start the production server
    console.log('🚀 Step 11: Starting production server...');
    
    const { spawn } = require('child_process');
    const serverProcess = spawn('node', ['production-start.js'], {
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
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
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the deployment
if (require.main === module) {
  deployWithDbFix()
    .then(() => {
      console.log('🎉 Deployment with database fix completed successfully!');
    })
    .catch((error) => {
      console.error('💥 Deployment with database fix failed:', error);
      process.exit(1);
    });
}

module.exports = { deployWithDbFix };
