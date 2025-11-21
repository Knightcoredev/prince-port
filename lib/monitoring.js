/**
 * Production Monitoring and Logging System
 * Provides comprehensive monitoring, logging, and alerting for production deployment
 */

const fs = require('fs').promises;
const path = require('path');
const { createLogger, format, transports } = require('winston');

class ProductionMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      startTime: Date.now()
    };
    
    this.alerts = [];
    this.thresholds = {
      errorRate: 0.05, // 5% error rate threshold
      responseTime: 5000, // 5 second response time threshold
      memoryUsage: 0.9 // 90% memory usage threshold
    };
    
    this.setupLogger();
    this.startMetricsCollection();
  }

  setupLogger() {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    fs.mkdir(logsDir, { recursive: true }).catch(console.error);

    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      defaultMeta: { service: 'portfolio-app' },
      transports: [
        // Write all logs to combined.log
        new transports.File({ 
          filename: path.join(logsDir, 'combined.log'),
          maxsize: 10485760, // 10MB
          maxFiles: 5
        }),
        // Write error logs to error.log
        new transports.File({ 
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5
        })
      ]
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      }));
    }
  }

  startMetricsCollection() {
    // Collect system metrics every minute
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000);

    // Check thresholds every 5 minutes
    setInterval(() => {
      this.checkThresholds();
    }, 300000);
  }

  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    });

    // Keep only last 24 hours of metrics
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.metrics.memoryUsage = this.metrics.memoryUsage.filter(
      metric => metric.timestamp > oneDayAgo
    );
    this.metrics.responseTime = this.metrics.responseTime.filter(
      metric => metric.timestamp > oneDayAgo
    );

    this.logger.info('System metrics collected', {
      memory: memUsage,
      cpu: cpuUsage,
      uptime: process.uptime()
    });
  }

  checkThresholds() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Check error rate
    const recentErrors = this.metrics.responseTime.filter(
      metric => metric.timestamp > oneHourAgo && metric.error
    ).length;
    const recentRequests = this.metrics.responseTime.filter(
      metric => metric.timestamp > oneHourAgo
    ).length;

    if (recentRequests > 0) {
      const errorRate = recentErrors / recentRequests;
      if (errorRate > this.thresholds.errorRate) {
        this.createAlert('HIGH_ERROR_RATE', `Error rate: ${(errorRate * 100).toFixed(2)}%`);
      }
    }

    // Check average response time
    const recentResponseTimes = this.metrics.responseTime.filter(
      metric => metric.timestamp > oneHourAgo && !metric.error
    );
    
    if (recentResponseTimes.length > 0) {
      const avgResponseTime = recentResponseTimes.reduce((sum, metric) => sum + metric.duration, 0) / recentResponseTimes.length;
      if (avgResponseTime > this.thresholds.responseTime) {
        this.createAlert('SLOW_RESPONSE', `Average response time: ${avgResponseTime.toFixed(2)}ms`);
      }
    }

    // Check memory usage
    const recentMemory = this.metrics.memoryUsage.filter(
      metric => metric.timestamp > oneHourAgo
    );
    
    if (recentMemory.length > 0) {
      const latestMemory = recentMemory[recentMemory.length - 1];
      const memoryUsagePercent = latestMemory.heapUsed / latestMemory.heapTotal;
      
      if (memoryUsagePercent > this.thresholds.memoryUsage) {
        this.createAlert('HIGH_MEMORY_USAGE', `Memory usage: ${(memoryUsagePercent * 100).toFixed(2)}%`);
      }
    }
  }

  createAlert(type, message) {
    const alert = {
      id: `alert-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(alert);
    this.logger.error('Alert created', alert);

    // In production, you might want to send this to an external service
    // like Slack, email, or a monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendAlert(alert);
    }
  }

  async sendAlert(alert) {
    // Placeholder for external alert sending
    // You can integrate with services like:
    // - Slack webhooks
    // - Email notifications
    // - PagerDuty
    // - Discord webhooks
    
    try {
      // Example: Log to file for now
      await fs.appendFile(
        path.join(process.cwd(), 'logs', 'alerts.log'),
        JSON.stringify(alert) + '\n'
      );
    } catch (error) {
      this.logger.error('Failed to send alert', { error: error.message, alert });
    }
  }

  // Middleware for tracking requests
  trackRequest() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Track request
      this.metrics.requests++;
      
      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = (...args) => {
        const duration = Date.now() - startTime;
        const isError = res.statusCode >= 400;
        
        this.metrics.responseTime.push({
          timestamp: Date.now(),
          duration,
          error: isError,
          statusCode: res.statusCode,
          method: req.method,
          path: req.path
        });

        if (isError) {
          this.metrics.errors++;
        }

        this.logger.info('Request completed', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });

        originalEnd.apply(res, args);
      };

      next();
    };
  }

  // Get current system status
  getSystemStatus() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentRequests = this.metrics.responseTime.filter(
      metric => metric.timestamp > oneHourAgo
    );
    
    const recentErrors = recentRequests.filter(metric => metric.error);
    const recentSuccessful = recentRequests.filter(metric => !metric.error);
    
    const avgResponseTime = recentSuccessful.length > 0 
      ? recentSuccessful.reduce((sum, metric) => sum + metric.duration, 0) / recentSuccessful.length
      : 0;

    const errorRate = recentRequests.length > 0 
      ? recentErrors.length / recentRequests.length 
      : 0;

    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: this.getOverallStatus(),
      uptime: uptime,
      requests: {
        total: this.metrics.requests,
        lastHour: recentRequests.length,
        errorRate: errorRate
      },
      performance: {
        avgResponseTime: Math.round(avgResponseTime),
        memoryUsage: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        }
      },
      alerts: {
        active: this.alerts.filter(alert => !alert.resolved).length,
        total: this.alerts.length
      }
    };
  }

  getOverallStatus() {
    const activeAlerts = this.alerts.filter(alert => !alert.resolved);
    const criticalAlerts = activeAlerts.filter(alert => 
      alert.type === 'HIGH_ERROR_RATE' || alert.type === 'HIGH_MEMORY_USAGE'
    );

    if (criticalAlerts.length > 0) return 'critical';
    if (activeAlerts.length > 0) return 'warning';
    return 'healthy';
  }

  // Get detailed metrics for admin dashboard
  getDetailedMetrics(timeRange = '1h') {
    const now = Date.now();
    let startTime;

    switch (timeRange) {
      case '1h':
        startTime = now - (60 * 60 * 1000);
        break;
      case '24h':
        startTime = now - (24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = now - (60 * 60 * 1000);
    }

    const filteredResponseTimes = this.metrics.responseTime.filter(
      metric => metric.timestamp > startTime
    );

    const filteredMemoryUsage = this.metrics.memoryUsage.filter(
      metric => metric.timestamp > startTime
    );

    return {
      responseTime: filteredResponseTimes,
      memoryUsage: filteredMemoryUsage,
      alerts: this.alerts.filter(alert => alert.timestamp > new Date(startTime)),
      summary: this.getSystemStatus()
    };
  }

  // Graceful shutdown
  async shutdown() {
    this.logger.info('Shutting down monitoring system');
    
    // Save final metrics
    try {
      const finalMetrics = {
        timestamp: new Date(),
        uptime: process.uptime(),
        totalRequests: this.metrics.requests,
        totalErrors: this.metrics.errors,
        alerts: this.alerts.length
      };

      await fs.writeFile(
        path.join(process.cwd(), 'logs', 'shutdown-metrics.json'),
        JSON.stringify(finalMetrics, null, 2)
      );
    } catch (error) {
      this.logger.error('Failed to save shutdown metrics', { error: error.message });
    }
  }
}

// Create singleton instance
const monitor = new ProductionMonitor();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  monitor.shutdown().then(() => process.exit(0));
});

process.on('SIGINT', () => {
  monitor.shutdown().then(() => process.exit(0));
});

module.exports = monitor;