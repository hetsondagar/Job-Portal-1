const express = require('express');
const router = express.Router();
const { User, Company, Notification } = require('../models');
const { authenticateToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/verification-documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @route   POST /api/verification/submit
 * @desc    Submit verification request with documents
 * @access  Private (Employer)
 */
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { documents, companyInfo, additionalNotes, gstNumber, panNumber } = req.body;
    const userId = req.user.id;

    // Validate documents
    if (!documents || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one document is required for verification'
      });
    }

    // Get user information
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get company information directly
    const companyId = user.company_id || user.companyId;
    const company = await Company.findByPk(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Prepare comprehensive verification metadata
    const verificationMetadata = {
      documents: documents,
      gstNumber: gstNumber || null,
      panNumber: panNumber || null,
      additionalNotes: additionalNotes || null,
      submittedBy: {
        userId: userId,
        userName: `${user.first_name} ${user.last_name}`,
        userEmail: user.email,
        userPhone: user.phone
      },
      submittedAt: new Date().toISOString()
    };

    // Update company verification status and documents
    await company.update({
      verificationStatus: 'pending',
      verificationDocuments: verificationMetadata,
      companyStatus: 'pending_approval'
    });

    // Update all company users to pending verification status
    const companyUsers = await User.findAll({
      where: { company_id: company.id }
    });

    for (const user of companyUsers) {
      try {
        await user.update({
          account_status: 'pending_verification'
        });
        console.log(`✅ Updated user ${user.email} to pending_verification status`);
      } catch (error) {
        console.log(`⚠️ Could not update user ${user.email} status (ENUM may not exist yet):`, error.message);
        // Continue with other users even if one fails
      }
    }

    // Create notification for super admin
    const superAdmins = await User.findAll({
      where: { user_type: 'superadmin' }
    });

    for (const admin of superAdmins) {
      await Notification.create({
        userId: admin.id,
        type: 'verification_request',
        title: 'New Employer Verification Request',
        message: `New employer "${user.first_name} ${user.last_name}" from company "${company.name}" has submitted verification documents. Review the documents including GST${gstNumber ? ': ' + gstNumber : ''}, PAN${panNumber ? ': ' + panNumber : ''}, and additional notes to approve or reject the registration.`,
        priority: 'high',
        actionUrl: `/admin/dashboard/verifications`,
        actionText: 'Review Documents',
        icon: 'building',
        metadata: {
          companyId: company.id,
          userId: userId,
          verificationType: 'employer_registration',
          gstNumber: gstNumber,
          panNumber: panNumber,
          documentCount: documents.length
        }
      });
    }

    // Create notification for the employer
    await Notification.create({
      userId: userId,
      type: 'verification_request',
      title: 'Verification Request Submitted',
      message: 'Your verification documents have been submitted successfully. You will be notified once reviewed by our admin team.',
      priority: 'medium',
      actionUrl: '/employer-dashboard',
      actionText: 'View Dashboard',
      icon: 'check-circle'
    });

    console.log(`✅ Verification request submitted for company: ${company.name} (${company.id})`);

    res.json({
      success: true,
      message: 'Verification request submitted successfully',
      data: {
        companyId: company.id,
        verificationStatus: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ Verification submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit verification request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/verification/approve/:companyId
 * @desc    Approve employer verification (Admin only)
 * @access  Private (Super Admin)
 */
router.post('/approve/:companyId', authenticateToken, async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.user_type !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    const { companyId } = req.params;
    const { notes } = req.body;

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update company status
    await company.update({
      verificationStatus: 'verified',
      companyStatus: 'active',
      verifiedAt: new Date(),
      verificationMethod: 'admin_approval'
    });

    // Get company users and activate their accounts
    const companyUsers = await User.findAll({
      where: { company_id: company.id }
    });

    // Activate all company users and create notifications
    for (const user of companyUsers) {
      // Activate user account
      try {
        await user.update({
          account_status: 'active',
          session_version: user.session_version + 1 // Invalidate existing tokens
        });
        console.log(`✅ Activated user account: ${user.email}`);
      } catch (error) {
        console.log(`⚠️ Could not update user ${user.email} status:`, error.message);
      }

      await Notification.create({
        userId: user.id,
        type: 'verification_approved',
        title: 'Verification Approved',
        message: `Your company "${company.name}" has been verified and approved! Please log out and log back in to access all features.`,
        priority: 'high',
        actionUrl: '/employer-dashboard',
        actionText: 'Access Dashboard',
        icon: 'check-circle',
        metadata: {
          companyId: company.id,
          approvedBy: req.user.id,
          approvedAt: new Date()
        }
      });
    }

    console.log(`✅ Company verification approved: ${company.name} (${company.id}) by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Company verification approved successfully',
      data: {
        companyId: company.id,
        verificationStatus: 'verified'
      }
    });

  } catch (error) {
    console.error('❌ Verification approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/verification/reject/:companyId
 * @desc    Reject employer verification (Admin only)
 * @access  Private (Super Admin)
 */
router.post('/reject/:companyId', authenticateToken, async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.user_type !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    const { companyId } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update company status
    await company.update({
      verificationStatus: 'rejected',
      companyStatus: 'inactive'
    });

    // Get company users and set them for re-registration
    const companyUsers = await User.findAll({
      where: { company_id: company.id }
    });

    // Set users to rejected status for re-registration and create notifications
    for (const user of companyUsers) {
      // Set user account status to allow re-registration
      try {
        await user.update({
          account_status: 'rejected',
          session_version: user.session_version + 1 // Invalidate existing tokens
        });
        console.log(`✅ Set user account to rejected: ${user.email}`);
      } catch (error) {
        console.log(`⚠️ Could not update user ${user.email} status:`, error.message);
      }

      await Notification.create({
        userId: user.id,
        type: 'verification_rejected',
        title: 'Verification Rejected',
        message: `Your company verification has been rejected. Reason: ${reason}. Please resubmit with correct documents.`,
        priority: 'high',
        actionUrl: '/employer-register',
        actionText: 'Resubmit Documents',
        icon: 'x-circle',
        metadata: {
          companyId: company.id,
          rejectedBy: req.user.id,
          rejectedAt: new Date(),
          rejectionReason: reason
        }
      });
    }

    console.log(`❌ Company verification rejected: ${company.name} (${company.id}) by admin: ${req.user.email}. Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Company verification rejected',
      data: {
        companyId: company.id,
        verificationStatus: 'rejected',
        reason: reason
      }
    });

  } catch (error) {
    console.error('❌ Verification rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/verification/status/:companyId
 * @desc    Get verification status for a company
 * @access  Private
 */
router.get('/status/:companyId', authenticateToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this company
    const user = await User.findByPk(userId);
    const company = await Company.findByPk(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check access permissions
    const hasAccess = user.user_type === 'superadmin' || 
                     user.companyId === companyId ||
                     user.user_type === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        companyId: company.id,
        verificationStatus: company.verificationStatus,
        companyStatus: company.companyStatus,
        verificationDocuments: company.verificationDocuments,
        verifiedAt: company.verifiedAt,
        verificationMethod: company.verificationMethod
      }
    });

  } catch (error) {
    console.error('❌ Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/verification/pending
 * @desc    Get all pending verification requests (Admin only)
 * @access  Private (Super Admin)
 */
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.user_type !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    const pendingCompanies = await Company.findAll({
      where: {
        verificationStatus: 'pending',
        companyStatus: 'pending_approval'
      },
      include: [{
        model: User,
        as: 'users',
        where: { user_type: ['employer', 'admin'] },
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: pendingCompanies,
      message: `Found ${pendingCompanies.length} pending verification requests`
    });

  } catch (error) {
    console.error('❌ Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending verifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/verification/upload-documents
 * @desc    Upload verification documents
 * @access  Private (Employer)
 */
router.post('/upload-documents', authenticateToken, upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedDocuments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/verification-documents/${file.filename}`
    }));

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedDocuments.length} document(s)`,
      data: {
        documents: uploadedDocuments
      }
    });

  } catch (error) {
    console.error('❌ Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload documents',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/verification/documents/:filename
 * @desc    Serve verification documents
 * @access  Private (Admin/SuperAdmin)
 */
router.get('/documents/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    // Check if user is admin or superadmin
    if (!['admin', 'superadmin'].includes(user.user_type)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const filePath = path.join(__dirname, '../uploads/verification-documents', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.sendFile(filePath);

  } catch (error) {
    console.error('❌ Document serve error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
