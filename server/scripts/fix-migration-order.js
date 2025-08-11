const fs = require('fs');
const path = require('path');

// Define the correct migration order based on dependencies
const migrationOrder = [
  '20250810113825-create-companies.js',    // 1. companies (no dependencies)
  '20250810113826-create-users.js',        // 2. users (depends on companies)
  '20250810113823-create-job-categories.js', // 3. job_categories (no dependencies)
  '20250810113824-create-jobs.js',         // 4. jobs (depends on companies, users, job_categories)
  '20250810113821-create-resumes.js',      // 5. resumes (depends on users)
  '20250810113820-create-work-experiences.js', // 6. work_experiences (depends on users)
  '20250810113819-create-educations.js',   // 7. educations (depends on users)
  '20250810113818-create-requirements.js', // 8. requirements (depends on companies)
  '20250810113822-create-job-applications.js', // 9. job_applications (depends on jobs, users, resumes)
  '20250810113817-create-applications.js', // 10. applications (depends on requirements, users)
  '20250810113816-create-job-bookmarks.js', // 11. job_bookmarks (depends on jobs, users)
  '20250810113815-create-job-alerts.js',   // 12. job_alerts (depends on users, job_categories)
  '20250810113814-create-notifications.js', // 13. notifications (depends on users)
  '20250810113813-create-company-reviews.js', // 14. company_reviews (depends on companies, users)
  '20250810113812-create-company-follows.js', // 15. company_follows (depends on companies, users)
  '20250810113811-create-subscription-plans.js', // 16. subscription_plans (no dependencies)
  '20250810113810-create-subscriptions.js', // 17. subscriptions (depends on users, subscription_plans)
  '20250810113809-create-payments.js',     // 18. payments (depends on users, subscriptions)
  '20250810113808-create-user-sessions.js', // 19. user_sessions (depends on users)
  '20250810113807-create-interviews.js',   // 20. interviews (depends on job_applications, users)
  '20250810113806-create-conversations.js', // 21. conversations (depends on users)
  '20250810113805-create-messages.js',     // 22. messages (depends on conversations, users)
  '20250810113804-create-analytics.js'     // 23. analytics (depends on users)
];

const migrationsDir = path.join(__dirname, '..', 'migrations');

function fixMigrationOrder() {
  console.log('🔧 Fixing migration file order...');
  
  // Get current migration files
  const currentFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();
  
  console.log('📁 Current migration files:');
  currentFiles.forEach(file => console.log(`   ${file}`));
  
  // Create backup directory
  const backupDir = path.join(migrationsDir, 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  // Backup current files
  console.log('\n💾 Backing up current migration files...');
  currentFiles.forEach(file => {
    const sourcePath = path.join(migrationsDir, file);
    const backupPath = path.join(backupDir, file);
    fs.copyFileSync(sourcePath, backupPath);
  });
  
  // Rename files in correct order
  console.log('\n🔄 Renaming migration files in correct order...');
  migrationOrder.forEach((targetFile, index) => {
    const currentFile = currentFiles.find(file => file.includes(targetFile.split('-').slice(2).join('-')));
    
    if (currentFile) {
      const newTimestamp = `202508101138${String(index + 1).padStart(2, '0')}`;
      const newFileName = `${newTimestamp}-${targetFile.split('-').slice(2).join('-')}`;
      
      const oldPath = path.join(migrationsDir, currentFile);
      const newPath = path.join(migrationsDir, newFileName);
      
      fs.renameSync(oldPath, newPath);
      console.log(`   ${currentFile} → ${newFileName}`);
    } else {
      console.log(`   ⚠️  Could not find: ${targetFile}`);
    }
  });
  
  console.log('\n✅ Migration order fixed successfully!');
  console.log('📁 Backup files saved in: migrations/backup/');
  console.log('\n🚀 You can now run: npm run db:migrate');
}

fixMigrationOrder();
