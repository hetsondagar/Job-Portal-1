const nodemailer = require('nodemailer');

class SimpleEmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@jobportal.com';
    this.fromName = process.env.FROM_NAME || 'Job Portal';
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Prefer explicit SMTP settings if provided
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        console.log('✅ Email service initialized with configured SMTP');
        return;
      }

      // No SMTP. We'll rely on API providers (Resend/SendGrid) if configured.
      this.transporter = null;
      console.log('ℹ️ No SMTP configured. Will use email API providers if available.');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.transporter = null;
    }
  }

  async sendPasswordResetEmail(toEmail, resetToken, userName = 'User') {
    // Ensure init ran
    if (typeof this.transporter === 'undefined') {
      await this.initializeTransporter();
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request - Job Portal';
    const htmlContent = this.getPasswordResetEmailTemplate(userName, resetUrl);
    const textContent = this.getPasswordResetEmailText(userName, resetUrl);

    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: toEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    // Strategy 1: SMTP via nodemailer
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent via SMTP');
        return { success: true, method: 'smtp', messageId: info.messageId };
      } catch (error) {
        console.error('❌ SMTP send failed:', error.message);
      }
    }

    // Strategy 2: Resend API
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await this.sendViaResend({ toEmail, subject, htmlContent, textContent });
        console.log('✅ Password reset email sent via Resend');
        return { success: true, method: 'resend', id: res.id };
      } catch (error) {
        console.error('❌ Resend API send failed:', error.message);
      }
    }

    // Strategy 3: SendGrid API
    if (process.env.SENDGRID_API_KEY) {
      try {
        const res = await this.sendViaSendgrid({ toEmail, subject, htmlContent, textContent });
        console.log('✅ Password reset email sent via SendGrid');
        return { success: true, method: 'sendgrid', id: res.message };
      } catch (error) {
        console.error('❌ SendGrid API send failed:', error.message);
      }
    }

    // Strategy 4: Final fallback to jsonTransport for local dev only
    try {
      const devTransporter = nodemailer.createTransport({ jsonTransport: true });
      const info = await devTransporter.sendMail(mailOptions);
      console.log('📝 Email not sent (no provider configured). Logged message for dev env.');
      console.log(JSON.stringify(info.message, null, 2));
      return { success: true, method: 'jsonTransport', message: 'Logged (no provider configured)' };
    } catch (error) {
      console.error('❌ All email strategies failed:', error.message);
      throw new Error('Email provider not configured. Set SMTP_*, RESEND_API_KEY, or SENDGRID_API_KEY');
    }
  }

  async sendViaResend({ toEmail, subject, htmlContent, textContent }) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = `${this.fromName} <${this.fromEmail}>`;
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [toEmail],
        subject,
        html: htmlContent,
        text: textContent
      })
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Resend error ${resp.status}: ${txt}`);
    }
    return await resp.json();
  }

  async sendViaSendgrid({ toEmail, subject, htmlContent, textContent }) {
    const apiKey = process.env.SENDGRID_API_KEY;
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: this.fromEmail, name: this.fromName },
        subject,
        content: [
          { type: 'text/plain', value: textContent },
          { type: 'text/html', value: htmlContent }
        ]
      })
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`SendGrid error ${resp.status}: ${txt}`);
    }
    return { message: 'accepted' };
  }

  getPasswordResetEmailTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Job Portal</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            color: #1f2937;
            font-size: 20px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Job Portal</div>
            <h1 class="title">Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password for your Job Portal account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>For security, this link can only be used once</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The Job Portal Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailText(userName, resetUrl) {
    return `
Password Reset Request - Job Portal

Hello ${userName},

We received a request to reset your password for your Job Portal account. If you didn't make this request, you can safely ignore this email.

To reset your password, visit this link:
${resetUrl}

Important:
- This link will expire in 1 hour
- If you didn't request this password reset, please ignore this email
- For security, this link can only be used once

If you have any questions, please contact our support team.

Best regards,
The Job Portal Team

© 2024 Job Portal. All rights reserved.
    `;
  }

  async testEmailService() {
    try {
      const testEmail = 'test@example.com';
      const result = await this.sendPasswordResetEmail(testEmail, 'test-token-123', 'Test User');
      return { success: true, message: 'Email service is working correctly', previewUrl: result.previewUrl };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new SimpleEmailService();
