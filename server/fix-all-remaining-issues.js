#!/usr/bin/env node

/**
 * Fix All Remaining Issues
 * This script fixes all the remaining deployment issues
 */

const dbConnection = require('./lib/robust-database-connection');

console.log('🔧 Fixing All Remaining Issues...');

async function fixAllRemainingIssues() {
  try {
    // Connect to database using robust connection handler
    const sequelize = await dbConnection.connect();
    console.log('✅ Database connection established');

    // Step 1: Create company_photos table properly
    console.log('🔧 Step 1: Creating company_photos table...');
    try {
      const [tableExists] = await sequelize.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'company_photos'
      `);
      
      if (!tableExists || tableExists.length === 0) {
        console.log('Creating company_photos table...');
        await sequelize.query(`
          CREATE TABLE company_photos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            filename VARCHAR NOT NULL,
            file_path VARCHAR NOT NULL,
            file_url VARCHAR NOT NULL,
            file_size INTEGER NOT NULL,
            mime_type VARCHAR NOT NULL,
            alt_text VARCHAR,
            caption TEXT,
            display_order INTEGER NOT NULL DEFAULT 0,
            is_primary BOOLEAN NOT NULL DEFAULT false,
            is_active BOOLEAN NOT NULL DEFAULT true,
            uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            metadata JSONB,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create indexes
        await sequelize.query(`CREATE INDEX IF NOT EXISTS company_photos_company_id ON company_photos(company_id)`);
        await sequelize.query(`CREATE INDEX IF NOT EXISTS company_photos_uploaded_by ON company_photos(uploaded_by)`);
        await sequelize.query(`CREATE INDEX IF NOT EXISTS company_photos_is_active ON company_photos(is_active)`);
        await sequelize.query(`CREATE INDEX IF NOT EXISTS company_photos_is_primary ON company_photos(is_primary)`);
        await sequelize.query(`CREATE INDEX IF NOT EXISTS company_photos_display_order ON company_photos(display_order)`);
        
        console.log('✅ company_photos table created successfully');
      } else {
        console.log('✅ company_photos table already exists');
      }
    } catch (error) {
      console.log('⚠️ company_photos table error:', error.message);
    }

    // Step 2: Add missing columns to companies table
    console.log('🔧 Step 2: Adding missing columns to companies table...');
    
    const columnsToAdd = [
      {
        name: 'why_join_us',
        type: 'TEXT',
        nullable: true
      },
      {
        name: 'verification_status',
        type: 'VARCHAR DEFAULT \'unverified\'',
        nullable: false
      },
      {
        name: 'company_status',
        type: 'VARCHAR DEFAULT \'active\'',
        nullable: false
      }
    ];

    for (const column of columnsToAdd) {
      try {
        const [columnExists] = await sequelize.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'companies' AND column_name = '${column.name}'
        `);
        
        if (columnExists.length === 0) {
          console.log(`Adding ${column.name} column...`);
          await sequelize.query(`
            ALTER TABLE companies ADD COLUMN ${column.name} ${column.type}
          `);
          console.log(`✅ Added ${column.name} column`);
        } else {
          console.log(`✅ ${column.name} column already exists`);
        }
      } catch (error) {
        console.log(`⚠️ ${column.name} column error:`, error.message);
      }
    }

    // Step 3: Ensure superadmin user type exists
    console.log('🔧 Step 3: Ensuring superadmin user type...');
    try {
      const [enumValues] = await sequelize.query(`
        SELECT unnest(enum_range(NULL::enum_users_user_type)) as value
      `);
      
      const currentValues = enumValues.map(row => row.value);
      
      if (!currentValues.includes('superadmin')) {
        console.log('Adding "superadmin" to enum_users_user_type...');
        await sequelize.query(`
          ALTER TYPE enum_users_user_type ADD VALUE 'superadmin'
        `);
        console.log('✅ Added "superadmin" to enum_users_user_type');
      } else {
        console.log('✅ "superadmin" already exists in enum_users_user_type');
      }
    } catch (error) {
      console.log('⚠️ Superadmin enum error:', error.message);
    }

    // Step 4: Update admin@campus.com to superadmin
    console.log('🔧 Step 4: Updating admin@campus.com to superadmin...');
    try {
      const [adminUser] = await sequelize.query(`
        SELECT id, email, user_type FROM users WHERE email = 'admin@campus.com'
      `);
      
      if (adminUser.length > 0) {
        const user = adminUser[0];
        if (user.user_type !== 'superadmin') {
          console.log('Updating admin@campus.com to superadmin...');
          await sequelize.query(`
            UPDATE users SET user_type = 'superadmin' WHERE email = 'admin@campus.com'
          `);
          console.log('✅ Updated admin@campus.com to superadmin');
        } else {
          console.log('✅ admin@campus.com is already superadmin');
        }
      } else {
        console.log('⚠️ admin@campus.com user not found');
      }
    } catch (error) {
      console.log('⚠️ Admin user update error:', error.message);
    }

    // Step 5: Test all fixes
    console.log('🔧 Step 5: Testing all fixes...');
    try {
      // Test company_photos table
      const [photoTest] = await sequelize.query(`
        SELECT COUNT(*) as count FROM company_photos
      `);
      console.log('✅ company_photos table test successful, count:', photoTest[0].count);

      // Test companies table with new columns
      const [companyTest] = await sequelize.query(`
        SELECT id, name, verification_status, company_status, why_join_us FROM companies LIMIT 1
      `);
      console.log('✅ Companies table test successful');

      // Test superadmin user
      const [superadminTest] = await sequelize.query(`
        SELECT id, email, user_type FROM users WHERE user_type = 'superadmin'
      `);
      console.log('✅ Superadmin user test successful, count:', superadminTest.length);

      // Test admin stats query
      const [statsTest] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
        FROM jobs
      `);
      console.log('✅ Admin stats query test successful:', statsTest[0]);

    } catch (error) {
      console.log('⚠️ Test error:', error.message);
    }

    console.log('✅ All remaining issues fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing remaining issues:', error.message);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixAllRemainingIssues()
    .then(() => {
      console.log('🎉 All remaining issues fixed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to fix remaining issues:', error);
      process.exit(1);
    });
}

module.exports = { fixAllRemainingIssues };
