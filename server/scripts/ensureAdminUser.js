/**
 * Ensure Admin User Exists
 * Used by admin-setup routes to ensure admin user is created
 */

const { User } = require('../models');

async function ensureAdminUser() {
  try {
    console.log('🔧 Ensuring admin user exists...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@campus.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }

    // Create admin user if it doesn't exist
    console.log('📝 Creating new admin user...');
    const adminUser = await User.create({
      email: 'admin@campus.com',
      password: 'admin@123',
      first_name: 'System',
      last_name: 'Administrator',
      user_type: 'admin',
      is_active: true,
      is_email_verified: true,
      region: 'india',
      account_status: 'active',
      profile_completion: 100,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: admin@123');

    return adminUser;

  } catch (error) {
    console.error('❌ Error ensuring admin user:', error);
    throw error;
  }
}

module.exports = { ensureAdminUser };

