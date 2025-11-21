const crypto = require('crypto');
const Joi = require('joi');

/**
 * CSRF Token Management
 */
class CSRFProtection {
  constructor() {
    this.tokens = new Map();
    this.secret = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate CSRF token for session
   */
  generateToken(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    
    // Store token with expiration (1 hour)
    this.tokens.set(token, {
      sessionId,
      timestamp,
      expires: timestamp + (60 * 60 * 1000) // 1 hour
    });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  /**
   * Validate CSRF token
   */
  validateToken(token, sessionId) {
    if (!token || !sessionId) {
      return false;
    }

    const tokenData = this.tokens.get(token);
    if (!tokenData) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > tokenData.expires) {
      this.tokens.delete(token);
      return false;
    }

    // Check if token belongs to session
    if (tokenData.sessionId !== sessionId) {
      return false;
    }

    return true;
  }

  /**
   * Consume CSRF token (one-time use)
   */
  consumeToken(token, sessionId) {
    const isValid = this.validateToken(token, sessionId);
    if (isValid) {
      this.tokens.delete(token);
    }
    return isValid;
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(token);
      }
    }
  }
}

// Global CSRF protection instance
const csrfProtection = new CSRFProtection();

/**
 * Input Sanitization Functions
 */

/**
 * Comprehensive HTML sanitization to prevent XSS
 */
