
'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const EmployerActivityService = require('../services/employerActivityService');
const EmailService = require('../services/simpleEmailService');

const {
  createJob,
  getAllJobs,
  getJobById,
  getSimilarJobs,
  getJobForEdit,
  updateJob,
  deleteJob,
  getJobsByCompany,
  getJobsByEmployer
} = require('../controller/JobController');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Public routes (order matters: specific routes before parameterized ':id')
router.get('/', getAllJobs);
router.get('/company/:companyId', getJobsByCompany);
router.get('/:id/similar', getSimilarJobs);
router.get('/:id', getJobById);

// Protected routes (require authentication)
router.get('/employer/manage-jobs', authenticateToken, getJobsByEmployer);
router.get('/edit/:id', authenticateToken, getJobForEdit);
router.post('/create', authenticateToken, createJob);
router.put('/:id', authenticateToken, updateJob);
router.delete('/:id', authenticateToken, deleteJob);
// Hardened status update with inline watcher notifications and explicit logs
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const job = await Job.findByPk(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const prevStatus = job.status;
    await job.update({ status });

    if (status === 'active') {
      console.log('🔔 [route] Reactivation for job', job.id, 'prevStatus=', prevStatus, '-> active');
      try {
        const [watchers] = await Job.sequelize.query('SELECT user_id FROM job_bookmarks WHERE job_id = $1', { bind: [job.id] });
        console.log('🔔 [route] Found watchers:', Array.isArray(watchers) ? watchers.length : 0);
        if (Array.isArray(watchers) && watchers.length > 0) {
          const Notification = require('../models/Notification');
          for (const w of watchers) {
            try {
              const watcher = await User.findByPk(w.user_id);
              console.log('🔔 [route] Notifying watcher user_id=', w.user_id, 'email=', watcher?.email || 'n/a');
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
              if (watcher?.email) {
                await EmailService.sendPasswordResetEmail(watcher.email, 'job-reopened', watcher.first_name || 'Job Seeker');
              }
            } catch (inner) {
              console.warn('⚠️ [route] Failed notifying watcher', w.user_id, inner?.message || inner);
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ [route] Watcher notification failed:', e?.message || e);
      }
    }

    return res.status(200).json({ success: true, message: 'Job status updated successfully', data: job });
  } catch (error) {
    console.error('Update job status error (route):', error);
    return res.status(500).json({ success: false, message: 'Failed to update job status' });
  }
});

// Update job expiry (validTill)
router.patch('/:id/expiry', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { validTill } = req.body || {};

    if (!validTill) {
      return res.status(400).json({ success: false, message: 'validTill date is required' });
    }

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Ensure only owner or admin can update
    if (job.employerId !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only update your own jobs' });
    }

    const newValidTill = new Date(validTill);
    if (isNaN(newValidTill.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format for validTill' });
    }

    await job.update({ validTill: newValidTill });

    return res.status(200).json({ success: true, message: 'Job expiry updated', data: job });
  } catch (error) {
    console.error('Error updating job expiry:', error);
    return res.status(500).json({ success: false, message: 'Failed to update job expiry' });
  }
});

// --- Job Watchlist (notify on reactivation) ---
// Add watch (jobseeker only). Uses JobBookmark with folder='watchlist'
router.post('/:id/watch', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Only jobseekers can watch
    if (req.user.user_type !== 'jobseeker') {
      return res.status(403).json({ success: false, message: 'Only jobseekers can watch jobs' });
    }

    const job = await Job.findByPk(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status === 'active') {
      return res.status(400).json({ success: false, message: 'Job is active. Watching is only available for inactive jobs' });
    }

    // Raw SQL to avoid optional columns (folder/priority) that may not exist in all envs
    const sequelize = Job.sequelize;
    await sequelize.query(
      'INSERT INTO job_bookmarks (id, user_id, job_id, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) ON CONFLICT (user_id, job_id) DO NOTHING',
      { bind: [req.user.id, id] }
    );
    return res.json({ success: true, message: 'You will be notified when this job reopens', data: { watching: true } });
  } catch (error) {
    console.error('Error adding job watch:', error);
    return res.status(500).json({ success: false, message: 'Failed to add watch' });
  }
});

// Remove watch
router.delete('/:id/watch', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.user_type !== 'jobseeker') {
      return res.status(403).json({ success: false, message: 'Only jobseekers can unwatch jobs' });
    }
    const sequelize = Job.sequelize;
    const [result] = await sequelize.query('DELETE FROM job_bookmarks WHERE user_id = $1 AND job_id = $2 RETURNING id', { bind: [req.user.id, id] });
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: 'Not watching this job' });
    }
    return res.json({ success: true, message: 'Stopped watching this job', data: { watching: false } });
  } catch (error) {
    console.error('Error removing job watch:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove watch' });
  }
});

