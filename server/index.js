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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Ensure proper headers for image files
    if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      // Remove CSP headers that might block cross-origin image loading
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('Cross-Origin-Resource-Policy');
    }
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
app.use('/api/candidate-upvotes', candidateLikesRoutes);
app.use('/api/messages', require('./routes/messages'));
app.use('/api/hot-vacancies', require('./routes/hot-vacancies'));
app.use('/api/featured-jobs', featuredJobsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/usage', usageRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
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