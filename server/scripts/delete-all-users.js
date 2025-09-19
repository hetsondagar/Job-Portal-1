require('dotenv').config();
const { sequelize } = require('../config/sequelize');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Resume = require('../models/Resume');
const Education = require('../models/Education');
const WorkExperience = require('../models/WorkExperience');
const SearchHistory = require('../models/SearchHistory');
const JobBookmark = require('../models/JobBookmark');
const JobAlert = require('../models/JobAlert');
const CandidateLike = require('../models/CandidateLike');
const Notification = require('../models/Notification');
const ViewTracking = require('../models/ViewTracking');
const UserSession = require('../models/UserSession');
const CoverLetter = require('../models/CoverLetter');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Interview = require('../models/Interview');
const Analytics = require('../models/Analytics');
const CandidateAnalytics = require('../models/CandidateAnalytics');

const deleteAllUsers = async () => {
  await sequelize.sync(); // Ensure models are synced

  try {
    console.log('🗑️ Starting deletion of all users...');

    // Get all users first
    const allUsers = await User.findAll();
    console.log(`📊 Found ${allUsers.length} total users`);

    if (allUsers.length === 0) {
      console.log('✅ No users found to delete');
      return;
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      let deletedCount = 0;

      for (const user of allUsers) {
        console.log(`\n🗑️ Deleting user: ${user.email} (${user.user_type})`);

        // Delete dependent records in correct order
        const userId = user.id;

        // 1. Delete job applications (references resumes and jobs)
        const jobAppCount = await JobApplication.destroy({
          where: { userId: userId },
          transaction
        });
        if (jobAppCount > 0) console.log(`  - Deleted ${jobAppCount} job applications`);

        // 2. Delete resumes (references users)
        const resumeCount = await Resume.destroy({
          where: { userId: userId },
          transaction
        });
        if (resumeCount > 0) console.log(`  - Deleted ${resumeCount} resumes`);

        // 3. Delete education records
        const educationCount = await Education.destroy({
          where: { userId: userId },
          transaction
        });
        if (educationCount > 0) console.log(`  - Deleted ${educationCount} education records`);

        // 4. Delete work experiences
        const workExpCount = await WorkExperience.destroy({
          where: { userId: userId },
          transaction
        });
        if (workExpCount > 0) console.log(`  - Deleted ${workExpCount} work experiences`);

        // 5. Delete search histories
        const searchCount = await SearchHistory.destroy({
          where: { userId: userId },
          transaction
        });
        if (searchCount > 0) console.log(`  - Deleted ${searchCount} search histories`);

        // 6. Delete job bookmarks
        const bookmarkCount = await JobBookmark.destroy({
          where: { userId: userId },
          transaction
        });
        if (bookmarkCount > 0) console.log(`  - Deleted ${bookmarkCount} job bookmarks`);

        // 7. Delete job alerts
        const alertCount = await JobAlert.destroy({
          where: { userId: userId },
          transaction
        });
        if (alertCount > 0) console.log(`  - Deleted ${alertCount} job alerts`);

        // 8. Delete candidate likes
        const likeCount = await CandidateLike.destroy({
          where: { userId: userId },
          transaction
        });
        if (likeCount > 0) console.log(`  - Deleted ${likeCount} candidate likes`);

        // 9. Delete notifications
        const notificationCount = await Notification.destroy({
          where: { userId: userId },
          transaction
        });
        if (notificationCount > 0) console.log(`  - Deleted ${notificationCount} notifications`);

        // 10. Delete view trackings
        const viewCount = await ViewTracking.destroy({
          where: { userId: userId },
          transaction
        });
        if (viewCount > 0) console.log(`  - Deleted ${viewCount} view trackings`);

        // 11. Delete user sessions
        const sessionCount = await UserSession.destroy({
          where: { userId: userId },
          transaction
        });
        if (sessionCount > 0) console.log(`  - Deleted ${sessionCount} user sessions`);

        // 12. Delete cover letters
        const coverLetterCount = await CoverLetter.destroy({
          where: { userId: userId },
          transaction
        });
        if (coverLetterCount > 0) console.log(`  - Deleted ${coverLetterCount} cover letters`);

        // 13. Delete messages (check both sender_id and recipient_id)
        const messageCount = await Message.destroy({
          where: { 
            [sequelize.Op.or]: [
              { sender_id: userId },
              { recipient_id: userId }
            ]
          },
          transaction
        });
        if (messageCount > 0) console.log(`  - Deleted ${messageCount} messages`);

        // 14. Delete conversations (check both sender_id and recipient_id)
        const conversationCount = await Conversation.destroy({
          where: { 
            [sequelize.Op.or]: [
              { sender_id: userId },
              { recipient_id: userId }
            ]
          },
          transaction
        });
        if (conversationCount > 0) console.log(`  - Deleted ${conversationCount} conversations`);

        // 15. Delete interviews (check both candidateId and interviewerId)
        const interviewCount = await Interview.destroy({
          where: { 
            [sequelize.Op.or]: [
              { candidateId: userId },
              { interviewerId: userId }
            ]
          },
          transaction
        });
        if (interviewCount > 0) console.log(`  - Deleted ${interviewCount} interviews`);

        // 16. Delete analytics
        const analyticsCount = await Analytics.destroy({
          where: { userId: userId },
          transaction
        });
        if (analyticsCount > 0) console.log(`  - Deleted ${analyticsCount} analytics records`);

        // 17. Delete candidate analytics
        const candidateAnalyticsCount = await CandidateAnalytics.destroy({
          where: { userId: userId },
          transaction
        });
        if (candidateAnalyticsCount > 0) console.log(`  - Deleted ${candidateAnalyticsCount} candidate analytics records`);

        // 18. Finally delete the user
        await User.destroy({
          where: { id: userId },
          transaction
        });
        console.log(`  ✅ Deleted user: ${user.email}`);

        deletedCount++;
      }

      // Delete orphaned companies (companies with no users)
      console.log('\n🏢 Checking for orphaned companies...');
      const orphanedCompanies = await Company.findAll({
        where: {
          id: {
            [sequelize.Op.notIn]: await User.findAll({
              attributes: ['company_id'],
              where: { company_id: { [sequelize.Op.ne]: null } },
              raw: true
            }).then(users => users.map(u => u.company_id).filter(Boolean))
          }
        },
        transaction
      });

      if (orphanedCompanies.length > 0) {
        console.log(`🗑️ Found ${orphanedCompanies.length} orphaned companies, deleting...`);
        for (const company of orphanedCompanies) {
          // Delete jobs associated with this company
          const jobCount = await Job.destroy({
            where: { companyId: company.id },
            transaction
          });
          if (jobCount > 0) console.log(`  - Deleted ${jobCount} jobs for company: ${company.name}`);

          // Delete the company
          await Company.destroy({
            where: { id: company.id },
            transaction
          });
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
