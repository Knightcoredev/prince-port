#!/usr/bin/env node

/**
 * Production Configuration Validator
 * Validates all configuration settings before deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
  }

  validateEnvironmentVariables() {
    this.log('Validating environment variables...');
    
    const requiredVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'SESSION_SECRET',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'APP_URL',
      'ADMIN_USERNAME'
    ];

    const recommendedVars = [
      'CSRF_SECRET',
      'BCRYPT_ROUNDS',
      'RATE_LIMIT_MAX',
      'UPLOAD_MAX_SIZE',
      'LOG_LEVEL'
    ];

    // Check required variables
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.log(`Missing required environment variable: ${varName}`, 'error');
      } else {
        this.log(`Found required variable: ${varName}`);
      }
    }

    // Check recommended variables
    for (const varName of recommendedVars) {
      if (!process.env[varName]) {
        this.log(`Missing recommended environment variable: ${varName}`, 'warning');
      }
    }

    // Validate specific values
    this.validateSecrets();
    this.validateUrls();
    this.validateNumericValues();
  }

  validateSecrets() {
    this.log('Validating secrets...');
    
    const secrets = ['JWT_SECRET', 'SESSION_SECRET', 'CSRF_SECRET'];
    
    for (const secretName of secrets) {
      const secret = process.env[secretName];
      if (secret) {
        // Check length
        if (secret.length < 32) {
          this.log(`${secretName} is too short (minimum 32 characters)`, 'error');
        }
        
        // Check for placeholder values
        if (secret.includes('your-') || secret.includes('example') || secret.includes('change-me')) {
          this.log(`${secretName} appears to be a placeholder value`, 'error');
        }
        
        // Check entropy (basic check)
        const uniqueChars = new Set(secret).size;
        if (uniqueChars < 10) {
          this.log(`${secretName} has low entropy (${uniqueChars} unique characters)`, 'warning');
        }
        
        this.log(`${secretName} validation passed`);
      }
    }
  }

  validateUrls() {
    this.log('Validating URLs...');
    
    const urls = ['APP_URL', 'NEXTAUTH_URL'];
    
    for (const urlName of urls) {
      const url = process.env[urlName];
      if (url) {
        try {
          const parsedUrl = new URL(url);
          
          // Check protocol
          if (parsedUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
            this.log(`${urlName} should use HTTPS in production`, 'warning');
          }
          
          // Check for localhost in production
          if (parsedUrl.hostname === 'localhost' && process.env.NODE_ENV === 'production') {
            this.log(`${urlName} uses localhost in production`, 'error');
          }
          
          this.log(`${urlName} validation passed`);
        } catch (error) {
          this.log(`${urlName} is not a valid URL: ${error.message}`, 'error');
        }
      }
    }
  }

  validateNumericValues() {
    this.log('Validating numeric values...');
    
    const numericVars = {
      'BCRYPT_ROUNDS': { min: 10, max: 15, recommended: 12 },
      'RATE_LIMIT_MAX': { min: 1, max: 1000, recommended: 100 },
      'UPLOAD_MAX_SIZE': { min: 1024, max: 10485760, recommended: 5242880 }, // 1KB to 10MB
      'SMTP_PORT': { min: 1, max: 65535, recommended: 587 }
    };

    for (const [varName, config] of Object.entries(numericVars)) {
      const value = process.env[varName];
      if (value) {
        const numValue = parseInt(value, 10);
        
        if (isNaN(numValue)) {
          this.log(`${varName} is not a valid number: ${value}`, 'error');
          continue;
        }
        
        if (numValue < config.min || numValue > config.max) {
          this.log(`${varName} is out of range (${config.min}-${config.max}): ${numValue}`, 'error');
        } else if (numValue !== config.recommended) {
          this.log(`${varName} differs from recommended value (${config.recommended}): ${numValue}`, 'warning');
        } else {
          this.log(`${varName} validation passed`);
        }
      }
    }
  }

  validateFileSystem() {
    this.log('Validating file system...');
    
    const requiredDirs = [
      'data',
      'logs',
      'public/uploads',
      'public/uploads/blog',
      'public/uploads/projects'
    ];

    const requiredFiles = [
      'package.json',
      'next.config.js',
      '.env.production'
    ];

    // Check directories
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        this.log(`Missing required directory: ${dir}`, 'error');
      } else {
        // Check write permissions
        try {
          const testFile = path.join(dir, '.write-test');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          this.log(`Directory accessible: ${dir}`);
        } catch (error) {
          this.log(`No write permission for directory: ${dir}`, 'error');
        }
      }
    }

    // Check files
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        this.log(`Missing required file: ${file}`, 'error');
      } else {
        this.log(`Found required file: ${file}`);
      }
    }
  }

  validateDependencies() {
    this.log('Validating dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const criticalDeps = [
        'next',
        'react',
        'bcrypt',
        'jsonwebtoken',
        'nodemailer',
        'joi',
        'winston'
      ];

      // Check if node_modules exists
      if (!fs.existsSync('node_modules')) {
        this.log('node_modules directory not found', 'error');
        return;
      }

      // Check critical dependencies
      for (const dep of criticalDeps) {
        if (!packageJson.dependencies[dep]) {
          this.log(`Missing critical dependency in package.json: ${dep}`, 'error');
        } else if (!fs.existsSync(path.join('node_modules', dep))) {
          this.log(`Critical dependency not installed: ${dep}`, 'error');
        } else {
          this.log(`Critical dependency found: ${dep}`);
        }
      }

      // Check for security vulnerabilities (basic check)
      const vulnerableDeps = ['lodash@4.17.20', 'axios@0.21.0']; // Example vulnerable versions
      for (const vulnDep of vulnerableDeps) {
        const [name, version] = vulnDep.split('@');
        if (packageJson.dependencies[name] === version) {
          this.log(`Potentially vulnerable dependency: ${vulnDep}`, 'warning');
        }
      }

    } catch (error) {
      this.log(`Error validating dependencies: ${error.message}`, 'error');
    }
  }

  validateSecurity() {
    this.log('Validating security configuration...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      this.log(`Node.js version ${nodeVersion} is outdated (minimum: 16)`, 'error');
    } else if (majorVersion < 18) {
      this.log(`Node.js version ${nodeVersion} is supported but consider upgrading to 18+`, 'warning');
    } else {
      this.log(`Node.js version ${nodeVersion} is up to date`);
    }

    // Check for development dependencies in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0) {
          this.log('Development dependencies found in production build', 'warning');
        }
      } catch (error) {
        // Ignore error
      }
    }

    // Check for sensitive files
    const sensitiveFiles = ['.env', '.env.local', '.env.development'];
    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        this.log(`Sensitive file found: ${file} (ensure it's not in version control)`, 'warning');
      }
    }
  }

  validateEmailConfiguration() {
    this.log('Validating email configuration...');
    
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (smtpHost && smtpUser && smtpPass) {
      // Basic validation
      if (!smtpHost.includes('.')) {
        this.log('SMTP_HOST appears to be invalid', 'error');
      }
      
      if (!smtpUser.includes('@')) {
        this.log('SMTP_USER should be an email address', 'warning');
      }
      
      if (smtpPass.length < 8) {
        this.log('SMTP_PASS appears to be too short', 'warning');
      }
      
      this.log('Email configuration validation passed');
    } else {
      this.log('Incomplete email configuration', 'warning');
    }
  }

  async validate() {
    this.log('🔍 Starting configuration validation...');
    
    const validations = [
      () => this.validateEnvironmentVariables(),
      () => this.validateFileSystem(),
      () => this.validateDependencies(),
      () => this.validateSecurity(),
      () => this.validateEmailConfiguration()
    ];

    for (const validation of validations) {
      try {
        validation();
      } catch (error) {
        this.log(`Validation error: ${error.message}`, 'error');
      }
    }

    this.printResults();
    
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 CONFIGURATION VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All configuration checks passed!');
      console.log('🚀 System is ready for production deployment');
    } else {
      if (this.errors.length > 0) {
        console.log(`❌ ${this.errors.length} error(s) found:`);
        this.errors.forEach(error => console.log(`   • ${error}`));
      }
      
      if (this.warnings.length > 0) {
        console.log(`\n⚠️  ${this.warnings.length} warning(s) found:`);
        this.warnings.forEach(warning => console.log(`   • ${warning}`));
      }
      
      if (this.errors.length > 0) {
        console.log('\n🔧 Please fix the errors before deploying to production');
      } else {
        console.log('\n✅ No critical errors found, but consider addressing warnings');
      }
    }
    
    console.log('='.repeat(60));
  }
}

// Execute validation if run directly
if (require.main === module) {
  const validator = new ConfigValidator();
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = ConfigValidator;