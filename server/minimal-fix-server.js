#!/usr/bin/env node

/**
 * Minimal server to bypass route error temporarily
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// Basic CORS
app.use(cors({
  origin: [
    'https://job-portal-nine-rouge.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Job Portal API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// OAuth URLs endpoint (most critical for frontend)
app.get('/api/oauth/urls', (req, res) => {
  console.log('🔍 OAuth URLs request from:', req.headers.origin);
  console.log('🔍 User type:', req.query.userType);
  
  // Set explicit CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  const urls = {
    google: `${process.env.BACKEND_URL || 'https://job-portal-97q3.onrender.com'}/api/oauth/google`,
    facebook: `${process.env.BACKEND_URL || 'https://job-portal-97q3.onrender.com'}/api/oauth/facebook`
  };
  
  res.json({
    success: true,
    data: urls,
    timestamp: new Date().toISOString()
  });
});

// Basic auth me endpoint
app.get('/api/auth/me', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Unauthorized - No token provided'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 OAuth URLs: http://localhost:${PORT}/api/oauth/urls`);
});

module.exports = app;
