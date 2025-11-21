# Vercel Deployment Guide - Prince F. Obieze Portfolio

This guide covers deploying your portfolio to Vercel with all features working correctly.

## 🚀 Quick Vercel Deployment

### Step 1: Prepare for Vercel

1. **Push to GitHub** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Prince F. Obieze Portfolio"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio-nextjs.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Import Project**: Click "New Project" → Import from GitHub
4. **Select Repository**: Choose your portfolio repository
5. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: **/** (leave default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)

### Step 3: Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```bash
# Core Configuration
NODE_ENV=production
APP_NAME=Prince F. Obieze Portfolio
APP_URL=https://your-vercel-domain.vercel.app

# Authentication Secrets
JWT_SECRET=95d6e170dd2b210ec92db7ff52f6650fc8161c117be4725a6d7c480700e656da
SESSION_SECRET=6a3924a61d7f6b1efc0e5494af944cfdcac57b7692e34f549221fabb4dd1f
CSRF_SECRET=1a70796cefb98ce174abc9f37a824ff4a890dbdf68d488cf778727b013dbfd23
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
COMPRESSION=true
```

### Step 4: Custom Domain (Optional)

1. **Add Domain**: In Vercel dashboard → Settings → Domains
2. **Add your domain**: `your-domain.com`
3. **Update DNS**: Point your domain to Vercel
4. **Update Environment Variables**:
   - Change `APP_URL` to `https://your-domain.com`
   - Update email domains accordingly

## 🔧 Vercel-Specific Configurations

### 1. Create `vercel.json` Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Update `next.config.js` for Vercel

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Vercel optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization for Vercel
  images: {
    domains: ['localhost', 'your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Environment variables for client
  env: {
    APP_NAME: process.env.APP_NAME,
    APP_URL: process.env.APP_URL,
  },
  
  // Vercel-specific webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
```

## 📁 File Storage on Vercel

### Important: Vercel Limitations

Vercel has a **read-only filesystem** in production. Your current setup uses local JSON files and file uploads, which need adjustments:

### Option 1: Keep Current Setup (Recommended for MVP)
- Data will reset on each deployment
- Good for testing and development
- File uploads work but are temporary

### Option 2: Upgrade to Database (Production Ready)
- Use **Vercel Postgres** or **PlanetScale**
- Use **Vercel Blob** for file storage
- Persistent data across deployments

## 🚀 Deployment Steps

### 1. Create Vercel Configuration