/**
 * Test Script: Check Sheikh's Company Data
 * Tests the company creator detection logic
 */

const { sequelize } = require('./config/sequelize');
const User = require('./models/User');
const Company = require('./models/Company');

async function testSheikhCompany() {
  try {
    console.log('🔍 Testing Sheikh Company Data\n');
    console.log('='.repeat(80));

    // Find user
    const user = await User.findOne({
      where: { email: 'sheikh@gmail.com' }
    });

    if (!user) {
      console.log('❌ User sheikh@gmail.com not found in database');
      return;
    }

    console.log('\n📋 USER DATA:');
    console.log('-'.repeat(80));
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - User Type: ${user.user_type}`);
    console.log(`   - Company ID: ${user.company_id || 'NULL'}`);
    console.log(`   - Designation: ${user.designation || 'NULL'}`);
    console.log(`   - Phone: ${user.phone || 'NULL'}`);
    console.log(`   - Created At: ${user.created_at}`);
    console.log(`   - Last Login: ${user.last_login_at || 'NULL'}`);
    console.log(`   - Preferences:`, JSON.stringify(user.preferences, null, 2));

    if (user.company_id) {
      const company = await Company.findByPk(user.company_id);
      
      if (company) {
        console.log('\n📦 COMPANY DATA:');
        console.log('-'.repeat(80));
        console.log(`   - ID: ${company.id}`);
        console.log(`   - Name: ${company.name}`);
        console.log(`   - Contact Email: ${company.contactEmail || company.contact_email || 'NULL'}`);
        console.log(`   - Contact Person: ${company.contactPerson || company.contact_person || 'NULL'}`);
        console.log(`   - Email: ${company.email || 'NULL'}`);
        console.log(`   - Created At: ${company.created_at}`);
        console.log(`   - Company Status: ${company.companyStatus || company.company_status || 'NULL'}`);
        
        console.log('\n🔍 COMPANY CREATOR CHECK:');
        console.log('-'.repeat(80));
        const contactEmail = company.contactEmail || company.contact_email;
        const isCompanyCreator = contactEmail === user.email;
        console.log(`   - User Email: ${user.email}`);
        console.log(`   - Company Contact Email: ${contactEmail || 'NULL'}`);
        console.log(`   - Match: ${isCompanyCreator ? '✅ YES - Company Creator' : '❌ NO - Fellow Employer/Admin'}`);
        
        if (isCompanyCreator) {
          console.log(`   ✅ Should show ALL 4 STEPS`);
        } else {
          console.log(`   ⚠️  Should show ONLY STEP 4`);
        }

        // Check if company was created today
        const companyCreatedAt = new Date(company.created_at);
        const today = new Date();
        const isCreatedToday = companyCreatedAt.toDateString() === today.toDateString();
        console.log(`\n   📅 Company Created: ${companyCreatedAt.toISOString()}`);
        console.log(`   📅 Today: ${today.toISOString()}`);
        console.log(`   📅 Created Today: ${isCreatedToday ? '✅ YES' : '❌ NO'}`);

        // Check all users in this company
        const allCompanyUsers = await User.findAll({
          where: { company_id: company.id },
          attributes: ['id', 'email', 'user_type', 'designation', 'created_at']
        });
        
        console.log(`\n👥 ALL USERS IN COMPANY (${allCompanyUsers.length}):`);
        allCompanyUsers.forEach((u, index) => {
          console.log(`   ${index + 1}. ${u.email} (${u.user_type}) - Created: ${u.created_at}`);
        });

        // Check if this is the first user (company creator)
        const firstUser = allCompanyUsers.sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        )[0];
        const isFirstUser = firstUser.id === user.id;
        console.log(`\n   🎯 First User (Company Creator): ${firstUser.email}`);
        console.log(`   🎯 Is Sheikh First User: ${isFirstUser ? '✅ YES' : '❌ NO'}`);

      } else {
        console.log('\n❌ Company not found for company_id:', user.company_id);
      }
    } else {
      console.log('\n❌ User has no company_id');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test Complete!\n');

  } catch (error) {
    console.error('❌ Error running test:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the test
if (require.main === module) {
  testSheikhCompany()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testSheikhCompany };

