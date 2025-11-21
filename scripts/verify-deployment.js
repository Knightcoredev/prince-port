#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Comprehensive verification of production deployment
 */

const http = require('http');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

class DeploymentVerifier {
  constructor() {
    this.baseUrl = process.env.APP_URL || 'http://localhost:3000';
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  async testEndpoint(name, path, expectedStatus = 200, options = {}) {
    try {
      const response = await this.makeRequest(path, options);
      
      if (response.statusCode === expectedStatus) {
        this.results.passed++;
        this.results.tests.push({ name, status: 'PASS', details: `Status: ${response.statusCode}` });
        this.log(`${name}: PASS (${response.statusCode})`);
        return true;
      } else {
        this.results.failed++;
        this.results.tests.push({ name, status: 'FAIL', details: `Expected ${expectedStatus}, got ${response.statusCode}` });
        this.log(`${name}: FAIL (Expected ${expectedStatus}, got ${response.statusCode})`, 'error');
        return false;
      }
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', details: error.message });
      this.log(`${name}: FAIL (${error.message})`, 'error');
      return false;
    }
  }

  async testPublicPages() {
    this.log('Testing public pages...');
    
    const pages = [
      { name: 'Home Page', path: '/' },
      { name: 'Blog Index', path: '/blog' },
      { name: 'Admin Login', path: '/admin/login' }
    ];

    for (const page of pages) {
      await this.testEndpoint(page.name, page.path);
    }
  }

  async testApiEndpoints() {
    this.log('Testing API endpoints...');
    
    const endpoints = [
      { name: 'Blog API', path: '/api/blog', method: 'GET' },
      { name: 'Projects API', path: '/api/projects', method: 'GET' },
      { name: 'Auth Session', path: '/api/auth/session', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint.name, endpoint.path, 200, { method: endpoint.method });
    }
  }

  async testContactForm() {
    this.log('Testing contact form...');
    
    const formData = JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message from deployment verification'
    });

