/**
 * Security Implementation Test
 * Simple tests to verify security measures are working
 */

const { 
  sanitizeHtml, 
  sanitizeText, 
  sanitizeEmail, 
  sanitizeUrl,
  validateFileUpload,
  csrfProtection 
} = require('./security');

/**
 * Test input sanitization
 */
function testInputSanitization() {
  console.log('Testing input sanitization...');
  
  // Test XSS prevention
  const xssInput = '<script>alert("XSS")</script><p>Safe content</p>';
  const sanitizedHtml = sanitizeHtml(xssInput);
  console.log('XSS Test:', sanitizedHtml.includes('<script>') ? 'FAILED' : 'PASSED');
  
  // Test SQL injection prevention
  const sqlInput = "'; DROP TABLE users; --";
  const sanitizedSql = sanitizeText(sqlInput, { preventSqlInjection: true });
  console.log('SQL Injection Test:', sanitizedSql.includes('DROP') ? 'FAILED' : 'PASSED');
  
  // Test email sanitization
  const maliciousEmail = 'test@example.com<script>alert(1)</script>';
  const sanitizedEmail = sanitizeEmail(maliciousEmail);
  console.log('Email Sanitization Test:', sanitizedEmail === '' ? 'PASSED' : 'FAILED'); // Should return empty string for invalid email
  
  // Test URL sanitization
  const maliciousUrl = 'javascript:alert("XSS")';
  const sanitizedUrl = sanitizeUrl(maliciousUrl);
  console.log('URL Sanitization Test:', sanitizedUrl === '' ? 'PASSED' : 'FAILED');
}

/**
 * Test file upload security
 */
function testFileUploadSecurity() {
  console.log('\nTesting file upload security...');
  
  // Test dangerous file type
  const dangerousFile = {
    originalname: 'malware.exe',
    mimetype: 'application/octet-stream',
    size: 1024
  };
  
  const result1 = validateFileUpload(dangerousFile);
  console.log('Dangerous File Test:', !result1.isValid ? 'PASSED' : 'FAILED');
  
  // Test oversized file
  const oversizedFile = {
    originalname: 'large.jpg',
    mimetype: 'image/jpeg',
    size: 10 * 1024 * 1024 // 10MB
  };
  
  const result2 = validateFileUpload(oversizedFile);
  console.log('Oversized File Test:', !result2.isValid ? 'PASSED' : 'FAILED');
  
  // Test valid file
  const validFile = {
    originalname: 'photo.jpg',
    mimetype: 'image/jpeg',
    size: 1024 * 1024 // 1MB
  };
  
  const result3 = validateFileUpload(validFile);
  console.log('Valid File Test:', result3.isValid ? 'PASSED' : 'FAILED');
}

/**
 * Test CSRF protection
 */
function testCSRFProtection() {
  console.log('\nTesting CSRF protection...');
  
  const sessionId = 'test-session-123';
  
  // Generate token
  const token = csrfProtection.generateToken(sessionId);
  console.log('CSRF Token Generation Test:', token && token.length > 0 ? 'PASSED' : 'FAILED');
  
  // Validate token
  const isValid = csrfProtection.validateToken(token, sessionId);
  console.log('CSRF Token Validation Test:', isValid ? 'PASSED' : 'FAILED');
  
  // Test invalid session
  const isInvalid = csrfProtection.validateToken(token, 'wrong-session');
  console.log('CSRF Invalid Session Test:', !isInvalid ? 'PASSED' : 'FAILED');
  
  // Consume token
  const consumed = csrfProtection.consumeToken(token, sessionId);
  console.log('CSRF Token Consumption Test:', consumed ? 'PASSED' : 'FAILED');
  
  // Test consumed token (should fail)
  const reused = csrfProtection.validateToken(token, sessionId);
  console.log('CSRF Token Reuse Test:', !reused ? 'PASSED' : 'FAILED');
}

/**
 * Run all security tests
 */
function runSecurityTests() {
  console.log('=== Security Implementation Tests ===\n');
  
  testInputSanitization();
  testFileUploadSecurity();
  testCSRFProtection();
  
  console.log('\n=== Security Tests Completed ===');
}

// Export for use in other modules
module.exports = {
  testInputSanitization,
  testFileUploadSecurity,
  testCSRFProtection,
  runSecurityTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runSecurityTests();
}