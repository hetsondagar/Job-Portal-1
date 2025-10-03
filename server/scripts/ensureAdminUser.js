/**
 * Production-ready script to ensure admin user exists
 * This script can be run manually or via API endpoint
 */

const { User } = require('../models');

async function ensureAdminUser() {
  try {
    console.log('🔍 Checking for admin user...');

    // Check if admin user exists
    let adminUser = await User.findOne({
      where: { email: 'admin@campus.com' }
    });

    if (adminUser) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 User Type:', adminUser.user_type);
      console.log('🔐 Status:', adminUser.is_active ? 'Active' : 'Inactive');
      
      // Ensure user is admin and active
      if (adminUser.user_type !== 'admin' || !adminUser.is_active) {
        console.log('🔄 Updating admin user status...');
        await adminUser.update({
          user_type: 'admin',
          is_active: true,
          is_email_verified: true
        });
        console.log('✅ Admin user updated successfully');
      }
      
      return adminUser;
    }

    // Create admin user if it doesn't exist
    console.log('🆕 Creating admin user...');
    adminUser = await User.create({
      email: 'admin@campus.com',
      password: 'admin@123',
      first_name: 'System',
      last_name: 'Administrator',
      user_type: 'admin',
      is_active: true,
      is_email_verified: true,
      region: 'india',
      account_status: 'active',
      profile_completion: 100
    });

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', `${adminUser.first_name} ${adminUser.last_name}`);
    console.log('🔑 User Type:', adminUser.user_type);
    console.log('🆔 User ID:', adminUser.id);

    return adminUser;

  } catch (error) {
    console.error('❌ Error ensuring admin user:', error);
    throw error;
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  ensureAdminUser()
    .then(() => {
      console.log('\n✅ Admin user check completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Admin user check failed:', error);
      process.exit(1);
    });
}

module.exports = { ensureAdminUser };
