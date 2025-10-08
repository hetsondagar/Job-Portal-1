#!/usr/bin/env node

/**
 * Mark Old Migrations as Run
 * 
 * This script manually marks old migrations as run in the database
 * to prevent them from being re-executed on an existing database.
 * 
 * Use this when you have an existing database and want to skip old migrations.
 */

const { sequelize } = require('../config/sequelize');

async function markMigrationsAsRun() {
  try {
    console.log('🔧 Marking old migrations as run...\n');
    
    // Migrations that should be marked as run (already applied to production)
    const migrationsToMark = [
      '20250810113804-jobs.js',
      '20250810113805-resumes.js',
      '20250810113806-work-experiences.js',
      '20250810113807-educations.js',
      '20250810113808-requirements.js',
      '20250810113809-job-applications.js',
      '20250810113810-applications.js',
      '20250810113811-job-bookmarks.js',
      '20250810113812-job-alerts.js',
      '20250810113813-notifications.js',
      '20250810113814-company-reviews.js',
      '20250810113815-company-follows.js',
      '20250810113816-subscription-plans.js',
      '20250810113817-subscriptions.js',
      '20250810113818-payments.js',
      '20250810113819-user-sessions.js',
      '20250810113820-interviews.js',
      '20250810113821-conversations.js',
      '20250810113822-messages.js',
      '20250810113823-analytics.js',
      '20250810113824-add-oauth-fields.js',
      '20250810113825-add-region-to-companies.js',
      '20250810113826-add-region-to-jobs.js',
      '20250810113827-add-region-to-users.js',
      '20250810113828-add-password-skipped-to-users.js',
      '20250810113829-allow-null-names-for-oauth.js',
      '20250810113830-update-quota-types.js',
      '20250810113831-add-region-to-requirements.js',
      '20250810113832-add-missing-job-bookmark-columns.js',
      '20250810113833-fix-model-field-mappings.js',
      '20250810113834-fix-all-field-mappings.js',
      '20250810113835-create-conversations-and-messages.js',
      '20250810113836-create-missing-tables.js',
      '20250810113837-add-secure-job-tracking.js',
      '20250810113838-fix-all-database-issues.js',
      '20250810113839-force-fix-field-mappings.js',
      '20250810113840-final-database-fixes.js',
      '20250826173051-add-visibility-type-to-jobs.js',
      '20250826184757-update-jobs-company-id-optional.js',
      '20250905085947-add-salary-field-to-jobs.js',
      '20250910000100-fix-cover-letter-id-column.js',
      '20250910201643-add-interview-notification-types.js',
      '20250910202000-add-missing-interview-fields.js',
      '20250910202100-add-missing-notification-fields.js',
      '20250911160907-add-internship-fields-to-jobs.js',
      '20250917120000-create-userActivityLogs.js',
      '20250917121000-create-employerQuotas.js',
      '20250917160948-add-verification-date-to-educations.js',
      '20251005090000-add-job-search-indexes.js',
      '20251006120000-extend-notification-types.js',
      '20251007071802-add-new-job-fields.js',
      '20251007073100-add-missing-job-columns.js',
      '20251007080000-add-premium-hot-vacancy-features.js',
      '20251007090000-add-hot-vacancy-features-to-jobs.js',
      '20251101000000-create-job-templates.js',
      '20251109000001-create-hot-vacancies.js',
      '20251109000002-create-view-tracking.js',
      '20251115000000-create-search-history.js',
      '20251115000001-create-user-dashboard.js',
      '20251115000002-create-job-photos.js',
      '20251115000003-create-cover-letters.js',
      '20251115000004-add-cover-letter-id-to-job-applications.js',
      '20251115000005-add-cover-letter-fk-constraint.js',
      '20251115000006-create-company-photos.js',
      '20251115000007-add-why-join-us-to-companies.js',
      '20251120000001-create-featured-jobs.js',
      '20251120000002-create-candidate-analytics.js',
      '20251120000003-create-bulk-job-imports.js',
      '20251120000004-create-candidate-likes.js',
      '20251120000005-add-preferred-locations-to-users.js'
    ];
    
    let markedCount = 0;
    
    for (const migration of migrationsToMark) {
      try {
        // Check if already marked
        const [existing] = await sequelize.query(
          'SELECT name FROM "SequelizeMeta" WHERE name = ?',
          { replacements: [migration] }
        );
        
        if (existing && existing.length > 0) {
          console.log(`✓ ${migration} - Already marked`);
          continue;
        }
        
        // Mark as run
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (?) ON CONFLICT DO NOTHING',
          { replacements: [migration] }
        );
        
        console.log(`✅ Marked as run: ${migration}`);
        markedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to mark ${migration}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully marked ${markedCount} migrations as run`);
    console.log(`📊 Total migrations processed: ${migrationsToMark.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

markMigrationsAsRun();

