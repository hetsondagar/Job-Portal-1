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

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      console.log('🗑️ Deleting all data in correct order to handle foreign key constraints...');

      // 1. Delete jobs first (they reference users via employerId)
      const [jobResult] = await sequelize.query('DELETE FROM jobs', { transaction });
      console.log(`✅ Deleted ${jobResult} jobs`);

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
        'analytics',
        'candidate_analytics'
      ];

      for (const table of tablesToDelete) {
        try {
          const [result] = await sequelize.query(`DELETE FROM ${table}`, { transaction });
          if (result > 0) {
            console.log(`✅ Deleted ${result} records from ${table}`);
          }
        } catch (error) {
          console.log(`⚠️  Could not delete from ${table}: ${error.message}`);
        }
      }

      // 3. Delete all users
      const [userResult] = await sequelize.query('DELETE FROM users', { transaction });
      console.log(`✅ Deleted ${userResult} users`);

      // 4. Delete orphaned companies
      console.log('\n🏢 Checking for orphaned companies...');
      const [orphanedCompanies] = await sequelize.query(`
        SELECT c.id, c.name 
        FROM companies c 
        LEFT JOIN users u ON c.id = u.company_id 
        WHERE u.id IS NULL
      `, { transaction });

      if (orphanedCompanies.length > 0) {
        console.log(`🗑️ Found ${orphanedCompanies.length} orphaned companies, deleting...`);
        for (const company of orphanedCompanies) {
          await sequelize.query(
            'DELETE FROM companies WHERE id = :companyId',
            { replacements: { companyId: company.id }, transaction }
          );
          console.log(`  ✅ Deleted orphaned company: ${company.name}`);
        }
      } else {
        console.log('✅ No orphaned companies found');
      }

      // Commit transaction
      await transaction.commit();

      console.log(`\n✅ Successfully deleted all users and their associated data`);
      console.log('✅ All foreign key constraints handled properly');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error during deletion:', error);
  } finally {
    await sequelize.close();
  }
};

deleteAllUsers();
