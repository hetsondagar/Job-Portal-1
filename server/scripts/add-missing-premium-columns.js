#!/usr/bin/env node

/**
 * Add Missing Premium Columns to Production
 * 
 * This script adds all missing premium hot vacancy columns
 * directly to the production database.
 */

const {sequelize} = require('../config/sequelize');

async function addMissingColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to production database\n');
    console.log('🔧 Adding missing premium feature columns...\n');
    
    const columnsToAdd = [
      {
        name: 'hiringtimeline',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hiringtimeline VARCHAR(20) CHECK (hiringtimeline IN ('immediate', '1-week', '2-weeks', '1-month'))`
      },
      {
        name: 'maxapplications',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS maxapplications INTEGER`
      },
      {
        name: 'applicationdeadline',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applicationdeadline TIMESTAMP WITH TIME ZONE`
      },
      {
        name: 'pricingtier',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pricingtier VARCHAR(20) CHECK (pricingtier IN ('basic', 'premium', 'enterprise', 'super-premium'))`
      },
      {
        name: 'paymentid',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS paymentid VARCHAR(255)`
      },
      {
        name: 'paymentdate',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS paymentdate TIMESTAMP WITH TIME ZONE`
      },
      {
        name: 'prioritylisting',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS prioritylisting BOOLEAN DEFAULT false`
      },
      {
        name: 'featuredbadge',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS featuredbadge BOOLEAN DEFAULT false`
      },
      {
        name: 'unlimitedapplications',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS unlimitedapplications BOOLEAN DEFAULT false`
      },
      {
        name: 'advancedanalytics',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS advancedanalytics BOOLEAN DEFAULT false`
      },
      {
        name: 'candidatematching',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS candidatematching BOOLEAN DEFAULT false`
      },
      {
        name: 'directcontact',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS directcontact BOOLEAN DEFAULT false`
      },
      {
        name: 'seotitle',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seotitle VARCHAR(255)`
      },
      {
        name: 'seodescription',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seodescription TEXT`
      },
      {
        name: 'keywords',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS keywords JSONB DEFAULT '[]'`
      },
      {
        name: 'impressions',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0`
      },
      {
        name: 'clicks',
        sql: `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0`
      }
    ];
    
    for (const col of columnsToAdd) {
      try {
        await sequelize.query(col.sql);
        console.log(`✅ Added column: ${col.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Column ${col.name} already exists`);
        } else {
          console.error(`❌ Failed to add ${col.name}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ All missing columns added successfully!\n');
    
    // Verify
    const [result] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs'
        AND column_name IN (
          'hiringtimeline', 'maxapplications', 'applicationdeadline',
          'pricingtier', 'paymentid', 'paymentdate', 'prioritylisting',
          'featuredbadge', 'unlimitedapplications', 'advancedanalytics',
          'candidatematching', 'directcontact', 'seotitle', 'seodescription',
          'keywords', 'impressions', 'clicks'
        )
      ORDER BY column_name
    `);
    
    console.log('📋 Verification - Columns now present:');
    result.forEach(r => console.log('  ✅', r.column_name));
    console.log(`\n📊 Total: ${result.length}/17 premium columns added\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addMissingColumns();

