/**
 * Security Audit Utilities
 * Tools for monitoring and auditing security measures
 */

const fs = require('fs').promises;
const path = require('path');
const { securityLogger } = require('./logger');

/**
 * Security Audit Class
 */
class SecurityAudit {
  constructor() {
    this.auditResults = [];
  }

  /**
   * Run comprehensive security audit
   */
  async runAudit() {
    console.log('Starting security audit...');
    
    this.auditResults = [];
    
    // Check environment variables
    await this.auditEnvironmentVariables();
    
    // Check file permissions
    await this.auditFilePermissions();
    
    // Check security configurations
    await this.auditSecurityConfig();
    
    // Check for security vulnerabilities in dependencies
    await this.auditDependencies();
    
    // Check log files for security events
    await this.auditSecurityLogs();
    
    // Generate audit report
    const report = this.generateAuditReport();
    
    console.log('Security audit completed.');
    return report;
  }

  /**
   * Audit environment variables for security
   */
  async auditEnvironmentVariables() {
    const requiredSecrets = [
      'CSRF_SECRET',
      'SESSION_SECRET', 
      'JWT_SECRET',
      'NEXTAUTH_SECRET'
    ];
    
    const optionalSecrets = [
      'EMAIL_PASSWORD',
      'DATABASE_URL',
      'ADMIN_PASSWORD'
    ];
    
    // Check required secrets
    for (const secret of requiredSecrets) {
      if (!process.env[secret]) {
        this.auditResults.push({
          type: 'CRITICAL',
          category: 'Environment',
          issue: `Missing required secret: ${secret}`,
          recommendation: `Set ${secret} environment variable with a strong random value`
        });
      } else if (process.env[secret].length < 32) {
        this.auditResults.push({
          type: 'WARNING',
          category: 'Environment',
          issue: `Weak secret detected: ${secret} (length: ${process.env[secret].length})`,
          recommendation: `Use a stronger secret with at least 32 characters`
        });
      }
    }
    
    // Check optional secrets
    for (const secret of optionalSecrets) {
      if (process.env[secret] && process.env[secret].length < 16) {
        this.auditResults.push({
          type: 'WARNING',
          category: 'Environment',
          issue: `Weak optional secret: ${secret}`,
          recommendation: `Consider using a stronger value`
        });
      }
    }
    
    // Check for development settings in production
    if (process.env.NODE_ENV === 'production') {
      const devSettings = [
        'DEBUG',
        'DISABLE_SSL',
        'ALLOW_HTTP'
      ];
      
      for (const setting of devSettings) {
        if (process.env[setting] === 'true') {
          this.auditResults.push({
            type: 'CRITICAL',
            category: 'Environment',
            issue: `Development setting enabled in production: ${setting}`,
            recommendation: `Disable ${setting} in production environment`
          });
        }
      }
    }
  }

  /**
   * Audit file permissions
   */
  async auditFilePermissions() {
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'data/users.json',
      'logs/security.log',
      'logs/error.log'
    ];
    
