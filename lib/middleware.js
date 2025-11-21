const { extractTokenFromRequest, validateSession, isAdmin } = require('./auth');
const { 
  csrfProtection, 
  sanitizeText, 
  sanitizeHtml, 
  sanitizeEmail, 
  sanitizeUrl,
  rateLimiter,
  getSecurityHeaders
} = require('./security');

/**
 * Authentication middleware for API routes
 * Validates session and attaches user to request object
 */
function withAuth(handler) {
  return async function authMiddleware(req, res) {
    try {
      // Extract token from request
      const token = extractTokenFromRequest(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please log in.'
          }
        });
      }

      // Validate session
      const session = await validateSession(token);
      
      if (!session || !session.isValid) {
        // Clear invalid session cookie
        res.setHeader('Set-Cookie', 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict');
        
        return res.status(401).json({
          success: false,
          error: {
            code: 'SESSION_EXPIRED',
            message: 'Session has expired. Please log in again.'
          }
        });
      }

      // Check session timeout (24 hours)
      const sessionAge = Date.now() - new Date(session.user.lastLogin || 0).getTime();
      const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > SESSION_TIMEOUT) {
        // Clear expired session cookie
        res.setHeader('Set-Cookie', 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict');
        
        return res.status(401).json({
          success: false,
          error: {
            code: 'SESSION_TIMEOUT',
            message: 'Session has timed out due to inactivity. Please log in again.'
          }
        });
      }

      // Attach user to request object
      req.user = session.user;
      req.session = session;

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication error occurred'
        }
      });
    }
  };
}

/**
 * Admin-only middleware for API routes
 * Validates session and checks for admin role
 */
function withAdminAuth(handler) {
  return withAuth(async function adminMiddleware(req, res) {
    try {
      // Check if user has admin role
      if (!req.user || !isAdmin(req.user)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required. Insufficient permissions.'
          }
        });
      }

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Admin middleware error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authorization error occurred'
        }
      });
    }
  });
}

/**
 * Optional authentication middleware
 * Attaches user to request if authenticated, but doesn't require authentication
 */
function withOptionalAuth(handler) {
  return async function optionalAuthMiddleware(req, res) {
    try {
      // Extract token from request
      const token = extractTokenFromRequest(req);
      
      if (token) {
        // Validate session if token exists
        const session = await validateSession(token);
        
        if (session && session.isValid) {
          // Attach user to request object if valid
          req.user = session.user;
          req.session = session;
        }
      }

      // Call the original handler regardless of authentication status
      return handler(req, res);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      // Continue without authentication on error
      return handler(req, res);
    }
  };
}

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP address
 */
const requestCounts = new Map();

function withRateLimit(options = {}) {
  const {
    maxRequests = 100,
    windowMs = 15 * 60 * 1000, // 15 minutes
    message = 'Too many requests. Please try again later.',
    skipSuccessfulRequests = false
  } = options;

  return function rateLimitMiddleware(handler) {
    return async function rateLimitedHandler(req, res) {
      try {
        // Get client IP
        const clientIP = req.headers['x-forwarded-for'] || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress ||
                        'unknown';

        const now = Date.now();
        const windowStart = now - windowMs;

        // Get or create request count for this IP
        let requestData = requestCounts.get(clientIP) || { requests: [], windowStart: now };

        // Remove old requests outside the window
        requestData.requests = requestData.requests.filter(timestamp => timestamp > windowStart);

        // Check if limit exceeded
        if (requestData.requests.length >= maxRequests) {
          const resetTime = Math.ceil((requestData.requests[0] + windowMs - now) / 1000);
          
          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: message,
              retryAfter: resetTime
            }
          });
        }

        // Add current request
        requestData.requests.push(now);
        requestCounts.set(clientIP, requestData);

        // Call the original handler
        const result = await handler(req, res);

        // Remove request from count if it was successful and skipSuccessfulRequests is true
        if (skipSuccessfulRequests && res.statusCode < 400) {
          requestData.requests.pop();
          requestCounts.set(clientIP, requestData);
        }

        return result;
      } catch (error) {
        console.error('Rate limit middleware error:', error);
        return handler(req, res);
      }
    };
  };
}

/**
 * CORS middleware for API routes
 */
