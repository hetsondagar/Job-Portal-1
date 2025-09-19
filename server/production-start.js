#!/usr/bin/env node

/**
 * Production-ready server startup script
 * Handles all potential issues and provides comprehensive error handling
 */

require('dotenv').config();

// Set default environment variables if not provided
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '8000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-make-it-very-long-and-secure-for-production-use';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret-key-make-it-very-long-and-secure-for-production-use';

// Database defaults
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'password';
process.env.DB_NAME = process.env.DB_NAME || 'jobportal_dev';

// CORS defaults
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
process.env.BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

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
const { testConnection } = require('./config/sequelize');

async function startServer() {
  try {
    console.log('🔍 Testing database connection...');
    await testConnection();
    
    console.log('✅ Database connection successful');
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








