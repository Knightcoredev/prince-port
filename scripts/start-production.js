#!/usr/bin/env node

/**
 * Production Startup Script
 * Handles graceful startup with monitoring and error handling
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class ProductionStarter {
  constructor() {
    this.processId = null;
    this.isShuttingDown = false;
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async preStartChecks() {
    this.log('Performing pre-start checks...');
    
    // Check if already running
    const pidFile = path.join(process.cwd(), 'app.pid');
    try {
      const existingPid = await fs.readFile(pidFile, 'utf8');
      if (existingPid) {
        try {
          process.kill(parseInt(existingPid), 0); // Check if process exists
          this.log('Application is already running', 'error');
          process.exit(1);
        } catch (error) {
          // Process doesn't exist, remove stale PID file
          await fs.unlink(pidFile);
        }
      }
    } catch (error) {
      // PID file doesn't exist, that's fine
    }

    // Check environment
    if (process.env.NODE_ENV !== 'production') {
      this.log('NODE_ENV is not set to production', 'warning');
    }

    // Check required directories
    const requiredDirs = ['data', 'logs', 'public/uploads'];
    for (const dir of requiredDirs) {
      try {
        await fs.access(dir);
      } catch (error) {
        this.log(`Creating missing directory: ${dir}`);
        await fs.mkdir(dir, { recursive: true });
      }
    }

    // Check build artifacts
    try {
      await fs.access('.next');
      this.log('Build artifacts found');
    } catch (error) {
      this.log('Build artifacts not found, please run: npm run build:prod', 'error');
      process.exit(1);
    }

    this.log('Pre-start checks completed');
  }

  async createPidFile() {
    const pidFile = path.join(process.cwd(), 'app.pid');
    await fs.writeFile(pidFile, process.pid.toString());
    this.log(`Created PID file: ${pidFile}`);
  }

  async removePidFile() {
    const pidFile = path.join(process.cwd(), 'app.pid');
    try {
      await fs.unlink(pidFile);
      this.log('Removed PID file');
    } catch (error) {
      // File might not exist
    }
  }

  async setupLogging() {
    const logsDir = path.join(process.cwd(), 'logs');
    await fs.mkdir(logsDir, { recursive: true });
    
    // Create startup log entry
    const startupLog = {
      timestamp: new Date().toISOString(),
      event: 'startup',
      pid: process.pid,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV
    };

    await fs.appendFile(
      path.join(logsDir, 'startup.log'),
      JSON.stringify(startupLog) + '\n'
    );
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      this.log(`Received ${signal}, starting graceful shutdown...`);
      
      try {
        // Stop accepting new connections
        if (this.server) {
          this.server.close();
        }

        // Clean up resources
        await this.removePidFile();
        
        // Log shutdown
        const shutdownLog = {
          timestamp: new Date().toISOString(),
          event: 'shutdown',
          signal,
          uptime: Date.now() - this.startTime,
          pid: process.pid
        };

        await fs.appendFile(
          path.join(process.cwd(), 'logs', 'startup.log'),
          JSON.stringify(shutdownLog) + '\n'
        );

        this.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        this.log(`Error during shutdown: ${error.message}`, 'error');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
  }

  async startApplication() {
    this.log('Starting Next.js application...');
    
    const env = {
      ...process.env,
      NODE_ENV: 'production'
    };

    const nextProcess = spawn('npm', ['run', 'start:prod'], {
      env,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    this.processId = nextProcess.pid;

    // Handle application output
    nextProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log(`APP: ${message}`);
      }
    });

    nextProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log(`APP ERROR: ${message}`, 'error');
      }
    });

    // Handle application exit
    nextProcess.on('exit', (code, signal) => {
      if (!this.isShuttingDown) {
        this.log(`Application exited unexpectedly (code: ${code}, signal: ${signal})`, 'error');
        this.removePidFile().then(() => process.exit(1));
      }
    });

    nextProcess.on('error', (error) => {
      this.log(`Failed to start application: ${error.message}`, 'error');
      this.removePidFile().then(() => process.exit(1));
    });

    // Wait for application to start
    await new Promise((resolve) => {
      setTimeout(() => {
        this.log('Application startup completed');
        resolve();
      }, 5000); // Wait 5 seconds for startup
    });

    return nextProcess;
  }

  async startMonitoring() {
    this.log('Starting monitoring system...');
    
    try {
      // Initialize monitoring
      const monitor = require('../lib/monitoring');
      
      // Set up periodic health checks
      setInterval(async () => {
        try {
          const status = monitor.getSystemStatus();
          if (status.status === 'critical') {
            this.log('System status is critical!', 'error');
          }
        } catch (error) {
          this.log(`Monitoring error: ${error.message}`, 'error');
        }
      }, 300000); // Every 5 minutes

      this.log('Monitoring system started');
    } catch (error) {
      this.log(`Failed to start monitoring: ${error.message}`, 'warning');
    }
  }

  async start() {
    try {
      this.log('🚀 Starting production application...');
      
      await this.preStartChecks();
      await this.setupLogging();
      await this.createPidFile();
      
      this.setupGracefulShutdown();
      
      const appProcess = await this.startApplication();
      await this.startMonitoring();
      
      this.log('🎉 Production application started successfully!');
      this.log(`Process ID: ${this.processId}`);
      this.log(`Application URL: ${process.env.APP_URL || 'http://localhost:3000'}`);
      this.log(`Admin Panel: ${process.env.APP_URL || 'http://localhost:3000'}/admin/login`);
      
      // Keep the process alive
      process.stdin.resume();
      
    } catch (error) {
      this.log(`💥 Failed to start application: ${error.message}`, 'error');
      await this.removePidFile();
      process.exit(1);
    }
  }
}

// Execute startup if run directly
if (require.main === module) {
  const starter = new ProductionStarter();
  starter.start();
}

module.exports = ProductionStarter;