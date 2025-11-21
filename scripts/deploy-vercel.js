#!/usr/bin/env node

/**
 * Vercel Deployment Preparation Script
 * Prepares the portfolio for Vercel deployment
 */

const fs = require('fs').promises;
const path = require('path');

class VercelDeployment {
  constructor() {
    this.requiredFiles = [
      'vercel.json',
      'next.config.js',
      'package.json'
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkVercelConfig() {
    this.log('Checking Vercel configuration...');
    
    for (const file of this.requiredFiles) {
      try {
        await fs.access(file);
        this.log(`Found: ${file}`);
      } catch (error) {
        this.log(`Missing: ${file}`, 'error');
        return false;
      }
    }
    
    return true;
  }

  async createEnvExample() {
    this.log('Creating .env.example for Vercel...');
    
    const envExample = `# Vercel Environment Variables
# Copy these to your Vercel dashboard under Settings > Environment Variables

# Core Configuration
NODE_ENV=production
APP_NAME=Prince F. Obieze Portfolio
APP_URL=https://your-vercel-domain.vercel.app

# Authentication Secrets (Generate new ones for production)
JWT_SECRET=your-jwt-secret-32-chars-minimum
SESSION_SECRET=your-session-secret-32-chars-minimum
CSRF_SECRET=your-csrf-secret-32-chars-minimum
BCRYPT_ROUNDS=12

# Admin Credentials
ADMIN_USERNAME=knightdev
ADMIN_EMAIL=knightdev@your-domain.com
ADMIN_PASSWORD=grandson707

# Email Configuration
SMTP_HOST=smtp.devmail.email
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=portfolio-box
SMTP_PASS=rPZBDKRjpM4DOHQp1slX
EMAIL_FROM=noreply@your-domain.com
EMAIL_TO=knightdev@your-domain.com

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_CONTACT_MAX=5

# Performance
CACHE_TTL=3600
IMAGE_OPTIMIZATION=true
COMPRESSION=true`;

    try {
      await fs.writeFile('.env.example', envExample);
      this.log('Created .env.example');
      return true;
    } catch (error) {
      this.log(`Failed to create .env.example: ${error.message}`, 'error');
      return false;
    }
  }

  async checkGitIgnore() {
    this.log('Checking .gitignore...');
    
    try {
      const gitignore = await fs.readFile('.gitignore', 'utf8');
      const requiredEntries = [
        '.env.local',
        '.env.production',
        'data/',
        'logs/',
        'backups/'
      ];
      
      let needsUpdate = false;
      let updatedContent = gitignore;
      
      for (const entry of requiredEntries) {
        if (!gitignore.includes(entry)) {
          updatedContent += `\n${entry}`;
          needsUpdate = true;
          this.log(`Added to .gitignore: ${entry}`);
        }
      }
      
      if (needsUpdate) {
        await fs.writeFile('.gitignore', updatedContent);
        this.log('Updated .gitignore');
      } else {
        this.log('.gitignore is up to date');
      }
      
      return true;
    } catch (error) {
      this.log(`Error checking .gitignore: ${error.message}`, 'warning');
      return false;
    }
  }

  async generateDeploymentInstructions() {
    this.log('Generating deployment instructions...');
    
    const instructions = `# 🚀 Vercel Deployment Instructions

## Quick Deploy Steps:

1. **Push to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

3. **Add Environment Variables**:
   Copy from .env.example to Vercel dashboard:
   Settings > Environment Variables

4. **Custom Domain** (Optional):
   - Settings > Domains
   - Add your domain
   - Update APP_URL in environment variables

## 🔗 Your Portfolio URLs:
- **Live Site**: https://your-vercel-domain.vercel.app
- **Admin Panel**: https://your-vercel-domain.vercel.app/admin/login
- **Login**: knightdev / grandson707

## 📧 Email Configuration:
Your SMTP settings are already configured for smtp.devmail.email

## ✅ Ready for Production!
Your portfolio is now ready for Vercel deployment with all features working.
`;

    try {
      await fs.writeFile('DEPLOY_TO_VERCEL.md', instructions);
      this.log('Created deployment instructions: DEPLOY_TO_VERCEL.md');
      return true;
    } catch (error) {
      this.log(`Failed to create instructions: ${error.message}`, 'error');
      return false;
    }
  }

  async prepare() {
    this.log('🚀 Preparing for Vercel deployment...');
    
    const steps = [
      () => this.checkVercelConfig(),
      () => this.createEnvExample(),
      () => this.checkGitIgnore(),
      () => this.generateDeploymentInstructions()
    ];
    
    for (const step of steps) {
      const success = await step();
      if (!success) {
        this.log('❌ Preparation failed', 'error');
        process.exit(1);
      }
    }
    
    this.log('🎉 Vercel deployment preparation completed!');
    this.log('\n📋 Next Steps:');
    this.log('1. Read DEPLOY_TO_VERCEL.md for detailed instructions');
    this.log('2. Push your code to GitHub');
    this.log('3. Import project on Vercel');
    this.log('4. Add environment variables from .env.example');
    this.log('5. Deploy and enjoy your portfolio!');
  }
}

// Execute preparation if run directly
if (require.main === module) {
  const deployment = new VercelDeployment();
  deployment.prepare().catch(error => {
    console.error('❌ Preparation failed:', error);
    process.exit(1);
  });
}

module.exports = VercelDeployment;