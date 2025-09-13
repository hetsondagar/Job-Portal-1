/**
 * Production-ready error handling middleware
 * Ensures the server never crashes unexpectedly
 */

const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.errors || err.message;
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database Validation Error';
    details = err.errors?.map(e => e.message) || err.message;
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate Entry';
    details = 'A record with this information already exists';
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid Reference';
    details = 'Referenced record does not exist';
  } else if (err.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database Connection Error';
    details = 'Unable to connect to database';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
    details = 'Authentication token is invalid';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
    details = 'Authentication token has expired';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File Upload Error';
    details = err.message;
  } else if (err.status) {
    statusCode = err.status;
    message = err.message || message;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    details = 'Something went wrong. Please try again later.';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

// Handle 404 errors
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

// Handle uncaught exceptions
const uncaughtExceptionHandler = (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('💡 This is a critical error. Server will exit.');
  
  // Log to file if needed
  // fs.appendFileSync('error.log', `${new Date().toISOString()} - Uncaught Exception: ${err.message}\n${err.stack}\n\n`);
  
  process.exit(1);
};

// Handle unhandled promise rejections
const unhandledRejectionHandler = (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('💡 This is a critical error. Server will exit.');
  
  // Log to file if needed
  // fs.appendFileSync('error.log', `${new Date().toISOString()} - Unhandled Rejection: ${reason}\n${promise}\n\n`);
  
  process.exit(1);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  uncaughtExceptionHandler,
  unhandledRejectionHandler
};








