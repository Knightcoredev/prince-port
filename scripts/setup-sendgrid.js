#!/usr/bin/env node

/**
 * SendGrid Setup Helper
 * Guides you through SendGrid SMTP configuration
 */

console.log('🚀 SendGrid SMTP Setup Guide\n');

console.log('📋 Step-by-Step Setup:\n');

console.log('1️⃣  Create SendGrid Account:');
console.log('   • Go to https://sendgrid.com');
console.log('   • Sign up for a free account (100 emails/day)');
console.log('   • Verify your email address\n');

console.log('2️⃣  Generate API Key:');
console.log('   • Login to SendGrid dashboard');
console.log('   • Go to Settings > API Keys');
console.log('   • Click "Create API Key"');
console.log('   • Choose "Restricted Access"');
console.log('   • Enable "Mail Send" permission');
console.log('   • Name it "Portfolio SMTP"');
console.log('   • Copy the generated API key\n');

console.log('3️⃣  Update Environment File:');
console.log('   • Open .env.production');
console.log('   • Replace YOUR_SENDGRID_API_KEY with your actual API key');
console.log('   • Example: SMTP_PASS=SG.abc123def456...\n');

console.log('4️⃣  Test Configuration:');
console.log('   • Run: npm run smtp:test');
console.log('   • Run: npm run smtp:send');
console.log('   • Check your email inbox\n');

console.log('5️⃣  Domain Authentication (Optional but Recommended):');
console.log('   • Go to Settings > Sender Authentication');
console.log('   • Click "Authenticate Your Domain"');
console.log('   • Follow DNS setup instructions');
console.log('   • This improves email deliverability\n');

console.log('📧 SendGrid Configuration Summary:');
console.log('   Host: smtp.sendgrid.net');
console.log('   Port: 587');
console.log('   Secure: true');
console.log('   User: apikey');
console.log('   Pass: YOUR_SENDGRID_API_KEY\n');

console.log('💡 Pro Tips:');
console.log('   • Keep your API key secure and never commit it to git');
console.log('   • SendGrid free tier: 100 emails/day');
console.log('   • Monitor usage in SendGrid dashboard');
console.log('   • Set up domain authentication for better deliverability');
console.log('   • Use a professional "from" email address\n');

console.log('🔗 Useful Links:');
console.log('   • SendGrid Dashboard: https://app.sendgrid.com');
console.log('   • API Keys: https://app.sendgrid.com/settings/api_keys');
console.log('   • Domain Auth: https://app.sendgrid.com/settings/sender_auth');
console.log('   • Documentation: https://docs.sendgrid.com\n');

console.log('❓ Need Help?');
console.log('   • Run: npm run smtp:guide');
console.log('   • Check SMTP_SETUP_GUIDE.md');
console.log('   • SendGrid Support: https://support.sendgrid.com\n');

console.log('✅ Once configured, test with: npm run smtp:send');

// Check if API key is already configured
const fs = require('fs');
if (fs.existsSync('.env.production')) {
  const envContent = fs.readFileSync('.env.production', 'utf8');
  if (envContent.includes('YOUR_SENDGRID_API_KEY')) {
    console.log('\n⚠️  Remember to replace YOUR_SENDGRID_API_KEY in .env.production!');
  } else if (envContent.includes('SG.')) {
    console.log('\n✅ SendGrid API key appears to be configured!');
    console.log('   Test it with: npm run smtp:test');
  }
}