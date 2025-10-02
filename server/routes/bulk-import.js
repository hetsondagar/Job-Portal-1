'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const { sequelize } = require('../config/sequelize');
const BulkJobImport = require('../models/BulkJobImport')(sequelize);
const JobTemplate = require('../models/JobTemplate');

const router = express.Router();

// Middleware to handle multipart requests properly
router.use((req, res, next) => {
  if (req.is('multipart/form-data') || req.method === 'POST') {
    console.log('📁 Multipart request detected, skipping JSON parsing');
    return next();
  }
  next();
});

// Ensure no JSON parsing happens for this router
router.use((req, res, next) => {
  // Clear any parsed body to prevent JSON parsing errors
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('🧹 Clearing parsed body for bulk import route');
    req.body = {};
  }
  next();
});

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
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/bulk-imports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = 'bulk-import-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, Excel, and JSON files are allowed'));
    }
  }
});

// Get all bulk imports for a company
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, importType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId
    };

    if (status) {
      whereClause.status = status;
    }

    if (importType) {
      whereClause.importType = importType;
    }

    const imports = await BulkJobImport.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        imports: imports.rows,
        pagination: {
          total: imports.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(imports.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get bulk imports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bulk imports',
      error: error.message
    });
  }
});

// Get specific bulk import details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const importRecord = await BulkJobImport.findOne({
      where: {
        id: id,
        companyId: req.user.companyId
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: JobTemplate,
          as: 'template',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    if (!importRecord) {
      return res.status(404).json({
        success: false,
        message: 'Bulk import not found'
      });
    }

    res.json({
      success: true,
      data: importRecord
    });
  } catch (error) {
    console.error('Get bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bulk import',
      error: error.message
    });
  }
});

// Create new bulk import
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const {
      importName,
      importType,
      templateId,
      defaultValues,
      mappingConfig,
      validationRules,
      isScheduled,
      scheduledAt,
      notificationEmail
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Parse default values and mapping config from JSON strings
    const parsedDefaultValues = defaultValues ? JSON.parse(defaultValues) : {};
    const parsedMappingConfig = mappingConfig ? JSON.parse(mappingConfig) : {};
    const parsedValidationRules = validationRules ? JSON.parse(validationRules) : {};

    // Create bulk import record
    const bulkImport = await BulkJobImport.create({
      importName,
      importType: importType || path.extname(req.file.originalname).substring(1),
      fileUrl: `/uploads/bulk-imports/${req.file.filename}`,
      fileSize: req.file.size,
      mappingConfig: parsedMappingConfig,
      validationRules: parsedValidationRules,
      defaultValues: parsedDefaultValues,
      templateId: templateId || null,
      isScheduled: isScheduled === 'true',
      scheduledAt: isScheduled === 'true' ? new Date(scheduledAt) : null,
      notificationEmail,
      createdBy: req.user.id,
      companyId: req.user.companyId
    });

    // If not scheduled, start processing immediately
    if (!isScheduled || isScheduled === 'false') {
      // Start processing in background
      processBulkImport(bulkImport.id).catch(error => {
        console.error('Background processing error:', error);
      });
    }

    res.json({
      success: true,
      message: 'Bulk import created successfully',
      data: bulkImport
    });
  } catch (error) {
    console.error('Create bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk import',
      error: error.message
    });
  }
});

// Cancel bulk import
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const importRecord = await BulkJobImport.findOne({
      where: {
        id: id,
        companyId: req.user.companyId
      }
    });

    if (!importRecord) {
      return res.status(404).json({
        success: false,
        message: 'Bulk import not found'
      });
    }

    if (importRecord.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed import'
      });
    }

    await importRecord.update({
      status: 'cancelled',
      cancelledAt: new Date()
    });

    res.json({
      success: true,
      message: 'Bulk import cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel bulk import',
      error: error.message
    });
  }
});

// Retry failed bulk import
router.post('/:id/retry', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const importRecord = await BulkJobImport.findOne({
      where: {
        id: id,
        companyId: req.user.companyId
      }
    });

    if (!importRecord) {
      return res.status(404).json({
        success: false,
        message: 'Bulk import not found'
      });
    }

    if (importRecord.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Can only retry failed imports'
      });
    }

    // Reset import status
    await importRecord.update({
      status: 'pending',
      processedRecords: 0,
      successfulImports: 0,
      failedImports: 0,
      skippedRecords: 0,
      progress: 0,
      startedAt: null,
      completedAt: null,
      errorLog: [],
      successLog: []
    });

    // Start processing in background
    processBulkImport(importRecord.id).catch(error => {
      console.error('Background processing error:', error);
    });

    res.json({
      success: true,
      message: 'Bulk import retry initiated'
    });
  } catch (error) {
    console.error('Retry bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry bulk import',
      error: error.message
    });
  }
});

