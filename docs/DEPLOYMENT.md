# Deployment Guide

This guide covers the complete deployment process for the Portfolio Enhancement system.

## Prerequisites

### System Requirements
- Node.js 16+ 
- npm 8+
- Git
- SSL certificate (for HTTPS)
- SMTP server access (for email functionality)

### Environment Setup
1. Clone the repository to your production server
2. Install dependencies: `npm ci --only=production`
3. Configure environment variables (see Configuration section)

## Configuration

### Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Core Configuration
NODE_ENV=production
APP_URL=https://your-domain.com
APP_NAME="Your Portfolio Name"

# Authentication & Security
JWT_SECRET=your-secure-jwt-secret-32-chars-min
SESSION_SECRET=your-secure-session-secret-32-chars-min
CSRF_SECRET=your-secure-csrf-secret-32-chars-min
BCRYPT_ROUNDS=12

# Admin Account
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=secure-admin-password

# Email Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@your-domain.com
SMTP_PASS=your-email-password
EMAIL_FROM=noreply@your-domain.com
EMAIL_TO=admin@your-domain.com

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp
UPLOAD_PATH=./public/uploads

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_CONTACT_MAX=5

# Performance
CACHE_TTL=3600
IMAGE_OPTIMIZATION=true
COMPRESSION=true

# Monitoring
LOG_LEVEL=error
LOG_FILE=./logs/app.log
ENABLE_ANALYTICS=true
ENABLE_ERROR_TRACKING=true

# Backup
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000
BACKUP_RETENTION=7
```

### Security Considerations

1. **Strong Secrets**: Generate cryptographically secure secrets (32+ characters)
2. **HTTPS Only**: Always use HTTPS in production
3. **File Permissions**: Ensure proper file permissions for upload directories
4. **Regular Updates**: Keep dependencies updated
5. **Backup Strategy**: Implement regular data backups

## Deployment Process

### Automated Deployment

Use the provided deployment script for a complete automated setup:

```bash
npm run deploy:full
```

This script will:
1. Check environment configuration
2. Create required directories
3. Install production dependencies
4. Build the application
5. Seed the database with initial data
6. Perform health checks
7. Create initial backup

### Manual Deployment Steps

If you prefer manual deployment:

1. **Environment Setup**
   ```bash
   cp .env.local.example .env.production
   # Edit .env.production with your values
   ```

2. **Install Dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Build Application**
   ```bash
   npm run build:prod
   ```

4. **Create Directories**
   ```bash
   mkdir -p data logs public/uploads public/uploads/blog public/uploads/projects
   ```

5. **Seed Database**
   ```bash
   npm run seed
   ```

6. **Health Check**
   ```bash
   npm run health-check
   ```

7. **Start Application**
   ```bash
   npm run start:prod
   ```

## Post-Deployment

### Initial Setup

1. **Access Admin Panel**: Navigate to `/admin/login`
2. **Change Default Password**: Use the default credentials to login and immediately change the password
3. **Configure SMTP**: Test email functionality through the contact form
4. **Add Content**: Create your first blog post and projects

### Monitoring

1. **Application Logs**: Monitor `logs/app.log` for errors
2. **Health Checks**: Run periodic health checks with `npm run health-check`
3. **Backup Verification**: Ensure backups are created regularly

### Maintenance

1. **Regular Backups**: 
   ```bash
   npm run backup
   ```

2. **Log Rotation**: Clean old logs periodically
   ```bash
   npm run logs:clean
   ```

3. **Security Updates**: Keep dependencies updated
   ```bash
   npm audit
   npm update
   ```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (16+ required)
   - Verify all dependencies are installed
   - Check for syntax errors in code

2. **Database Issues**
   - Ensure data directory has write permissions
   - Verify JSON files are valid
   - Check file system space

3. **Email Not Working**
   - Verify SMTP credentials
   - Check firewall settings
   - Test SMTP connection manually

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure sufficient disk space

### Health Check Failures

Run the health check to identify issues:
```bash
npm run health-check
```

Common fixes:
- Missing directories: Create with proper permissions
- Invalid JSON: Restore from backup or re-seed
- Missing environment variables: Update .env.production
- Build artifacts missing: Run `npm run build:prod`

## Scaling Considerations

### Performance Optimization

1. **CDN**: Use a CDN for static assets
2. **Image Optimization**: Enable Next.js image optimization
3. **Caching**: Implement Redis for session storage
4. **Database**: Consider migrating to PostgreSQL/MongoDB for larger datasets

### High Availability

1. **Load Balancer**: Use multiple application instances
2. **Database Replication**: Implement database clustering
3. **File Storage**: Use cloud storage (AWS S3, etc.)
4. **Monitoring**: Implement comprehensive monitoring (New Relic, DataDog)

## Backup and Recovery

### Backup Strategy

1. **Automated Backups**: Enabled by default (daily)
2. **Manual Backup**: `npm run backup`
3. **Backup Location**: `./backups/` directory
4. **Retention**: 7 days by default

### Recovery Process

1. **Stop Application**
2. **Restore Data**: `npm run restore -- backup-filename.tar.gz`
3. **Verify Data**: Check data files integrity
4. **Restart Application**

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong, unique secrets generated
- [ ] Default admin password changed
- [ ] File upload restrictions configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular security updates scheduled
- [ ] Backup encryption enabled
- [ ] Access logs monitored
- [ ] Firewall rules configured

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Run health check diagnostics
4. Verify environment configuration
5. Check system requirements

## Version History

- v1.0.0: Initial deployment guide
- v1.1.0: Added security checklist and scaling considerations