const { Sequelize } = require('sequelize');

// Production database credentials
const DATABASE_URL = 'postgresql://jobportal_dev_0u1u_user:yK9WCII787btQrSqZJVdq0Cx61rZoTsc@dpg-d372gajuibrs738lnm5g-a.oregon-postgres.render.com/jobportal_dev_0u1u';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

async function analyzeDatabaseSchema() {
  try {
    console.log('🔌 Connecting to production database...\n');
    await sequelize.authenticate();
    console.log('✅ Connected successfully!\n');
    console.log('═'.repeat(100));
    console.log('📊 PRODUCTION DATABASE SCHEMA ANALYSIS');
    console.log('═'.repeat(100));
    console.log();

    // Get all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`📋 Total Tables: ${tables.length}\n`);

    // Analyze each table
    for (const table of tables) {
      const tableName = table.table_name;
      
      console.log('─'.repeat(100));
      console.log(`📑 TABLE: ${tableName.toUpperCase()}`);
      console.log('─'.repeat(100));

      // Get column details
      const [columns] = await sequelize.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `);

      console.log(`\n   Columns (${columns.length}):`);
      console.log('   ┌─────────────────────────────────────────────────────────────────────────────┐');
      
      columns.forEach((col, index) => {
        const name = col.column_name.padEnd(30);
        const type = col.data_type.toUpperCase().padEnd(20);
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const defaultVal = col.column_default ? `DEFAULT: ${col.column_default.substring(0, 30)}` : '';
        
        console.log(`   │ ${(index + 1).toString().padStart(2)}. ${name} │ ${type}${maxLength.padEnd(8)} │ ${nullable.padEnd(9)} │ ${defaultVal.padEnd(25)} │`);
      });
      
      console.log('   └─────────────────────────────────────────────────────────────────────────────┘');

      // Get row count
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}";`);
      const rowCount = countResult[0].count;
      console.log(`\n   📊 Total Rows: ${rowCount}`);

      // Get primary keys
      const [primaryKeys] = await sequelize.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = '"${tableName}"'::regclass AND i.indisprimary;
      `);

      if (primaryKeys.length > 0) {
        console.log(`   🔑 Primary Key(s): ${primaryKeys.map(pk => pk.attname).join(', ')}`);
      }

      // Get foreign keys
      const [foreignKeys] = await sequelize.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${tableName}';
      `);

      if (foreignKeys.length > 0) {
        console.log(`   🔗 Foreign Key(s):`);
        foreignKeys.forEach(fk => {
          console.log(`      - ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }

      // Get indexes
      const [indexes] = await sequelize.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = '${tableName}'
        AND schemaname = 'public';
      `);

      if (indexes.length > 0) {
        console.log(`   📇 Indexes (${indexes.length}):`);
        indexes.forEach(idx => {
          console.log(`      - ${idx.indexname}`);
        });
      }

      console.log();
    }

    // Get ENUM types
    console.log('═'.repeat(100));
    console.log('🏷️  ENUM TYPES');
    console.log('═'.repeat(100));
    console.log();

    const [enums] = await sequelize.query(`
      SELECT 
        t.typname as enum_name,
        e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `);

    const enumGroups = {};
    enums.forEach(e => {
      if (!enumGroups[e.enum_name]) {
        enumGroups[e.enum_name] = [];
      }
      enumGroups[e.enum_name].push(e.enum_value);
    });

    Object.entries(enumGroups).forEach(([name, values]) => {
      console.log(`   📌 ${name}:`);
      console.log(`      Values: ${values.join(', ')}`);
      console.log();
    });

    // Summary
    console.log('═'.repeat(100));
    console.log('📈 DATABASE SUMMARY');
    console.log('═'.repeat(100));
    console.log();

    const [totalRows] = await sequelize.query(`
      SELECT 
        schemaname,
        SUM(n_live_tup) as total_rows
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      GROUP BY schemaname;
    `);

    if (totalRows.length > 0) {
      console.log(`   📊 Total Rows Across All Tables: ${totalRows[0].total_rows}`);
    }

    console.log(`   📋 Total Tables: ${tables.length}`);
    console.log(`   🏷️  Total ENUM Types: ${Object.keys(enumGroups).length}`);
    console.log();
    console.log('═'.repeat(100));

    console.log('\n✅ Database analysis completed successfully!\n');

  } catch (error) {
    console.error('❌ Error analyzing database:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the analysis
analyzeDatabaseSchema();

