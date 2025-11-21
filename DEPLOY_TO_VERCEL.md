# 🚀 Vercel Deployment Instructions

## Quick Deploy Steps:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

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
