require('dotenv').config();
const User = require('./models/User');
const Company = require('./models/Company');
const { sequelize } = require('./config/sequelize');

console.log('🧹 Clearing OAuth User History');
console.log('==============================\n');

async function clearOAuthHistory() {
  try {
    console.log('🔍 Finding all OAuth users...');
    
    // Find all users with OAuth providers
    const oauthUsers = await User.findAll({
      where: {
        oauth_provider: ['google', 'facebook']
      }
    });
    
    console.log(`📊 Found ${oauthUsers.length} OAuth users`);
    
    if (oauthUsers.length === 0) {
      console.log('✅ No OAuth users found to clear');
      return;
    }
    
    // Display current OAuth users
    console.log('\n📋 Current OAuth Users:');
    oauthUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.oauth_provider}) - Type: ${user.user_type}`);
    });
    
    console.log('\n🗑️ Clearing OAuth user history...');
    
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Clear OAuth fields for all OAuth users
      await User.update({
        oauth_provider: null,
        oauth_id: null,
        oauth_access_token: null,
        oauth_refresh_token: null,
        oauth_token_expires_at: null
      }, {
        where: {
          oauth_provider: ['google', 'facebook']
        },
        transaction
      });
      
      console.log('✅ OAuth fields cleared for all users');
      
      // Reset user types to jobseeker (default)
      await User.update({
        user_type: 'jobseeker'
      }, {
        where: {
          oauth_provider: null
        },
        transaction
      });
      
      console.log('✅ User types reset to jobseeker');
      
      // Commit the transaction
      await transaction.commit();
      
      console.log('✅ Transaction committed successfully');
      
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
    
    // Verify the cleanup
    const remainingOAuthUsers = await User.findAll({
      where: {
        oauth_provider: ['google', 'facebook']
      }
    });
    
    console.log(`\n📊 Verification: ${remainingOAuthUsers.length} users still have OAuth data`);
    
    if (remainingOAuthUsers.length === 0) {
      console.log('✅ All OAuth user history cleared successfully!');
    } else {
      console.log('⚠️ Some OAuth users still exist:');
      remainingOAuthUsers.forEach(user => {
        console.log(`- ${user.email} (${user.oauth_provider})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error clearing OAuth history:', error);
  }
}

async function resetEmployerUsers() {
  try {
    console.log('\n🔄 Resetting employer users...');
    
    // Find all employer users
    const employerUsers = await User.findAll({
      where: {
        user_type: 'employer'
      }
    });
    
    console.log(`📊 Found ${employerUsers.length} employer users`);
    
    if (employerUsers.length === 0) {
      console.log('✅ No employer users found to reset');
      return;
    }
    
    // Display current employer users
    console.log('\n📋 Current Employer Users:');
    employerUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Company ID: ${user.company_id}`);
    });
    
    // Reset employer users to jobseeker
    await User.update({
      user_type: 'jobseeker',
      company_id: null
    }, {
      where: {
        user_type: 'employer'
      }
    });
    
    console.log('✅ All employer users reset to jobseeker');
    
  } catch (error) {
    console.error('❌ Error resetting employer users:', error);
  }
}

async function runCleanup() {
  console.log('🚀 Starting OAuth history cleanup...\n');
  
  // Clear OAuth history
  await clearOAuthHistory();
  
  // Reset employer users
  await resetEmployerUsers();
  
  console.log('\n🎉 Cleanup completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. All OAuth user history has been cleared');
  console.log('2. All users have been reset to jobseeker type');
  console.log('3. When users log in via OAuth again, they will be treated as new users');
  console.log('4. Employer OAuth flow will now work correctly');
  
  console.log('\n🔧 Manual Testing Steps:');
  console.log('1. Go to http://localhost:3000/employer-login');
  console.log('2. Click on "Google" OAuth button');
  console.log('3. Complete Google OAuth flow');
  console.log('4. Verify you are redirected to /employer-dashboard');
  console.log('5. Check that user type is set to "employer"');
  
  process.exit(0);
}

// Run the cleanup
runCleanup().catch(console.error);
