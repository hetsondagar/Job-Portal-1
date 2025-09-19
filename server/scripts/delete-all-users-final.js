require('dotenv').config();
const { sequelize } = require('../config/sequelize');

const deleteAllUsers = async () => {
  try {
    console.log('🗑️ Starting deletion of all users...');

    // Get all users first
    const [users] = await sequelize.query('SELECT id, email, user_type FROM users');
    console.log(`📊 Found ${users.length} total users`);

    if (users.length === 0) {
      console.log('✅ No users found to delete');
      return;
    }

    console.log('🗑️ Deleting all data in correct order to handle foreign key constraints...');

    // 1. Delete jobs first (they reference users via employerId)
    try {
      const [jobResult] = await sequelize.query('DELETE FROM jobs');
      console.log(`✅ Deleted ${jobResult} jobs`);
    } catch (error) {
      console.log(`⚠️  Could not delete jobs: ${error.message}`);
    }

    // 2. Delete all other dependent records
    const tablesToDelete = [
      'job_applications',
      'resumes', 
      'educations',
      'work_experiences',
      'search_history',
      'job_bookmarks',
      'job_alerts',
      'candidate_likes',
      'notifications',
      'view_tracking',
      'user_sessions',
      'cover_letters',
      'messages',
      'conversations',
      'interviews',
      'analytics'
    ];

    for (const table of tablesToDelete) {
      try {
        const [result] = await sequelize.query(`DELETE FROM ${table}`);
        if (result > 0) {
          console.log(`✅ Deleted ${result} records from ${table}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not delete from ${table}: ${error.message}`);
      }
    }

    // 3. Delete all users
    try {
      const [userResult] = await sequelize.query('DELETE FROM users');
      console.log(`✅ Deleted ${userResult} users`);
    } catch (error) {
      console.log(`❌ Could not delete users: ${error.message}`);
    }

    // 4. Delete orphaned companies
    console.log('\n🏢 Checking for orphaned companies...');
    try {
      const [orphanedCompanies] = await sequelize.query(`
        SELECT c.id, c.name 
        FROM companies c 
        LEFT JOIN users u ON c.id = u.company_id 
        WHERE u.id IS NULL
      `);

      if (orphanedCompanies.length > 0) {
        console.log(`🗑️ Found ${orphanedCompanies.length} orphaned companies, deleting...`);
        for (const company of orphanedCompanies) {
          await sequelize.query(
            'DELETE FROM companies WHERE id = :companyId',
            { replacements: { companyId: company.id } }
          );
          console.log(`  ✅ Deleted orphaned company: ${company.name}`);
        }
      } else {
        console.log('✅ No orphaned companies found');
      }
    } catch (error) {
      console.log(`⚠️  Could not check/delete orphaned companies: ${error.message}`);
    }

    console.log(`\n✅ Deletion process completed`);

  } catch (error) {
    console.error('❌ Error during deletion:', error);
  } finally {
    await sequelize.close();
  }
};

deleteAllUsers();
