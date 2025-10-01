const nodemailer = require('nodemailer');

class SimpleEmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@jobportal.com';
    this.fromName = process.env.FROM_NAME || 'Job Portal';
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Yahoo-specific handling
      if (process.env.SMTP_HOST === 'smtp.mail.yahoo.com' || process.env.SMTP_HOST?.includes('yahoo')) {
        console.log('🔄 Detected Yahoo SMTP - using Yahoo-specific configuration');
        this.transporter = await this.initializeYahooTransporter();
        return;
      }

      // Prefer explicit SMTP settings if provided (or URL)
      const smtpUrl = process.env.SMTP_URL;
      const hasHostCreds = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
      if (smtpUrl || hasHostCreds) {
        const poolEnabled = String(process.env.SMTP_POOL || 'true') === 'true';
        const port = Number(process.env.SMTP_PORT || 587);
        const secure = String(process.env.SMTP_SECURE || (port === 465)).toLowerCase() === 'true';
        const connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000);
        const socketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 10000);

        const baseOptions = smtpUrl
          ? { url: smtpUrl }
          : {
              host: process.env.SMTP_HOST,
              port,
              secure,
              auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            };

        // Build advanced SMTP options
        const transporterOptions = {
          ...baseOptions,
          pool: poolEnabled,
          maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 5),
          maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 100),
          connectionTimeout,
          greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
          socketTimeout,
          // STARTTLS / TLS behaviors
          requireTLS: String(process.env.SMTP_REQUIRE_TLS || 'false') === 'true',
          ignoreTLS: String(process.env.SMTP_IGNORE_TLS || 'false') === 'true',
          tls: {
            // Sometimes providers need this off if they use self-signed or old certs
            rejectUnauthorized: String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true') === 'true',
            ciphers: process.env.SMTP_TLS_CIPHERS || undefined,
            minVersion: process.env.SMTP_TLS_MIN_VERSION || undefined
          },
          debug: String(process.env.SMTP_DEBUG || 'false') === 'true',
        };

        this.transporter = nodemailer.createTransport(transporterOptions);

        // Verify connection in background (non-blocking)
        Promise.resolve()
          .then(() => this.transporter.verify())
          .then(() => console.log('✅ SMTP transporter verified successfully'))
          .catch((err) => console.warn('⚠️ SMTP transporter verification failed:', err?.message || err));

        console.log('✅ Email service initialized with configured SMTP', {
          pool: transporterOptions.pool,
          host: smtpUrl ? '(via URL)' : process.env.SMTP_HOST,
          port,
          secure,
          connectionTimeout,
          socketTimeout
        });
        return;
      }

      // No SMTP configured
      this.transporter = null;
      console.log('ℹ️ No SMTP configured. Set SMTP_URL or SMTP_HOST/USER/PASS to enable SMTP.');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.transporter = null;
    }
  }

  // Yahoo-specific SMTP configuration
  async initializeYahooTransporter() {
    const yahooHost = 'smtp.mail.yahoo.com';
    const yahooPorts = [465, 587]; // Try both ports
    
    for (const port of yahooPorts) {
      try {
        const secure = port === 465;
        const transporterOptions = {
          host: yahooHost,
          port,
          secure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          // Yahoo-specific settings
          connectionTimeout: 30000, // 30 seconds
          greetingTimeout: 30000,
          socketTimeout: 30000,
          requireTLS: !secure, // Only for port 587
          ignoreTLS: false,
          tls: {
            rejectUnauthorized: false, // Yahoo sometimes has cert issues
            ciphers: 'SSLv3',
            secureProtocol: 'TLSv1_2_method'
          },
          // Yahoo connection pooling
          pool: false, // Disable pooling for Yahoo
          maxConnections: 1,
          maxMessages: 1,
          // Yahoo-specific debug
          debug: true,
          logger: true
        };

        console.log(`🔄 Trying Yahoo SMTP on port ${port} (secure: ${secure})`);
        
        const testTransporter = nodemailer.createTransport(transporterOptions);
        await testTransporter.verify();
        
        console.log(`✅ Yahoo SMTP verified on port ${port}`);
        return testTransporter;
      } catch (error) {
        console.warn(`❌ Yahoo SMTP failed on port ${port}:`, error?.message || error);
        continue;
      }
    }
    
    throw new Error('Yahoo SMTP failed on all ports (465, 587)');
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

    // Strategy: SMTP only, with retries
    if (!this.transporter) {
      throw new Error('SMTP is not configured. Set SMTP_URL or SMTP_HOST/USER/PASS');
    }

    const maxAttempts = Number(process.env.SMTP_RETRY_ATTEMPTS || 3);
    const baseDelayMs = Number(process.env.SMTP_RETRY_DELAY_MS || 1000);
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent via SMTP');
        return { success: true, method: 'smtp', messageId: info.messageId };
      } catch (error) {
        lastError = error;
        console.error(`❌ SMTP send failed (attempt ${attempt}/${maxAttempts}):`, error?.message || error);
        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
      }
    }
    throw new Error(`SMTP send failed after ${maxAttempts} attempts: ${lastError?.message || lastError}`);
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
