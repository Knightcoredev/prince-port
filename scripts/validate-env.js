#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables are set for production
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for production
const REQUIRED_VARS = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET'
];

// Variables that should not contain placeholder values (optional checks)
const PLACEHOLDER_CHECKS = {
  // Only check these if they exist - they're optional for basic portfolio
  'NEXTAUTH_URL': ['YOUR_DOMAIN'],
  'NEXT_PUBLIC_APP_URL': ['YOUR_DOMAIN'],
  'APP_URL': ['YOUR_DOMAIN'],
  'GOOGLE_CLIENT_ID': ['YOUR_GOOGLE_CLIENT_ID'],
  'GOOGLE_CLIENT_SECRET': ['YOUR_GOOGLE_CLIENT_SECRET']
};

// Minimum length requirements for secrets
const SECRET_MIN_LENGTH = {
  'JWT_SECRET': 32,
  'SESSION_SECRET': 32,
  'NEXTAUTH_SECRET': 32,
  'CSRF_SECRET': 32
};

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment file not found: ${envPath}`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

function validateEnvironment(envVars) {
  let isValid = true;
  const errors = [];
  const warnings = [];

  console.log('🔍 Validating production environment...\n');

  // Check required variables
  REQUIRED_VARS.forEach(varName => {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      errors.push(`Missing required variable: ${varName}`);
      isValid = false;
    }
  });

  // Check for placeholder values (warnings only for optional vars)
  Object.entries(PLACEHOLDER_CHECKS).forEach(([varName, placeholders]) => {
    if (envVars[varName]) {
      placeholders.forEach(placeholder => {
        if (envVars[varName].includes(placeholder)) {
          warnings.push(`${varName} contains placeholder value: ${placeholder} (optional)`);
        }
      });
    }
  });

  // Check secret lengths
  Object.entries(SECRET_MIN_LENGTH).forEach(([varName, minLength]) => {
    if (envVars[varName] && envVars[varName].length < minLength) {
      warnings.push(`${varName} should be at least ${minLength} characters long`);
    }
  });

  // Check URL formats
  const urlVars = ['NEXTAUTH_URL', 'NEXT_PUBLIC_APP_URL', 'APP_URL'];
  urlVars.forEach(varName => {
    if (envVars[varName] && !envVars[varName].startsWith('https://')) {
      warnings.push(`${varName} should use HTTPS in production`);
    }
  });

  // Check contact email format (optional)
  if (envVars['CONTACT_EMAIL'] && !envVars['CONTACT_EMAIL'].includes('@')) {
    warnings.push('CONTACT_EMAIL does not appear to be a valid email address');
  }

  // Check DATABASE_URL format for SQLite
  if (envVars['DATABASE_URL'] && !envVars['DATABASE_URL'].startsWith('file:')) {
    errors.push('DATABASE_URL should start with "file:" for SQLite database');
    isValid = false;
  }

  // Check SQLite database path
  if (envVars['SQLITE_DB_PATH'] && !envVars['SQLITE_DB_PATH'].endsWith('.db')) {
    warnings.push('SQLITE_DB_PATH should end with .db extension');
  }

  // Display results
  if (errors.length > 0) {
    console.log('❌ Validation Errors:');
    errors.forEach(error => console.log(`   • ${error}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   • ${warning}`));
    console.log('');
  }

  if (isValid && warnings.length === 0) {
    console.log('✅ All environment variables are properly configured!');
  } else if (isValid) {
    console.log('✅ Required environment variables are set (with warnings above)');
  } else {
    console.log('❌ Environment validation failed. Please fix the errors above.');
  }

  return isValid;
}

function main() {
  const envPath = process.argv[2] || '.env.production';
  
  console.log(`Validating environment file: ${envPath}\n`);
  
  try {
    const envVars = loadEnvFile(envPath);
    const isValid = validateEnvironment(envVars);
    
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Error validating environment:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateEnvironment, loadEnvFile };