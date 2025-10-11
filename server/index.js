require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path'); // Added for static file serving
const fs = require('fs');

// Ensure upload directories exist on startup
const uploadDirs = [
  'uploads',
  'uploads/company-photos',
  'uploads/company-logos',
  'uploads/avatars',
  'uploads/resumes',
  'uploads/job-photos',
  'uploads/hot-vacancy-photos',
  'uploads/agency-documents'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created upload directory: ${dir}`);
  }
});

// Clean up orphaned photos on startup (in production)
if (process.env.NODE_ENV === 'production') {
  const { cleanupOrphanedPhotos } = require('./scripts/cleanup-orphaned-photos');
  cleanupOrphanedPhotos().catch(err => {
    console.error('❌ Failed to cleanup orphaned photos:', err);
  });
}

// Import database configuration
const { sequelize, testConnection } = require('./config/sequelize');

// Initialize email service
const emailService = require('./services/emailService');

// Import routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/admin-auth');
const userRoutes = require('./routes/user');
const oauthRoutes = require('./routes/oauth');
const companiesRoutes = require('./routes/companies');
const jobsRoutes = require('./routes/jobs');
const requirementsRoutes = require('./routes/requirements');
const jobAlertsRoutes = require('./routes/job-alerts');
const jobTemplatesRoutes = require('./routes/job-templates');
const candidateLikesRoutes = require('./routes/candidate-upvote');
const interviewsRoutes = require('./routes/interviews');
const hotVacanciesRoutes = require('./routes/hot-vacancies');
const featuredJobsRoutes = require('./routes/featured-jobs');
const usageRoutes = require('./routes/usage');
// Test notifications routes (mounted only in non-production)
let testNotificationsRoutes = null;
if (process.env.NODE_ENV !== 'production') {
  try {
    testNotificationsRoutes = require('./routes/test-notifications');
  } catch (e) {
    console.warn('Test notifications routes not available:', e?.message || e);
  }
}
const gulfJobsRoutes = require('./routes/gulf-jobs');
const salaryRoutes = require('./routes/salary');
const agencyRoutes = require('./routes/agency');
const adminAgencyRoutes = require('./routes/admin-agency');
const clientVerificationRoutes = require('./routes/client-verification');
const companyClaimRoutes = require('./routes/company-claim');
const paymentRoutes = require('./routes/payment');

// Import passport for OAuth
const passport = require('passport');

// Passport session configuration
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = require('./models/User');
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Import middleware
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;

// Trust proxy for rate limiting behind reverse proxy (Render, etc.)
app.set('trust proxy', 1);

// Security middleware - Configure helmet to allow cross-origin resources
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "http:"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "data:"],
      workerSrc: ["'self'", "blob:"]
    }
  }
}));

// Enhanced CORS configuration - MUST BE BEFORE ALL ROUTES
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://job-portal-nine-rouge.vercel.app',
    process.env.CORS_ORIGIN || 'https://job-portal-nine-rouge.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://job-portal-nine-rouge.vercel.app',
    'https://job-portal-dr834n32f-hetsondagar16-4175s-projects.vercel.app',
    'https://job-portal-97q3.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400
};

app.use(cors(corsOptions));

// CORS is handled by the cors middleware above

// Logging middleware to track request content types
app.use((req, res, next) => {
  const contentType = req.get('Content-Type') || '';
  const path = req.path || '';
  const origin = req.headers.origin || 'no-origin';
  console.log('🔍 Request to:', path, 'Content-Type:', contentType, 'Origin:', origin);
  next();
});

// ⚠️ CRITICAL: Register bulk import routes BEFORE body parsers
// This allows multer to handle multipart/form-data before express.json tries to parse it
app.use('/api/bulk-import', require('./routes/bulk-import'));

// Admin setup routes (no auth required)
app.use('/api/setup', require('./routes/admin-setup'));

// Body parsing middleware for non-multipart requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log CORS requests for debugging (no duplicate CORS headers)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('🔍 Preflight request from:', req.headers.origin, 'to:', req.path);
  }
  next();
});

// Session configuration for OAuth (production optimized)
const { getSessionConfig } = require('./config/session-config');
app.use(session(getSessionConfig()));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // More lenient in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => {
    // Allow higher throughput for lightweight endpoints
    const p = req.path || '';
    return p.startsWith('/candidate-likes') || p === '/health';
  }
});

// More lenient rate limiter for OAuth endpoints
const oauthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 200, // More lenient in development
  message: {
    success: false,
    message: 'Too many OAuth requests, please try again later.'
  }
});

// Very lenient rate limiter for auth endpoints (signup, login, etc.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 100, // More lenient in development
  message: {
    success: false,
    message: 'Too many authentication requests, please try again later.'
  }
});

app.use('/api/oauth', oauthLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/', limiter);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Bulk import routes already registered above

// Serve static files from uploads directory with comprehensive CORS headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Allow cross-origin usage of uploaded files (for frontend domains)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    // Fix Cross-Origin-Resource-Policy issue
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Timing-Allow-Origin', '*');
    // Set accurate content-type based on extension
    const lower = filePath.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (lower.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (lower.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (lower.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (lower.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Portal API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      auth: '/api/auth',
      jobs: '/api/jobs',
      companies: '/api/companies',
      users: '/api/user'
    }
  });
});

// Comprehensive health check endpoints
app.use('/api/health', require('./routes/health'));
app.use('/health', require('./routes/health'));

// Test endpoint to check if routes are working
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    origin: req.headers.origin || 'no-origin'
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin || 'no-origin',
    headers: {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true'
    },
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/user', userRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/companies', companyClaimRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/requirements', requirementsRoutes);
app.use('/api/job-alerts', jobAlertsRoutes);
app.use('/api/agency', agencyRoutes);
// Mount test routes for notifications in non-production
if (testNotificationsRoutes) {
  app.use('/api/test/notifications', testNotificationsRoutes);
  console.log('🧪 Test notification routes mounted at /api/test/notifications');
}
app.use('/api/job-templates', jobTemplatesRoutes);
app.use('/api/candidate-likes', candidateLikesRoutes);
app.use('/api/messages', require('./routes/messages'));
app.use('/api/hot-vacancies', require('./routes/hot-vacancies'));
app.use('/api/featured-jobs', featuredJobsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/gulf', gulfJobsRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/job-preferences', require('./routes/job-preferences'));
// Payment routes (authenticated)
app.use('/api/payment', paymentRoutes);
// Client verification routes (public with token)
app.use('/api/client', clientVerificationRoutes);
// Admin routes (secure)
app.use('/api/admin', adminAgencyRoutes);
app.use('/api/admin', require('./routes/admin'));

  // Compatibility redirect for cover-letter download legacy path
  app.get('/api/cover-letters/:id/download', (req, res) => {
    // Forward to user route if available
    try {
      const token = req.headers.authorization || req.query.token || req.query.access_token || '';
      const cleanToken = token.replace(/^Bearer\s+/i, '');
      const url = `/api/user/cover-letters/${req.params.id}/download`;
      
      console.log('🔍 Cover letter redirect - Original URL:', req.originalUrl);
      console.log('🔍 Cover letter redirect - Forwarding to:', url);
      console.log('🔍 Cover letter redirect - Token present:', !!cleanToken);
      
      // Create new request object with updated URL and headers
      const newReq = Object.create(req);
      newReq.url = url + (cleanToken ? `?token=${encodeURIComponent(cleanToken)}` : '');
      newReq.originalUrl = url;
      newReq.path = `/cover-letters/${req.params.id}/download`;
      
      if (cleanToken && !newReq.headers.authorization) {
        newReq.headers.authorization = `Bearer ${cleanToken}`;
      }
      
      return userRoutes.handle(newReq, res);
    } catch (error) {
      console.error('❌ Cover letter redirect error:', error);
      return res.status(404).json({ success: false, message: 'Route /api/cover-letters/:id/download not found' });
    }
  });

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Fix ALL database issues (missing columns, tables, constraints)
    if (process.env.NODE_ENV === 'production' || process.env.RUN_DB_FIXES === 'true') {
      try {
        console.log('🔧 Running comprehensive database fixes...');
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        await execAsync('node fix-all-database-issues.js', { cwd: __dirname });
        console.log('✅ All database issues fixed successfully!');
      } catch (fixError) {
        console.warn('⚠️ Database fix failed, continuing with startup:', fixError?.message || fixError);
      }
    }
    
    // Avoid global sync to prevent duplicate index creation on existing tables.
    // Only ensure the new candidate_likes table exists.
    try {
      const qi = sequelize.getQueryInterface();
      const tables = await qi.showAllTables();
      const tableNames = Array.isArray(tables) ? tables.map((t) => (typeof t === 'string' ? t : t.tableName || t)).map((n) => String(n).toLowerCase()) : [];
      if (!tableNames.includes('candidate_likes')) {
        await require('./models/CandidateLike').sync();
        console.log('✅ candidate_likes table ensured');
      } else {
        console.log('ℹ️ candidate_likes table already exists');
      }
      // Ensure featured_jobs table exists
      if (!tableNames.includes('featured_jobs')) {
        await require('./models/FeaturedJob').sync();
        console.log('✅ featured_jobs table ensured');
      } else {
        console.log('ℹ️ featured_jobs table already exists');
      }
    } catch (syncError) {
      console.warn('⚠️ Skipping conditional sync due to error:', syncError?.message || syncError);
    }

    // Seed default public job templates for India and Gulf
    try {
      const JobTemplate = require('./models/JobTemplate');
      const defaults = [
        {
          name: 'Software Engineer (India) - Full-time',
          description: 'Standard software engineer role with common fields prefilled for India region.',
          category: 'technical',
          isPublic: true,
          isDefault: true,
          templateData: {
            title: 'Software Engineer',
            description: 'We are looking for a Software Engineer to build and maintain applications.',
            location: 'Bengaluru, India',
            country: 'India',
            jobType: 'full-time',
            experienceLevel: 'mid',
            skills: ['JavaScript', 'Node.js', 'React'],
            salaryCurrency: 'INR',
            salaryPeriod: 'yearly',
            remoteWork: 'hybrid'
          },
          tags: ['india', 'engineering']
        },
        {
          name: 'Sales Executive (Gulf) - Full-time',
          description: 'Standard sales executive role with fields tailored for Gulf region.',
          category: 'non-technical',
          isPublic: true,
          isDefault: true,
          templateData: {
            title: 'Sales Executive',
            description: 'Seeking a Sales Executive to drive revenue and build client relationships.',
            location: 'Dubai, UAE',
            country: 'United Arab Emirates',
            jobType: 'full-time',
            experienceLevel: 'mid',
            skills: ['Sales', 'Negotiation', 'CRM'],
            salaryCurrency: 'AED',
            salaryPeriod: 'yearly',
            remoteWork: 'on-site'
          },
          tags: ['gulf', 'sales']
        }
      ];
      for (const d of defaults) {
        const existing = await JobTemplate.findOne({ where: { name: d.name, isDefault: true } });
        if (!existing) {
          await JobTemplate.create({
            name: d.name,
            description: d.description,
            category: d.category,
            isPublic: d.isPublic,
            isDefault: d.isDefault,
            templateData: d.templateData,
            tags: d.tags
          }, { fields: ['name','description','category','isPublic','isDefault','templateData','tags'] });
          console.log(`✅ Seeded default template: ${d.name}`);
        }
      }
    } catch (seedError) {
      console.warn('⚠️ Skipping default template seeding:', seedError?.message || seedError);
    }

    // Create job preferences table if it doesn't exist
    try {
      const { createJobPreferencesTable } = require('./scripts/create-job-preferences-table');
      await createJobPreferencesTable();
    } catch (tableError) {
      console.warn('⚠️ Skipping job preferences table creation:', tableError?.message || tableError);
    }

    // Seed admin user
    try {
      const { seedAdminUser } = require('./scripts/seedAdminUser');
      await seedAdminUser();
    } catch (adminSeedError) {
      console.warn('⚠️ Skipping admin user seeding:', adminSeedError?.message || adminSeedError);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Job Portal API server running on port: ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
      
      // Start contract expiry monitoring service
      try {
        const contractExpiryService = require('./services/contractExpiryService');
        contractExpiryService.start();
        console.log('✅ Contract expiry monitoring service started');
      } catch (error) {
        console.warn('⚠️ Failed to start contract expiry service:', error.message);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; 