    for (const file of sensitiveFiles) {
      try {
        const filePath = path.join(process.cwd(), file);
        const stats = await fs.stat(filePath);
        
        // Check if file is readable by others (basic check)
        const mode = stats.mode;
        const permissions = (mode & parseInt('777', 8)).toString(8);
        
        if (permissions.endsWith('4') || permissions.endsWith('6') || permissions.endsWith('7')) {
          this.auditResults.push({
            type: 'WARNING',
            category: 'File Permissions',
            issue: `Sensitive file ${file} may be readable by others (permissions: ${permissions})`,
            recommendation: `Restrict file permissions to owner only`
          });
        }
      } catch (error) {
        // File doesn't exist - this might be expected
        if (file.includes('.env') && error.code === 'ENOENT') {
          this.auditResults.push({
            type: 'INFO',
            category: 'File Permissions',
            issue: `Environment file ${file} not found`,
            recommendation: `Create ${file} if needed for configuration`
          });
        }
      }
    }
  }

  /**
   * Audit security configuration
   */
  async auditSecurityConfig() {
    try {
      const { validateSecurityConfig } = require('./security-config');
      
      if (!validateSecurityConfig()) {
        this.auditResults.push({
          type: 'CRITICAL',
          category: 'Configuration',
          issue: 'Security configuration validation failed',
          recommendation: 'Check security configuration and required environment variables'
        });
      }
      
      // Check HTTPS enforcement in production
      if (process.env.NODE_ENV === 'production' && !process.env.FORCE_HTTPS) {
        this.auditResults.push({
          type: 'WARNING',
          category: 'Configuration',
          issue: 'HTTPS not enforced in production',
          recommendation: 'Set FORCE_HTTPS=true in production environment'
        });
      }
      
    } catch (error) {
      this.auditResults.push({
        type: 'ERROR',
        category: 'Configuration',
        issue: `Failed to validate security configuration: ${error.message}`,
        recommendation: 'Check security configuration files'
      });
    }
  }

  /**
   * Audit dependencies for known vulnerabilities
   */
  async auditDependencies() {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      // Check for potentially vulnerable packages
      const vulnerablePackages = [
        'lodash', // Check for old versions
        'moment', // Deprecated
        'request' // Deprecated
      ];
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      for (const pkg of vulnerablePackages) {
        if (allDeps[pkg]) {
          this.auditResults.push({
            type: 'WARNING',
            category: 'Dependencies',
            issue: `Potentially vulnerable package detected: ${pkg}@${allDeps[pkg]}`,
            recommendation: `Review and update ${pkg} to latest secure version or find alternative`
          });
        }
      }
      
      // Check for missing security-related packages
      const recommendedSecurityPackages = [
        'helmet', // Security headers
        'express-rate-limit', // Rate limiting
        'joi' // Input validation
      ];
      
      for (const pkg of recommendedSecurityPackages) {
        if (!allDeps[pkg]) {
          this.auditResults.push({
            type: 'INFO',
            category: 'Dependencies',
            issue: `Recommended security package not found: ${pkg}`,
            recommendation: `Consider adding ${pkg} for enhanced security`
          });
        }
      }
      
    } catch (error) {
      this.auditResults.push({
        type: 'ERROR',
        category: 'Dependencies',
        issue: `Failed to audit dependencies: ${error.message}`,
        recommendation: 'Check package.json file'
      });
    }
  }

  /**
   * Audit security logs for patterns
   */
  async auditSecurityLogs() {
    try {
      const recentEvents = await securityLogger.getRecentSecurityEvents(1000);
      
      if (recentEvents.length === 0) {
        this.auditResults.push({
          type: 'INFO',
          category: 'Logs',
          issue: 'No recent security events found',
          recommendation: 'This is normal if the system has been secure'
        });
        return;
      }
      
      // Analyze security events
      const eventCounts = {};
      const ipCounts = {};
      const recentTime = Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
      
      for (const event of recentEvents) {
        const eventTime = new Date(event.timestamp).getTime();
        if (eventTime > recentTime) {
          // Count event types
          const eventType = event.message.split('_')[0];
          eventCounts[eventType] = (eventCounts[eventType] || 0) + 1;
          
          // Count IPs for suspicious activity
          if (event.ip) {
            ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
          }
        }
      }
      
      // Check for suspicious patterns
      for (const [eventType, count] of Object.entries(eventCounts)) {
        if (count > 50) { // More than 50 events of same type in 24h
          this.auditResults.push({
            type: 'WARNING',
            category: 'Logs',
            issue: `High frequency of ${eventType} events: ${count} in last 24 hours`,
            recommendation: 'Investigate potential security issue or attack'
          });
        }
      }
      
      // Check for suspicious IPs
      for (const [ip, count] of Object.entries(ipCounts)) {
        if (count > 20) { // More than 20 security events from same IP
          this.auditResults.push({
            type: 'WARNING',
            category: 'Logs',
            issue: `High activity from IP ${ip}: ${count} security events in last 24 hours`,
            recommendation: 'Consider blocking or investigating this IP address'
          });
        }
      }
      
    } catch (error) {
      this.auditResults.push({
        type: 'ERROR',
        category: 'Logs',
        issue: `Failed to audit security logs: ${error.message}`,
        recommendation: 'Check log file accessibility and format'
      });
    }
  }

  /**
   * Generate comprehensive audit report
   */
  generateAuditReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.auditResults.length,
        critical: this.auditResults.filter(r => r.type === 'CRITICAL').length,
        warnings: this.auditResults.filter(r => r.type === 'WARNING').length,
        info: this.auditResults.filter(r => r.type === 'INFO').length,
        errors: this.auditResults.filter(r => r.type === 'ERROR').length
      },
      results: this.auditResults,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  /**
   * Generate prioritized recommendations
   */
  generateRecommendations() {
    const critical = this.auditResults.filter(r => r.type === 'CRITICAL');
    const warnings = this.auditResults.filter(r => r.type === 'WARNING');
    
    const recommendations = [];
    
    if (critical.length > 0) {
      recommendations.push({
        priority: 'IMMEDIATE',
        action: 'Address all critical security issues',
        items: critical.map(c => c.recommendation)
      });
    }
    
    if (warnings.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Review and address security warnings',
        items: warnings.map(w => w.recommendation)
      });
    }
    
    // General recommendations
    recommendations.push({
      priority: 'ONGOING',
      action: 'Maintain security best practices',
      items: [
        'Regularly update dependencies',
        'Monitor security logs daily',
        'Conduct monthly security audits',
        'Keep environment variables secure',
        'Review and update security configurations'
      ]
    });
    
    return recommendations;
  }

  /**
   * Save audit report to file
   */
  async saveAuditReport(report) {
    try {
      const reportsDir = path.join(process.cwd(), 'logs', 'security-audits');
      await fs.mkdir(reportsDir, { recursive: true });
      
      const filename = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
      const filepath = path.join(reportsDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      
      console.log(`Security audit report saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Failed to save audit report:', error);
      throw error;
    }
  }
}

/**
 * Run security audit and return report
 */
async function runSecurityAudit() {
  const audit = new SecurityAudit();
  const report = await audit.runAudit();
  
  // Save report
  await audit.saveAuditReport(report);
  
  return report;
}

/**
 * Get security metrics for dashboard
 */
async function getSecurityMetrics() {
  try {
    const recentEvents = await securityLogger.getRecentSecurityEvents(100);
    const recentErrors = await securityLogger.getRecentErrors(50);
    
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const last7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const metrics = {
      securityEvents: {
        last24Hours: recentEvents.filter(e => new Date(e.timestamp).getTime() > last24Hours).length,
        last7Days: recentEvents.filter(e => new Date(e.timestamp).getTime() > last7Days).length,
        total: recentEvents.length
      },
      errors: {
        last24Hours: recentErrors.filter(e => new Date(e.timestamp).getTime() > last24Hours).length,
        last7Days: recentErrors.filter(e => new Date(e.timestamp).getTime() > last7Days).length,
        total: recentErrors.length
      },
      topSecurityEvents: getTopEvents(recentEvents),
      topErrorTypes: getTopErrors(recentErrors)
    };
    
    return metrics;
  } catch (error) {
    console.error('Failed to get security metrics:', error);
    return null;
  }
}

/**
 * Get top security events by type
 */
function getTopEvents(events) {
  const eventCounts = {};
  
  events.forEach(event => {
    const eventType = event.message.split('_')[0];
    eventCounts[eventType] = (eventCounts[eventType] || 0) + 1;
  });
  
  return Object.entries(eventCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));
}

/**
 * Get top error types
 */
function getTopErrors(errors) {
  const errorCounts = {};
  
  errors.forEach(error => {
    const errorType = error.level || 'UNKNOWN';
    errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
  });
  
  return Object.entries(errorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));
}

module.exports = {
  SecurityAudit,
  runSecurityAudit,
  getSecurityMetrics
};