#!/usr/bin/env node

/**
 * Production Deployment Script
 * Handles the complete deployment process including environment setup,
 * database seeding, and health checks.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  requiredEnvVars: [
    'JWT_SECRET',
    'SESSION_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'APP_URL',
    'ADMIN_USERNAME'
  ],
  directories: [
    'data',
    'public/uploads',
    'logs',
    'backups'
  ],
  dataFiles: [
    'data/users.json',
    'data/blog-posts.json',
    'data/projects.json',
    'data/contacts.json'
  ]
};

class DeploymentManager {
  constructor() {
    this.startTime = Date.now();
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
  }

  async checkEnvironment() {
    this.log('Checking environment configuration...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 16) {
      this.log(`Node.js version ${nodeVersion} is not supported. Please use Node.js 16+`, 'error');
      return false;
    }
    
    // Check environment variables
    const missingVars = CONFIG.requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      this.log(`Missing required environment variables: ${missingVars.join(', ')}`, 'error');
      return false;
    }
    
    // Check if production environment file exists
    if (!fs.existsSync('.env.production')) {
      this.log('Production environment file (.env.production) not found', 'warning');
    }
    
    this.log('Environment check completed successfully');
    return true;
  }

  async createDirectories() {
    this.log('Creating required directories...');
    
    for (const dir of CONFIG.directories) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          this.log(`Created directory: ${dir}`);
        } else {
          this.log(`Directory already exists: ${dir}`);
        }
        
        // Set appropriate permissions for upload and logs directories
        if (dir.includes('uploads') || dir.includes('logs')) {
          try {
            fs.chmodSync(dir, 0o755);
          } catch (error) {
            this.log(`Could not set permissions for ${dir}: ${error.message}`, 'warning');
          }
        }
      } catch (error) {
        this.log(`Failed to create directory ${dir}: ${error.message}`, 'error');
        return false;
      }
    }
    
    return true;
  }

  async installDependencies() {
    this.log('Installing production dependencies...');
    
    try {
      execSync('npm ci --only=production', { stdio: 'inherit' });
      this.log('Dependencies installed successfully');
      return true;
    } catch (error) {
      this.log(`Failed to install dependencies: ${error.message}`, 'error');
      return false;
    }
  }

  async buildApplication() {
    this.log('Building application for production...');
    
    try {
      execSync('npm run build:prod', { stdio: 'inherit' });
      this.log('Application built successfully');
      return true;
    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      return false;
    }
  }

  async seedDatabase() {
    this.log('Seeding database with initial data...');
    
    try {
      // Check if data files already exist
      const existingFiles = CONFIG.dataFiles.filter(file => fs.existsSync(file));
      
      if (existingFiles.length > 0) {
        this.log(`Found existing data files: ${existingFiles.join(', ')}`, 'warning');
        this.log('Skipping database seeding to preserve existing data');
        return true;
      }
      
      execSync('npm run seed', { stdio: 'inherit' });
      this.log('Database seeded successfully');
      return true;
    } catch (error) {
      this.log(`Database seeding failed: ${error.message}`, 'error');
      return false;
    }
  }

  async performHealthCheck() {
    this.log('Performing health check...');
    
    try {
      execSync('npm run health-check', { stdio: 'inherit' });
      this.log('Health check passed');
      return true;
    } catch (error) {
      this.log(`Health check failed: ${error.message}`, 'warning');
      return false;
    }
  }

  async createBackup() {
    this.log('Creating initial backup...');
    
    try {
      execSync('npm run backup', { stdio: 'inherit' });
      this.log('Initial backup created');
      return true;
    } catch (error) {
      this.log(`Backup creation failed: ${error.message}`, 'warning');
      return false;
    }
  }

  async validateConfiguration() {
    this.log('Validating production configuration...');
    
    try {
      const ConfigValidator = require('./validate-config');
      const validator = new ConfigValidator();
      await validator.validate();
      this.log('Configuration validation passed');
      return true;
    } catch (error) {
      this.log(`Configuration validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async deploy() {
    this.log('🚀 Starting deployment process...');
    
    const steps = [
      { name: 'Configuration Validation', fn: () => this.validateConfiguration() },
      { name: 'Environment Check', fn: () => this.checkEnvironment() },
      { name: 'Create Directories', fn: () => this.createDirectories() },
      { name: 'Install Dependencies', fn: () => this.installDependencies() },
      { name: 'Build Application', fn: () => this.buildApplication() },
      { name: 'Seed Database', fn: () => this.seedDatabase() },
      { name: 'Health Check', fn: () => this.performHealthCheck() },
      { name: 'Create Backup', fn: () => this.createBackup() }
    ];
    
    for (const step of steps) {
      this.log(`\n📋 Executing: ${step.name}`);
      const success = await step.fn();
      
      if (!success && step.name !== 'Health Check' && step.name !== 'Create Backup') {
        this.log(`❌ Deployment failed at step: ${step.name}`, 'error');
        this.printSummary();
        process.exit(1);
      }
    }
    
    this.printSummary();
    this.log('🎉 Deployment completed successfully!');
  }

  printSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('='.repeat(50));
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`✅ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    console.log('\n📝 Next Steps:');
    console.log('   • Start the application: npm run start:production');
    console.log('   • Verify deployment: npm run verify-deployment');
    console.log('   • Monitor logs: tail -f logs/combined.log');
    console.log('   • Access admin panel: /admin/login');
    console.log('   • View production guide: cat PRODUCTION.md');
    console.log('='.repeat(50));
  }
}

// Execute deployment if run directly
if (require.main === module) {
  const deployment = new DeploymentManager();
  deployment.deploy().catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentManager;