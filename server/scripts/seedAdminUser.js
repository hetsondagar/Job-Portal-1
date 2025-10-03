/**
 * Script to seed the default admin user
 * Run this script to create the admin@campus.com user
 */

const { User } = require('../models');

async function seedAdminUser() {
  try {
    console.log('🌱 Starting admin user seeding...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@campus.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 User Type:', existingAdmin.user_type);
      console.log('🔐 Status:', existingAdmin.is_active ? 'Active' : 'Inactive');
      return;
    }

    // Create admin user (password will be hashed by the model)
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
    console.log('👤 Name:', `${adminUser.first_name} ${adminUser.last_name}`);
    console.log('🔑 User Type:', adminUser.user_type);
    console.log('🌍 Region:', adminUser.region);
    console.log('✅ Status:', adminUser.is_active ? 'Active' : 'Inactive');
    console.log('🆔 User ID:', adminUser.id);

    console.log('\n🔐 Login Credentials:');
    console.log('Email: admin@campus.com');
    console.log('Password: admin@123');
    console.log('\n⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedAdminUser()
    .then(() => {
      console.log('\n✅ Admin user seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Admin user seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAdminUser };
