const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Jobs API fix to production...');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    console.error('❌ Not in the correct directory. Please run from the server root.');
    process.exit(1);
  }

  // Check if the fix is in place
  const jobControllerPath = path.join(__dirname, 'controller', 'JobController.js');
  const jobControllerContent = fs.readFileSync(jobControllerPath, 'utf8');
  
  if (!jobControllerContent.includes('const OpNe = Job.sequelize.Op.ne;')) {
    console.error('❌ Jobs API fix not found in JobController.js');
    process.exit(1);
  }
  
  console.log('✅ Jobs API fix confirmed in JobController.js');

  // Check git status
  console.log('🔍 Checking git status...');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (gitStatus.trim()) {
    console.log('📝 Uncommitted changes found:');
    console.log(gitStatus);
    
    // Add and commit changes
    console.log('📝 Adding and committing changes...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Fix Jobs API 500 error - Cannot read properties of undefined (reading and)"', { stdio: 'inherit' });
    console.log('✅ Changes committed successfully');
  } else {
    console.log('✅ No uncommitted changes');
  }

  // Push to main branch
  console.log('🚀 Pushing changes to main branch...');
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Changes pushed to main branch');

  // Check if we're using Render
  if (fs.existsSync('.render')) {
    console.log('🔍 Render deployment detected');
    console.log('📋 Render should automatically deploy from the main branch');
    console.log('⏱️  Deployment typically takes 2-5 minutes');
  }

  console.log('🎉 Jobs API fix deployment initiated!');
  console.log('📋 Summary of fix:');
  console.log('   - Added missing OpNe = Job.sequelize.Op.ne');
  console.log('   - Fixed Op.in references to use OpIn');
  console.log('   - Resolved "Cannot read properties of undefined (reading and)" error');
  console.log('');
  console.log('🔍 Monitor the production logs to confirm the fix is working');
  console.log('🌐 Test endpoint: GET /api/jobs?status=active&limit=100');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
