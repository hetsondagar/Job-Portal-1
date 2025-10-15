#!/usr/bin/env node
/**
 * Fix job_templates table schema to use snake_case columns
 * Run this script to fix the template_data column issue
 */

const { sequelize } = require('../config/sequelize');

async function fixJobTemplatesSchema() {
  console.log('🔧 Starting job_templates schema fix...');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Check if table exists
    const [tables] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'job_templates'
      ) AS exists;
    `);

    const tableExists = tables[0]?.exists;

    if (!tableExists) {
      console.log('ℹ️ job_templates table does not exist. Run migrations first.');
      process.exit(0);
    }

    console.log('✅ job_templates table exists');

    // Check existing columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'job_templates'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Current columns:', columns.map(c => c.column_name).join(', '));

    // Check if problematic column exists (camelCase instead of snake_case)
    const hasTemplateData = columns.some(c => c.column_name === 'template_data');
    const hasTemplateDataCamel = columns.some(c => c.column_name === 'templateData');

    if (hasTemplateDataCamel && !hasTemplateData) {
      console.log('⚠️ Found camelCase templateData column, renaming to template_data...');
      
      await sequelize.query(`
        ALTER TABLE job_templates 
        RENAME COLUMN "templateData" TO template_data;
      `);
      
      console.log('✅ Renamed templateData to template_data');
    } else if (hasTemplateData) {
      console.log('✅ template_data column already exists with correct name');
    } else {
      console.log('⚠️ Neither template_data nor templateData column exists. Adding template_data...');
      
      await sequelize.query(`
        ALTER TABLE job_templates 
        ADD COLUMN template_data JSONB;
      `);
      
      console.log('✅ Added template_data column');
    }

    // Fix other columns if needed
    const columnRenames = [
      { old: 'isPublic', new: 'is_public' },
      { old: 'isDefault', new: 'is_default' },
      { old: 'isActive', new: 'is_active' },
      { old: 'createdBy', new: 'created_by' },
      { old: 'lastUsedAt', new: 'last_used_at' },
      { old: 'usageCount', new: 'usage_count' },
      { old: 'createdAt', new: 'created_at' },
      { old: 'updatedAt', new: 'updated_at' },
      { old: 'companyId', new: 'company_id' }
    ];

    for (const { old, new: newName } of columnRenames) {
      const hasOld = columns.some(c => c.column_name === old);
      const hasNew = columns.some(c => c.column_name === newName);

      if (hasOld && !hasNew) {
        console.log(`🔄 Renaming ${old} to ${newName}...`);
        
        await sequelize.query(`
          ALTER TABLE job_templates 
          RENAME COLUMN "${old}" TO ${newName};
        `);
        
        console.log(`✅ Renamed ${old} to ${newName}`);
      }
    }

    // Verify the fix
    const [fixedColumns] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'job_templates'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Final columns:', fixedColumns.map(c => c.column_name).join(', '));
    console.log('\n✅ job_templates schema fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing job_templates schema:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixJobTemplatesSchema().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

