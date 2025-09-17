const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const EmployerQuota = require('../models/EmployerQuota');
const UserActivityLog = require('../models/UserActivityLog');
const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

const router = express.Router();

// GET /api/usage/summary
router.get('/summary', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ success: false, message: 'companyId is required' });

    const recruiters = await User.findAll({
      where: { user_type: { [Op.in]: ['employer', 'admin'] }, company_id: companyId },
      attributes: ['id', 'first_name', 'last_name', 'email']
    });

    const recruiterIds = recruiters.map(r => r.id);
    const quotas = await EmployerQuota.findAll({ where: { userId: { [Op.in]: recruiterIds } } });

    // Initialize default quotas for users who don't have any
    const EmployerQuotaService = require('../services/employerQuotaService');
    const defaultQuotas = [
      { type: 'job_postings', limit: 50 },
      { type: 'resume_views', limit: 100 },
      { type: 'requirements_posted', limit: 30 },
      { type: 'profile_visits', limit: 500 }
    ];

    for (const recruiterId of recruiterIds) {
      const userQuotas = quotas.filter(q => q.userId === recruiterId);
      if (userQuotas.length === 0) {
        // Create default quotas for this user
        for (const defaultQuota of defaultQuotas) {
          try {
            await EmployerQuotaService.getOrCreateQuota(recruiterId, defaultQuota.type, defaultQuota.limit);
          } catch (error) {
            console.error(`Failed to create quota for user ${recruiterId}:`, error);
          }
        }
      }
    }

    // Fetch quotas again after creating defaults
    const allQuotas = await EmployerQuota.findAll({ where: { userId: { [Op.in]: recruiterIds } } });

    const userIdToQuotas = new Map();
    allQuotas.forEach(q => {
      const arr = userIdToQuotas.get(q.userId) || [];
      arr.push({ quotaType: q.quotaType, used: q.used, limit: q.limit, resetAt: q.resetAt });
      userIdToQuotas.set(q.userId, arr);
    });

    const data = recruiters.map(r => ({
      userId: r.id,
      name: `${r.first_name} ${r.last_name}`,
      email: r.email,
      quotas: userIdToQuotas.get(r.id) || []
    }));

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Usage summary error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/usage/activities
router.get('/activities', async (req, res) => {
  try {
    const { userId, activityType, from, to, companyId, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (activityType) where.activityType = activityType;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp[Op.gte] = new Date(from);
      if (to) where.timestamp[Op.lte] = new Date(to);
    }

    // If filtering by company, restrict to that company's recruiters/admins
    if (companyId) {
      const recruiters = await User.findAll({ 
        where: { 
          user_type: { [Op.in]: ['employer', 'admin'] }, 
          company_id: companyId 
        }, 
        attributes: ['id'] 
      });
      const recruiterIds = recruiters.map(r => r.id);
      if (!recruiterIds || recruiterIds.length === 0) {
        return res.json({ success: true, data: [] });
      }
      where.userId = { [Op.in]: recruiterIds };
    }

    console.log('🔍 Activities query where clause:', JSON.stringify(where, null, 2));
    
    const logs = await UserActivityLog.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: Math.min(Number(limit) || 50, 200),
      offset: Number(offset) || 0
    });
    
    console.log(`📊 Found ${logs.length} activity logs`);

    // Hydrate applicant info for logs that reference an applicationId
    const applicationIds = logs.filter(l => !!l.applicationId).map(l => l.applicationId);
    let applicationIdToUserId = new Map();
    let userIdToUser = new Map();
    let jobIdToJob = new Map();

    // Hydrate users for userId on the log
    const actorUserIds = Array.from(new Set(logs.map(l => l.userId).filter(Boolean)));
    if (actorUserIds.length > 0) {
      const users = await User.findAll({ where: { id: { [Op.in]: actorUserIds } }, attributes: ['id', 'first_name', 'last_name', 'email', 'user_type'] });
      users.forEach(u => userIdToUser.set(u.id, u));
    }

    // Hydrate jobs referenced by jobId on the log
    const jobIds = Array.from(new Set(logs.map(l => l.jobId).filter(Boolean)));
    if (jobIds.length > 0) {
      const jobs = await Job.findAll({ where: { id: { [Op.in]: jobIds } }, attributes: ['id', 'title', 'companyId'] });
      jobs.forEach(j => jobIdToJob.set(j.id, j));
    }
    if (applicationIds.length > 0) {
      const applications = await JobApplication.findAll({
        where: { id: { [Op.in]: applicationIds } },
        attributes: ['id', 'userId']
      });
      applicationIdToUserId = new Map(applications.map(a => [a.id, a.userId]));
      const applicantUserIds = Array.from(new Set(applications.map(a => a.userId)));
      if (applicantUserIds.length > 0) {
        const users = await User.findAll({ where: { id: { [Op.in]: applicantUserIds } }, attributes: ['id', 'first_name', 'last_name', 'email'] });
        userIdToUser = new Map(users.map(u => [u.id, u]));
      }
    }

    const data = logs.map(l => {
      const json = l.toJSON();
      // Attach actor user
      const actor = userIdToUser.get(json.userId);
      if (actor) {
        const first = actor.first_name || '';
        const last = actor.last_name || '';
        const full = `${first} ${last}`.trim();
        json.user = { id: actor.id, email: actor.email, name: full || actor.email, user_type: actor.user_type };
      }
      // Attach job
      if (json.jobId) {
        const job = jobIdToJob.get(json.jobId);
        if (job) {
          json.job = { id: job.id, title: job.title, companyId: job.companyId };
        }
      }
      const applicantUserId = json.applicationId ? applicationIdToUserId.get(json.applicationId) : undefined;
      const applicant = applicantUserId ? userIdToUser.get(applicantUserId) : undefined;
      if (applicant) {
        const first = applicant.first_name || '';
        const last = applicant.last_name || '';
        const full = `${first} ${last}`.trim();
        json.applicant = { id: applicant.id, name: full || applicant.email, email: applicant.email };
      }
      return json;
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Usage activities error:', error && (error.stack || error.message || error));
    return res.status(500).json({ 
      success: false, 
      message: error && (error.message || 'Internal server error'),
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/usage/search-insights
router.get('/search-insights', async (req, res) => {
  try {
    const { companyId, from, to, limit = 20 } = req.query;
    const userWhere = companyId ? { user_type: 'employer', company_id: companyId } : { user_type: 'employer' };
    const recruiters = await User.findAll({ where: userWhere, attributes: ['id'] });
    const recruiterIds = recruiters.map(r => r.id);

    const where = { userId: { [Op.in]: recruiterIds } };
    where.activityType = { [Op.in]: ['candidate_search', 'SEARCH'] };
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp[Op.gte] = new Date(from);
      if (to) where.timestamp[Op.lte] = new Date(to);
    }

    const logs = await UserActivityLog.findAll({ where, attributes: ['details'], order: [['timestamp', 'DESC']], limit: 1000 });

    const counts = new Map();
    logs.forEach(l => {
      const d = l.details || {};
      const kw = (d.keywords || d.keyword || d.query || '').toString().trim().toLowerCase();
      if (!kw) return;
      counts.set(kw, (counts.get(kw) || 0) + 1);
    });

    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.min(Number(limit) || 20, 100))
      .map(([keyword, count]) => ({ keyword, count }));

    return res.json({ success: true, data: top });
  } catch (error) {
    console.error('Usage search-insights error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/usage/posting-insights
router.get('/posting-insights', async (req, res) => {
  try {
    const { companyId, from, to } = req.query;
    const jobWhere = {};
    if (companyId) jobWhere.companyId = companyId;
    if (from) jobWhere.createdAt = { ...(jobWhere.createdAt || {}), [Op.gte]: new Date(from) };
    if (to) jobWhere.createdAt = { ...(jobWhere.createdAt || {}), [Op.lte]: new Date(to) };

    const jobs = await Job.findAll({ where: jobWhere, attributes: ['id', 'employerId', 'title', 'createdAt'] });
    const jobIds = jobs.map(j => j.id);

    let applicationCounts = [];
    if (jobIds.length > 0) {
      applicationCounts = await JobApplication.findAll({
        where: { jobId: { [Op.in]: jobIds } },
        attributes: ['jobId', [fn('COUNT', col('id')), 'count']],
        group: ['jobId']
      });
    }

    const jobIdToAppCount = new Map();
    applicationCounts.forEach(row => { jobIdToAppCount.set(row.jobId, parseInt(row.dataValues.count, 10) || 0); });

    // Get recruiter details
    const recruiterIds = [...new Set(jobs.map(j => j.employerId))];
    const recruiters = await User.findAll({ 
      where: { id: { [Op.in]: recruiterIds } }, 
      attributes: ['id', 'email', 'first_name', 'last_name'] 
    });
    const recruiterMap = new Map(recruiters.map(r => [r.id, r]));

    const perRecruiter = new Map();
    jobs.forEach(j => {
      const apps = jobIdToAppCount.get(j.id) || 0;
      const recruiter = recruiterMap.get(j.employerId);
      const entry = perRecruiter.get(j.employerId) || { 
        recruiterId: j.employerId, 
        recruiterEmail: recruiter?.email || j.employerId,
        totalJobs: 0, 
        totalApplications: 0 
      };
      entry.totalJobs += 1;
      entry.totalApplications += apps;
      perRecruiter.set(j.employerId, entry);
    });

    return res.json({ success: true, data: Array.from(perRecruiter.values()) });
  } catch (error) {
    console.error('Usage posting-insights error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/usage/recruiter-performance
router.get('/recruiter-performance', async (req, res) => {
  try {
    const { companyId, from, to, limit = 10 } = req.query;
    const userWhere = companyId ? { user_type: 'employer', company_id: companyId } : { user_type: 'employer' };
    const recruiters = await User.findAll({ where: userWhere, attributes: ['id', 'first_name', 'last_name', 'email'] });
    const recruiterIds = recruiters.map(r => r.id);

    const where = { userId: { [Op.in]: recruiterIds } };
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp[Op.gte] = new Date(from);
      if (to) where.timestamp[Op.lte] = new Date(to);
    }

    const rows = await UserActivityLog.findAll({
      where,
      attributes: ['userId', [fn('COUNT', col('id')), 'count']],
      group: ['userId'],
      order: [[literal('count'), 'DESC']]
    });

    const countByUser = new Map(rows.map(r => [r.userId, parseInt(r.dataValues.count, 10) || 0]));
    const ranked = recruiters
      .map(r => ({ userId: r.id, name: `${r.first_name} ${r.last_name}`, email: r.email, activityCount: countByUser.get(r.id) || 0 }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, Math.min(Number(limit) || 10, 100));

    return res.json({ success: true, data: ranked });
  } catch (error) {
    console.error('Usage recruiter-performance error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/usage/quotas?userId=...
router.get('/quotas', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    const quotas = await EmployerQuota.findAll({ where: { userId } });
    return res.json({ success: true, data: quotas });
  } catch (error) {
    console.error('Usage quotas get error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/usage/quotas { userId, quotaType, limit, resetUsed? }
router.put('/quotas', async (req, res) => {
  try {
    const { userId, quotaType, limit, resetUsed } = req.body || {};
    if (!userId || !quotaType || typeof limit !== 'number') {
      return res.status(400).json({ success: false, message: 'userId, quotaType and numeric limit are required' });
    }
    const [quota, created] = await EmployerQuota.findOrCreate({
      where: { userId, quotaType },
      defaults: { userId, quotaType, used: 0, limit }
    });
    quota.limit = limit;
    if (resetUsed === true) quota.used = 0;
    await quota.save();
    return res.json({ success: true, data: quota, created });
  } catch (error) {
    console.error('Usage quotas update error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Debug endpoint to check activity logs
router.get('/debug-activities', async (req, res) => {
  try {
    const count = await UserActivityLog.count();
    const sample = await UserActivityLog.findAll({ limit: 5, order: [['timestamp', 'DESC']] });
    
    // Get company users to see what we're working with
    const companyUsers = await User.findAll({ 
      where: { user_type: { [Op.in]: ['employer', 'admin'] } },
      attributes: ['id', 'email', 'user_type', 'company_id'],
      limit: 10
    });
    
    return res.json({ 
      success: true, 
      data: { 
        totalActivityCount: count, 
        sampleActivities: sample.map(s => s.toJSON()),
        companyUsers: companyUsers.map(u => u.toJSON())
      } 
    });
  } catch (error) {
    console.error('Debug activities error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create sample activity logs for testing
router.post('/create-sample-activities', async (req, res) => {
  try {
    const EmployerActivityService = require('../services/employerActivityService');
    const EmployerQuotaService = require('../services/employerQuotaService');
    
    // Get a company user to create activities for
    const companyUser = await User.findOne({ 
      where: { user_type: { [Op.in]: ['employer', 'admin'] } },
      attributes: ['id', 'email']
    });
    
    if (!companyUser) {
      return res.status(400).json({ success: false, message: 'No company users found' });
    }
    
    // Create some sample activities with quota consumption
    await EmployerActivityService.logLogin(companyUser.id, { source: 'test' });
    
    // Consume some quotas to show usage
    try {
      await EmployerQuotaService.consume(companyUser.id, EmployerQuotaService.QUOTA_TYPES.JOB_POSTINGS, 1, {
        activityType: 'job_post',
        details: { title: 'Test Job Posting' }
      });
    } catch (e) {
      console.log('Quota consumption test:', e.message);
    }
    
    try {
      await EmployerQuotaService.consume(companyUser.id, EmployerQuotaService.QUOTA_TYPES.RESUME_SEARCH, 5, {
        activityType: 'candidate_search',
        details: { keywords: 'developer, javascript' }
      });
    } catch (e) {
      console.log('Resume search quota test:', e.message);
    }
    
    return res.json({ 
      success: true, 
      message: `Created sample activities and consumed quotas for user ${companyUser.email}` 
    });
  } catch (error) {
    console.error('Create sample activities error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