function withCors(options = {}) {
  const {
    origin = process.env.NODE_ENV === 'production' ? false : '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = true
  } = options;

  return function corsMiddleware(handler) {
    return async function corsHandler(req, res) {
      // Set CORS headers
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      
      if (credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      // Call the original handler
      return handler(req, res);
    };
  };
}

/**
 * Method validation middleware
 * Ensures only specified HTTP methods are allowed
 */
function withMethods(allowedMethods) {
  return function methodMiddleware(handler) {
    return async function methodHandler(req, res) {
      if (!allowedMethods.includes(req.method)) {
        return res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
          }
        });
      }

      return handler(req, res);
    };
  };
}

/**
 * Input validation middleware
 * Validates request body against a schema
 */
function withValidation(schema, options = {}) {
  const { validateQuery = false, validateBody = true } = options;

  return function validationMiddleware(handler) {
    return async function validationHandler(req, res) {
      try {
        if (validateBody && req.body) {
          const { error, value } = schema.validate(req.body, { abortEarly: false });
          if (error) {
            return res.status(400).json({
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: error.details.map(detail => ({
                  field: detail.path.join('.'),
                  message: detail.message
                }))
              }
            });
          }
          req.body = value;
        }

        if (validateQuery && req.query) {
          const { error, value } = schema.validate(req.query, { abortEarly: false });
          if (error) {
            return res.status(400).json({
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid query parameters',
                details: error.details.map(detail => ({
                  field: detail.path.join('.'),
                  message: detail.message
                }))
              }
            });
          }
          req.query = value;
        }

        return handler(req, res);
      } catch (error) {
        console.error('Validation middleware error:', error);
        return res.status(500).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error occurred'
          }
        });
      }
    };
  };
}

/**
 * Enhanced error handling middleware with comprehensive logging
 */
