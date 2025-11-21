const nodemailer = require('nodemailer');

// Rate limiting for email sending
const emailRateLimit = new Map();

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Default sender info
const DEFAULT_FROM = {
  name: process.env.FROM_NAME || 'Portfolio Contact',
  email: process.env.FROM_EMAIL || process.env.SMTP_USER
};

/**
 * Create and configure nodemailer transporter
 */
function createTransporter() {
  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }
    
    const transporter = nodemailer.createTransporter(EMAIL_CONFIG);
    
    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP configuration error:', error);
      } else {
        console.log('SMTP server is ready to send emails');
      }
    });
    
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
}

/**
 * Rate limiting for email sending
 */
function checkEmailRateLimit(identifier, maxEmails = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const attempts = emailRateLimit.get(identifier) || { count: 0, resetTime: now + windowMs };
  
  // Reset if window has passed
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
  }
  
  // Check if limit exceeded
  if (attempts.count >= maxEmails) {
    const remainingTime = Math.ceil((attempts.resetTime - now) / 1000 / 60);
    throw new Error(`Email rate limit exceeded. Try again in ${remainingTime} minutes.`);
  }
  
  // Increment attempt count
  attempts.count++;
  emailRateLimit.set(identifier, attempts);
  
  return true;
}

/**
 * Generate HTML email template for contact form
 */
