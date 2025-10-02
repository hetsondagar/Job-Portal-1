const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@jobportal.com';
    this.fromName = process.env.FROM_NAME || 'Job Portal';
    this.transporter = null;
    this.initialized = false;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Try multiple email providers in order of preference
      const providers = [
        {
          name: 'Custom SMTP',
          host: process.env.SMTP_HOST,
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true'
        },
        {
          name: 'Gmail',
          host: 'smtp.gmail.com',
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
          port: 587,
          secure: false
        },
        {
          name: 'Yahoo',
          host: 'smtp.mail.yahoo.com',
          user: process.env.YAHOO_USER,
          pass: process.env.YAHOO_APP_PASSWORD,
          port: 587,
          secure: false
        }
      ];

      for (const provider of providers) {
        if (provider.host && provider.user && provider.pass) {
          console.log(`🔄 Trying ${provider.name}...`);
          try {
            this.transporter = await this.createTransporter(provider);
            console.log(`✅ ${provider.name} transporter initialized successfully`);
            this.initialized = true;
            return;
          } catch (error) {
            console.error(`❌ ${provider.name} failed:`, error.message);
            continue;
          }
        }
      }

      // If all providers fail, use mock transporter
      this.transporter = this.createMockTransporter();
      console.log('⚠️ All email providers failed. Using mock transporter for development.');
      console.log('💡 To enable real email sending, configure SMTP credentials in .env');
      this.initialized = true;

    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.transporter = this.createMockTransporter();
      this.initialized = true;
    }
  }

  async createTransporter(provider) {
    const transporterOptions = {
      host: provider.host,
      port: provider.port,
      secure: provider.secure,
      auth: { 
        user: provider.user, 
        pass: provider.pass 
      },
      pool: false,
      maxConnections: 1,
      maxMessages: 1,
      connectionTimeout: 60000,
      greetingTimeout: 60000,
      socketTimeout: 60000,
      requireTLS: !provider.secure,
      ignoreTLS: false,
      tls: {
        rejectUnauthorized: false,
        ciphers: 'TLSv1.2',
        secureProtocol: 'TLSv1_2_method',
        servername: provider.host,
        checkServerIdentity: () => undefined
      },
      keepAlive: true,
      keepAliveMsecs: 30000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    };

    console.log(`📧 ${provider.name} Config:`, {
      host: provider.host,
      port: provider.port,
      secure: provider.secure,
      user: provider.user
    });
    
    const transporter = nodemailer.createTransport(transporterOptions);
    
    try {
      await transporter.verify();
      console.log(`✅ ${provider.name} connection verified successfully`);
      return transporter;
    } catch (verifyError) {
      console.error(`❌ ${provider.name} verification failed:`, verifyError.message);
      console.log(`🔄 Attempting to create ${provider.name} transporter without verification...`);
      
      // Return transporter even if verification fails - some providers have strict verification
      return transporter;
    }
  }

  createMockTransporter() {
    return {
      type: 'mock',
      sendMail: async (mailOptions) => {
        console.log('📧 Mock Email Sent (Development Mode):');
        console.log('   To:', mailOptions.to);
        console.log('   From:', mailOptions.from);
        console.log('   Subject:', mailOptions.subject);
        console.log('   Reset URL would be:', mailOptions.html?.match(/href="([^"]+)"/)?.[1] || 'Not found');
        console.log('💡 In production, configure SMTP settings to send real emails');
        return { 
          messageId: 'mock-' + Date.now(),
          success: true,
          method: 'mock'
        };
      }
    };
  }

  async sendPasswordResetEmail(toEmail, resetToken, userName = 'User') {
    // Wait for initialization if not ready
    if (!this.initialized) {
      console.log('⏳ Waiting for email service initialization...');
      let attempts = 0;
      while (!this.initialized && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
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

    if (!this.transporter) {
      throw new Error('No email service configured');
    }

    try {
      if (this.transporter.type === 'mock') {
        return await this.transporter.sendMail(mailOptions);
      } else {
        // Standard SMTP transporter
        console.log('📧 Sending email via SMTP...');
        console.log('📧 Email details:', {
          to: mailOptions.to,
          from: mailOptions.from,
          subject: mailOptions.subject
        });
        
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent via SMTP');
        console.log('📧 Message ID:', info.messageId);
        console.log('📧 Response:', info.response);
        return { success: true, method: 'smtp', messageId: info.messageId };
      }
    } catch (error) {
      console.error('❌ Email send failed:', error?.message || error);
      console.error('❌ Error details:', {
        code: error?.code,
        command: error?.command,
        response: error?.response,
        responseCode: error?.responseCode
      });
      throw new Error(`Email send failed: ${error?.message || error}`);
    }
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
      // Wait for initialization if not ready
      if (!this.initialized) {
        console.log('⏳ Waiting for email service initialization...');
        let attempts = 0;
        while (!this.initialized && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }

      const testEmail = 'test@example.com';
      const result = await this.sendPasswordResetEmail(testEmail, 'test-token-123', 'Test User');
      return { success: true, message: 'Email service is working correctly', method: result.method || 'smtp' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
