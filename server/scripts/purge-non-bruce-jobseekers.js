// Maintenance script: anonymize and mark as deleted all jobseekers except Bruce Wayne
// Usage: node scripts/purge-non-bruce-jobseekers.js

const { sequelize } = require('../config/sequelize');
const User = require('../models/User');

async function main() {
  console.log('🔍 Starting purge of non-Bruce jobseekers...');
  await sequelize.authenticate();
  console.log('✅ DB connected');

  const t = await sequelize.transaction();
  try {
    const candidates = await User.findAll({
      where: {
        user_type: 'jobseeker'
      },
      transaction: t
    });

    const toAnonymize = candidates.filter(u => !(
      (u.first_name || '').toLowerCase() === 'bruce' &&
      (u.last_name || '').toLowerCase() === 'wayne'
    ));

    console.log(`📋 Total jobseekers: ${candidates.length}`);
    console.log(`🗑️  To anonymize/delete: ${toAnonymize.length}`);

    let processed = 0;
    for (const u of toAnonymize) {
      const anonSuffix = u.id.slice(0, 8);
      await u.update({
        account_status: 'deleted',
        email: `deleted+${anonSuffix}@example.com`,
        password: null,
        first_name: 'Deleted',
        last_name: 'User',
        phone: null,
        avatar: null,
        preferences: {},
        date_of_birth: null,
        gender: null,
        current_location: null,
        preferred_locations: [],
        willing_to_relocate: false,
        expected_salary: null,
        current_salary: null,
        experience_years: 0,
        notice_period: null,
        designation: null,
        department: null,
        email_verification_token: null,
        email_verification_expires: null,
        password_reset_token: null,
        password_reset_expires: null,
        two_factor_enabled: false,
        two_factor_secret: null,
        login_attempts: 0,
        lock_until: null,
        headline: null,
        summary: null,
        skills: [],
        key_skills: [],
        languages: [],
        certifications: [],
        education: [],
        social_links: {},
        profile_visibility: 'public',
        contact_visibility: 'public',
        email_notifications: { jobAlerts: false, applicationUpdates: false, messages: false, companyUpdates: false, marketing: false },
        push_notifications: { jobAlerts: false, applicationUpdates: false, messages: false, companyUpdates: false },
        verification_level: 'unverified',
        profile_completion: 0,
        oauth_provider: 'local',
        oauth_id: null,
        oauth_access_token: null,
        oauth_refresh_token: null,
        oauth_token_expires_at: null,
      }, { transaction: t });
      processed += 1;
      if (processed % 50 === 0) console.log(`   → Processed ${processed}`);
    }

    await t.commit();
    console.log(`✅ Completed. Anonymized & marked deleted: ${processed}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during purge:', err);
    await t.rollback();
    process.exit(1);
  }
}

main();


