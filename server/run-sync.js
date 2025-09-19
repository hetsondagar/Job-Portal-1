require('dotenv').config();
const { sequelize } = require('./config/sequelize');
const fs = require('fs');
const path = require('path');

async function runSync() {
  try {
    console.log('🔄 Running complete database synchronization...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'complete-database-sync.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📝 Executing SQL script...');
    
    // Execute the entire SQL script
    await sequelize.query(sqlContent);
    
    console.log('✅ SQL script executed successfully');
    
    // Verify the results
    const result = await sequelize.query(`
      SELECT 
        'Database synchronization completed successfully!' as status,
        COUNT(*) as total_tables
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    console.log('\n📊 Results:');
    console.log(`  Status: ${result[0][0].status}`);
    console.log(`  Total tables: ${result[0][0].total_tables}`);
    
    // List all tables
    const tablesResult = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tables = tablesResult[0].map(row => row.table_name);
    console.log(`\n📋 All ${tables.length} tables:`);
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });
    
    console.log('\n🎉 Database synchronization completed successfully!');
    console.log('✅ Your database is now perfectly synced and ready to use');
    
  } catch (error) {
    console.error('❌ Error during synchronization:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the sync
runSync().catch(console.error);








