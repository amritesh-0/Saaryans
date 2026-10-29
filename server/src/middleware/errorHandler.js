import { errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Async handler wrapper to eliminate try/catch boilerplate
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  errorResponse(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global Error Handler Middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err.stack);

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';
  
  const errors = config.isProduction ? null : {
    stack: err.stack,
    details: err.details || null
  };

  errorResponse(res, message, statusCode, errors);
};

export default {
  asyncHandler,
  notFoundHandler,
  globalErrorHandler
};
