'use strict';

// Usage:
//   node server/scripts/notify-job-reopened.js <jobId>
// Creates in-app notifications for all watchers of the job and logs emails.

require('dotenv').config();

async function main() {
  const jobId = (process.argv[2] || '').trim();
  if (!jobId) {
    console.error('❌ jobId is required. Example: node server/scripts/notify-job-reopened.js 17f0-...');
    process.exit(1);
  }

  try {
    const { sequelize } = require('../config/sequelize');
    const { Job } = require('../config/index');
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const EmailService = require('../services/simpleEmailService');

    console.log('🔗 Connecting to DB...');
    await sequelize.authenticate();
    console.log('✅ DB connected');

    const job = await Job.findByPk(jobId);
    if (!job) {
      console.log('ℹ️ Job not found, nothing to do');
      await sequelize.close();
      process.exit(0);
    }

    console.log('🔎 Loading watchers for job:', job.id, job.title);
    const [watchers] = await Job.sequelize.query('SELECT user_id FROM job_bookmarks WHERE job_id = $1', { bind: [job.id] });
    console.log('👀 Watchers:', Array.isArray(watchers) ? watchers.length : 0);

    let created = 0;
    for (const w of (watchers || [])) {
      try {
        const watcher = await User.findByPk(w.user_id);
        console.log('🔔 Creating notification for', w.user_id, watcher?.email || 'no-email');
        await Notification.create({
          userId: w.user_id,
          type: 'system',
          title: 'Tracked job reopened',
          message: `${job.title} is open again. Apply now!`,
          priority: 'medium',
          actionUrl: `/jobs/${job.id}`,
          actionText: 'View job',
          icon: 'briefcase',
          metadata: { jobId: job.id, companyId: job.companyId }
        });
        created++;
        if (watcher?.email) {
          await EmailService.sendPasswordResetEmail(watcher.email, 'job-reopened', watcher.first_name || 'Job Seeker');
        }
      } catch (err) {
        console.warn('⚠️ Failed for watcher', w.user_id, err?.message || err);
      }
    }

    console.log('✅ Done. Notifications created:', created);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  }
}

main();


