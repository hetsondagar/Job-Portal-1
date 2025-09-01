require('dotenv').config();
const { sequelize } = require('./config/sequelize');
const JobBookmark = require('./models/JobBookmark');
const User = require('./models/User');
const Job = require('./models/Job');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized!');
    
    // Test JobBookmark model
    console.log('\n🔍 Testing JobBookmark model...');
    
    // Check if table exists
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Available tables:', tableExists);
    
    if (tableExists.includes('job_bookmarks')) {
      console.log('✅ JobBookmark table exists!');
      
      // Test creating a sample bookmark
      const sampleBookmark = await JobBookmark.create({
        userId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
        jobId: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
        folder: 'Test Folder',
        notes: 'Test notes',
        priority: 'high',
        isApplied: false
      });
      
      console.log('✅ Sample bookmark created:', sampleBookmark.id);
      
      // Test retrieving bookmarks
      const bookmarks = await JobBookmark.findAll();
      console.log('✅ Retrieved bookmarks:', bookmarks.length);
      
      // Clean up test data
      await sampleBookmark.destroy();
      console.log('✅ Test bookmark cleaned up');
      
    } else {
      console.log('❌ JobBookmark table not found');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

testDatabaseConnection();