function sanitizeHtml(input, options = {}) {
  if (typeof input !== 'string') return input;
  
  const {
    allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a'],
    allowedAttributes = { 'a': ['href', 'title'], '*': ['class'] },
    removeScripts = true,
    removeEvents = true,
    removeForms = true,
    removeObjects = true
  } = options;
  
  let sanitized = input;
  
  if (removeScripts) {
    // Remove script tags and their content (case insensitive, handles various formats)
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<script[^>]*>/gi, '');
    
    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript\s*:/gi, '');
    
    // Remove vbscript: protocol
    sanitized = sanitized.replace(/vbscript\s*:/gi, '');
    
    // Remove data: URLs that could contain javascript
    sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, 'data:text/plain');
    sanitized = sanitized.replace(/data\s*:\s*application\/javascript/gi, 'data:text/plain');
  }
  
  if (removeEvents) {
    // Remove all on* event handlers (comprehensive list)
    const eventHandlers = [
      'onabort', 'onblur', 'onchange', 'onclick', 'ondblclick', 'onerror', 'onfocus',
      'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onmousedown', 'onmousemove',
      'onmouseout', 'onmouseover', 'onmouseup', 'onreset', 'onresize', 'onselect',
      'onsubmit', 'onunload', 'oncontextmenu', 'ondrag', 'ondragend', 'ondragenter',
      'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onmousewheel', 'onscroll',
      'onanimationend', 'onanimationiteration', 'onanimationstart', 'ontransitionend'
    ];
    
    eventHandlers.forEach(event => {
      const regex = new RegExp(`\\s*${event}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    // Generic on* handler removal as fallback
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  }
  
  // Remove style attributes that could contain javascript
  sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*expression\s*\([^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*javascript\s*:[^"']*["']/gi, '');
  
  if (removeObjects) {
    // Remove potentially dangerous tags
    sanitized = sanitized.replace(/<(object|embed|applet|iframe|frame|frameset)[^>]*>.*?<\/\1>/gi, '');
    sanitized = sanitized.replace(/<(object|embed|applet|iframe|frame|frameset)[^>]*\/?>/gi, '');
  }
  
  if (removeForms) {
    // Remove form tags but preserve content
    sanitized = sanitized.replace(/<\/?form[^>]*>/gi, '');
    sanitized = sanitized.replace(/<(input|button|textarea|select|option)[^>]*>/gi, '');
  }
  
  // Remove dangerous HTML tags
  sanitized = sanitized.replace(/<(meta|link|base|title|head|html|body)[^>]*>/gi, '');
  
  // Remove comments that could contain malicious code
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove CDATA sections
  sanitized = sanitized.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  
  // If allowedTags is specified, remove all other tags
  if (allowedTags.length > 0) {
    // Create regex to match all HTML tags
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    sanitized = sanitized.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        // Keep allowed tags but sanitize attributes
        return sanitizeTagAttributes(match, tagName, allowedAttributes);
      }
      return ''; // Remove disallowed tags
    });
  }
  
  // Final cleanup - remove any remaining dangerous patterns
  sanitized = sanitized.replace(/&lt;script/gi, '&amp;lt;script');
  sanitized = sanitized.replace(/&lt;\/script/gi, '&amp;lt;/script');
  
  return sanitized;
}

/**
 * Sanitize HTML tag attributes
 */
function sanitizeTagAttributes(tag, tagName, allowedAttributes) {
  const tagLower = tagName.toLowerCase();
  const allowedForTag = allowedAttributes[tagLower] || allowedAttributes['*'] || [];
  
  if (allowedForTag.length === 0) {
    // No attributes allowed, return just the tag name
    return `<${tagName}>`;
  }
  
  // Extract and filter attributes
  const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/g;
  let match;
  const validAttrs = [];
  
  while ((match = attrRegex.exec(tag)) !== null) {
    const [, attrName, attrValue] = match;
    
    if (allowedForTag.includes(attrName.toLowerCase())) {
      // Sanitize attribute value
      let sanitizedValue = attrValue;
      
      // Special handling for href attributes
      if (attrName.toLowerCase() === 'href') {
        sanitizedValue = sanitizeUrl(attrValue);
        if (!sanitizedValue) continue; // Skip invalid URLs
      } else {
        // General attribute sanitization
        sanitizedValue = sanitizedValue
          .replace(/javascript\s*:/gi, '')
          .replace(/vbscript\s*:/gi, '')
          .replace(/data\s*:/gi, '')
          .replace(/[<>]/g, '');
      }
      
      validAttrs.push(`${attrName}="${sanitizedValue}"`);
    }
  }
  
  const isClosing = tag.startsWith('</');
  const isSelfClosing = tag.endsWith('/>');
  
  if (isClosing) {
    return `</${tagName}>`;
  } else if (isSelfClosing) {
    return validAttrs.length > 0 ? `<${tagName} ${validAttrs.join(' ')} />` : `<${tagName} />`;
  } else {
    return validAttrs.length > 0 ? `<${tagName} ${validAttrs.join(' ')}>` : `<${tagName}>`;
  }
}

/**
 * Enhanced text input sanitization
 */
function sanitizeText(input, options = {}) {
  if (typeof input !== 'string') return input;
  
  const {
    maxLength = 10000,
    allowHtml = false,
    trimWhitespace = true,
    preventSqlInjection = true,
    preventXss = true,
    allowedCharacters = null, // Regex pattern for allowed characters
    removeControlChars = true
  } = options;
  
  let sanitized = input;
  
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }
  
  // Remove control characters (except newlines and tabs if HTML is allowed)
  if (removeControlChars) {
    if (allowHtml) {
      // Keep newlines, tabs, and carriage returns for HTML content
      sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    } else {
      // Remove all control characters except space, newline, and tab
      sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }
  }
  
  // SQL injection prevention
  if (preventSqlInjection) {
    // Remove or escape common SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/|;|'|"|`)/g,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
      /(\bOR\b|\bAND\b)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?/gi
    ];
    
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
  }
  
  // XSS prevention
  if (preventXss && !allowHtml) {
    // Remove potential XSS vectors
    sanitized = sanitized
      .replace(/javascript\s*:/gi, '')
      .replace(/vbscript\s*:/gi, '')
      .replace(/data\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&lt;script/gi, '')
      .replace(/&lt;\/script/gi, '');
  }
  
  if (!allowHtml) {
    // Decode HTML entities to prevent double encoding issues
    sanitized = sanitized
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`');
      
    // Then re-encode dangerous characters
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;');
  } else {
    sanitized = sanitizeHtml(sanitized);
  }
  
  // Apply character whitelist if specified
  if (allowedCharacters) {
    const regex = new RegExp(`[^${allowedCharacters}]`, 'g');
    sanitized = sanitized.replace(regex, '');
  }
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize input specifically for database queries
 */
function sanitizeForDatabase(input) {
  if (typeof input !== 'string') return input;
  
  return sanitizeText(input, {
    preventSqlInjection: true,
    preventXss: true,
    allowHtml: false,
    removeControlChars: true,
    maxLength: 10000
  });
}

/**
 * Sanitize search query input
 */
function sanitizeSearchQuery(input) {
  if (typeof input !== 'string') return input;
  
  return sanitizeText(input, {
    maxLength: 200,
    allowHtml: false,
    preventSqlInjection: true,
    preventXss: true,
    // Allow alphanumeric, spaces, and common search characters
    allowedCharacters: 'a-zA-Z0-9\\s\\-_.,!?@#'
  });
}

/**
 * Enhanced email sanitization and validation
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  
  let sanitized = email.trim().toLowerCase();
  
  // Remove dangerous characters that could be used for injection
  sanitized = sanitized.replace(/[<>'"]/g, '');
  
  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    /<script/i,
    /on\w+=/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(sanitized))) {
    return '';
  }
  
  // RFC 5321 length limit
  if (sanitized.length > 254) {
    return '';
  }
  
  // Additional validation for local and domain parts
  const [localPart, domainPart] = sanitized.split('@');
  
  if (!localPart || !domainPart || localPart.length > 64 || domainPart.length > 253) {
    return '';
  }
  
  // Check for consecutive dots
  if (sanitized.includes('..')) {
    return '';
  }
  
  return sanitized;
}

/**
 * Enhanced URL sanitization and validation
 */
function sanitizeUrl(url, options = {}) {
  if (typeof url !== 'string') return '';
  
  const {
    allowedProtocols = ['http:', 'https:'],
    allowedDomains = null, // Array of allowed domains, null for any
    maxLength = 2048,
    removeFragment = false,
    removeQuery = false
  } = options;
  
  let sanitized = url.trim();
  
  // Length check
  if (sanitized.length > maxLength) {
    return '';
  }
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>"']/g, '');
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    /file:/i,
    /ftp:/i,
    /<script/i,
    /on\w+=/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(sanitized))) {
    return '';
  }
  
  try {
    const urlObj = new URL(sanitized);
    
    // Check protocol
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '';
    }
    
    // Check domain whitelist if specified
    if (allowedDomains && !allowedDomains.includes(urlObj.hostname)) {
      return '';
    }
    
    // Remove fragment if requested
    if (removeFragment) {
      urlObj.hash = '';
    }
    
    // Remove query parameters if requested
    if (removeQuery) {
      urlObj.search = '';
    }
    
    // Additional security checks
    const reconstructed = urlObj.toString();
    
    // Check for encoded dangerous patterns
    const encodedPatterns = [
      /%3Cscript/i, // <script
      /%6A%61%76%61%73%63%72%69%70%74/i, // javascript
      /%76%62%73%63%72%69%70%74/i // vbscript
    ];
    
    if (encodedPatterns.some(pattern => pattern.test(reconstructed))) {
      return '';
    }
    
    return reconstructed;
  } catch {
    return '';
  }
}

/**
 * Sanitize phone number input
 */
function sanitizePhoneNumber(phone) {
  if (typeof phone !== 'string') return '';
  
  // Remove all non-digit characters except + and spaces
  let sanitized = phone.replace(/[^\d\s+()-]/g, '');
  
  // Limit length (international numbers can be up to 15 digits)
  if (sanitized.replace(/\D/g, '').length > 15) {
    return '';
  }
  
  return sanitized.trim();
}

/**
 * Validation Schemas
 */

const blogPostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must be less than 200 characters'
  }),
  content: Joi.string().min(10).max(50000).required().messages({
    'string.empty': 'Content is required',
    'string.min': 'Content must be at least 10 characters',
    'string.max': 'Content must be less than 50,000 characters'
  }),
  excerpt: Joi.string().max(500).allow('').messages({
    'string.max': 'Excerpt must be less than 500 characters'
  }),
  categories: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  tags: Joi.array().items(Joi.string().max(30)).max(20).default([]),
  status: Joi.string().valid('draft', 'published').default('draft'),
  featuredImage: Joi.string().uri().allow('').messages({
    'string.uri': 'Featured image must be a valid URL'
  })
});

const projectSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must be less than 100 characters'
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description must be less than 1000 characters'
  }),
  longDescription: Joi.string().max(5000).allow('').messages({
    'string.max': 'Long description must be less than 5000 characters'
  }),
  technologies: Joi.array().items(Joi.string().max(30)).min(1).max(20).required().messages({
    'array.min': 'At least one technology is required',
    'array.max': 'Maximum 20 technologies allowed'
  }),
  category: Joi.string().max(50).required().messages({
    'string.empty': 'Category is required'
  }),
  liveUrl: Joi.string().uri().allow('').messages({
    'string.uri': 'Live URL must be a valid URL'
  }),
  githubUrl: Joi.string().uri().allow('').messages({
    'string.uri': 'GitHub URL must be a valid URL'
  }),
  featured: Joi.boolean().default(false),
  order: Joi.number().integer().min(0).default(0)
});

const contactSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.max': 'Name must be less than 100 characters'
  }),
  email: Joi.string().email().max(254).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must be less than 254 characters'
  }),
  subject: Joi.string().max(200).allow('').messages({
    'string.max': 'Subject must be less than 200 characters'
  }),
  message: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 10 characters',
    'string.max': 'Message must be less than 2000 characters'
  })
});

/**
 * File Upload Security
 */

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Dangerous file signatures (magic numbers)
const DANGEROUS_SIGNATURES = {
  // Executable files
  'MZ': 'exe', // Windows executable
  '\x7fELF': 'elf', // Linux executable
  '\xca\xfe\xba\xbe': 'java', // Java class file
  'PK': 'zip', // ZIP/JAR files (could contain executables)
  
  // Script files
  '<?php': 'php',
  '<%': 'asp',
  '<script': 'js',
  '#!/bin/sh': 'shell',
  '#!/bin/bash': 'shell'
};

/**
 * Check file signature for dangerous content
 */
function checkFileSignature(buffer) {
  if (!buffer || buffer.length < 4) return null;
  
  const header = buffer.toString('ascii', 0, Math.min(buffer.length, 20));
  
  for (const [signature, type] of Object.entries(DANGEROUS_SIGNATURES)) {
    if (header.startsWith(signature)) {
      return type;
    }
  }
  
  return null;
}

/**
 * Enhanced file upload validation with security checks
 */
function validateFileUpload(file, options = {}) {
  const {
    allowedTypes = ALLOWED_IMAGE_TYPES,
    maxSize = 5 * 1024 * 1024, // 5MB default
    maxFiles = 1,
    checkMagicNumbers = true,
    allowExecutables = false,
    maxFilenameLength = 255
  } = options;

  const errors = [];
  const warnings = [];

  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors, warnings };
  }

  // Handle multiple files
  const files = Array.isArray(file) ? file : [file];
  
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} file(s) allowed`);
  }

  for (const singleFile of files) {
    // Check file type
    if (!allowedTypes.includes(singleFile.mimetype)) {
      errors.push(`Invalid file type: ${singleFile.mimetype}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (singleFile.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
      errors.push(`File too large: ${(singleFile.size / 1024 / 1024).toFixed(1)}MB. Maximum size: ${maxSizeMB}MB`);
    }

    // Check for empty files
    if (singleFile.size === 0) {
      errors.push('Empty files are not allowed');
    }

    // Enhanced filename security checks
    if (singleFile.originalname) {
      const filename = singleFile.originalname;
      const filenameLower = filename.toLowerCase();
      
      // Check filename length
      if (filename.length > maxFilenameLength) {
        errors.push(`Filename too long: ${filename.length} characters. Maximum: ${maxFilenameLength}`);
      }

      // Check for dangerous extensions
      const dangerousExtensions = [
        '.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar', 
        '.php', '.asp', '.jsp', '.js', '.vbs', '.ps1', '.sh',
        '.msi', '.deb', '.rpm', '.dmg', '.app', '.ipa', '.apk'
      ];
      
      if (dangerousExtensions.some(ext => filenameLower.endsWith(ext))) {
        errors.push(`Dangerous file extension detected: ${filename}`);
      }

      // Check for path traversal attempts
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        errors.push('Invalid filename: path traversal detected');
      }

      // Check for null bytes and control characters
      if (filename.includes('\0') || /[\x00-\x1f\x7f-\x9f]/.test(filename)) {
        errors.push('Invalid filename: contains control characters');
      }

      // Check for reserved Windows filenames
      const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
      const nameWithoutExt = filename.split('.')[0].toUpperCase();
      if (reservedNames.includes(nameWithoutExt)) {
        errors.push(`Reserved filename not allowed: ${filename}`);
      }

      // Check for double extensions (potential disguised executables)
      const extensions = filename.split('.').slice(1);
      if (extensions.length > 1) {
        const secondLastExt = extensions[extensions.length - 2].toLowerCase();
        if (dangerousExtensions.some(ext => ext === '.' + secondLastExt)) {
          warnings.push(`Double extension detected: ${filename}. This could be a disguised executable.`);
        }
      }
    }

    // Check file content signature (magic numbers)
    if (checkMagicNumbers && singleFile.buffer) {
      const detectedType = checkFileSignature(singleFile.buffer);
      if (detectedType && !allowExecutables) {
        if (['exe', 'elf', 'java', 'php', 'asp', 'js', 'shell'].includes(detectedType)) {
          errors.push(`Dangerous file content detected: ${detectedType} signature found`);
        } else if (detectedType === 'zip') {
          warnings.push('ZIP file detected. Contents should be scanned separately.');
        }
      }
    }

    // Additional image-specific validation
    if (allowedTypes.some(type => type.startsWith('image/')) && singleFile.mimetype.startsWith('image/')) {
      // Check for embedded scripts in image files
      if (singleFile.buffer) {
        const content = singleFile.buffer.toString('ascii');
        if (content.includes('<script') || content.includes('javascript:') || content.includes('<?php')) {
          errors.push('Image file contains embedded scripts');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate secure filename
 */
function generateSecureFilename(originalName, prefix = '') {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = originalName ? originalName.split('.').pop().toLowerCase() : '';
  
  // Sanitize extension
  const safeExt = ext.replace(/[^a-z0-9]/g, '');
  
  return prefix 
    ? `${prefix}-${timestamp}-${random}.${safeExt}`
    : `${timestamp}-${random}.${safeExt}`;
}

/**
 * Rate Limiting
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  /**
   * Check if request is within rate limit
   */
  checkLimit(identifier, options = {}) {
    const {
      maxRequests = 100,
      windowMs = 15 * 60 * 1000, // 15 minutes
      skipSuccessfulRequests = false
    } = options;

    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request data
    let requestData = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    requestData = requestData.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (requestData.length >= maxRequests) {
      const oldestRequest = Math.min(...requestData);
      const resetTime = oldestRequest + windowMs;
      const remainingTime = Math.ceil((resetTime - now) / 1000);
      
      return {
        allowed: false,
        resetTime: remainingTime,
        remaining: 0
      };
    }

    // Add current request
    requestData.push(now);
    this.requests.set(identifier, requestData);

    return {
      allowed: true,
      remaining: maxRequests - requestData.length,
      resetTime: Math.ceil(windowMs / 1000)
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier) {
    this.requests.delete(identifier);
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Enhanced Security Headers
 */
function getSecurityHeaders(options = {}) {
  const {
    isDevelopment = process.env.NODE_ENV === 'development',
    allowInlineScripts = false,
    allowInlineStyles = true,
    additionalScriptSources = [],
    additionalStyleSources = [],
    additionalImageSources = []
  } = options;
  
  const scriptSrc = [
    "'self'",
    ...(allowInlineScripts ? ["'unsafe-inline'"] : []),
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ...additionalScriptSources
  ];
  
  const styleSrc = [
    "'self'",
    ...(allowInlineStyles ? ["'unsafe-inline'"] : []),
    ...additionalStyleSources
  ];
  
  const imgSrc = [
    "'self'",
    "data:",
    "https:",
    ...additionalImageSources
  ];
  
  return {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Enable XSS filtering
    'X-XSS-Protection': '1; mode=block',
    
    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Disable dangerous browser features
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '),
    
    // Comprehensive Content Security Policy
    'Content-Security-Policy': [
      `default-src 'self'`,
      `script-src ${scriptSrc.join(' ')}`,
      `style-src ${styleSrc.join(' ')}`,
      `img-src ${imgSrc.join(' ')}`,
      `font-src 'self'`,
      `connect-src 'self'`,
      `media-src 'self'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`
    ].join('; '),
    
    // Prevent caching of sensitive content
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    
    // Additional security headers
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  };
}

/**
 * Get security headers for static assets
 */
function getStaticAssetHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  };
}

module.exports = {
  // CSRF Protection
  csrfProtection,
  
  // Input Sanitization
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizePhoneNumber,
  sanitizeForDatabase,
  sanitizeSearchQuery,
  sanitizeTagAttributes,
  
  // Validation Schemas
  blogPostSchema,
  projectSchema,
  contactSchema,
  
  // File Upload Security
  validateFileUpload,
  generateSecureFilename,
  checkFileSignature,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  
  // Rate Limiting
  rateLimiter,
  RateLimiter,
  
  // Security Headers
  getSecurityHeaders,
  getStaticAssetHeaders
};