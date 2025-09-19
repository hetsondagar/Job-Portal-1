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
      // Delete all users directly - let foreign key constraints handle dependent records
      console.log('🗑️ Deleting all users and their dependent records...');
      
      const [userResult] = await sequelize.query('DELETE FROM users', { transaction });
      console.log(`✅ Deleted ${userResult} users`);

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