// Watch status
router.get('/:id/watch', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'jobseeker') {
      return res.status(403).json({ success: false, message: 'Only jobseekers can view watch status' });
    }
    const { id } = req.params;
    const sequelize = Job.sequelize;
    const [rows] = await sequelize.query('SELECT 1 FROM job_bookmarks WHERE user_id = $1 AND job_id = $2 LIMIT 1', { bind: [req.user.id, id] });
    return res.json({ success: true, data: { watching: Array.isArray(rows) && rows.length > 0 } });
  } catch (error) {
    console.error('Error getting watch status:', error);
    return res.status(500).json({ success: false, message: 'Failed to get watch status' });
  }
});

// Admin/Owner: Force notify all watchers that a job reopened (useful for backfills/testing)
router.post('/:id/notify-watchers', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Only job owner or admin
    if (req.user.user_type !== 'admin' && job.employerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const sequelize = Job.sequelize;
    const [watchers] = await sequelize.query('SELECT user_id FROM job_bookmarks WHERE job_id = $1', { bind: [job.id] });
    if (!Array.isArray(watchers) || watchers.length === 0) {
      return res.json({ success: true, message: 'No watchers to notify', data: { notified: 0 } });
    }

    const Notification = require('../models/Notification');
    let count = 0;
    for (const w of watchers) {
      try {
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
        count++;
      } catch (e) {
        console.warn('Failed to create notification for watcher', w.user_id, e?.message || e);
      }
    }

    return res.json({ success: true, message: 'Watchers notified', data: { notified: count } });
  } catch (error) {
    console.error('Error notifying watchers:', error);
    return res.status(500).json({ success: false, message: 'Failed to notify watchers' });
  }
});

// Expire job immediately (set status to expired and validTill = now)
router.patch('/:id/expire', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    // Owner or admin only
    if (job.employerId !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only expire your own jobs' });
    }
    const now = new Date();
    await job.update({ status: 'expired', validTill: now });
    return res.status(200).json({ success: true, message: 'Job expired', data: job });
  } catch (error) {
    console.error('Error expiring job:', error);
    return res.status(500).json({ success: false, message: 'Failed to expire job' });
  }
});

// Job application endpoint
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const { coverLetter, expectedSalary, noticePeriod, availableFrom, isWillingToRelocate, preferredLocations, resumeId } = req.body;

    console.log('🔍 Job application request:', { jobId, userId });

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Block application if job is expired
    if (job.validTill && new Date() > new Date(job.validTill)) {
      return res.status(400).json({
        success: false,
        message: 'Applications are closed for this job (expired)'
      });
    }
    
    console.log('🔍 Job details:', { job_id: job.id, employer_id: job.employerId, title: job.title });

    // Check if user has already applied for this job
    const existingApplication = await JobApplication.findOne({
      where: { jobId, userId }
    });

    if (existingApplication) {
      if (existingApplication.status && existingApplication.status !== 'withdrawn') {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this job'
        });
      }

      // If previously withdrawn, re-activate the existing application
      let selectedResumeId = resumeId;
      if (!selectedResumeId) {
        const defaultResume = await Resume.findOne({
          where: { userId, isDefault: true }
        });
        if (defaultResume) {
          selectedResumeId = defaultResume.id;
        }
      }

      await existingApplication.update({
        status: 'applied',
        coverLetter,
        expectedSalary,
        noticePeriod,
        availableFrom,
        isWillingToRelocate,
        preferredLocations,
        resumeId: existingApplication.resumeId || selectedResumeId,
        applied_at: new Date(),
        source: 'website'
      });

      console.log('✅ Re-applied to job by updating withdrawn application:', existingApplication.id);
      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          applicationId: existingApplication.id,
          status: existingApplication.status,
          applied_at: existingApplication.appliedAt || existingApplication.createdAt
        }
      });
    }

    // Get user's default resume if no resumeId provided
    let selectedResumeId = resumeId;
    if (!selectedResumeId) {
      const defaultResume = await Resume.findOne({
        where: { userId, isDefault: true }
      });
      if (defaultResume) {
        selectedResumeId = defaultResume.id;
      }
    }

    // Create job application
    const application = await JobApplication.create({
      jobId,
      userId,
      employerId: job.employerId, // Use employerId from job
      status: 'applied',
      coverLetter,
      expectedSalary,
      noticePeriod,
      availableFrom,
      isWillingToRelocate,
      preferredLocations,
      resumeId: selectedResumeId,
      source: 'website',
      appliedAt: new Date(),
      lastUpdatedAt: new Date()
    });

    console.log('✅ Job application created:', { 
      applicationId: application.id, 
      job_id: application.jobId, 
      user_id: application.userId, 
      employer_id: application.employerId,
      status: application.status 
    });

    // Log activity for employer: application received
    try {
      await EmployerActivityService.logApplicationReceived(job.employerId, application.id, job.id, { applicantId: userId });
    } catch (e) {
      console.error('⚠️ Failed to log application_received activity:', e?.message || e);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application.id,
        status: application.status,
        applied_at: application.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error applying for job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application: ' + error.message
    });
  }
});

module.exports = router;