function withErrorHandling(options = {}) {
  const {
    logErrors = true,
    includeStackTrace = process.env.NODE_ENV === 'development',
    customErrorCodes = {},
    sanitizeErrorMessages = true
  } = options;

  return function errorHandlingMiddleware(handler) {
    return async function errorHandler(req, res) {
      try {
        return await handler(req, res);
      } catch (error) {
        // Log the error with context
        if (logErrors) {
          const { securityLogger } = require('./logger');
          await securityLogger.logError(error, {
            method: req.method,
            url: req.url,
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            userId: req.user?.id || null,
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
            query: Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : undefined
          });
        }

        // Determine error type and status code
        let statusCode = 500;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let message = 'An internal server error occurred';

        // Handle specific error types
        if (error.name === 'ValidationError') {
          statusCode = 400;
          errorCode = 'VALIDATION_ERROR';
          message = 'Invalid input data';
        } else if (error.name === 'UnauthorizedError') {
          statusCode = 401;
          errorCode = 'UNAUTHORIZED';
          message = 'Authentication required';
        } else if (error.name === 'ForbiddenError') {
          statusCode = 403;
          errorCode = 'FORBIDDEN';
          message = 'Access denied';
        } else if (error.name === 'NotFoundError') {
          statusCode = 404;
          errorCode = 'NOT_FOUND';
          message = 'Resource not found';
        } else if (error.code === 'ENOENT') {
          statusCode = 404;
          errorCode = 'FILE_NOT_FOUND';
          message = 'File not found';
        } else if (error.code === 'EACCES') {
          statusCode = 403;
          errorCode = 'ACCESS_DENIED';
          message = 'Access denied';
        }

        // Apply custom error codes if provided
        if (customErrorCodes[error.name]) {
          const customError = customErrorCodes[error.name];
          statusCode = customError.statusCode || statusCode;
          errorCode = customError.code || errorCode;
          message = customError.message || message;
        }

        // Sanitize error message if needed
        if (sanitizeErrorMessages && error.message) {
          const { sanitizeText } = require('./security');
          const sanitizedMessage = sanitizeText(error.message, {
            maxLength: 500,
            preventXss: true,
            allowHtml: false
          });
          
          // Only use sanitized message if it's different and not empty
          if (sanitizedMessage && sanitizedMessage !== error.message) {
            message = sanitizedMessage;
          }
        }

        // Build error response
        const errorResponse = {
          success: false,
          error: {
            code: errorCode,
            message: message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        };

        // Include additional details in development
        if (includeStackTrace) {
          errorResponse.error.details = error.message;
          errorResponse.error.stack = error.stack;
        }

        // Set appropriate headers
        res.setHeader('Content-Type', 'application/json');
        
        // Add security headers even for error responses
        const { getSecurityHeaders } = require('./security');
        const securityHeaders = getSecurityHeaders();
        Object.entries(securityHeaders).forEach(([key, value]) => {
          res.setHeader(key, value);
        });

        return res.status(statusCode).json(errorResponse);
      }
    };
  };
}

/**
 * Enhanced CSRF Protection Middleware
 */
function withCSRF(options = {}) {
  const { 
    skipMethods = ['GET', 'HEAD', 'OPTIONS'],
    headerName = 'x-csrf-token',
    bodyField = '_csrf',
    logViolations = true
  } = options;

  return function csrfMiddleware(handler) {
    return async function csrfHandler(req, res) {
      // Skip CSRF for safe methods
      if (skipMethods.includes(req.method)) {
        return handler(req, res);
      }

      try {
        // Extract session ID from token
        const token = extractTokenFromRequest(req);
        const session = await validateSession(token);
        
        if (!session || !session.isValid) {
          if (logViolations) {
            const { securityLogger } = require('./logger');
            await securityLogger.logCSRFViolation(
              req.headers['x-forwarded-for'] || req.connection.remoteAddress,
              req.headers['user-agent'],
              req.url
            );
          }
          
          return res.status(401).json({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Valid session required for CSRF protection'
            }
          });
        }

        const sessionId = session.user.id;
        const csrfToken = req.headers[headerName] || req.body?.[bodyField];

        if (!csrfToken) {
          if (logViolations) {
            const { securityLogger } = require('./logger');
            await securityLogger.logCSRFViolation(
              req.headers['x-forwarded-for'] || req.connection.remoteAddress,
              req.headers['user-agent'],
              req.url
            );
          }
          
          return res.status(403).json({
            success: false,
            error: {
              code: 'CSRF_TOKEN_MISSING',
              message: 'CSRF token is required'
            }
          });
        }

        // Validate and consume CSRF token
        const isValidCSRF = csrfProtection.consumeToken(csrfToken, sessionId);
        if (!isValidCSRF) {
          if (logViolations) {
            const { securityLogger } = require('./logger');
            await securityLogger.logCSRFViolation(
              req.headers['x-forwarded-for'] || req.connection.remoteAddress,
              req.headers['user-agent'],
              req.url
            );
          }
          
          return res.status(403).json({
            success: false,
            error: {
              code: 'CSRF_TOKEN_INVALID',
              message: 'Invalid or expired CSRF token'
            }
          });
        }

        return handler(req, res);
      } catch (error) {
        console.error('CSRF middleware error:', error);
        
        const { securityLogger } = require('./logger');
        await securityLogger.logError(error, {
          middleware: 'CSRF',
          method: req.method,
          url: req.url,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });
        
        return res.status(500).json({
          success: false,
          error: {
            code: 'CSRF_ERROR',
            message: 'CSRF validation error'
          }
        });
      }
    };
  };
}

/**
 * Enhanced Input Sanitization Middleware
 */
