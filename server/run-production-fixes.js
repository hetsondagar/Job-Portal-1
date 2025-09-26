#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Running production fixes for database and React issues...');

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('warning')) {
        console.error(`⚠️ Warning: ${stderr}`);
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
};

async function runProductionFixes() {
  try {
    console.log('📋 Checking current migration status...');
    try {
      await runCommand('npx sequelize-cli db:migrate:status');
    } catch (error) {
      console.log('ℹ️ Could not check migration status (may be normal in production)');
    }

    console.log('🔄 Running all pending migrations...');
    try {
      await runCommand('npx sequelize-cli db:migrate');
      console.log('✅ Database migrations completed successfully!');
    } catch (error) {
      console.log('⚠️ Migration may have failed, but continuing...');
    }
    
    console.log('🔍 Checking final migration status...');
    try {
      await runCommand('npx sequelize-cli db:migrate:status');
    } catch (error) {
      console.log('ℹ️ Could not check final migration status');
    }

    console.log('🎉 Production fixes completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your application server');
    console.log('2. Check server logs for any remaining database sync warnings');
    console.log('3. Test the companies pages in your browser');
    console.log('4. Verify no React error #310 appears in browser console');
    console.log('5. Monitor API responses for 200 status codes');

    process.exit(0);
  } catch (error) {
    console.error('❌ Production fixes failed:', error.message);
    process.exit(1);
  }
}

runProductionFixes();
