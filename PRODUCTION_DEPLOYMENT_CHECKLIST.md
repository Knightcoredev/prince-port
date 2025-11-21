# Production Deployment Checklist

## 🔒 Security Configuration

### Required Environment Variables
- [ ] `DATABASE_URL` - Set to SQLite database file path (file:./data/portfolio.db)
- [ ] `JWT_SECRET` - Generate new 64-character secret
- [ ] `SESSION_SECRET` - Generate new 64-character secret
- [ ] `NEXTAUTH_SECRET` - Generate new 64-character secret
- [ ] `CSRF_SECRET` - Generate new 64-character secret

### Domain Configuration
- [ ] `NEXTAUTH_URL` - Set to your production domain
- [ ] `NEXT_PUBLIC_APP_URL` - Set to your production domain
- [ ] `APP_URL` - Set to your production domain
- [ ] `EMAIL_FROM` - Set to your domain email
- [ ] `EMAIL_TO` - Set to your contact email
- [ ] `ADMIN_EMAIL` - Set to your admin email

### OAuth Configuration (if using)
- [ ] `GOOGLE_CLIENT_ID` - Add Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Add Google OAuth client secret

### Email Configuration
- [ ] Choose production SMTP provider (SendGrid, Gmail, AWS SES, Mailgun)
- [ ] Update SMTP credentials in `.env.production`
- [ ] Test SMTP connection: `npm run smtp:test`
- [ ] Send test email: `npm run smtp:send`
- [ ] Set up domain authentication (SPF, DKIM, DMARC)
- [ ] Configure email templates and branding
- [ ] Test contact form functionality

## 🚀 Performance & Optimization

### File Uploads
- [ ] Consider implementing cloud storage (Cloudinary/AWS S3)
- [ ] Ensure upload directory exists if using local storage
- [ ] Configure proper file permissions

### Caching
- [ ] Configure Redis for session storage (recommended)
- [ ] Set up CDN for static assets
- [ ] Enable compression and minification

## 📊 Monitoring & Analytics

### Error Tracking
- [ ] Set up Sentry for error tracking
- [ ] Configure logging service (DataDog, LogTail)

### Analytics
- [ ] Add Google Analytics ID
- [ ] Configure other analytics services if needed

## 🔧 Infrastructure

### Database (SQLite)
- [ ] Initialize SQLite database: `npm run db:init`
- [ ] Set up database schema: `npm run db:setup`
- [ ] Configure database backups: `npm run db:backup`
- [ ] Ensure data directory has proper permissions
- [ ] Configure WAL mode for better performance
- [ ] Set up automated backup schedule

### Security Headers
- [ ] Verify CSP configuration
- [ ] Enable HSTS
- [ ] Configure CORS properly

### SSL/TLS
- [ ] Ensure HTTPS is enforced
- [ ] Configure SSL certificates

## 🧪 Testing

### Pre-deployment Tests
- [ ] Run all tests: `npm run test`
- [ ] Build successfully: `npm run build`
- [ ] Check for TypeScript errors
- [ ] Verify all API endpoints work
- [ ] Test authentication flow
- [ ] Test contact form
- [ ] Test file uploads

### Post-deployment Tests
- [ ] Verify site loads correctly
- [ ] Test all major functionality
- [ ] Check error tracking is working
- [ ] Verify analytics are collecting data
- [ ] Test email notifications

## 📝 Documentation

- [ ] Update README with production setup instructions
- [ ] Document any custom configuration
- [ ] Create runbook for common issues

## 🔄 Backup & Recovery

- [ ] Set up automated database backups
- [ ] Test backup restoration process
- [ ] Document recovery procedures

## 🎯 Go-Live Checklist

- [ ] All environment variables configured
- [ ] DNS configured correctly
- [ ] SSL certificate installed
- [ ] Monitoring systems active
- [ ] Backup systems running
- [ ] Team notified of deployment