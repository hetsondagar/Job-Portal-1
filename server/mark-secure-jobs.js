const { sequelize, Job } = require('./config/index');

async function markSecureJobs() {
  try {
    console.log('🔄 Marking some jobs as secure for testing...');
    
    // Get some recent jobs
    const jobs = await Job.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    if (jobs.length === 0) {
      console.log('❌ No jobs found to mark as secure');
      return;
    }
    
    // Mark the first few jobs as secure
    for (let i = 0; i < Math.min(3, jobs.length); i++) {
      await jobs[i].update({ isSecure: true });
      console.log(`✅ Marked job "${jobs[i].title}" as secure`);
    }
    
    console.log('✅ Secure jobs marked successfully!');
    console.log('🔍 You can now test the secure job tap functionality');
    
  } catch (error) {
    console.error('❌ Failed to mark secure jobs:', error);
  } finally {
    await sequelize.close();
  }
}

markSecureJobs();
