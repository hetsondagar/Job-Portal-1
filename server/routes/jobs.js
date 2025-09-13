
'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const Resume = require('../models/Resume');

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
          where: { userId, is_default: true }
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
        where: { userId, is_default: true }
      });
      if (defaultResume) {
        selectedResumeId = defaultResume.id;
      }
    }

    // Create job application
    const application = await JobApplication.create({
      jobId,
      userId,
      employer_id: job.employerId, // Use employerId from job
      status: 'applied',
      coverLetter,
      expectedSalary,
      noticePeriod,
      availableFrom,
      isWillingToRelocate,
      preferredLocations,
      resumeId: selectedResumeId,
      source: 'website'
    });

    console.log('✅ Job application created:', { 
      applicationId: application.id, 
      job_id: application.jobId, 
      user_id: application.userId, 
      employer_id: application.employerId,
      status: application.status 
    });

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