function withSanitization(options = {}) {
  const {
    sanitizeBody = true,
    sanitizeQuery = true,
    sanitizeHeaders = false,
    htmlFields = [],
    emailFields = ['email'],
    urlFields = ['url', 'website', 'link', 'liveUrl', 'githubUrl'],
    phoneFields = ['phone', 'phoneNumber', 'mobile'],
    searchFields = ['search', 'query', 'q'],
    databaseFields = [], // Fields that will be stored in database
    logViolations = true,
    strictMode = false // In strict mode, reject requests with suspicious content
  } = options;

  return function sanitizationMiddleware(handler) {
    return async function sanitizationHandler(req, res) {
      try {
        const violations = [];
        
        // Sanitize request body
        if (sanitizeBody && req.body && typeof req.body === 'object') {
          const result = sanitizeObject(req.body, { 
            htmlFields, 
            emailFields, 
            urlFields, 
            phoneFields, 
            searchFields, 
            databaseFields,
            strictMode 
          });
          req.body = result.sanitized;
          violations.push(...result.violations);
        }

        // Sanitize query parameters
        if (sanitizeQuery && req.query && typeof req.query === 'object') {
          const result = sanitizeObject(req.query, { 
            htmlFields, 
            emailFields, 
            urlFields, 
            phoneFields, 
            searchFields, 
            databaseFields,
            strictMode 
          });
          req.query = result.sanitized;
          violations.push(...result.violations);
        }

        // Sanitize specific headers if requested
        if (sanitizeHeaders && req.headers) {
          const headersToSanitize = ['user-agent', 'referer', 'origin'];
          headersToSanitize.forEach(header => {
            if (req.headers[header]) {
              const original = req.headers[header];
              req.headers[header] = sanitizeText(original, { 
                maxLength: 500, 
                preventXss: true, 
                preventSqlInjection: true 
              });
              
              if (original !== req.headers[header]) {
                violations.push(`Sanitized header: ${header}`);
              }
            }
          });
        }

        // Log violations if any
        if (violations.length > 0 && logViolations) {
          const { securityLogger } = require('./logger');
          await securityLogger.logValidationFailure(
            req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            req.url,
            violations,
            req.headers['user-agent']
          );
        }

        // In strict mode, reject requests with violations
        if (strictMode && violations.length > 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INPUT_VALIDATION_ERROR',
              message: 'Request contains potentially malicious content',
              details: violations
            }
          });
        }

        return handler(req, res);
      } catch (error) {
        console.error('Sanitization middleware error:', error);
        
        const { securityLogger } = require('./logger');
        await securityLogger.logError(error, {
          middleware: 'Sanitization',
          method: req.method,
          url: req.url,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });
        
        return res.status(500).json({
          success: false,
          error: {
            code: 'SANITIZATION_ERROR',
            message: 'Input sanitization error'
          }
        });
      }
    };
  };
}

/**
 * Enhanced object sanitization with violation tracking
 */
function sanitizeObject(obj, options = {}) {
  const { 
    htmlFields = [], 
    emailFields = [], 
    urlFields = [],
    phoneFields = [],
    searchFields = [],
    databaseFields = [],
    strictMode = false
  } = options;
  
  const sanitized = {};
  const violations = [];
  
  const { 
    sanitizeHtml, 
    sanitizeText, 
    sanitizeEmail, 
    sanitizeUrl, 
    sanitizePhoneNumber,
    sanitizeSearchQuery,
    sanitizeForDatabase
  } = require('./security');

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const original = value;
      let result;
      
      if (emailFields.includes(key)) {
        result = sanitizeEmail(value);
      } else if (urlFields.includes(key)) {
        result = sanitizeUrl(value);
      } else if (phoneFields.includes(key)) {
        result = sanitizePhoneNumber(value);
      } else if (searchFields.includes(key)) {
        result = sanitizeSearchQuery(value);
      } else if (databaseFields.includes(key)) {
        result = sanitizeForDatabase(value);
      } else if (htmlFields.includes(key)) {
        result = sanitizeHtml(value, {
          allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a'],
          allowedAttributes: { 'a': ['href', 'title'], '*': ['class'] }
        });
      } else {
        result = sanitizeText(value, {
          preventXss: true,
          preventSqlInjection: true,
          maxLength: 10000
        });
      }
      
      sanitized[key] = result;
      
      // Track violations
      if (original !== result) {
        violations.push(`Field '${key}' was sanitized`);
        
        // Check for potentially malicious content
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /on\w+=/i,
          /(union|select|insert|update|delete|drop)\s/i
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(original))) {
          violations.push(`Field '${key}' contained suspicious content: ${pattern}`);
        }
      }
      
    } else if (Array.isArray(value)) {
      const sanitizedArray = [];
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          const original = item;
          const sanitizedItem = sanitizeText(item, {
            preventXss: true,
            preventSqlInjection: true,
            maxLength: 1000
          });
          sanitizedArray.push(sanitizedItem);
          
          if (original !== sanitizedItem) {
            violations.push(`Array item at ${key}[${index}] was sanitized`);
          }
        } else if (item && typeof item === 'object') {
          const result = sanitizeObject(item, options);
          sanitizedArray.push(result.sanitized);
          violations.push(...result.violations);
        } else {
          sanitizedArray.push(item);
        }
      });
      sanitized[key] = sanitizedArray;
      
    } else if (value && typeof value === 'object') {
      const result = sanitizeObject(value, options);
      sanitized[key] = result.sanitized;
      violations.push(...result.violations);
    } else {
      sanitized[key] = value;
    }
  }

  return { sanitized, violations };
}

