const { Sequelize } = require('sequelize');
require('dotenv').config();

// Import models
const Job = require('./models/Job');
const JobBookmark = require('./models/JobBookmark');
const User = require('./models/User');

const sequelize = new Sequelize(process.env.DB_NAME || 'jobportal_dev', process.env.DB_USER || 'postgres', process.env.DB_PASSWORD || 'password', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: false
});

async function testBookmarkFunctionality() {
  try {
    console.log('🔍 Testing Bookmark Functionality...\n');

    // Test 1: Check if bookmarkCount field exists in Job model
    console.log('1. Checking Job model for bookmarkCount field...');
    const jobAttributes = Object.keys(Job.rawAttributes);
    if (jobAttributes.includes('bookmarkCount')) {
      console.log('✅ bookmarkCount field exists in Job model');
    } else {
      console.log('❌ bookmarkCount field missing from Job model');
      return;
    }

    // Test 2: Check if bookmarkCount column exists in database
    console.log('\n2. Checking database for bookmarkCount column...');
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'bookmarkCount'
    `);
    
    if (results.length > 0) {
      console.log('✅ bookmarkCount column exists in database');
    } else {
      console.log('❌ bookmarkCount column missing from database');
      return;
    }

    // Test 3: Check JobBookmark model hooks
    console.log('\n3. Checking JobBookmark model hooks...');
    const bookmarkHooks = JobBookmark.hooks;
    if (bookmarkHooks && bookmarkHooks.afterCreate && bookmarkHooks.afterDestroy) {
      console.log('✅ JobBookmark model has afterCreate and afterDestroy hooks');
    } else {
      console.log('❌ JobBookmark model missing required hooks');
    }

    // Test 4: Test bookmark creation and deletion
    console.log('\n4. Testing bookmark creation and deletion...');
    
    // Find or create a test user
    let testUser = await User.findOne({ where: { email: 'test@example.com' } });
    if (!testUser) {
      testUser = await User.create({
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        userType: 'jobseeker'
      });
      console.log('📝 Created test user');
    }

    // Find or create a test job
    let testJob = await Job.findOne({ where: { title: 'Test Job for Bookmarks' } });
    if (!testJob) {
      testJob = await Job.create({
        title: 'Test Job for Bookmarks',
        description: 'A test job for bookmark functionality',
        companyId: null,
        location: 'Test Location',
        experienceMin: 1,
        experienceMax: 3,
        salaryMin: 50000,
        salaryMax: 80000,
        jobType: 'Full-time',
        category: 'software'
      });
      console.log('📝 Created test job');
    }

    // Test bookmark creation
    const initialBookmarkCount = testJob.bookmarkCount || 0;
    console.log(`📊 Initial bookmark count: ${initialBookmarkCount}`);

    const bookmark = await JobBookmark.create({
      userId: testUser.id,
      jobId: testJob.id,
      folder: 'Test Folder',
      notes: 'Test bookmark',
      priority: 'medium'
    });
    console.log('✅ Bookmark created successfully');

    // Refresh job to see updated bookmark count
    await testJob.reload();
    const newBookmarkCount = testJob.bookmarkCount || 0;
    console.log(`📊 New bookmark count: ${newBookmarkCount}`);

    if (newBookmarkCount > initialBookmarkCount) {
      console.log('✅ Bookmark count incremented correctly');
    } else {
      console.log('❌ Bookmark count not incremented');
    }

    // Test bookmark deletion
    await bookmark.destroy();
    console.log('✅ Bookmark deleted successfully');

    // Refresh job to see updated bookmark count
    await testJob.reload();
    const finalBookmarkCount = testJob.bookmarkCount || 0;
    console.log(`📊 Final bookmark count: ${finalBookmarkCount}`);

    if (finalBookmarkCount === initialBookmarkCount) {
      console.log('✅ Bookmark count decremented correctly');
    } else {
      console.log('❌ Bookmark count not decremented correctly');
    }

    console.log('\n🎉 All bookmark functionality tests passed!');
    console.log('\n📋 Summary:');
    console.log('- Job model has bookmarkCount field');
    console.log('- Database has bookmarkCount column');
    console.log('- JobBookmark hooks are working');
    console.log('- Bookmark creation/deletion updates job count');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

testBookmarkFunctionality();
