/**
 * Centralized Security Configuration
 * This file contains all security-related configuration settings
 */

const SECURITY_CONFIG = {
  // CSRF Protection Settings
  csrf: {
    tokenExpiry: 60 * 60 * 1000, // 1 hour
    skipMethods: ['GET', 'HEAD', 'OPTIONS'],
    headerName: 'x-csrf-token',
    bodyField: '_csrf',
    logViolations: true
  },

  // Rate Limiting Settings
  rateLimit: {
    // General API rate limiting
    api: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many requests. Please try again later.'
    },
    
    // Contact form specific rate limiting
    contact: {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many contact form submissions. Please try again later.'
    },
    
    // Login attempts rate limiting
    login: {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many login attempts. Please try again later.'
    },
    
    // File upload rate limiting
    upload: {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: 'Too many file uploads. Please try again later.'
    }
  },

  // File Upload Security Settings
  fileUpload: {
    // Image uploads (blog, projects)
    images: {
      allowedTypes: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'image/gif'
      ],
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      checkMagicNumbers: true,
      allowExecutables: false,
      maxFilenameLength: 255
    },
    
    // Document uploads (if needed)
    documents: {
      allowedTypes: [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3,
      checkMagicNumbers: true,
      allowExecutables: false,
      maxFilenameLength: 255
    }
  },

  // Input Sanitization Settings
  sanitization: {
    // Default text sanitization
    text: {
      maxLength: 10000,
      allowHtml: false,
      preventSqlInjection: true,
      preventXss: true,
      removeControlChars: true
    },
    
    // HTML content sanitization (for blog posts)
    html: {
      allowedTags: [
        'p', 'br', 'strong', 'em', 'u', 'i', 'b',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a',
        'img', 'code', 'pre'
      ],
      allowedAttributes: {
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class', 'id']
      },
      removeScripts: true,
      removeEvents: true,
      removeForms: true,
      removeObjects: true
    },
    
    // Search query sanitization
    search: {
      maxLength: 200,
      allowedCharacters: 'a-zA-Z0-9\\s\\-_.,!?@#'
    },
    
    // Database field sanitization
    database: {
      preventSqlInjection: true,
      preventXss: true,
      maxLength: 50000,
      removeControlChars: true
    }
  },

  // Security Headers Configuration
  headers: {
    // Development environment headers
    development: {
      allowInlineScripts: true,
      allowInlineStyles: true,
      additionalScriptSources: ['localhost:*', '127.0.0.1:*'],
      additionalStyleSources: [],
      additionalImageSources: []
    },
    
    // Production environment headers
    production: {
      allowInlineScripts: false,
      allowInlineStyles: true,
      additionalScriptSources: [],
      additionalStyleSources: ['fonts.googleapis.com'],
      additionalImageSources: ['images.unsplash.com', 'via.placeholder.com']
    }
  },

  // Validation Schema Settings
  validation: {
    // Blog post validation
    blogPost: {
      title: { min: 1, max: 200 },
      content: { min: 10, max: 50000 },
      excerpt: { max: 500 },
      categories: { maxItems: 10, maxLength: 50 },
      tags: { maxItems: 20, maxLength: 30 }
    },
    
    // Project validation
    project: {
      title: { min: 1, max: 100 },
      description: { min: 10, max: 1000 },
      longDescription: { max: 5000 },
      technologies: { minItems: 1, maxItems: 20, maxLength: 30 },
      category: { max: 50 }
    },
    
    // Contact form validation
    contact: {
      name: { min: 1, max: 100 },
      email: { max: 254 },
      subject: { max: 200 },
      message: { min: 10, max: 2000 }
    }
  },

  // Logging Configuration
  logging: {
    // Security event logging
    security: {
      logFailedLogins: true,
      logCSRFViolations: true,
      logRateLimitViolations: true,
      logFileUploadViolations: true,
      logValidationFailures: true,
      logSuspiciousActivity: true,
      retentionDays: 30
    },
    
    // Error logging
    errors: {
      logAllErrors: true,
      includeStackTrace: process.env.NODE_ENV === 'development',
      sanitizeErrorMessages: true,
      retentionDays: 30
    },
    
    // Access logging
    access: {
      logAllRequests: true,
      logResponseTime: true,
      retentionDays: 7
    }
  },

  // Session Security Settings
  session: {
    timeout: 24 * 60 * 60 * 1000, // 24 hours
    cookieSettings: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Password Security Settings
  password: {
    bcryptRounds: 12,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }
};

/**
 * Get security configuration for specific component
 */
function getSecurityConfig(component, environment = process.env.NODE_ENV) {
  if (!SECURITY_CONFIG[component]) {
    throw new Error(`Security configuration not found for component: ${component}`);
  }
  
  const config = { ...SECURITY_CONFIG[component] };
  
  // Apply environment-specific overrides
  if (config[environment]) {
    Object.assign(config, config[environment]);
    delete config.development;
    delete config.production;
  }
  
  return config;
}

/**
 * Validate security configuration
 */
function validateSecurityConfig() {
  const requiredEnvVars = [
    'CSRF_SECRET',
    'SESSION_SECRET',
    'JWT_SECRET'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables for security: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

module.exports = {
  SECURITY_CONFIG,
  getSecurityConfig,
  validateSecurityConfig
};