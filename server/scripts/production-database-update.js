/**
 * PRODUCTION DATABASE UPDATE SCRIPT
 * Safely adds all hot vacancy features to the production database
 * 
 * This script:
 * - Checks if columns exist before adding them
 * - Handles PostgreSQL lowercase column names
 * - Provides detailed logging
 * - Safe to run multiple times (idempotent)
 * 
 * Usage: node scripts/production-database-update.js
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration - reads from environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.DATABASE_NAME,
  process.env.DB_USER || process.env.DATABASE_USER,
  process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
  {
    host: process.env.DB_HOST || process.env.DATABASE_HOST,
    port: process.env.DB_PORT || process.env.DATABASE_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  let color = colors.reset;
  let prefix = 'ℹ️';
  
  switch(type) {
    case 'success':
      color = colors.green;
      prefix = '✅';
      break;
    case 'error':
      color = colors.red;
      prefix = '❌';
      break;
    case 'warning':
      color = colors.yellow;
      prefix = '⚠️';
      break;
    case 'info':
      color = colors.cyan;
      prefix = 'ℹ️';
      break;
  }
  
  console.log(`${color}${prefix} [${timestamp}] ${message}${colors.reset}`);
}

async function columnExists(tableName, columnName) {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}' 
      AND column_name = '${columnName.toLowerCase()}'
    `);
    return results.length > 0;
  } catch (error) {
    log(`Error checking if column ${columnName} exists: ${error.message}`, 'error');
    return false;
  }
}

async function addColumn(tableName, columnName, columnType, allowNull = true, defaultValue = null) {
  try {
    const exists = await columnExists(tableName, columnName);
    
    if (exists) {
      log(`Column ${columnName} already exists in ${tableName}`, 'warning');
      return { success: true, existed: true };
    }
    
    let sqlType = columnType;
    let defaultClause = '';
    
    // Handle default values
    if (defaultValue !== null && defaultValue !== undefined) {
      if (typeof defaultValue === 'boolean') {
        defaultClause = ` DEFAULT ${defaultValue}`;
      } else if (typeof defaultValue === 'number') {
        defaultClause = ` DEFAULT ${defaultValue}`;
      } else if (typeof defaultValue === 'string') {
        defaultClause = ` DEFAULT '${defaultValue}'`;
      } else if (Array.isArray(defaultValue)) {
        defaultClause = ` DEFAULT '[]'::jsonb`;
      } else if (typeof defaultValue === 'object') {
        defaultClause = ` DEFAULT '{}'::jsonb`;
      }
    }
    
    const nullClause = allowNull ? '' : ' NOT NULL';
    
    const sql = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName.toLowerCase()} ${sqlType}${nullClause}${defaultClause}`;
    
    await sequelize.query(sql);
    log(`Successfully added column ${columnName} to ${tableName}`, 'success');
    return { success: true, existed: false };
  } catch (error) {
    log(`Failed to add column ${columnName} to ${tableName}: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function updateProductionDatabase() {
  log('='.repeat(80), 'info');
  log('🚀 PRODUCTION DATABASE UPDATE - HOT VACANCY FEATURES', 'info');
  log('='.repeat(80), 'info');
  log('', 'info');
  
  try {
    // Test database connection
    log('Testing database connection...', 'info');
    await sequelize.authenticate();
    log('Database connection established successfully', 'success');
    log('', 'info');
    
    // Define all hot vacancy columns to add to jobs table
    const hotVacancyColumns = [
      // Core hot vacancy fields
      { name: 'isHotVacancy', type: 'BOOLEAN', defaultValue: false },
      { name: 'urgentHiring', type: 'BOOLEAN', defaultValue: false },
      { name: 'boostedSearch', type: 'BOOLEAN', defaultValue: false },
      { name: 'superFeatured', type: 'BOOLEAN', defaultValue: false },
      
      // Communication fields
      { name: 'multipleEmailIds', type: 'JSONB', defaultValue: [] },
      { name: 'externalApplyUrl', type: 'VARCHAR(255)', defaultValue: null },
      
      // Search and visibility fields
      { name: 'searchBoostLevel', type: "VARCHAR(20) CHECK (searchboostlevel IN ('standard', 'premium', 'super', 'city-specific'))", defaultValue: 'standard' },
      { name: 'citySpecificBoost', type: 'JSONB', defaultValue: [] },
      { name: 'featuredKeywords', type: 'JSONB', defaultValue: [] },
      
      // Content fields
      { name: 'videoBanner', type: 'VARCHAR(255)', defaultValue: null },
      { name: 'whyWorkWithUs', type: 'TEXT', defaultValue: null },
      { name: 'companyProfile', type: 'TEXT', defaultValue: null },
      { name: 'companyReviews', type: 'JSONB', defaultValue: [] },
      { name: 'customBranding', type: 'JSONB', defaultValue: {} },
      
      // File management fields
      { name: 'attachmentFiles', type: 'JSONB', defaultValue: [] },
      { name: 'officeImages', type: 'JSONB', defaultValue: [] },
      
      // Automation fields
      { name: 'autoRefresh', type: 'BOOLEAN', defaultValue: false },
      { name: 'refreshDiscount', type: 'DECIMAL(10,2)', defaultValue: 0 },
      { name: 'proactiveAlerts', type: 'BOOLEAN', defaultValue: false },
      { name: 'alertRadius', type: 'INTEGER', defaultValue: 50 },
      { name: 'alertFrequency', type: "VARCHAR(20) CHECK (alertfrequency IN ('immediate', 'daily', 'weekly'))", defaultValue: 'immediate' },
      
      // Pricing fields
      { name: 'hotVacancyPrice', type: 'DECIMAL(10,2)', defaultValue: null },
      { name: 'hotVacancyCurrency', type: 'VARCHAR(10)', defaultValue: 'INR' },
      { name: 'hotVacancyPaymentStatus', type: "VARCHAR(20) CHECK (hotvacancypaymentstatus IN ('pending', 'paid', 'failed', 'refunded'))", defaultValue: 'pending' },
      
      // Tier field
      { name: 'tierLevel', type: "VARCHAR(20) CHECK (tierlevel IN ('basic', 'premium', 'enterprise', 'super-premium'))", defaultValue: 'basic' }
    ];
    
    log('Adding hot vacancy columns to jobs table...', 'info');
    log('', 'info');
    
    const results = {
      added: 0,
      existed: 0,
      failed: 0
    };
    
    for (const column of hotVacancyColumns) {
      const result = await addColumn('jobs', column.name, column.type, true, column.defaultValue);
      
      if (result.success) {
        if (result.existed) {
          results.existed++;
        } else {
          results.added++;
        }
      } else {
        results.failed++;
      }
    }
    
    log('', 'info');
    log('='.repeat(80), 'info');
    log('📊 SUMMARY', 'info');
    log('='.repeat(80), 'info');
    log(`✅ Columns added: ${results.added}`, 'success');
    log(`ℹ️  Columns already existed: ${results.existed}`, 'warning');
    log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'info');
    log('', 'info');
    
    if (results.failed === 0) {
      log('🎉 Production database update completed successfully!', 'success');
      log('✅ All hot vacancy features are now available in production', 'success');
      log('🚀 Your application is ready to use hot vacancy features!', 'success');
    } else {
      log('⚠️  Some columns failed to add. Please check the errors above.', 'warning');
      log('💡 The script is safe to re-run to retry failed columns.', 'info');
    }
    
    log('', 'info');
    log('='.repeat(80), 'info');
    
  } catch (error) {
    log('', 'info');
    log('❌ DATABASE UPDATE FAILED', 'error');
    log(`Error: ${error.message}`, 'error');
    log('', 'info');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      log('💡 Connection Error - Please check:', 'warning');
      log('  1. Database host and port are correct', 'info');
      log('  2. Database is running and accessible', 'info');
      log('  3. Firewall allows connections', 'info');
      log('  4. Database credentials are correct', 'info');
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the update
if (require.main === module) {
  updateProductionDatabase()
    .then(() => {
      log('Script execution completed', 'info');
      process.exit(0);
    })
    .catch(error => {
      log(`Script execution failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { updateProductionDatabase };
