#!/usr/bin/env node

/**
 * Production-ready server startup script
 * Handles all potential issues and provides comprehensive error handling
 */


// Load environment variables from .env file if it exists
try {
  require('dotenv').config();
} catch (error) {
  console.log('ℹ️ No .env file found, using environment variables or defaults');
}

// Set default environment variables if not provided
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '8000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'pL7nX2rQv9aJ4tGd8bE6wYcM5oF1uZsH3kD0jVxN7qR2lC8mT4gP9yK6hW3sA0z';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret-key-make-it-very-long-and-secure-for-production-use';

// Database defaults for production
process.env.DB_HOST = process.env.DB_HOST || 'dpg-d372gajuibrs738lnm5g-a.singapore-postgres.render.com';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'jobportal_dev_0u1u_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc';
process.env.DB_NAME = process.env.DB_NAME || 'jobportal_dev_0u1u';

// CORS defaults
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://job-portal-nine-rouge.vercel.app';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://job-portal-nine-rouge.vercel.app';
process.env.BACKEND_URL = process.env.BACKEND_URL || 'https://job-portal-97q3.onrender.com';

console.log('🚀 Starting Job Portal Server (Production Mode)');
console.log('📋 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT);
console.log('🗄️ Database:', `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('💡 This is a critical error. Server will exit.');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('💡 This is a critical error. Server will exit.');
  process.exit(1);
});

// Test database connection first
let testConnection;
try {
  const sequelizeConfig = require('./config/sequelize');
  testConnection = sequelizeConfig.testConnection;
} catch (error) {
  console.error('❌ Failed to load sequelize config:', error.message);
  process.exit(1);
}

async function startServer() {
  try {
    console.log('🔍 Testing database connection...');
    await testConnection();
    
    console.log('✅ Database connection successful');
    
    // Fix ALL database issues FIRST (missing columns, tables, constraints)
    console.log('🔧 Running comprehensive database fixes...');
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      await execAsync('node fix-all-database-issues.js', { cwd: __dirname });
      console.log('✅ All database issues fixed successfully!');
    } catch (fixError) {
      console.warn('⚠️ Database fix failed, continuing with startup:', fixError?.message || fixError);
    }
    
    // Setup database tables AFTER fixing issues
    console.log('🔄 Setting up database...');
    try {
      // Try robust setup first
      const { setupRobustDatabase } = require('./robust-db-setup');
      await setupRobustDatabase();
      console.log('✅ Database setup completed');
    } catch (robustError) {
      console.log('⚠️ Robust setup failed, trying fallback:', robustError.message);
      try {
        // Fallback to original setup
        const { setupProductionDatabase } = require('./production-db-setup');
        await setupProductionDatabase();
        console.log('✅ Database setup completed (fallback)');
      } catch (dbSetupError) {
        console.log('⚠️ Database setup warning:', dbSetupError.message);
        console.log('🔄 Continuing with server start...');
      }
    }
    
    console.log('🚀 Starting Express server...');
    
    // Import and start the main server
    const app = require('./index.js');
    
    // Additional health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
      });
    });
    
    console.log('✅ Server started successfully!');
    console.log(`🌐 Server running at: http://localhost:${process.env.PORT}`);
    console.log(`🔗 Health check: http://localhost:${process.env.PORT}/health`);
    console.log(`🔗 API endpoints: http://localhost:${process.env.PORT}/api`);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('📋 Error details:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Database connection refused. Make sure PostgreSQL is running.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 Database host not found. Check your DB_HOST setting.');
    } else if (error.code === '28P01') {
      console.error('💡 Database authentication failed. Check your DB_USER and DB_PASSWORD.');
    } else if (error.code === '3D000') {
      console.error('💡 Database does not exist. Check your DB_NAME setting.');
    }
    
    console.error('💡 Common solutions:');
    console.error('   1. Make sure PostgreSQL is running');
    console.error('   2. Check your database credentials');
    console.error('   3. Ensure the database exists');
    console.error('   4. Check your .env file configuration');
    
    process.exit(1);
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();








