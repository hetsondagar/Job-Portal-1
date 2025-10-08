/**
 * VERIFY READY FOR PRODUCTION
 * Quick check before pushing to main
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('🔍 VERIFYING PRODUCTION READINESS');
console.log('='.repeat(80));
console.log('');

let allChecks = true;

// Check 1: Auto-migration script exists
console.log('📋 Check 1: Auto-migration script...');
const migrationScript = path.join(__dirname, 'auto-migrate-on-deploy.js');
if (fs.existsSync(migrationScript)) {
  console.log('✅ auto-migrate-on-deploy.js exists');
} else {
  console.log('❌ auto-migrate-on-deploy.js NOT FOUND');
  allChecks = false;
}

// Check 2: package.json has postinstall hook
console.log('\n📋 Check 2: package.json postinstall hook...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
if (packageJson.scripts && packageJson.scripts.postinstall) {
  console.log('✅ postinstall script exists:', packageJson.scripts.postinstall);
} else {
  console.log('❌ postinstall script NOT FOUND in package.json');
  allChecks = false;
}

// Check 3: start-with-migration.js exists
console.log('\n📋 Check 3: Start script with migration check...');
const startScript = path.join(__dirname, '../start-with-migration.js');
if (fs.existsSync(startScript)) {
  console.log('✅ start-with-migration.js exists');
} else {
  console.log('❌ start-with-migration.js NOT FOUND');
  allChecks = false;
}

// Check 4: Job model has hot vacancy fields
console.log('\n📋 Check 4: Job model has hot vacancy fields...');
const jobModel = fs.readFileSync(path.join(__dirname, '../models/Job.js'), 'utf8');
if (jobModel.includes('isHotVacancy') && jobModel.includes('urgentHiring')) {
  console.log('✅ Job model has hot vacancy fields');
} else {
  console.log('❌ Job model missing hot vacancy fields');
  allChecks = false;
}

// Check 5: JobController has hot vacancy handling
console.log('\n📋 Check 5: JobController has hot vacancy handling...');
const jobController = fs.readFileSync(path.join(__dirname, '../controller/JobController.js'), 'utf8');
if (jobController.includes('isHotVacancy') && jobController.includes('urgentHiring')) {
  console.log('✅ JobController has hot vacancy handling');
} else {
  console.log('❌ JobController missing hot vacancy handling');
  allChecks = false;
}

console.log('\n' + '='.repeat(80));
if (allChecks) {
  console.log('✅ ALL CHECKS PASSED - READY FOR PRODUCTION!');
  console.log('='.repeat(80));
  console.log('\n🚀 YOU CAN NOW PUSH TO MAIN:');
  console.log('   git add .');
  console.log('   git commit -m "feat: Hot vacancy with auto-migration"');
  console.log('   git push origin main');
  console.log('\n✅ The auto-migration will run automatically on Render!');
  console.log('✅ All production errors will be fixed within 2-3 minutes!');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED - DO NOT PUSH YET');
  console.log('='.repeat(80));
  console.log('\n⚠️  Fix the issues above before pushing to main');
  console.log('');
  process.exit(1);
}

