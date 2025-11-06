/**
 * Migration script to convert existing currentCompany and currentRole 
 * from users table to work_experiences entries
 */

const { sequelize } = require('../config/sequelize');
const { User } = require('../models');
const { WorkExperience } = require('../models');

async function migrateCurrentCompanyToWorkExperience() {
  try {
    console.log('🔄 Starting migration: currentCompany/currentRole -> work_experiences');
    
    // Find all users with currentCompany or currentRole
    const users = await User.findAll({
      where: {
        [sequelize.Op.or]: [
          { current_company: { [sequelize.Op.ne]: null } },
          { current_role: { [sequelize.Op.ne]: null } }
        ]
      },
      attributes: ['id', 'current_company', 'current_role', 'first_name', 'last_name', 'email']
    });

    console.log(`📊 Found ${users.length} users with current company/role data`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Check if user already has a current work experience
        const existingCurrentExp = await WorkExperience.findOne({
          where: {
            user_id: user.id,
            is_current: true
          }
        });

        if (existingCurrentExp) {
          console.log(`⏭️  Skipping user ${user.email} - already has current work experience`);
          skipped++;
          continue;
        }

        // Create work experience entry
        const companyName = user.current_company || 'Unknown Company';
        const jobTitle = user.current_role || 'Not specified';
        
        // Use current date as start date if not available
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6); // Default to 6 months ago

        await WorkExperience.create({
          user_id: user.id,
          company: companyName,
          title: jobTitle,
          start_date: startDate.toISOString().split('T')[0],
          end_date: null,
          is_current: true,
          location: null,
          description: `Migrated from user profile - Previous company: ${companyName}, Role: ${jobTitle}`,
          employment_type: 'full-time',
          skills: [],
          achievements: [],
          salary: null,
          salary_currency: 'INR'
        });

        console.log(`✅ Migrated work experience for user ${user.email}`);
        migrated++;

      } catch (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('✅ Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCurrentCompanyToWorkExperience()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateCurrentCompanyToWorkExperience };



