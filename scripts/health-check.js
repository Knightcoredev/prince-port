#!/usr/bin/env node

/**
 * Health Check Script
 * Verifies that all system components are working correctly
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class HealthChecker {
  constructor() {
    this.checks = [];
    this.failures = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkFileSystem() {
    this.log('Checking file system...');
    
    const requiredPaths = [
      'data',
      'public/uploads',
      'logs',
      '.next'
    ];
    
    for (const pathToCheck of requiredPaths) {
      if (!fs.existsSync(pathToCheck)) {
        this.failures.push(`Missing required path: ${pathToCheck}`);
        this.log(`Missing required path: ${pathToCheck}`, 'error');
      }
    }
    
    // Check write permissions
    const writablePaths = ['data', 'public/uploads', 'logs'];
    for (const pathToCheck of writablePaths) {
      try {
        const testFile = path.join(pathToCheck, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
      } catch (error) {
        this.failures.push(`No write permission for: ${pathToCheck}`);
        this.log(`No write permission for: ${pathToCheck}`, 'error');
      }
    }
    
    this.log('File system check completed');
  }

  async checkDataFiles() {
    this.log('Checking data files...');
    
    const dataFiles = [
      'data/users.json',
      'data/blog-posts.json',
      'data/projects.json',
      'data/contacts.json'
    ];
    
    for (const file of dataFiles) {
      if (!fs.existsSync(file)) {
        this.failures.push(`Missing data file: ${file}`);
        this.log(`Missing data file: ${file}`, 'error');
        continue;
      }
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        this.log(`Data file valid: ${file}`);
      } catch (error) {
        this.failures.push(`Invalid JSON in: ${file}`);
        this.log(`Invalid JSON in: ${file}`, 'error');
      }
    }
  }

  async checkEnvironmentVariables() {
    this.log('Checking environment variables...');
    
    const requiredVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'SESSION_SECRET',
      'SMTP_HOST',
      'APP_URL'
    ];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.failures.push(`Missing environment variable: ${varName}`);
        this.log(`Missing environment variable: ${varName}`, 'error');
      }
    }
    
    // Check if we're in production mode
    if (process.env.NODE_ENV !== 'production') {
      this.log(`Not in production mode (NODE_ENV=${process.env.NODE_ENV})`, 'warning');
    }
  }

  async checkDependencies() {
    this.log('Checking dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const nodeModulesExists = fs.existsSync('node_modules');
      
      if (!nodeModulesExists) {
        this.failures.push('node_modules directory not found');
        this.log('node_modules directory not found', 'error');
        return;
      }
      
      // Check critical dependencies
      const criticalDeps = ['next', 'react', 'bcrypt', 'jsonwebtoken'];
      for (const dep of criticalDeps) {
        const depPath = path.join('node_modules', dep);
        if (!fs.existsSync(depPath)) {
          this.failures.push(`Missing critical dependency: ${dep}`);
          this.log(`Missing critical dependency: ${dep}`, 'error');
        }
      }
      
      this.log('Dependencies check completed');
    } catch (error) {
      this.failures.push(`Error checking dependencies: ${error.message}`);
      this.log(`Error checking dependencies: ${error.message}`, 'error');
    }
  }

  async checkBuildArtifacts() {
    this.log('Checking build artifacts...');
    
    const buildPaths = [
      '.next/BUILD_ID',
      '.next/static',
      '.next/server'
    ];
    
    for (const buildPath of buildPaths) {
      if (!fs.existsSync(buildPath)) {
        this.failures.push(`Missing build artifact: ${buildPath}`);
        this.log(`Missing build artifact: ${buildPath}`, 'error');
      }
    }
  }

  async checkSecurityConfiguration() {
    this.log('Checking security configuration...');
    
    // Check for secure secrets
    const secrets = ['JWT_SECRET', 'SESSION_SECRET', 'CSRF_SECRET'];
    for (const secret of secrets) {
      const value = process.env[secret];
      if (value) {
        if (value.length < 32) {
          this.failures.push(`${secret} is too short (minimum 32 characters)`);
          this.log(`${secret} is too short (minimum 32 characters)`, 'error');
        }
        if (value.includes('your-') || value.includes('example')) {
          this.failures.push(`${secret} appears to be a placeholder value`);
          this.log(`${secret} appears to be a placeholder value`, 'error');
        }
      }
    }
    
    // Check BCRYPT rounds
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    if (bcryptRounds < 12) {
      this.log(`BCRYPT_ROUNDS is ${bcryptRounds}, recommended minimum is 12`, 'warning');
    }
  }

  async performHealthCheck() {
    this.log('🏥 Starting health check...');
    
    const checks = [
      { name: 'File System', fn: () => this.checkFileSystem() },
      { name: 'Data Files', fn: () => this.checkDataFiles() },
      { name: 'Environment Variables', fn: () => this.checkEnvironmentVariables() },
      { name: 'Dependencies', fn: () => this.checkDependencies() },
      { name: 'Build Artifacts', fn: () => this.checkBuildArtifacts() },
      { name: 'Security Configuration', fn: () => this.checkSecurityConfiguration() }
    ];
    
    for (const check of checks) {
      try {
        await check.fn();
      } catch (error) {
        this.failures.push(`${check.name} check failed: ${error.message}`);
        this.log(`${check.name} check failed: ${error.message}`, 'error');
      }
    }
    
    this.printResults();
    
    if (this.failures.length > 0) {
      process.exit(1);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🏥 HEALTH CHECK RESULTS');
    console.log('='.repeat(50));
    
    if (this.failures.length === 0) {
      console.log('✅ All health checks passed!');
      console.log('🚀 System is ready for production');
    } else {
      console.log(`❌ ${this.failures.length} health check(s) failed:`);
      this.failures.forEach(failure => console.log(`   • ${failure}`));
      console.log('\n🔧 Please fix the above issues before deploying');
    }
    
    console.log('='.repeat(50));
  }
}

// Execute health check if run directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.performHealthCheck().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = HealthChecker;