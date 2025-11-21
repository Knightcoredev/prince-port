const fs = require('fs').promises;
const path = require('path');

/**
 * Security Logger for tracking security events
 */
class SecurityLogger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.securityLogFile = path.join(this.logDir, 'security.log');
    this.errorLogFile = path.join(this.logDir, 'error.log');
    this.accessLogFile = path.join(this.logDir, 'access.log');
    
    // Ensure log directory exists
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  async ensureLogDirectory() {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log entry
   */
  formatLogEntry(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...metadata
    };
    
    return JSON.stringify(logEntry) + '\n';
  }

  /**
   * Write log entry to file
   */
  async writeLog(filename, entry) {
    try {
      await fs.appendFile(filename, entry);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  /**
   * Log security events
   */
  async logSecurity(event, details = {}) {
    const entry = this.formatLogEntry('SECURITY', event, {
      type: 'security_event',
      ...details
    });
    
    await this.writeLog(this.securityLogFile, entry);
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] ${event}`, details);
    }
  }

  /**
   * Log authentication events
   */
  async logAuth(event, userId, ip, details = {}) {
    await this.logSecurity(`AUTH_${event}`, {
      userId,
      ip,
      userAgent: details.userAgent,
      ...details
    });
  }

  /**
   * Log failed login attempts
   */
  async logFailedLogin(username, ip, reason, userAgent) {
    await this.logAuth('FAILED_LOGIN', null, ip, {
      username,
      reason,
      userAgent
    });
  }

  /**
   * Log successful login
   */
  async logSuccessfulLogin(userId, ip, userAgent) {
    await this.logAuth('SUCCESSFUL_LOGIN', userId, ip, {
      userAgent
    });
  }

  /**
   * Log logout events
   */
  async logLogout(userId, ip, userAgent) {
    await this.logAuth('LOGOUT', userId, ip, {
      userAgent
    });
  }

  /**
   * Log CSRF token violations
   */
  async logCSRFViolation(ip, userAgent, endpoint) {
    await this.logSecurity('CSRF_VIOLATION', {
      ip,
      userAgent,
      endpoint,
      severity: 'HIGH'
    });
  }

  /**
   * Log rate limit violations
   */
  async logRateLimitViolation(ip, endpoint, requestCount) {
    await this.logSecurity('RATE_LIMIT_VIOLATION', {
      ip,
      endpoint,
      requestCount,
      severity: 'MEDIUM'
    });
  }

  /**
   * Log file upload security violations
   */
  async logFileUploadViolation(ip, filename, reason, userAgent) {
    await this.logSecurity('FILE_UPLOAD_VIOLATION', {
      ip,
      filename,
      reason,
      userAgent,
      severity: 'HIGH'
    });
  }

  /**
   * Log input validation failures
   */
  async logValidationFailure(ip, endpoint, errors, userAgent) {
    await this.logSecurity('VALIDATION_FAILURE', {
      ip,
      endpoint,
      errors,
      userAgent,
      severity: 'LOW'
    });
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(ip, activity, details, userAgent) {
    await this.logSecurity('SUSPICIOUS_ACTIVITY', {
      ip,
      activity,
      details,
      userAgent,
      severity: 'HIGH'
    });
  }

  /**
   * Log errors
   */
  async logError(error, context = {}) {
    const entry = this.formatLogEntry('ERROR', error.message, {
      type: 'error',
      stack: error.stack,
      ...context
    });
    
    await this.writeLog(this.errorLogFile, entry);
    
    // Also log to console
    console.error('[ERROR]', error.message, context);
  }

  /**
   * Log API access
   */
  async logAccess(req, res, responseTime) {
    const entry = this.formatLogEntry('ACCESS', 'API_REQUEST', {
      type: 'access',
      method: req.method,
      url: req.url,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      statusCode: res.statusCode,
      responseTime,
      userId: req.user?.id || null
    });
    
    await this.writeLog(this.accessLogFile, entry);
  }

  /**
   * Get recent security events
   */
  async getRecentSecurityEvents(limit = 100) {
    try {
      const data = await fs.readFile(this.securityLogFile, 'utf8');
      const lines = data.trim().split('\n');
      
      return lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .reverse(); // Most recent first
    } catch (error) {
      return [];
    }
  }

  /**
   * Get error logs
   */
  async getRecentErrors(limit = 50) {
    try {
      const data = await fs.readFile(this.errorLogFile, 'utf8');
      const lines = data.trim().split('\n');
      
      return lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .reverse(); // Most recent first
    } catch (error) {
      return [];
    }
  }

  /**
   * Clean old logs (keep last 30 days)
   */
  async cleanOldLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const logFiles = [this.securityLogFile, this.errorLogFile, this.accessLogFile];
    
    for (const logFile of logFiles) {
      try {
        const data = await fs.readFile(logFile, 'utf8');
        const lines = data.trim().split('\n');
        
        const recentLines = lines.filter(line => {
          try {
            const entry = JSON.parse(line);
            return new Date(entry.timestamp) > thirtyDaysAgo;
          } catch {
            return false;
          }
        });
        
        await fs.writeFile(logFile, recentLines.join('\n') + '\n');
      } catch (error) {
        console.error(`Failed to clean log file ${logFile}:`, error);
      }
    }
  }
}

// Global logger instance
const securityLogger = new SecurityLogger();

/**
 * Express middleware for access logging
 */
function accessLogMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    securityLogger.logAccess(req, res, responseTime);
    originalEnd.apply(this, args);
  };
  
  if (next) next();
}

/**
 * Enhanced error handler with logging
 */
function errorHandler(error, req, res, next) {
  // Log the error
  securityLogger.logError(error, {
    method: req.method,
    url: req.url,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id || null
  });
  
  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      ...(isDevelopment && { 
        details: error.message, 
        stack: error.stack 
      })
    }
  });
}

module.exports = {
  SecurityLogger,
  securityLogger,
  accessLogMiddleware,
  errorHandler
};