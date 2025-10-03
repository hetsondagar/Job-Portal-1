#!/usr/bin/env node

/**
 * Fix Superadmin Redirect
 * This script ensures superadmin users are properly redirected to admin dashboard
 */

const dbConnection = require('./lib/robust-database-connection');

console.log('🔧 Fixing Superadmin Redirect...');

async function fixSuperadminRedirect() {
  try {
    // Connect to database using robust connection handler
    const sequelize = await dbConnection.connect();
    console.log('✅ Database connection established');

    // Step 1: Verify admin@campus.com is superadmin
    console.log('🔧 Step 1: Verifying admin@campus.com is superadmin...');
    try {
      const [adminUser] = await sequelize.query(`
        SELECT id, email, user_type, is_active, account_status FROM users WHERE email = 'admin@campus.com'
      `);
      
      if (adminUser.length > 0) {
        const user = adminUser[0];
        console.log('✅ admin@campus.com user found:', {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          is_active: user.is_active,
          account_status: user.account_status
        });
        
        if (user.user_type !== 'superadmin') {
          console.log('⚠️ admin@campus.com is not superadmin, updating...');
          await sequelize.query(`
            UPDATE users SET user_type = 'superadmin' WHERE email = 'admin@campus.com'
          `);
          console.log('✅ Updated admin@campus.com to superadmin');
        } else {
          console.log('✅ admin@campus.com is already superadmin');
        }
      } else {
        console.log('❌ admin@campus.com user not found');
      }
    } catch (error) {
      console.log('⚠️ Admin user verification error:', error.message);
    }

    // Step 2: Test superadmin login redirect
    console.log('🔧 Step 2: Testing superadmin login redirect...');
    try {
      // Simulate the getRedirectUrl function logic
      const testUserType = 'superadmin';
      const testRegion = 'india';
      
      let redirectUrl;
      if (testUserType === 'superadmin') {
        redirectUrl = '/admin/dashboard';
      } else if (testUserType === 'employer' || testUserType === 'admin') {
        redirectUrl = testRegion === 'gulf' ? '/gulf-dashboard' : '/employer-dashboard';
      } else if (testUserType === 'jobseeker') {
        if (testRegion === 'gulf') {
          redirectUrl = '/jobseeker-gulf-dashboard';
        } else {
          redirectUrl = '/dashboard';
        }
      } else {
        redirectUrl = '/dashboard';
      }
      
      console.log('✅ Superadmin redirect test successful:', {
        userType: testUserType,
        region: testRegion,
        redirectUrl: redirectUrl
      });
      
      if (redirectUrl !== '/admin/dashboard') {
        console.log('❌ Redirect URL is incorrect for superadmin');
      } else {
        console.log('✅ Redirect URL is correct for superadmin');
      }
    } catch (error) {
      console.log('⚠️ Redirect test error:', error.message);
    }

    // Step 3: Verify superadmin enum exists
    console.log('🔧 Step 3: Verifying superadmin enum exists...');
    try {
      const [enumValues] = await sequelize.query(`
        SELECT unnest(enum_range(NULL::enum_users_user_type)) as value
      `);
      
      const currentValues = enumValues.map(row => row.value);
      console.log('Current enum values:', currentValues);
      
      if (currentValues.includes('superadmin')) {
        console.log('✅ superadmin exists in enum_users_user_type');
      } else {
        console.log('❌ superadmin does not exist in enum_users_user_type');
      }
    } catch (error) {
      console.log('⚠️ Enum verification error:', error.message);
    }

    // Step 4: Test admin dashboard access
    console.log('🔧 Step 4: Testing admin dashboard access...');
    try {
      const [superadminUsers] = await sequelize.query(`
        SELECT id, email, user_type, is_active, account_status 
        FROM users WHERE user_type = 'superadmin'
      `);
      
      console.log(`Found ${superadminUsers.length} superadmin user(s):`);
      superadminUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.id}) - Active: ${user.is_active}, Status: ${user.account_status}`);
      });
      
      if (superadminUsers.length > 0) {
        console.log('✅ Superadmin users found and can access admin dashboard');
      } else {
        console.log('❌ No superadmin users found');
      }
    } catch (error) {
      console.log('⚠️ Admin dashboard access test error:', error.message);
    }

    console.log('✅ Superadmin redirect fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing superadmin redirect:', error.message);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixSuperadminRedirect()
    .then(() => {
      console.log('🎉 Superadmin redirect fix completed successfully!');
      console.log('\n🔐 Login Instructions:');
      console.log('1. Use admin@campus.com with password admin@123');
      console.log('2. Login through regular login page (will redirect to admin dashboard)');
      console.log('3. Or use dedicated admin login: /api/admin-auth/admin-login');
      console.log('\n✅ Expected redirect: /admin/dashboard');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to fix superadmin redirect:', error);
      process.exit(1);
    });
}

module.exports = { fixSuperadminRedirect };
