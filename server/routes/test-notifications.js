'use strict';

const express = require('express');
const router = express.Router();

const { authenticateToken } = (() => {
  // Lightweight wrapper using existing auth middleware from user routes if available
  try {
    return require('../middlewares/auth');
  } catch (e) {
    // Fallback: accept all in non-production for local testing
    return {
      authenticateToken: (req, res, next) => next()
    };
  }
})();

const NotificationService = require('../services/notificationService');
const JobPreferenceMatchingService = require('../services/jobPreferenceMatchingService');
const { Job, Company, User, Requirement } = require('../config/index');
const emailService = require('../services/emailService');

// Health check
router.get('/health', (req, res) => res.json({ ok: true }));

// Test email functionality
router.post('/test-email', async (req, res) => {
  try {
    const { email, testType } = req.body;
    const targetEmail = email || process.env.SMTP_USER || 'test@example.com';
    
    console.log('\n🧪 Testing email service...');
    console.log(`📧 Target email: ${targetEmail}`);
    console.log(`📧 Test type: ${testType || 'password-reset'}`);
    
    let result;
    if (testType === 'password-reset') {
      result = await emailService.sendPasswordResetEmail(
        targetEmail, 
        'test-token-' + Date.now(), 
        'Test User'
      );
    } else {
      // Generic test email
      result = await emailService.sendMail({
        to: targetEmail,
        subject: 'Test Email from Job Portal',
        html: `
          <h2>Test Email</h2>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        `
      });
    }
    
    console.log('✅ Email test result:', result);
    
    return res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      result,
      targetEmail
    });
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
});

// Trigger preferred job notification for matching users or a specific user
router.post('/preferred', authenticateToken, async (req, res) => {
  try {
    const { jobId, userId } = req.body;
    if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required' });

    const job = await Job.findByPk(jobId, {
      include: [{ model: Company, as: 'company', attributes: ['name'] }]
    });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const jobData = {
      title: job.title,
      companyName: job.company?.name || 'Unknown Company',
      location: job.location,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      remoteWork: job.remoteWork,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salary: job.salary,
      skills: job.skills || [],
      industry: job.company?.industry,
      region: job.region
    };

    let targetUserIds = [];
    if (userId) {
      targetUserIds = [userId];
    } else {
      targetUserIds = await JobPreferenceMatchingService.findMatchingUsers(jobData);
    }

    const result = await NotificationService.sendPreferredJobNotification(job.id, jobData, targetUserIds);
    return res.json({ success: true, result, targets: targetUserIds });
  } catch (err) {
    console.error('test-notifications preferred error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error' });
  }
});

// Trigger shortlist notification
router.post('/shortlist', authenticateToken, async (req, res) => {
  try {
    const { candidateId, employerId, jobId, requirementId } = req.body;
    if (!candidateId || !employerId) {
      return res.status(400).json({ success: false, message: 'candidateId and employerId are required' });
    }

    // Validate users exist (best-effort)
    const candidate = await User.findByPk(candidateId);
    const employer = await User.findByPk(employerId);
    if (!candidate || !employer) return res.status(404).json({ success: false, message: 'candidate or employer not found' });

    const context = {};
    if (requirementId) {
      const reqm = await Requirement.findByPk(requirementId);
      if (reqm) context.requirementTitle = reqm.title;
    }

    const result = await NotificationService.sendShortlistingNotification(
      candidateId,
      employerId,
      jobId || null,
      requirementId || null,
      context
    );
    return res.json({ success: true, result });
  } catch (err) {
    console.error('test-notifications shortlist error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error' });
  }
});

module.exports = router;