function generateContactEmailTemplate(data) {
  const { name, email, subject, message, submittedAt, ipAddress } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #495057; }
        .value { margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        .message { white-space: pre-wrap; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>New Contact Form Submission</h2>
        <p>You have received a new message through your portfolio contact form.</p>
      </div>
      
      <div class="content">
        <div class="field">
          <div class="label">Name:</div>
          <div class="value">${escapeHtml(name)}</div>
        </div>
        
        <div class="field">
          <div class="label">Email:</div>
          <div class="value">${escapeHtml(email)}</div>
        </div>
        
        ${subject ? `
        <div class="field">
          <div class="label">Subject:</div>
          <div class="value">${escapeHtml(subject)}</div>
        </div>
        ` : ''}
        
        <div class="field">
          <div class="label">Message:</div>
          <div class="value message">${escapeHtml(message)}</div>
        </div>
      </div>
      
      <div class="footer">
        <p>Submitted on: ${new Date(submittedAt).toLocaleString()}</p>
        <p>IP Address: ${ipAddress}</p>
        <p>This email was sent from your portfolio contact form.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email template for contact form
 */
function generateContactTextTemplate(data) {
  const { name, email, subject, message, submittedAt, ipAddress } = data;
  
  return `
New Contact Form Submission

Name: ${name}
Email: ${email}
${subject ? `Subject: ${subject}\n` : ''}
Message:
${message}

---
Submitted on: ${new Date(submittedAt).toLocaleString()}
IP Address: ${ipAddress}
This email was sent from your portfolio contact form.
  `.trim();
}

/**
 * Generate auto-reply email template
 */
function generateAutoReplyTemplate(name) {
  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for your message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Thank you for your message!</h2>
        </div>
        
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          
          <p>Thank you for reaching out through my portfolio contact form. I have received your message and will get back to you as soon as possible.</p>
          
          <p>I typically respond to messages within 24-48 hours during business days.</p>
          
          <p>Best regards,<br>
          [Your Name]</p>
        </div>
        
        <div class="footer">
          <p>This is an automated response. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Hi ${name},

Thank you for reaching out through my portfolio contact form. I have received your message and will get back to you as soon as possible.

I typically respond to messages within 24-48 hours during business days.

Best regards,
[Your Name]

---
This is an automated response. Please do not reply to this email.
    `.trim()
  };
}

/**
 * Escape HTML characters to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Send contact form email
 */
async function sendContactEmail(contactData) {
  try {
    const { name, email, subject, message, ipAddress } = contactData;
    
    // Check rate limit based on IP address
    checkEmailRateLimit(ipAddress);
    
    // Create transporter
    const transporter = createTransporter();
    
    // Prepare email data
    const submissionData = {
      ...contactData,
      submittedAt: new Date()
    };
    
    // Email to site owner
    const ownerEmailOptions = {
      from: `"${DEFAULT_FROM.name}" <${DEFAULT_FROM.email}>`,
      to: process.env.CONTACT_EMAIL || DEFAULT_FROM.email,
      subject: subject ? `Portfolio Contact: ${subject}` : `New Portfolio Contact from ${name}`,
      html: generateContactEmailTemplate(submissionData),
      text: generateContactTextTemplate(submissionData),
      replyTo: email
    };
    
    // Send email to owner
    const ownerResult = await transporter.sendMail(ownerEmailOptions);
    console.log('Contact email sent to owner:', ownerResult.messageId);
    
    // Send auto-reply to sender (optional)
    if (process.env.SEND_AUTO_REPLY === 'true') {
      const autoReply = generateAutoReplyTemplate(name);
      const autoReplyOptions = {
        from: `"${DEFAULT_FROM.name}" <${DEFAULT_FROM.email}>`,
        to: email,
        subject: 'Thank you for your message',
        html: autoReply.html,
        text: autoReply.text
      };
      
      const autoReplyResult = await transporter.sendMail(autoReplyOptions);
      console.log('Auto-reply sent:', autoReplyResult.messageId);
    }
    
    return {
      success: true,
      messageId: ownerResult.messageId
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send notification email for new blog post
 */
async function sendBlogNotification(blogPost) {
  try {
    if (!process.env.BLOG_NOTIFICATION_EMAIL) {
      return { success: false, message: 'Blog notification email not configured' };
    }
    
    const transporter = createTransporter();
    
    const emailOptions = {
      from: `"${DEFAULT_FROM.name}" <${DEFAULT_FROM.email}>`,
      to: process.env.BLOG_NOTIFICATION_EMAIL,
      subject: `New Blog Post Published: ${blogPost.title}`,
      html: `
        <h2>New Blog Post Published</h2>
        <p><strong>Title:</strong> ${escapeHtml(blogPost.title)}</p>
        <p><strong>Excerpt:</strong> ${escapeHtml(blogPost.excerpt || 'No excerpt available')}</p>
        <p><strong>Published:</strong> ${new Date(blogPost.createdAt).toLocaleString()}</p>
        <p><a href="${process.env.SITE_URL}/blog/${blogPost.slug}">View Post</a></p>
      `,
      text: `
New Blog Post Published

Title: ${blogPost.title}
Excerpt: ${blogPost.excerpt || 'No excerpt available'}
Published: ${new Date(blogPost.createdAt).toLocaleString()}
URL: ${process.env.SITE_URL}/blog/${blogPost.slug}
      `.trim()
    };
    
    const result = await transporter.sendMail(emailOptions);
    console.log('Blog notification sent:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Blog notification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test email configuration
 */
async function testEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    return {
      success: true,
      message: 'Email configuration is valid'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send test email
 */
async function sendTestEmail(toEmail) {
  try {
    const transporter = createTransporter();
    
    const emailOptions = {
      from: `"${DEFAULT_FROM.name}" <${DEFAULT_FROM.email}>`,
      to: toEmail,
      subject: 'Portfolio Email Test',
      html: `
        <h2>Email Test Successful</h2>
        <p>This is a test email from your portfolio contact system.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `,
      text: `
Email Test Successful

This is a test email from your portfolio contact system.
If you received this email, your email configuration is working correctly.

Sent at: ${new Date().toLocaleString()}
      `.trim()
    };
    
    const result = await transporter.sendMail(emailOptions);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    throw new Error(`Test email failed: ${error.message}`);
  }
}

/**
 * Clear email rate limit for identifier
 */
function clearEmailRateLimit(identifier) {
  emailRateLimit.delete(identifier);
}

/**
 * Get email rate limit status
 */
function getEmailRateLimitStatus(identifier) {
  const attempts = emailRateLimit.get(identifier);
  if (!attempts) {
    return { count: 0, resetTime: null };
  }
  
  return {
    count: attempts.count,
    resetTime: new Date(attempts.resetTime),
    remaining: Math.max(0, 5 - attempts.count)
  };
}

module.exports = {
  sendContactEmail,
  sendBlogNotification,
  testEmailConfig,
  sendTestEmail,
  checkEmailRateLimit,
  clearEmailRateLimit,
  getEmailRateLimitStatus,
  generateContactEmailTemplate,
  generateContactTextTemplate,
  generateAutoReplyTemplate
};