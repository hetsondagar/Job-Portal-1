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
      let deletedCount = 0;

      for (const user of users) {
        console.log(`\n🗑️ Deleting user: ${user.email} (${user.user_type})`);

        // Delete dependent records in correct order
        const userId = user.id;

        // 1. Delete job applications
        const [jobAppResult] = await sequelize.query(
          'DELETE FROM job_applications WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (jobAppResult > 0) console.log(`  - Deleted ${jobAppResult} job applications`);

        // 2. Delete resumes
        const [resumeResult] = await sequelize.query(
          'DELETE FROM resumes WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (resumeResult > 0) console.log(`  - Deleted ${resumeResult} resumes`);

        // 3. Delete education records
        const [educationResult] = await sequelize.query(
          'DELETE FROM educations WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (educationResult > 0) console.log(`  - Deleted ${educationResult} education records`);

        // 4. Delete work experiences
        const [workExpResult] = await sequelize.query(
          'DELETE FROM work_experiences WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (workExpResult > 0) console.log(`  - Deleted ${workExpResult} work experiences`);

        // 5. Delete search histories
        const [searchResult] = await sequelize.query(
          'DELETE FROM search_history WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (searchResult > 0) console.log(`  - Deleted ${searchResult} search histories`);

        // 6. Delete job bookmarks
        const [bookmarkResult] = await sequelize.query(
          'DELETE FROM job_bookmarks WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (bookmarkResult > 0) console.log(`  - Deleted ${bookmarkResult} job bookmarks`);

        // 7. Delete job alerts
        const [alertResult] = await sequelize.query(
          'DELETE FROM job_alerts WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (alertResult > 0) console.log(`  - Deleted ${alertResult} job alerts`);

        // 8. Delete candidate likes
        const [likeResult] = await sequelize.query(
          'DELETE FROM candidate_likes WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (likeResult > 0) console.log(`  - Deleted ${likeResult} candidate likes`);

        // 9. Delete notifications
        const [notificationResult] = await sequelize.query(
          'DELETE FROM notifications WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (notificationResult > 0) console.log(`  - Deleted ${notificationResult} notifications`);

        // 10. Delete view trackings
        const [viewResult] = await sequelize.query(
          'DELETE FROM view_tracking WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (viewResult > 0) console.log(`  - Deleted ${viewResult} view trackings`);

        // 11. Delete user sessions
        const [sessionResult] = await sequelize.query(
          'DELETE FROM user_sessions WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (sessionResult > 0) console.log(`  - Deleted ${sessionResult} user sessions`);

        // 12. Delete cover letters
        const [coverLetterResult] = await sequelize.query(
          'DELETE FROM cover_letters WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (coverLetterResult > 0) console.log(`  - Deleted ${coverLetterResult} cover letters`);

        // 13. Delete messages (check both sender_id and recipient_id)
        const [messageResult] = await sequelize.query(
          'DELETE FROM messages WHERE sender_id = :userId OR recipient_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (messageResult > 0) console.log(`  - Deleted ${messageResult} messages`);

        // 14. Delete conversations (check both sender_id and recipient_id)
        const [conversationResult] = await sequelize.query(
          'DELETE FROM conversations WHERE sender_id = :userId OR recipient_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (conversationResult > 0) console.log(`  - Deleted ${conversationResult} conversations`);

        // 15. Delete interviews (check both candidate_id and interviewer_id)
        const [interviewResult] = await sequelize.query(
          'DELETE FROM interviews WHERE candidate_id = :userId OR interviewer_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (interviewResult > 0) console.log(`  - Deleted ${interviewResult} interviews`);

        // 16. Delete analytics
        const [analyticsResult] = await sequelize.query(
          'DELETE FROM analytics WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (analyticsResult > 0) console.log(`  - Deleted ${analyticsResult} analytics records`);

        // 17. Delete candidate analytics
        const [candidateAnalyticsResult] = await sequelize.query(
          'DELETE FROM candidate_analytics WHERE user_id = :userId',
          { replacements: { userId }, transaction }
        );
        if (candidateAnalyticsResult > 0) console.log(`  - Deleted ${candidateAnalyticsResult} candidate analytics records`);

        // 18. Finally delete the user
        await sequelize.query(
          'DELETE FROM users WHERE id = :userId',
          { replacements: { userId }, transaction }
        );
        console.log(`  ✅ Deleted user: ${user.email}`);

        deletedCount++;
      }

      // Delete orphaned companies (companies with no users)
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
          // Delete jobs associated with this company
          const [jobResult] = await sequelize.query(
            'DELETE FROM jobs WHERE company_id = :companyId',
            { replacements: { companyId: company.id }, transaction }
          );
          if (jobResult > 0) console.log(`  - Deleted ${jobResult} jobs for company: ${company.name}`);

          // Delete the company
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

      console.log(`\n✅ Successfully deleted ${deletedCount} users and their associated data`);
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
