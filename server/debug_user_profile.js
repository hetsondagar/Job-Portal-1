/**
 * Debug User Profile - Check specific user's profile completion status
 */

const { User } = require('./models');

async function debugUserProfile() {
  console.log('🔍 Debugging User Profile for hxx@gmail.com...\n');

  try {
    // Find the specific user
    const user = await User.findOne({
      where: { email: 'hxx@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found: hxx@gmail.com');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      phone: user.phone,
      designation: user.designation,
      companyId: user.companyId
    });

    console.log('\n🔍 Current Preferences:');
    console.log(JSON.stringify(user.preferences, null, 2));

    console.log('\n🔍 Profile Completion Status:');
    console.log('profileCompleted:', user.preferences?.profileCompleted);
    console.log('profileCompletion:', user.profileCompletion);
    console.log('lastProfileUpdate:', user.lastProfileUpdate);

    // Check if profile is actually complete
    const hasPhone = !!user.phone;
    const hasDesignation = !!user.designation;
    const hasCompanyId = !!user.companyId;
    const isAdmin = user.user_type === 'admin';
    
    const hasRequiredFields = hasPhone && hasDesignation && (hasCompanyId || isAdmin);
    
    console.log('\n🔍 Required Fields Check:');
    console.log('Phone:', hasPhone, user.phone);
    console.log('Designation:', hasDesignation, user.designation);
    console.log('Company ID:', hasCompanyId, user.companyId);
    console.log('Is Admin:', isAdmin);
    console.log('Has Required Fields:', hasRequiredFields);

    // Fix the profile completion if needed
    if (hasRequiredFields && !user.preferences?.profileCompleted) {
      console.log('\n🔧 FIXING: Setting profileCompleted to true...');
      
      const currentPreferences = user.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        profileCompleted: true
      };

      await user.update({
        preferences: updatedPreferences,
        lastProfileUpdate: new Date()
      });

      console.log('✅ Profile completion status updated!');
      console.log('New preferences:', JSON.stringify(updatedPreferences, null, 2));
    } else if (user.preferences?.profileCompleted) {
      console.log('✅ Profile is already marked as completed');
    } else {
      console.log('⚠️ Profile is not complete - missing required fields');
    }

  } catch (error) {
    console.error('❌ Error debugging user profile:', error);
  } finally {
    process.exit(0);
  }
}

debugUserProfile();
