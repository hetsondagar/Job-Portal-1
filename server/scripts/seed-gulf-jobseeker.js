'use strict';

require('dotenv').config();

const { sequelize } = require('../config/sequelize');
const User = require('../models/User');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🌱 Seeding Gulf jobseeker user...');

    const [user, created] = await User.findOrCreate({
      where: { email: 'gulf.jobseeker@example.com' },
      defaults: {
        email: 'gulf.jobseeker@example.com',
        user_type: 'jobseeker',
        region: 'gulf',
        is_email_verified: true,
        password: 'Test@1234',
        oauth_provider: 'local',
        profile_completion: 0
      }
    });

    console.log('👤 Jobseeker:', user.id, user.email, user.user_type, user.region, created ? '(created)' : '(existing)');
    console.log('✅ Done');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
})();


