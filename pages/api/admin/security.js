const { 
  withAdminAuth, 
  withMethods, 
  withErrorHandling, 
  withSecurityHeaders,
  compose 
} = require('../../../lib/middleware');
const { runSecurityAudit, getSecurityMetrics } = require('../../../lib/security-audit');
const { securityLogger } = require('../../../lib/logger');

/**
 * Admin Security Monitoring API
 * GET /api/admin/security - Get security metrics and recent events
 * POST /api/admin/security/audit - Run security audit
 */
async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { action } = req.query;
      
      if (action === 'metrics') {
        // Get security metrics for dashboard
        const metrics = await getSecurityMetrics();
        
        return res.status(200).json({
          success: true,
          data: {
            metrics
          }
        });
      }
      
      if (action === 'events') {
        // Get recent security events
        const { limit = 50 } = req.query;
        const events = await securityLogger.getRecentSecurityEvents(parseInt(limit));
        
        return res.status(200).json({
          success: true,
          data: {
            events,
            total: events.length
          }
        });
      }
      
      if (action === 'errors') {
        // Get recent errors
        const { limit = 25 } = req.query;
        const errors = await securityLogger.getRecentErrors(parseInt(limit));
        
        return res.status(200).json({
          success: true,
          data: {
            errors,
            total: errors.length
          }
        });
      }
      
      // Default: return overview
      const metrics = await getSecurityMetrics();
      const recentEvents = await securityLogger.getRecentSecurityEvents(10);
      const recentErrors = await securityLogger.getRecentErrors(5);
      
      return res.status(200).json({
        success: true,
        data: {
          metrics,
          recentEvents,
          recentErrors
        }
      });
      
    } catch (error) {
      console.error('Security monitoring error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SECURITY_MONITORING_ERROR',
          message: 'Failed to retrieve security information'
        }
      });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { action } = req.body;
      
      if (action === 'audit') {
        // Run comprehensive security audit
        console.log('Starting security audit requested by admin...');
        
        const auditReport = await runSecurityAudit();
        
        // Log the audit action
        await securityLogger.logSecurity('SECURITY_AUDIT_REQUESTED', {
          userId: req.user.id,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          auditSummary: auditReport.summary
        });
        
        return res.status(200).json({
          success: true,
          data: {
            auditReport,
            message: 'Security audit completed successfully'
          }
        });
      }
      
      if (action === 'clear-logs') {
        // Clear old security logs (admin action)
        await securityLogger.cleanOldLogs();
        
        await securityLogger.logSecurity('SECURITY_LOGS_CLEARED', {
          userId: req.user.id,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        
        return res.status(200).json({
          success: true,
          message: 'Security logs cleaned successfully'
        });
      }
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Invalid action specified'
        }
      });
      
    } catch (error) {
      console.error('Security action error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SECURITY_ACTION_ERROR',
          message: 'Failed to perform security action'
        }
      });
    }
  }
}

export default compose(
  withMethods(['GET', 'POST']),
  withSecurityHeaders,
  withAdminAuth,
  withErrorHandling({
    logErrors: true,
    sanitizeErrorMessages: true
  })
)(handler);