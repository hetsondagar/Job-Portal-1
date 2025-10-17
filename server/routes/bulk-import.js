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

// Health check endpoint for bulk import
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'bulk-import',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Multer middleware for handling file uploads

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
      offset: parseInt(offset)
      // Removed include to avoid association error
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
      }
      // Removed include to avoid association error
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

// Simple upload route for testing
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// Create new bulk import with proper multer handling
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log('🔍 Bulk import POST request received');
    console.log('📊 Request headers:', req.headers);
    console.log('📊 Content-Type:', req.get('Content-Type'));
    console.log('📊 Request body:', req.body);
    console.log('📊 Request file:', req.file);
    console.log('📊 User:', req.user ? req.user.id : 'No user');
    console.log('📊 Raw body type:', typeof req.body);
    console.log('📊 Raw body length:', req.body ? Object.keys(req.body).length : 0);
    console.log('📊 Raw body content:', req.body);
    console.log('📊 Request method:', req.method);
    console.log('📊 Request URL:', req.url);
    
    // Safely extract form data with fallbacks
    const importName = req.body?.importName || '';
    const importType = req.body?.importType || 'csv';
    const templateId = req.body?.templateId || null;
    const defaultValues = req.body?.defaultValues || '{}';
    const mappingConfig = req.body?.mappingConfig || '{}';
    const validationRules = req.body?.validationRules || '{}';
    const isScheduled = req.body?.isScheduled || 'false';
    const scheduledAt = req.body?.scheduledAt || null;
    const notificationEmail = req.body?.notificationEmail || null;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Parse default values and mapping config from JSON strings (with error handling)
    let parsedDefaultValues = {};
    let parsedMappingConfig = {};
    let parsedValidationRules = {};
    
    try {
      parsedDefaultValues = defaultValues ? JSON.parse(defaultValues) : {};
    } catch (error) {
      console.warn('Failed to parse defaultValues:', error.message);
      parsedDefaultValues = {};
    }
    
    try {
      parsedMappingConfig = mappingConfig ? JSON.parse(mappingConfig) : {};
    } catch (error) {
      console.warn('Failed to parse mappingConfig:', error.message);
      parsedMappingConfig = {};
    }
    
    try {
      parsedValidationRules = validationRules ? JSON.parse(validationRules) : {};
    } catch (error) {
      console.warn('Failed to parse validationRules:', error.message);
      parsedValidationRules = {};
    }

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
      companyId: req.user.companyId || req.user.company_id || null
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
    console.error('Error stack:', error.stack);
    
    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = 'Failed to create bulk import';
    
    if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = 'Validation error: ' + error.message;
    } else if (error.name === 'SequelizeValidationError') {
      statusCode = 400;
      errorMessage = 'Database validation error: ' + error.message;
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      statusCode = 409;
      errorMessage = 'Duplicate entry error: ' + error.message;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    
    if (type === 'csv') {
      // Generate CSV file
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="job-import-template.csv"`);
      
      // Convert template to CSV
      const csvContent = convertToCSV(template);
      res.send(csvContent);
    } else {
      // Generate Excel file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="job-import-template-${type}.xlsx"`);
      
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(template);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Jobs');
      const buffer = xlsx.write(workbook, { type: 'buffer' });
      res.send(buffer);
    }
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

// Convert array of objects to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeader = headers.join(',');
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeader, ...csvRows].join('\n');
}

// Create job template
function createJobTemplate(type) {
  const baseTemplate = [
    {
      title: 'Senior Software Engineer',
      description: 'We are looking for a highly skilled Senior Software Engineer to lead our development team. The ideal candidate will have extensive experience in full-stack development and a strong understanding of scalable architectures.',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      jobType: 'full-time',
      experienceLevel: 'senior',
      experienceMin: 5,
      experienceMax: 10,
      salaryMin: 120000,
      salaryMax: 180000,
      salaryCurrency: 'INR',
      salaryPeriod: 'yearly',
      department: 'Engineering',
      category: 'Technology',
      skills: 'JavaScript,React,Node.js,TypeScript,PostgreSQL,AWS,Docker,Kubernetes',
      requirements: "Bachelor's or Master's degree in Computer Science or related field, 5+ years of experience in software development, Proven leadership skills",
      responsibilities: 'Lead a team of software engineers,Design and implement scalable software solutions,Mentor junior developers,Collaborate with product and design teams',
      remoteWork: 'hybrid',
      shiftTiming: 'day',
      education: "Bachelor's Degree",
      isUrgent: false,
      isFeatured: true,
      isPremium: false,
      validTill: '2024-12-31',
      tags: 'javascript,react,fullstack,senior,leadership',
      benefits: 'Health Insurance,401k,Remote Work,Paid Time Off,Performance Bonus,Learning Budget',
      companyName: 'Tech Solutions Inc.',
      applicationDeadline: '2024-12-31',
      isActive: true
    },
    {
      title: 'Marketing Manager',
      description: 'We are seeking a dynamic Marketing Manager to develop and execute comprehensive marketing strategies. This role requires a creative thinker with strong analytical skills and a proven track record in digital marketing.',
      location: 'Delhi, NCR',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      jobType: 'full-time',
      experienceLevel: 'mid',
      experienceMin: 3,
      experienceMax: 7,
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'INR',
      salaryPeriod: 'yearly',
      department: 'Marketing',
      category: 'Marketing',
      skills: 'Digital Marketing,SEO,SEM,Content Marketing,Social Media,Analytics,Team Management',
      requirements: "Bachelor's degree in Marketing or Business, 3+ years of experience in marketing management, Strong communication and leadership skills",
      responsibilities: 'Develop and implement marketing campaigns,Manage digital marketing channels,Analyze market trends and competitor activities,Oversee content creation',
      remoteWork: 'remote',
      shiftTiming: 'day',
      education: "Bachelor's Degree",
      isUrgent: false,
      isFeatured: false,
      isPremium: false,
      validTill: '2024-12-31',
      tags: 'marketing,digital,seo,content,strategy',
      benefits: 'Health Insurance,Performance Bonus,Professional Development,Paid Time Off,Work from Home',
      companyName: 'Global Marketing Agency',
      applicationDeadline: '2024-12-31',
      isActive: true
    }
  ];

  return baseTemplate;
}

module.exports = router;
