# Production Deployment Guide

This document provides comprehensive instructions for deploying the Portfolio Enhancement system to production.

## Quick Start

For a complete automated deployment:

```bash
# 1. Clone and setup
git clone <repository-url>
cd portfolio-nextjs
npm install

# 2. Configure environment
cp .env.local.example .env.production
# Edit .env.production with your values

# 3. Deploy
npm run deploy:full

# 4. Start application
npm run start:production
```

## Detailed Setup

### 1. System Requirements

- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **Memory**: Minimum 512MB RAM
- **Storage**: Minimum 1GB free space
- **Network**: HTTPS-capable domain
- **Email**: SMTP server access

### 2. Environment Configuration

Create `.env.production` with these essential variables:

```bash
# Application
NODE_ENV=production
APP_URL=https://your-domain.com
APP_NAME="Your Portfolio"

# Security (Generate strong, unique values)
JWT_SECRET=your-32-char-minimum-secret
SESSION_SECRET=your-32-char-minimum-secret
CSRF_SECRET=your-32-char-minimum-secret

# Admin Account
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=secure-password

# Email Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
EMAIL_FROM=noreply@your-domain.com
EMAIL_TO=admin@your-domain.com
```

### 3. Security Setup

Generate secure secrets:
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deployment Process

#### Option A: Automated Deployment
```bash
npm run deploy:full
```

#### Option B: Manual Deployment
```bash
# Validate configuration
npm run validate-config

# Install dependencies
npm ci --only=production

# Build application
npm run build:prod

# Seed database
npm run seed

# Health check
npm run health-check

# Start application
npm run start:production
```

## Post-Deployment

### 1. Initial Setup

1. **Access Admin Panel**: Navigate to `https://your-domain.com/admin/login`
2. **Login**: Use the credentials from your `.env.production`
3. **Change Password**: Immediately change the default admin password
4. **Test Email**: Submit a test contact form to verify email functionality
5. **Add Content**: Create your first blog post and project

### 2. Verification Checklist

- [ ] Application loads at your domain
- [ ] Admin panel is accessible
- [ ] Contact form sends emails
- [ ] File uploads work
- [ ] Blog posts can be created/edited
- [ ] Projects can be managed
- [ ] HTTPS is working
- [ ] All pages load correctly

## Monitoring & Maintenance

### System Monitoring

Check system status:
```bash
npm run status
```

View detailed metrics:
```bash
npm run monitor
```

### Log Management

View logs:
```bash
tail -f logs/combined.log
tail -f logs/error.log
```

Clean old logs:
```bash
npm run logs:clean
```

### Backup & Recovery

Create backup:
```bash
npm run backup
```

Restore from backup:
```bash
npm run restore -- backup-filename.tar.gz
```

### Health Monitoring

Run health check:
```bash
npm run health-check
```

The health check verifies:
- File system permissions
- Database integrity
- Environment configuration
- Dependencies
- Build artifacts
- Security settings

## Scaling & Performance

### Performance Optimization

1. **Enable Compression**: Already configured in `next.config.js`
2. **Image Optimization**: Automatic with Next.js Image component
3. **Caching**: Implement Redis for session storage
4. **CDN**: Use CloudFlare or similar for static assets

### Database Scaling

For high traffic, consider migrating from JSON files to:
- **PostgreSQL**: For relational data
- **MongoDB**: For document-based storage
- **Redis**: For session and cache storage

### Load Balancing

For multiple instances:
1. Use a load balancer (nginx, HAProxy)
2. Implement sticky sessions
3. Use shared storage for uploads
4. Centralize logging

## Security

### Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong, unique secrets generated
- [ ] Default passwords changed
- [ ] File upload restrictions configured
- [ ] Rate limiting enabled
- [ ] Security headers configured (automatic)
- [ ] Dependencies updated regularly
- [ ] Backup encryption enabled
- [ ] Access logs monitored
- [ ] Firewall configured

### Security Updates

Regular maintenance:
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check security configuration
npm run validate-config
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
tail -f logs/error.log

# Verify build
npm run build:prod

# Check dependencies
npm install
```

#### Email Not Working
```bash
# Test SMTP settings
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transport.verify().then(console.log).catch(console.error);
"
```

#### File Upload Issues
```bash
# Check permissions
ls -la public/uploads/

# Fix permissions
chmod 755 public/uploads/
```

#### Database Corruption
```bash
# Restore from backup
npm run restore -- latest-backup.tar.gz

# Or re-seed
rm -rf data/*.json
npm run seed
```

### Getting Help

1. Check the troubleshooting section above
2. Review application logs in `logs/` directory
3. Run `npm run health-check` for diagnostics
4. Verify environment configuration with `npm run validate-config`

## Advanced Configuration

### Custom Domain Setup

1. **DNS Configuration**: Point your domain to your server
2. **SSL Certificate**: Use Let's Encrypt or your provider
3. **Nginx Configuration** (optional):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment-Specific Configuration

Create different configurations for staging/production:

- `.env.staging`
- `.env.production`

### Monitoring Integration

Integrate with external services:
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure monitoring
- **Sentry**: Error tracking
- **LogRocket**: User session recording

## Support

For deployment issues:
1. Check this guide thoroughly
2. Review logs in `logs/` directory
3. Run diagnostic commands
4. Check system requirements
5. Verify environment configuration

## Version History

- **v1.0.0**: Initial production deployment guide
- **v1.1.0**: Added monitoring and security enhancements
- **v1.2.0**: Added scaling and performance optimization guides