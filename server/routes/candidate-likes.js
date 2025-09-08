const express = require('express');
const router = express.Router();
const { CandidateLike, User, Notification } = require('../config');
const DashboardService = require('../services/dashboardService');
const jwt = require('jsonwebtoken');

// Auth middleware (copied pattern from other route files)
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

// Ensure only employers can like
function ensureEmployer(req, res, next) {
	if (!req.user || req.user.user_type !== 'employer') {
		return res.status(403).json({ success: false, message: 'Only employers can like candidates' });
	}
	next();
}

// Get like count and whether current employer liked
router.get('/:candidateId', authenticateToken, async (req, res) => {
	try {
		const { candidateId } = req.params;
		const likeCount = await CandidateLike.count({ where: { candidateId } });
		let likedByCurrent = false;
		if (req.user && req.user.user_type === 'employer') {
			const existing = await CandidateLike.findOne({ where: { employerId: req.user.id, candidateId } });
			likedByCurrent = !!existing;
		}
		return res.json({ success: true, data: { likeCount, likedByCurrent } });
	} catch (error) {
		console.error('Error fetching candidate likes:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch likes' });
	}
});

// Like a candidate
router.post('/:candidateId', authenticateToken, ensureEmployer, async (req, res) => {
	try {
		const { candidateId } = req.params;
		if (candidateId === req.user.id) {
			return res.status(400).json({ success: false, message: 'Cannot like your own profile' });
		}
		// Ensure candidate exists and is jobseeker
		const candidate = await User.findByPk(candidateId);
		if (!candidate || candidate.user_type !== 'jobseeker') {
			return res.status(404).json({ success: false, message: 'Candidate not found' });
		}
		const [like, created] = await CandidateLike.findOrCreate({
			where: { employerId: req.user.id, candidateId },
			defaults: { employerId: req.user.id, candidateId }
		});

		// Record jobseeker activity without revealing employer identity
		try {
			await DashboardService.recordActivity(candidateId, 'profile_like', { source: 'employer' });
			await Notification.create({
				userId: candidateId,
				type: 'profile_view',
				title: 'Your profile received a like',
				message: 'Someone liked your profile.',
				priority: 'medium',
				icon: 'thumbs-up',
				metadata: { event: 'profile_like' }
			});
		} catch (activityErr) {
			console.warn('Failed to record profile_like activity:', activityErr?.message || activityErr);
		}
		return res.json({ success: true, data: { liked: true, created } });
	} catch (error) {
		console.error('Error liking candidate:', error);
		return res.status(500).json({ success: false, message: 'Failed to like candidate' });
	}
});

// Unlike a candidate
router.delete('/:candidateId', authenticateToken, ensureEmployer, async (req, res) => {
	try {
		const { candidateId } = req.params;
		const deleted = await CandidateLike.destroy({ where: { employerId: req.user.id, candidateId } });
		return res.json({ success: true, data: { liked: false, deleted: deleted > 0 } });
	} catch (error) {
		console.error('Error unliking candidate:', error);
		return res.status(500).json({ success: false, message: 'Failed to unlike candidate' });
	}
});

module.exports = router;
