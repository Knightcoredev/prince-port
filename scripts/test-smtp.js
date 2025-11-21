#!/usr/bin/env node

/**
 * SMTP Configuration Test Script
 * Tests email sending functionality with current SMTP settings
 */

const nodemailer = require('nodemailer');
const fs = require('fs');

function loadEnvFile(envPath = '.env.production') {
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment file not found: ${envPath}`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

async function testSMTPConnection(config) {
  console.log('🔄 Testing SMTP connection...');
  
  const transporter = nodemailer.createTransporter({
    host: config.SMTP_HOST,
    port: parseInt(config.SMTP_PORT),
    secure: config.SMTP_SECURE === 'true',
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS
    },
    // Add timeout and connection options
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    return transporter;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    
    // Provide specific error guidance
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Check:');
      console.log('   • Username and password are correct');
      console.log('   • For Gmail: Use App Password, not regular password');
      console.log('   • For Outlook: Enable "Less secure app access"');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Check:');
      console.log('   • SMTP host and port are correct');
      console.log('   • Firewall/network allows SMTP connections');
      console.log('   • SMTP_SECURE setting matches port (587=false, 465=true)');
    }
    
    throw error;
  }
}

async function sendTestEmail(transporter, config) {
  console.log('📧 Sending test email...');
  
  const testEmail = {
    from: config.EMAIL_FROM || 'test@example.com',
    to: config.EMAIL_TO || 'test@example.com',
    subject: '🧪 SMTP Test Email - Portfolio System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">SMTP Test Successful! 🎉</h2>
        <p>This is a test email from your portfolio SMTP configuration.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Configuration Details:</h3>
          <ul>
            <li><strong>SMTP Host:</strong> ${config.SMTP_HOST}</li>
            <li><strong>SMTP Port:</strong> ${config.SMTP_PORT}</li>
            <li><strong>Secure:</strong> ${config.SMTP_SECURE}</li>
            <li><strong>From:</strong> ${config.EMAIL_FROM}</li>
            <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
          </ul>
        </div>
        
        <p>If you received this email, your SMTP configuration is working correctly!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated test email from ${config.APP_NAME || 'Portfolio System'}
        </p>
      </div>
    `,
    text: `
SMTP Test Successful!

This is a test email from your portfolio SMTP configuration.

Configuration Details:
- SMTP Host: ${config.SMTP_HOST}
- SMTP Port: ${config.SMTP_PORT}
- Secure: ${config.SMTP_SECURE}
- From: ${config.EMAIL_FROM}
- Test Time: ${new Date().toISOString()}

If you received this email, your SMTP configuration is working correctly!
    `
  };

  try {
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    
    if (info.preview) {
      console.log(`🔗 Preview URL: ${info.preview}`);
    }
    
    return info;
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    throw error;
  }
}

function validateSMTPConfig(config) {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required SMTP configuration:');
    missing.forEach(key => console.error(`   • ${key}`));
    return false;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.EMAIL_FROM)) {
    console.error('❌ EMAIL_FROM is not a valid email address');
    return false;
  }
  
  if (config.EMAIL_TO && !emailRegex.test(config.EMAIL_TO)) {
    console.error('❌ EMAIL_TO is not a valid email address');
    return false;
  }
  
  return true;
}

function displaySMTPProviderGuide() {
  console.log('\n📚 Popular SMTP Provider Setup Guide:\n');
  
  console.log('🔹 Gmail:');
  console.log('   1. Enable 2FA on your Google account');
  console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
  console.log('   3. Use: smtp.gmail.com:587, secure=true');
  console.log('');
  
  console.log('🔹 SendGrid:');
  console.log('   1. Create account at sendgrid.com');
  console.log('   2. Generate API key in Settings > API Keys');
  console.log('   3. Use: smtp.sendgrid.net:587, user=apikey, pass=your-api-key');
  console.log('');
  
  console.log('🔹 Mailgun:');
  console.log('   1. Create account at mailgun.com');
  console.log('   2. Get SMTP credentials from Domains > SMTP');
  console.log('   3. Use: smtp.mailgun.org:587');
  console.log('');
  
  console.log('🔹 AWS SES:');
  console.log('   1. Set up SES in AWS Console');
  console.log('   2. Create SMTP credentials');
  console.log('   3. Use: email-smtp.{region}.amazonaws.com:587');
  console.log('');
}

async function main() {
  const command = process.argv[2];
  const envFile = process.argv[3] || '.env.production';
  
  console.log('📧 SMTP Configuration Tester\n');
  
  if (command === 'guide') {
    displaySMTPProviderGuide();
    return;
  }
  
  try {
    const config = loadEnvFile(envFile);
    
    console.log(`📁 Using environment file: ${envFile}`);
    console.log(`🏷️  SMTP Host: ${config.SMTP_HOST}`);
    console.log(`🔌 SMTP Port: ${config.SMTP_PORT}`);
    console.log(`🔒 Secure: ${config.SMTP_SECURE}`);
    console.log(`👤 User: ${config.SMTP_USER}`);
    console.log(`📨 From: ${config.EMAIL_FROM}`);
    console.log(`📬 To: ${config.EMAIL_TO}\n`);
    
    // Validate configuration
    if (!validateSMTPConfig(config)) {
      process.exit(1);
    }
    
    // Test connection
    const transporter = await testSMTPConnection(config);
    
    // Send test email if requested
    if (command === 'send' || command === 'test') {
      await sendTestEmail(transporter, config);
    }
    
    console.log('\n🎉 SMTP configuration is working correctly!');
    
  } catch (error) {
    console.error('\n💥 SMTP test failed:', error.message);
    console.log('\n💡 Run "node scripts/test-smtp.js guide" for setup help');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testSMTPConnection, sendTestEmail, validateSMTPConfig };