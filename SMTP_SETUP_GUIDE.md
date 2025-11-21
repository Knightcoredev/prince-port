# SMTP Configuration Guide

## Current Configuration

Your portfolio is currently configured with DevMail SMTP for development/testing. For production, you should use a reliable email service provider.

## Production SMTP Providers

### 🥇 Recommended Providers

#### 1. **SendGrid** (Recommended for portfolios)
- **Free Tier**: 100 emails/day
- **Reliability**: Excellent
- **Setup Difficulty**: Easy

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Setup Steps:**
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Go to Settings > API Keys
3. Create new API key with "Mail Send" permissions
4. Use `apikey` as username and your API key as password

#### 2. **Gmail SMTP** (Good for personal portfolios)
- **Free Tier**: 500 emails/day
- **Reliability**: Good
- **Setup Difficulty**: Medium (requires App Password)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Setup Steps:**
1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an App Password for "Mail"
4. Use your Gmail address and the generated App Password

#### 3. **AWS SES** (Best for high volume)
- **Free Tier**: 62,000 emails/month
- **Reliability**: Excellent
- **Setup Difficulty**: Hard

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-aws-access-key
SMTP_PASS=your-aws-secret-key
```

#### 4. **Mailgun** (Developer-friendly)
- **Free Tier**: 5,000 emails/month
- **Reliability**: Excellent
- **Setup Difficulty**: Easy

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## Testing Your SMTP Configuration

### Quick Connection Test
```bash
# Test SMTP connection only
node scripts/test-smtp.js

# Test connection and send test email
node scripts/test-smtp.js send

# View setup guide
node scripts/test-smtp.js guide
```

### Manual Testing with Different Providers

1. **Update your `.env.production`** with new SMTP settings
2. **Test the connection**: `node scripts/test-smtp.js`
3. **Send test email**: `node scripts/test-smtp.js send`
4. **Check your inbox** for the test email

## Email Configuration Best Practices

### 1. Domain Authentication
Set up SPF, DKIM, and DMARC records for your domain:

```dns
# SPF Record
TXT @ "v=spf1 include:sendgrid.net ~all"

# DMARC Record  
TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

### 2. Email Templates
Your configuration includes template settings:

```env
EMAIL_TEMPLATE_ENABLED=true
EMAIL_LOGO_URL=https://yourdomain.com/logo.png
EMAIL_FOOTER_TEXT=© 2024 Prince F. Obieze Portfolio
```

### 3. Rate Limiting
Prevent spam and abuse:

```env
EMAIL_RATE_LIMIT=10  # emails per hour
EMAIL_QUEUE_ENABLED=true
EMAIL_VALIDATION_ENABLED=true
```

## Common Issues & Solutions

### ❌ Authentication Failed (EAUTH)
- **Gmail**: Use App Password, not regular password
- **Outlook**: Enable "Less secure app access"
- **SendGrid**: Use `apikey` as username

### ❌ Connection Timeout (ECONNECTION)
- Check firewall settings
- Verify SMTP host and port
- Ensure SMTP_SECURE matches port (587=false, 465=true)

### ❌ Emails Going to Spam
- Set up domain authentication (SPF, DKIM, DMARC)
- Use a professional "from" address
- Include unsubscribe links
- Maintain good sender reputation

## Production Checklist

- [ ] Choose production SMTP provider
- [ ] Update SMTP credentials in `.env.production`
- [ ] Test SMTP connection: `node scripts/test-smtp.js`
- [ ] Send test email: `node scripts/test-smtp.js send`
- [ ] Set up domain authentication (SPF, DKIM, DMARC)
- [ ] Configure email templates and branding
- [ ] Set up monitoring for email delivery
- [ ] Test contact form functionality
- [ ] Verify emails don't go to spam

## Monitoring Email Delivery

### Track Email Metrics
Most providers offer dashboards to monitor:
- Delivery rates
- Open rates
- Bounce rates
- Spam complaints

### Set Up Webhooks (Advanced)
Configure webhooks to track email events in your application:
- Delivered
- Opened
- Clicked
- Bounced
- Spam complaints

## Security Considerations

1. **Never commit SMTP credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate credentials regularly**
4. **Monitor for suspicious activity**
5. **Implement rate limiting** to prevent abuse
6. **Validate email addresses** before sending
7. **Use HTTPS** for all email-related endpoints

## Need Help?

Run the SMTP test script for detailed diagnostics:
```bash
node scripts/test-smtp.js send
```

The script will provide specific error messages and suggestions for common issues.