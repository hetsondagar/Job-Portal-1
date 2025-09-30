
'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const EmployerActivityService = require('../services/employerActivityService');

const {
  createJob,
  getAllJobs,
  getJobById,
  getSimilarJobs,
  getJobForEdit,
  updateJob,
  deleteJob,
  getJobsByCompany,
  getJobsByEmployer,
  updateJobStatus
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

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.get('/:id/similar', getSimilarJobs);
router.get('/company/:companyId', getJobsByCompany);

// Protected routes (require authentication)
router.get('/employer/manage-jobs', authenticateToken, getJobsByEmployer);
router.get('/edit/:id', authenticateToken, getJobForEdit);
router.post('/create', authenticateToken, createJob);
router.put('/:id', authenticateToken, updateJob);
router.delete('/:id', authenticateToken, deleteJob);
router.patch('/:id/status', authenticateToken, updateJobStatus);

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
