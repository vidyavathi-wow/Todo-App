// middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error('=== ERROR HANDLER ===');
  console.error('Error Type:', err.constructor.name);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.constructor.name === 'ValidationError') {
    statusCode = 400;
    message = err.message || 'Validation error';
  } else if (err.constructor.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (err.constructor.name === 'MulterError') {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Email already exists';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.message || 'Validation error';
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};

module.exports = errorHandler;
