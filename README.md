# Portfolio Enhancement - Next.js + Tailwind

This is an enhanced portfolio template built with Next.js (pages router) and Tailwind CSS, featuring a dynamic blog system, administrative panel, contact form backend with email integration, and project showcase improvements.

## Features

- Dynamic blog system with CRUD operations
- Administrative panel for content management
- Contact form with email integration
- Enhanced project showcase with filtering
- Authentication system for admin access
- File upload capabilities
- JSON-based data storage

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

3. Start development server:
```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
portfolio-nextjs/
├── pages/
│   ├── api/              # API routes
│   ├── admin/            # Admin panel pages
│   ├── blog/             # Blog pages
│   └── index.js          # Home page
├── components/
│   ├── admin/            # Admin components
│   ├── blog/             # Blog components
│   └── ui/               # UI components
├── lib/                  # Utility functions
├── data/                 # JSON data storage
└── public/
    └── uploads/          # File uploads
```

## Dependencies

### Core Dependencies
- Next.js 13.4.9
- React 18.2.0
- Tailwind CSS 3.4.7

### Enhancement Dependencies
- NextAuth.js - Authentication
- Nodemailer - Email sending
- React-Quill - Rich text editor
- Multer - File upload handling
- bcrypt - Password hashing
- Joi - Data validation

## Development

This project follows a spec-driven development approach. Implementation tasks are defined in `.kiro/specs/portfolio-enhancement/tasks.md`.

## Deployment

### Development Deployment (Vercel)
1. Push repository to GitHub
2. Import project on Vercel (https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy

### Production Deployment
For production deployment with full features and monitoring, see the comprehensive [Production Deployment Guide](./PRODUCTION.md).

Quick production setup:
```bash
# 1. Configure environment
cp .env.local.example .env.production
# Edit .env.production with production values

# 2. Deploy with monitoring
npm run deploy:full

# 3. Start production server
npm run start:production
```

The production deployment includes:
- Automated configuration validation
- Database seeding with initial data
- Health monitoring and logging
- Backup and recovery systems
- Security hardening
- Performance optimization

## Configuration

### Email Setup
Configure SMTP settings in `.env.local`:
- SMTP_HOST: Your email provider's SMTP server
- SMTP_PORT: SMTP port (usually 587 for TLS)
- SMTP_USER: Your email address
- SMTP_PASS: Your email password or app-specific password

### Admin Access
Set admin credentials in `.env.local`:
- ADMIN_USERNAME: Admin username
- ADMIN_PASSWORD: Admin password (use a strong password in production)

### File Upload
Configure file upload limits:
- MAX_FILE_SIZE: Maximum file size in bytes (default: 5MB)
- ALLOWED_FILE_TYPES: Comma-separated list of allowed MIME types