/**
 * Security Headers Middleware
 */
function withSecurityHeaders(handler) {
  return async function securityHeadersHandler(req, res) {
    // Set security headers
    const headers = getSecurityHeaders();
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }

    return handler(req, res);
  };
}

/**
 * Enhanced Rate Limiting Middleware
 */
function withEnhancedRateLimit(options = {}) {
  const {
    maxRequests = 100,
    windowMs = 15 * 60 * 1000, // 15 minutes
    message = 'Too many requests. Please try again later.',
    skipSuccessfulRequests = false,
    keyGenerator = (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
  } = options;

  return function rateLimitMiddleware(handler) {
    return async function rateLimitedHandler(req, res) {
      try {
        const identifier = keyGenerator(req);
        const result = rateLimiter.checkLimit(identifier, {
          maxRequests,
          windowMs,
          skipSuccessfulRequests
        });

        if (!result.allowed) {
          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: message,
              retryAfter: result.resetTime
            }
          });
        }

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + result.resetTime * 1000).toISOString());

        return handler(req, res);
      } catch (error) {
        console.error('Rate limit middleware error:', error);
        return handler(req, res);
      }
    };
  };
}

/**
 * Enhanced File Upload Security Middleware
 */
function withFileUploadSecurity(options = {}) {
  const {
    logViolations = true,
    quarantineFiles = false,
    scanContent = true
  } = options;

  return function fileUploadSecurityMiddleware(handler) {
    return async function fileUploadSecurityHandler(req, res) {
      try {
        // This middleware should be used after multer/formidable processing
        if (req.files || req.file) {
          const { validateFileUpload } = require('./security');
          
          const files = req.files || (req.file ? [req.file] : []);
          const validation = validateFileUpload(files, {
            ...options,
            checkMagicNumbers: scanContent
          });
          
          if (!validation.isValid) {
            // Log security violation
            if (logViolations) {
              const { securityLogger } = require('./logger');
              await securityLogger.logFileUploadViolation(
                req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                files.map(f => f.originalname || f.filename).join(', '),
                validation.errors.join('; '),
                req.headers['user-agent']
              );
            }
            
            return res.status(400).json({
              success: false,
              error: {
                code: 'FILE_VALIDATION_ERROR',
                message: 'File validation failed',
                details: validation.errors
              }
            });
          }
          
          // Log warnings if any
          if (validation.warnings && validation.warnings.length > 0) {
            if (logViolations) {
              const { securityLogger } = require('./logger');
              await securityLogger.logSecurity('FILE_UPLOAD_WARNING', {
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                warnings: validation.warnings,
                files: files.map(f => f.originalname || f.filename),
                userAgent: req.headers['user-agent']
              });
            }
            
            // Attach warnings to request for handler to use
            req.fileWarnings = validation.warnings;
          }
        }

        return handler(req, res);
      } catch (error) {
        console.error('File upload security middleware error:', error);
        
        const { securityLogger } = require('./logger');
        await securityLogger.logError(error, {
          middleware: 'FileUploadSecurity',
          method: req.method,
          url: req.url,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });
        
        return res.status(500).json({
          success: false,
          error: {
            code: 'FILE_SECURITY_ERROR',
            message: 'File security validation error'
          }
        });
      }
    };
  };
}

/**
 * Compose multiple middleware functions
 * Usage: compose(withAuth, withRateLimit(), withErrorHandling)(handler)
 */
function compose(...middlewares) {
  return function composedMiddleware(handler) {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc);
    }, handler);
  };
}

module.exports = {
  withAuth,
  withAdminAuth,
  withOptionalAuth,
  withRateLimit,
  withCors,
  withMethods,
  withValidation,
  withErrorHandling,
  withCSRF,
  withSanitization,
  withSecurityHeaders,
  withEnhancedRateLimit,
  withFileUploadSecurity,
  sanitizeObject,
  compose
};