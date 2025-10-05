#!/usr/bin/env node

/**
 * Production Database Analysis Script
 * 
 * This script connects to the production database and analyzes:
 * - All tables in the database
 * - Fields/columns in each table
 * - Data types and constraints
 * - Indexes and relationships
 * 
 * IMPORTANT: This script is READ-ONLY and will NOT modify any data
 */

const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Production database connection details
const DB_CONFIG = {
  host: 'dpg-d372gajuibrs738lnm5g-a.frankfurt-postgres.render.com',
  database: 'jobportal_dev_0u1u',
  username: 'jobportal_dev_0u1u_user',
  password: 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
  port: 5432,
  dialect: 'postgres',
  logging: false, // Disable SQL logging for security
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(DB_CONFIG.database, DB_CONFIG.username, DB_CONFIG.password, {
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  dialect: DB_CONFIG.dialect,
  logging: DB_CONFIG.logging,
  pool: DB_CONFIG.pool,
  dialectOptions: DB_CONFIG.dialectOptions
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Successfully connected to production database');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
}

async function getTablesInfo() {
  try {
    console.log('🔍 Fetching all tables information...');
    
    // Query to get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`📊 Found ${tables.length} tables in the database`);
    return tables;
  } catch (error) {
    console.error('❌ Error fetching tables:', error.message);
    return [];
  }
}

async function getTableColumns(tableName) {
  try {
    // Query to get detailed column information
    const columns = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        datetime_precision
      FROM information_schema.columns 
      WHERE table_name = :tableName 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, {
      replacements: { tableName },
      type: Sequelize.QueryTypes.SELECT
    });
    
    return columns;
  } catch (error) {
    console.error(`❌ Error fetching columns for table ${tableName}:`, error.message);
    return [];
  }
}

async function getTableConstraints(tableName) {
  try {
    // Query to get constraints (primary keys, foreign keys, etc.)
    const constraints = await sequelize.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
      WHERE tc.table_name = :tableName
        AND tc.table_schema = 'public'
      ORDER BY tc.constraint_type, kcu.ordinal_position;
    `, {
      replacements: { tableName },
      type: Sequelize.QueryTypes.SELECT
    });
    
    return constraints;
  } catch (error) {
    console.error(`❌ Error fetching constraints for table ${tableName}:`, error.message);
    return [];
  }
}

async function getTableIndexes(tableName) {
  try {
    // Query to get indexes
    const indexes = await sequelize.query(`
      SELECT 
        indexname,
        indexdef,
        schemaname
      FROM pg_indexes 
      WHERE tablename = :tableName
        AND schemaname = 'public'
      ORDER BY indexname;
    `, {
      replacements: { tableName },
      type: Sequelize.QueryTypes.SELECT
    });
    
    return indexes;
  } catch (error) {
    console.error(`❌ Error fetching indexes for table ${tableName}:`, error.message);
    return [];
  }
}

async function getTableRowCount(tableName) {
  try {
    const result = await sequelize.query(`
      SELECT COUNT(*) as count FROM "${tableName}";
    `, {
      type: Sequelize.QueryTypes.SELECT
    });
    
    return result[0].count;
  } catch (error) {
    console.error(`❌ Error fetching row count for table ${tableName}:`, error.message);
    return 'N/A';
  }
}

function formatDataType(column) {
  let dataType = column.data_type;
  
  // Add length/precision information
  if (column.character_maximum_length) {
    dataType += `(${column.character_maximum_length})`;
  } else if (column.numeric_precision && column.numeric_scale) {
    dataType += `(${column.numeric_precision},${column.numeric_scale})`;
  } else if (column.numeric_precision) {
    dataType += `(${column.numeric_precision})`;
  } else if (column.datetime_precision) {
    dataType += `(${column.datetime_precision})`;
  }
  
  return dataType;
}

function formatDefaultValue(defaultValue) {
  if (!defaultValue) return null;
  
  // Clean up default values
  if (typeof defaultValue === 'string') {
    // Remove function calls and clean up
    if (defaultValue.includes('nextval')) return 'AUTO_INCREMENT';
    if (defaultValue.includes('now()')) return 'CURRENT_TIMESTAMP';
    if (defaultValue.includes("'::")) {
      return defaultValue.split("'::")[0] + "'";
    }
  }
  
  return defaultValue;
}

async function analyzeDatabase() {
  console.log('🚀 Starting Production Database Analysis');
  console.log('=' .repeat(60));
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  console.log('');
  
  // Get all tables
  const tables = await getTablesInfo();
  
  if (tables.length === 0) {
    console.log('❌ No tables found in the database');
    await sequelize.close();
    return;
  }
  
  // Create analysis report
  const analysisReport = {
    database: DB_CONFIG.database,
    host: DB_CONFIG.host,
    analyzedAt: new Date().toISOString(),
    totalTables: tables.length,
    tables: {}
  };
  
  console.log(`📋 Analyzing ${tables.length} tables...`);
  console.log('');
  
  // Analyze each table
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    console.log(`[${i + 1}/${tables.length}] Analyzing table: ${table.table_name}`);
    
    try {
      // Get table information
      const [columns, constraints, indexes, rowCount] = await Promise.all([
        getTableColumns(table.table_name),
        getTableConstraints(table.table_name),
        getTableIndexes(table.table_name),
        getTableRowCount(table.table_name)
      ]);
      
      // Format table analysis
      const tableAnalysis = {
        name: table.table_name,
        schema: table.table_schema,
        rowCount: rowCount,
        columns: columns.map(col => ({
          name: col.column_name,
          dataType: formatDataType(col),
          nullable: col.is_nullable === 'YES',
          defaultValue: formatDefaultValue(col.column_default)
        })),
        constraints: constraints.map(con => ({
          name: con.constraint_name,
          type: con.constraint_type,
          column: con.column_name,
          foreignTable: con.foreign_table_name,
          foreignColumn: con.foreign_column_name
        })),
        indexes: indexes.map(idx => ({
          name: idx.indexname,
          definition: idx.indexdef
        }))
      };
      
      analysisReport.tables[table.table_name] = tableAnalysis;
      
      // Display table summary
      console.log(`  📊 Rows: ${rowCount}`);
      console.log(`  📝 Columns: ${columns.length}`);
      console.log(`  🔗 Constraints: ${constraints.length}`);
      console.log(`  📇 Indexes: ${indexes.length}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error analyzing table ${table.table_name}:`, error.message);
      analysisReport.tables[table.table_name] = {
        name: table.table_name,
        error: error.message
      };
    }
  }
  
  // Save detailed report to file
  const reportPath = path.join(__dirname, 'production-db-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysisReport, null, 2));
  console.log(`💾 Detailed analysis saved to: ${reportPath}`);
  
  // Display summary
  console.log('=' .repeat(60));
  console.log('📊 DATABASE ANALYSIS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`🗄️  Database: ${analysisReport.database}`);
  console.log(`🌐 Host: ${analysisReport.host}`);
  console.log(`📅 Analyzed: ${new Date(analysisReport.analyzedAt).toLocaleString()}`);
  console.log(`📋 Total Tables: ${analysisReport.totalTables}`);
  console.log('');
  
  console.log('📋 TABLE SUMMARY:');
  console.log('-' .repeat(60));
  console.log('Table Name'.padEnd(30) + 'Columns'.padEnd(10) + 'Rows'.padEnd(15) + 'Constraints'.padEnd(12) + 'Indexes');
  console.log('-'.repeat(80));
  
  Object.values(analysisReport.tables).forEach(table => {
    if (table.error) {
      console.log(`${table.name}`.padEnd(30) + 'ERROR'.padEnd(10) + 'N/A'.padEnd(15) + 'N/A'.padEnd(12) + 'N/A');
    } else {
      console.log(
        `${table.name}`.padEnd(30) + 
        `${table.columns.length}`.padEnd(10) + 
        `${table.rowCount}`.padEnd(15) + 
        `${table.constraints.length}`.padEnd(12) + 
        `${table.indexes.length}`
      );
    }
  });
  
  console.log('');
  console.log('✅ Database analysis completed successfully!');
  
  // Close connection
  await sequelize.close();
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT, closing database connection...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
  process.exit(0);
});

// Run the analysis
if (require.main === module) {
  analyzeDatabase().catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = {
  analyzeDatabase,
  testConnection,
  getTablesInfo,
  getTableColumns,
  getTableConstraints,
  getTableIndexes,
  getTableRowCount
};
