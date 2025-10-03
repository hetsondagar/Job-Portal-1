require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path'); // Added for static file serving


// Import database configuration
const { sequelize, testConnection } = require('./config/sequelize');

// Initialize email service
const emailService = require('./services/emailService');

// Import routes
const authRoutes = require('./routes/auth');
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
const gulfJobsRoutes = require('./routes/gulf-jobs');
const salaryRoutes = require('./routes/salary');

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

// Security middleware
app.use(helmet());

// Enhanced CORS configuration - MUST BE BEFORE ALL ROUTES
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://job-portal-nine-rouge.vercel.app',
    process.env.CORS_ORIGIN || 'https://job-portal-nine-rouge.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://job-portal-nine-rouge.vercel.app',
      'https://job-portal-dr834n32f-hetsondagar16-4175s-projects.vercel.app',
      'https://job-portal-97q3.onrender.com',
      // Allow all Vercel preview deployments
      /^https:\/\/.*\.vercel\.app$/
    ];
    
    // Check if origin matches any allowed origin (including regex patterns)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      // Still allow the request but log it
      callback(null, true);
    }
  },
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
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Logging middleware to track request content types
app.use((req, res, next) => {
  const contentType = req.get('Content-Type') || '';
  const path = req.path || '';
  console.log('🔍 Request to:', path, 'Content-Type:', contentType);
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

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Allow cross-origin usage of uploaded files (for frontend domains)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint (alternative path)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint to check if routes are working
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API routes are working',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/requirements', requirementsRoutes);
app.use('/api/job-alerts', jobAlertsRoutes);
app.use('/api/job-templates', jobTemplatesRoutes);
app.use('/api/candidate-likes', candidateLikesRoutes);
app.use('/api/messages', require('./routes/messages'));
app.use('/api/hot-vacancies', require('./routes/hot-vacancies'));
app.use('/api/featured-jobs', featuredJobsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/gulf', gulfJobsRoutes);
app.use('/api/salary', salaryRoutes);
// Admin routes (secure)
app.use('/api/admin', require('./routes/admin'));

  // Compatibility redirect for cover-letter download legacy path
  app.get('/api/cover-letters/:id/download', (req, res) => {
    // Forward to user route if available
    try {
      const token = req.headers.authorization || req.query.token || req.query.access_token || '';
      const url = `/api/user/cover-letters/${req.params.id}/download`;
      // If running behind same server, rewrite path
      req.url = url + (req.url.includes('?') ? `&` : `?`) + (token ? `token=${encodeURIComponent(token.replace(/^Bearer\s+/i, ''))}` : '');
      return userRoutes.handle(req, res);
    } catch (_) {
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