const { create } = require('../../../lib/db');
const { sendContactEmail } = require('../../../lib/email');
const { generateId } = require('../../../lib/utils');
const { 
  withMethods, 
  withSanitization, 
  withEnhancedRateLimit, 
  withSecurityHeaders,
  withValidation,
  withErrorHandling,
  compose 
} = require('../../../lib/middleware');
const { contactSchema } = require('../../../lib/security');

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map();

/**
 * Rate limiting middleware
 */
function checkRateLimit(ip, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get or create rate limit data for this IP
  let requests = rateLimitStore.get(ip) || [];
  
  // Remove old requests outside the window
  requests = requests.filter(timestamp => timestamp > windowStart);
  
  // Check if limit exceeded
  if (requests.length >= maxRequests) {
    const oldestRequest = Math.min(...requests);
    const resetTime = oldestRequest + windowMs;
    const remainingTime = Math.ceil((resetTime - now) / 1000 / 60);
    
    throw new Error(`Rate limit exceeded. Try again in ${remainingTime} minutes.`);
  }
  
  // Add current request
  requests.push(now);
  rateLimitStore.set(ip, requests);
  
  return true;
}

/**
 * Get client IP address
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 2000); // Limit length
}

/**
 * Validate contact form data
 */
function validateContactData(data) {
  const errors = {};
  
  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Valid email address is required';
  }
  
  // Subject validation (optional)
  if (data.subject && data.subject.length > 200) {
    errors.subject = 'Subject must be less than 200 characters';
  }
  
  // Message validation
  if (!data.message || data.message.trim().length === 0) {
    errors.message = 'Message is required';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (data.message.trim().length > 2000) {
    errors.message = 'Message must be less than 2000 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const clientIP = getClientIP(req);
      
      // Extract form data (already sanitized by middleware)
      const { name, email, subject, message } = req.body;
      
      // Create contact submission record
      const submissionId = generateId();
      const submissionData = {
        id: submissionId,
        name,
        email,
        subject: subject || '',
        message,
        status: 'unread',
        submittedAt: new Date(),
        ipAddress: clientIP
      };
      
      // Save to database
      try {
        await create('contacts', submissionData);
      } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to save contact submission'
          }
        });
      }
      
      // Send email notification
      try {
        await sendContactEmail(submissionData);
      } catch (emailError) {
        console.error('Email error:', emailError);
        
        // Email failed but submission was saved
        // Return success but log the email failure
        return res.status(200).json({
          success: true,
          message: 'Your message has been received. We will get back to you soon.',
          warning: 'Email notification may be delayed'
        });
      }
      
      // Success response
      return res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon.',
        submissionId: submissionId
      });
      
    } catch (error) {
      console.error('Contact form error:', error);
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.'
        }
      });
    }
  }
}

export default compose(
  withMethods(['POST']),
  withSecurityHeaders,
  withSanitization({ 
    emailFields: ['email'],
    databaseFields: ['name', 'subject', 'message'],
    logViolations: true,
    strictMode: false
  }),
  withValidation(contactSchema),
  withEnhancedRateLimit({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many contact form submissions. Please try again later.'
  }),
  withErrorHandling({
    logErrors: true,
    sanitizeErrorMessages: true
  })
)(handler);