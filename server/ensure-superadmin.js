#!/usr/bin/env node

/**
 * Ensure Superadmin
 * This script ensures admin@campus.com is set as superadmin
 */

const dbConnection = require('./lib/robust-database-connection');

console.log('🔧 Ensuring Superadmin Setup...');

async function ensureSuperadmin() {
  try {
    // Connect to database using robust connection handler
    const sequelize = await dbConnection.connect();
    console.log('✅ Database connection established');

    // Step 1: Ensure superadmin user type exists
    console.log('🔧 Step 1: Ensuring superadmin user type...');
    try {
      const [enumValues] = await sequelize.query(`
        SELECT unnest(enum_range(NULL::enum_users_user_type)) as value
      `);
      
      const currentValues = enumValues.map(row => row.value);
      console.log('Current enum values:', currentValues);
      
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

    // Step 2: Check if admin@campus.com exists
    console.log('🔧 Step 2: Checking admin@campus.com user...');
    try {
      const [adminUser] = await sequelize.query(`
        SELECT id, email, user_type, is_active, account_status FROM users WHERE email = 'admin@campus.com'
      `);
      
      if (adminUser.length === 0) {
        console.log('❌ admin@campus.com user not found. Creating...');
        
        // Create admin user
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin@123', 12);
        
        await sequelize.query(`
          INSERT INTO users (
            id, email, password, first_name, last_name, user_type, 
            is_active, is_email_verified, account_status, region, 
            profile_completion, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), 'admin@campus.com', $1, 'System', 'Administrator', 'superadmin',
            true, true, 'active', 'india', 100, NOW(), NOW()
          )
        `, {
          bind: [hashedPassword]
        });
        
        console.log('✅ Created admin@campus.com as superadmin');
      } else {
        const user = adminUser[0];
        console.log('✅ admin@campus.com user found:', {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          is_active: user.is_active,
          account_status: user.account_status
        });
        
        // Update to superadmin if not already
        if (user.user_type !== 'superadmin') {
          console.log('Updating admin@campus.com to superadmin...');
          await sequelize.query(`
            UPDATE users SET user_type = 'superadmin' WHERE email = 'admin@campus.com'
          `);
          console.log('✅ Updated admin@campus.com to superadmin');
        } else {
          console.log('✅ admin@campus.com is already superadmin');
        }
        
        // Ensure account is active
        if (!user.is_active || user.account_status !== 'active') {
          console.log('Activating admin@campus.com account...');
          await sequelize.query(`
            UPDATE users SET is_active = true, account_status = 'active' WHERE email = 'admin@campus.com'
          `);
          console.log('✅ Activated admin@campus.com account');
        }
      }
    } catch (error) {
      console.log('⚠️ Admin user setup error:', error.message);
    }

    // Step 3: Test superadmin access
    console.log('🔧 Step 3: Testing superadmin access...');
    try {
      const [superadminTest] = await sequelize.query(`
        SELECT id, email, user_type, is_active, account_status 
        FROM users WHERE user_type = 'superadmin' AND email = 'admin@campus.com'
      `);
      
      if (superadminTest.length > 0) {
        const user = superadminTest[0];
        console.log('✅ Superadmin test successful:', {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          is_active: user.is_active,
          account_status: user.account_status
        });
      } else {
        console.log('❌ Superadmin test failed - user not found');
      }
    } catch (error) {
      console.log('⚠️ Superadmin test error:', error.message);
    }

    // Step 4: Verify no other superadmin users exist
    console.log('🔧 Step 4: Checking for other superadmin users...');
    try {
      const [allSuperadmins] = await sequelize.query(`
        SELECT id, email, user_type, created_at 
        FROM users WHERE user_type = 'superadmin'
        ORDER BY created_at
      `);
      
      console.log(`Found ${allSuperadmins.length} superadmin user(s):`);
      allSuperadmins.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.id}) - Created: ${user.created_at}`);
      });
      
      if (allSuperadmins.length > 1) {
        console.log('⚠️ Warning: Multiple superadmin users found. Consider reviewing access.');
      }
    } catch (error) {
      console.log('⚠️ Superadmin count error:', error.message);
    }

    console.log('✅ Superadmin setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error ensuring superadmin setup:', error.message);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

// Run the setup
if (require.main === module) {
  ensureSuperadmin()
    .then(() => {
      console.log('🎉 Superadmin setup completed successfully!');
      console.log('\n🔐 Admin Login Credentials:');
      console.log('Email: admin@campus.com');
      console.log('Password: admin@123');
      console.log('User Type: superadmin');
      console.log('\n⚠️  Please change the default password after first login!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to ensure superadmin setup:', error);
      process.exit(1);
    });
}

module.exports = { ensureSuperadmin };
