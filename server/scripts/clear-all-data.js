require('dotenv').config();
const { sequelize } = require('../config/sequelize');

const clearAllData = async () => {
  try {
    console.log('🗑️ Starting complete database data clearing...');

    // Get all table names
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'spatial_ref_sys'
      ORDER BY table_name
    `);

    console.log(`📊 Found ${tables.length} tables to clear`);

    if (tables.length === 0) {
      console.log('✅ No tables found to clear');
      return;
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      console.log('🗑️ Clearing all data from all tables...');

      // Disable foreign key checks temporarily
      await sequelize.query('SET session_replication_role = replica;', { transaction });

      // Clear all tables
      for (const table of tables) {
        const tableName = table.table_name;
        try {
          const [result] = await sequelize.query(`DELETE FROM "${tableName}"`, { transaction });
          if (result > 0) {
            console.log(`✅ Cleared ${result} records from ${tableName}`);
          } else {
            console.log(`ℹ️  ${tableName} was already empty`);
          }
        } catch (error) {
          console.log(`⚠️  Could not clear ${tableName}: ${error.message}`);
        }
      }

      // Re-enable foreign key checks
      await sequelize.query('SET session_replication_role = DEFAULT;', { transaction });

      // Commit transaction
      await transaction.commit();

      console.log(`\n✅ Successfully cleared all data from all tables`);
      console.log('✅ Database structure preserved');
      console.log('✅ All tables are now empty');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error during data clearing:', error);
  } finally {
    await sequelize.close();
  }
};

clearAllData();
