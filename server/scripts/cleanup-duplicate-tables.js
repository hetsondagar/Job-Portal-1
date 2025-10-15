#!/usr/bin/env node
/**
 * Cleanup duplicate JobTemplates table
 */

const { sequelize } = require('../config/sequelize');

async function cleanupDuplicates() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check if both tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('JobTemplates', 'job_templates')
      ORDER BY table_name
    `);

    console.log('📋 Found job template tables:', tables.map(t => t.table_name).join(', '));

    if (tables.length === 2) {
      console.log('\n⚠️ Duplicate table detected!');
      console.log('Keeping: job_templates (snake_case - correct)');
      console.log('Removing: JobTemplates (camelCase - incorrect)\n');

      // Check if JobTemplates has any data
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "JobTemplates"`);
      console.log(`JobTemplates has ${count[0].count} rows`);

      // Check job_templates data
      const [count2] = await sequelize.query(`SELECT COUNT(*) as count FROM job_templates`);
      console.log(`job_templates has ${count2[0].count} rows\n`);

      if (count[0].count > 0 && count2[0].count === 0) {
        console.log('⚠️ JobTemplates has data but job_templates is empty!');
        console.log('Would you like to migrate data? (This script just reports, no action taken)');
      } else {
        console.log('✅ Safe to drop JobTemplates table');
        console.log('\nTo drop it, run:');
        console.log('DROP TABLE "JobTemplates";');
      }
    } else if (tables.length === 1) {
      console.log(`\n✅ Only one table exists: ${tables[0].table_name}`);
    } else {
      console.log('\n⚠️ No job template tables found!');
    }

    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

cleanupDuplicates();

