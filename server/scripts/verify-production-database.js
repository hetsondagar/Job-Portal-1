/**
 * VERIFY PRODUCTION DATABASE COLUMNS
 * Checks if all hot vacancy columns exist in production
 */

const { Sequelize } = require('sequelize');

// Production database credentials
const sequelize = new Sequelize(
  'jobportal_dev_0u1u',
  'jobportal_dev_0u1u_user',
  'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
  {
    host: 'dpg-d372gajuibrs738lnm5g-a.oregon-postgres.render.com',
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
);

async function verifyProductionDatabase() {
  console.log('='.repeat(80));
  console.log('🔍 VERIFYING PRODUCTION DATABASE COLUMNS');
  console.log('='.repeat(80));
  console.log('');
  
  try {
    // Test connection
    console.log('🔌 Connecting to production database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully\n');
    
    // Expected hot vacancy columns
    const expectedColumns = [
      'ishotvacancy',
      'urgenthiring',
      'boostedsearch',
      'superfeatured',
      'multipleemailids',
      'externalapplyurl',
      'searchboostlevel',
      'cityspecificboost',
      'featuredkeywords',
      'videobanner',
      'whyworkwithus',
      'companyprofile',
      'companyreviews',
      'custombranding',
      'attachmentfiles',
      'officeimages',
      'proactivealerts',
      'alertradius',
      'alertfrequency',
      'hotvacancyprice',
      'hotvacancycurrency',
      'hotvacancypaymentstatus',
      'tierlevel',
      'autorefresh',
      'refreshdiscount'
    ];
    
    console.log('📋 Checking for hot vacancy columns in jobs table...\n');
    
    // Get all columns in jobs table
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs'
      ORDER BY column_name;
    `);
    
    const existingColumns = columns.map(col => col.column_name.toLowerCase());
    
    let allColumnsExist = true;
    const missingColumns = [];
    
    for (const expectedCol of expectedColumns) {
      if (existingColumns.includes(expectedCol)) {
        console.log(`✅ ${expectedCol}`);
      } else {
        console.log(`❌ ${expectedCol} - MISSING`);
        allColumnsExist = false;
        missingColumns.push(expectedCol);
      }
    }
    
    console.log('');
    console.log('='.repeat(80));
    
    if (allColumnsExist) {
      console.log('🎉 SUCCESS! All hot vacancy columns exist in production database!');
      console.log('');
      console.log('⚠️  IMPORTANT: Your Render backend server needs to be restarted!');
      console.log('');
      console.log('📋 Steps to restart on Render:');
      console.log('   1. Go to https://dashboard.render.com');
      console.log('   2. Click on your backend service');
      console.log('   3. Click "Manual Deploy" → "Clear build cache & deploy"');
      console.log('   OR');
      console.log('   3. Click "Restart Service" button');
      console.log('');
      console.log('   This will reload the server and pick up the new database columns.');
      console.log('   All 500 errors will be fixed after restart!');
    } else {
      console.log(`❌ MISSING ${missingColumns.length} COLUMNS!`);
      console.log('');
      console.log('Missing columns:');
      missingColumns.forEach(col => console.log(`   - ${col}`));
      console.log('');
      console.log('⚠️  Run the fix script again:');
      console.log('   node scripts/fix-production-now.js');
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  verifyProductionDatabase();
}

module.exports = verifyProductionDatabase;