// Download template
router.get('/template/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    
    // Create template based on type
    const template = createJobTemplate(type);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="job-import-template-${type}.xlsx"`);
    
    // Generate Excel file
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(template);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Jobs');
    xlsx.write(workbook, { type: 'buffer' }).then(buffer => {
      res.send(buffer);
    });
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message
    });
  }
});

// Background processing function
async function processBulkImport(importId) {
  try {
    const importRecord = await BulkJobImport.findByPk(importId);
    if (!importRecord) {
      throw new Error('Import record not found');
    }

    // Update status to processing
    await importRecord.update({
      status: 'processing',
      startedAt: new Date()
    });

    const filePath = path.join(__dirname, '../uploads/bulk-imports', path.basename(importRecord.fileUrl));
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Import file not found');
    }

    const records = await parseImportFile(filePath, importRecord.importType);
    const totalRecords = records.length;

    await importRecord.update({
      totalRecords: totalRecords
    });

    let processedRecords = 0;
    let successfulImports = 0;
    let failedImports = 0;
    let skippedRecords = 0;
    const errorLog = [];
    const successLog = [];

    // Process each record
    for (const record of records) {
      try {
        // Validate record
        const validationResult = validateJobRecord(record, importRecord.validationRules);
        if (!validationResult.isValid) {
          errorLog.push({
            record: record,
            error: validationResult.errors,
            timestamp: new Date()
          });
          failedImports++;
          processedRecords++;
          continue;
        }

        // Check for duplicates
        const existingJob = await Job.findOne({
          where: {
            title: record.title,
            companyId: importRecord.companyId,
            location: record.location
          }
        });

        if (existingJob) {
          skippedRecords++;
          processedRecords++;
          continue;
        }

        // Create job
        const jobData = {
          ...record,
          companyId: importRecord.companyId,
          employerId: importRecord.createdBy,
          status: 'draft',
          ...importRecord.defaultValues
        };

        const job = await Job.create(jobData);
        
        successLog.push({
          jobId: job.id,
          title: job.title,
          timestamp: new Date()
        });

        successfulImports++;
        processedRecords++;

        // Update progress
        const progress = Math.round((processedRecords / totalRecords) * 100);
        await importRecord.update({
          processedRecords,
          successfulImports,
          failedImports,
          skippedRecords,
          progress,
          errorLog,
          successLog
        });

      } catch (error) {
        console.error('Error processing record:', error);
        errorLog.push({
          record: record,
          error: error.message,
          timestamp: new Date()
        });
        failedImports++;
        processedRecords++;
      }
    }

    // Mark as completed
    await importRecord.update({
      status: 'completed',
      completedAt: new Date(),
      progress: 100
    });

    // Send notification email if configured
    if (importRecord.notificationEmail) {
      // TODO: Send notification email
      console.log('Sending notification email to:', importRecord.notificationEmail);
    }

  } catch (error) {
    console.error('Bulk import processing error:', error);
    
    try {
      await BulkJobImport.update({
        status: 'failed',
        completedAt: new Date(),
        errorLog: [{ error: error.message, timestamp: new Date() }]
      }, {
        where: { id: importId }
      });
    } catch (updateError) {
      console.error('Failed to update import status:', updateError);
    }
  }
}

// Parse import file based on type
async function parseImportFile(filePath, importType) {
  return new Promise((resolve, reject) => {
    const records = [];

    if (importType === 'csv') {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => records.push(data))
        .on('end', () => resolve(records))
        .on('error', reject);
    } else if (importType === 'xlsx' || importType === 'xls') {
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    } else if (importType === 'json') {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        resolve(Array.isArray(data) ? data : [data]);
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
}

// Validate job record
function validateJobRecord(record, validationRules) {
  const errors = [];
  
  // Required fields
  const requiredFields = ['title', 'description', 'location'];
  for (const field of requiredFields) {
    if (!record[field] || record[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  }

  // Custom validation rules
  if (validationRules) {
    // Add custom validation logic here
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Create job template
function createJobTemplate(type) {
  const baseTemplate = [
    {
      title: 'Software Engineer',
      description: 'We are looking for a skilled software engineer...',
      location: 'New York, NY',
      jobType: 'full-time',
      experienceLevel: 'mid',
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 80000,
      salaryMax: 120000,
      skills: 'JavaScript,React,Node.js',
      benefits: 'Health Insurance,401k,Remote Work',
      remoteWork: 'hybrid',
      department: 'Engineering',
      category: 'Technology'
    }
  ];

  return baseTemplate;
}

module.exports = router;
