#!/usr/bin/env node
/**
 * Drop the duplicate JobTemplates table (camelCase)
 */

const { sequelize } = require('../config/sequelize');

async function dropDuplicateTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Verify the duplicate exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'JobTemplates'
    `);

    if (tables.length === 0) {
      console.log('✅ No duplicate JobTemplates table found. Nothing to do!');
      await sequelize.close();
      return;
    }

    // Check row count
    const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "JobTemplates"`);
    console.log(`📊 JobTemplates table has ${count[0].count} rows`);

    if (count[0].count > 0) {
      console.log('⚠️ JobTemplates has data! Aborting drop for safety.');
      console.log('Please migrate data first before dropping.');
      await sequelize.close();
      return;
    }

    console.log('🗑️ Dropping empty JobTemplates table...\n');

    // Drop the table
    await sequelize.query(`DROP TABLE "JobTemplates" CASCADE`);

    console.log('✅ Successfully dropped JobTemplates table!');

    // Verify it's gone
    const [afterTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('JobTemplates', 'job_templates')
      ORDER BY table_name
    `);

    console.log('\n📋 Remaining job template tables:', afterTables.map(t => t.table_name).join(', '));
    console.log('\n✅ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

dropDuplicateTable();