    await this.testEndpoint(
      'Contact Form Submission',
      '/api/contact',
      200,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(formData)
        },
        body: formData
      }
    );
  }

  async testSecurityHeaders() {
    this.log('Testing security headers...');
    
    try {
      const response = await this.makeRequest('/');
      const headers = response.headers;
      
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy'
      ];

      let securityScore = 0;
      for (const header of securityHeaders) {
        if (headers[header]) {
          securityScore++;
          this.log(`Security header present: ${header}`);
        } else {
          this.log(`Missing security header: ${header}`, 'warning');
          this.results.warnings++;
        }
      }

      if (securityScore === securityHeaders.length) {
        this.results.passed++;
        this.results.tests.push({ name: 'Security Headers', status: 'PASS', details: 'All headers present' });
      } else {
        this.results.warnings++;
        this.results.tests.push({ name: 'Security Headers', status: 'WARNING', details: `${securityScore}/${securityHeaders.length} headers present` });
      }

    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: 'Security Headers', status: 'FAIL', details: error.message });
      this.log(`Security headers test failed: ${error.message}`, 'error');
    }
  }

  async testFileSystem() {
    this.log('Testing file system...');
    
    const requiredPaths = [
      'data',
      'logs',
      'public/uploads',
      '.next'
    ];

    let filesystemScore = 0;
    for (const pathToCheck of requiredPaths) {
      try {
        await fs.access(pathToCheck);
        filesystemScore++;
        this.log(`Required path exists: ${pathToCheck}`);
      } catch (error) {
        this.log(`Missing required path: ${pathToCheck}`, 'error');
      }
    }

    if (filesystemScore === requiredPaths.length) {
      this.results.passed++;
      this.results.tests.push({ name: 'File System', status: 'PASS', details: 'All paths exist' });
    } else {
      this.results.failed++;
      this.results.tests.push({ name: 'File System', status: 'FAIL', details: `${filesystemScore}/${requiredPaths.length} paths exist` });
    }
  }

  async testDataIntegrity() {
    this.log('Testing data integrity...');
    
    const dataFiles = [
      'data/users.json',
      'data/blog-posts.json',
      'data/projects.json',
      'data/contacts.json'
    ];

    let dataScore = 0;
    for (const file of dataFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        JSON.parse(content);
        dataScore++;
        this.log(`Data file valid: ${file}`);
      } catch (error) {
        this.log(`Data file invalid: ${file} - ${error.message}`, 'error');
      }
    }

    if (dataScore === dataFiles.length) {
      this.results.passed++;
      this.results.tests.push({ name: 'Data Integrity', status: 'PASS', details: 'All data files valid' });
    } else {
      this.results.failed++;
      this.results.tests.push({ name: 'Data Integrity', status: 'FAIL', details: `${dataScore}/${dataFiles.length} files valid` });
    }
  }

  async testEnvironmentConfig() {
    this.log('Testing environment configuration...');
    
    const requiredVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'SESSION_SECRET',
      'APP_URL'
    ];

    let configScore = 0;
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        configScore++;
        this.log(`Environment variable set: ${varName}`);
      } else {
        this.log(`Missing environment variable: ${varName}`, 'error');
      }
    }

    if (configScore === requiredVars.length) {
      this.results.passed++;
      this.results.tests.push({ name: 'Environment Config', status: 'PASS', details: 'All variables set' });
    } else {
      this.results.failed++;
      this.results.tests.push({ name: 'Environment Config', status: 'FAIL', details: `${configScore}/${requiredVars.length} variables set` });
    }
  }

  async testPerformance() {
    this.log('Testing performance...');
    
    const startTime = Date.now();
    try {
      await this.makeRequest('/');
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 2000) {
        this.results.passed++;
        this.results.tests.push({ name: 'Performance', status: 'PASS', details: `Response time: ${responseTime}ms` });
        this.log(`Performance test passed: ${responseTime}ms`);
      } else if (responseTime < 5000) {
        this.results.warnings++;
        this.results.tests.push({ name: 'Performance', status: 'WARNING', details: `Slow response: ${responseTime}ms` });
        this.log(`Performance warning: ${responseTime}ms`, 'warning');
      } else {
        this.results.failed++;
        this.results.tests.push({ name: 'Performance', status: 'FAIL', details: `Too slow: ${responseTime}ms` });
        this.log(`Performance test failed: ${responseTime}ms`, 'error');
      }
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: 'Performance', status: 'FAIL', details: error.message });
      this.log(`Performance test failed: ${error.message}`, 'error');
    }
  }

  async verify() {
    this.log('🔍 Starting deployment verification...');
    this.log(`Testing deployment at: ${this.baseUrl}`);
    
    const tests = [
      () => this.testEnvironmentConfig(),
      () => this.testFileSystem(),
      () => this.testDataIntegrity(),
      () => this.testPublicPages(),
      () => this.testApiEndpoints(),
      () => this.testContactForm(),
      () => this.testSecurityHeaders(),
      () => this.testPerformance()
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        this.log(`Test error: ${error.message}`, 'error');
        this.results.failed++;
      }
    }

    this.printResults();
    
    if (this.results.failed > 0) {
      process.exit(1);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 DEPLOYMENT VERIFICATION RESULTS');
    console.log('='.repeat(60));
    
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    if (this.results.tests.length > 0) {
      console.log('\nDetailed Results:');
      this.results.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`  ${icon} ${test.name}: ${test.status} - ${test.details}`);
      });
    }
    
    if (this.results.failed === 0) {
      console.log('\n🎉 Deployment verification completed successfully!');
      console.log('🚀 Your application is ready for production use');
    } else {
      console.log('\n💥 Deployment verification failed');
      console.log('🔧 Please fix the issues above before using in production');
    }
    
    console.log('='.repeat(60));
  }
}

// Execute verification if run directly
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  verifier.verify().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentVerifier;