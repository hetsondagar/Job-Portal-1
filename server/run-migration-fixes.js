#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Running migration fixes for production database...');

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`⚠️ Warning: ${stderr}`);
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
};

async function runMigrations() {
  try {
    console.log('📋 Checking migration status...');
    await runCommand('npx sequelize-cli db:migrate:status');

    console.log('🔄 Running new migrations...');
    await runCommand('npx sequelize-cli db:migrate');

    console.log('✅ All migrations completed successfully!');
    
    console.log('🔍 Checking final migration status...');
    await runCommand('npx sequelize-cli db:migrate:status');

    console.log('🎉 Migration fixes completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration fixes failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
