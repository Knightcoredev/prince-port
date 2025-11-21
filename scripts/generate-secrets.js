#!/usr/bin/env node

/**
 * Secret Generation Script
 * Generates secure random secrets for production environment
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateSecrets() {
  console.log('🔐 Generated Production Secrets\n');
  console.log('Copy these values to your .env.production file:\n');
  
  console.log('# Authentication Secrets');
  console.log(`JWT_SECRET=${generateSecret(32)}`);
  console.log(`SESSION_SECRET=${generateSecret(32)}`);
  console.log(`NEXTAUTH_SECRET=${generateSecret(32)}`);
  console.log(`CSRF_SECRET=${generateSecret(32)}`);
  
  console.log('\n# Additional Security (optional)');
  console.log(`BACKUP_ENCRYPTION_KEY=${generateSecret(32)}`);
  
  console.log('\n⚠️  Important Security Notes:');
  console.log('• Store these secrets securely');
  console.log('• Never commit them to version control');
  console.log('• Use your hosting platform\'s secret management when possible');
  console.log('• Rotate secrets regularly');
}

if (require.main === module) {
  generateSecrets();
}

module.exports = { generateSecret, generateSecrets };