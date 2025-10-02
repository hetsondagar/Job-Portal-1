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
          name: 'Gmail',
          host: 'smtp.gmail.com',
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
          port: 587,
          secure: false
        },
        {
          name: 'Yahoo (Port 587)',
          host: 'smtp.mail.yahoo.com',
          user: process.env.YAHOO_USER,
          pass: process.env.YAHOO_APP_PASSWORD,
          port: 587,
          secure: false
        },
        {
          name: 'Yahoo (Port 465)',
          host: 'smtp.mail.yahoo.com',
          user: process.env.YAHOO_USER,
          pass: process.env.YAHOO_APP_PASSWORD,
          port: 465,
          secure: true
        },
        {
          name: 'Custom SMTP',
          host: process.env.SMTP_HOST,
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true'
        }
      ];

      console.log('\n📧 Email Service Configuration Check:');
      console.log('=====================================');
      if (process.env.GMAIL_USER) {
        console.log('✓ Gmail credentials found');
        console.log(`  User: ${process.env.GMAIL_USER}`);
        console.log(`  Password: ${process.env.GMAIL_APP_PASSWORD ? '***' + process.env.GMAIL_APP_PASSWORD.slice(-4) : 'NOT SET'}`);
      }
      if (process.env.YAHOO_USER) {
        console.log('✓ Yahoo credentials found');
        console.log(`  User: ${process.env.YAHOO_USER}`);
        console.log(`  Password: ${process.env.YAHOO_APP_PASSWORD ? '***' + process.env.YAHOO_APP_PASSWORD.slice(-4) : 'NOT SET'}`);
      }
      if (process.env.SMTP_HOST) {
        console.log('✓ Custom SMTP credentials found');
        console.log(`  Host: ${process.env.SMTP_HOST}`);
        console.log(`  User: ${process.env.SMTP_USER}`);
      }
      console.log('=====================================\n');

      for (const provider of providers) {
        if (provider.host && provider.user && provider.pass) {
          console.log(`🔄 Attempting to connect to ${provider.name}...`);
          console.log(`   Host: ${provider.host}:${provider.port}`);
          console.log(`   User: ${provider.user}`);
          
          try {
            this.transporter = await this.createTransporter(provider);
            console.log(`\n🎉 SUCCESS! ${provider.name} transporter initialized!`);
            console.log(`✅ Emails will be sent from: ${this.fromEmail}`);
            console.log(`✅ Ready to send password reset emails!\n`);
            this.initialized = true;
            return;
          } catch (error) {
            console.error(`❌ ${provider.name} connection failed:`);
            console.error(`   Error: ${error.message}`);
            console.error(`   Code: ${error.code || 'N/A'}`);
            continue;
          }
        }
      }

      // If all providers fail, use mock transporter
      this.transporter = this.createMockTransporter();
      console.log('\n⚠️  WARNING: All email providers failed!');
      console.log('=====================================');
      console.log('Using MOCK transporter - emails will NOT actually send!');
      console.log('');
      console.log('To fix this:');
      console.log('1. Check your .env file has email credentials');
      console.log('2. For Gmail: Use App Password (not regular password)');
      console.log('3. For Yahoo: Generate app password in Yahoo settings');
      console.log('4. Make sure password has NO SPACES');
      console.log('');
      console.log('See server/QUICK_EMAIL_SETUP.md for detailed instructions');
      console.log('=====================================\n');
      this.initialized = true;

    } catch (error) {
      console.error('❌ Critical error initializing email service:', error.message);
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
      connectionTimeout: 10000, // Reduced to 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      requireTLS: !provider.secure,
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
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
      // Use a shorter timeout for verification
      const verifyPromise = transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Verification timeout')), 8000)
      );
      
      await Promise.race([verifyPromise, timeoutPromise]);
      console.log(`✅ ${provider.name} connection verified successfully`);
      return transporter;
    } catch (verifyError) {
      console.error(`❌ ${provider.name} verification failed:`, verifyError.message);
      
      // For timeout errors, throw to try next provider
      if (verifyError.message.includes('timeout') || verifyError.code === 'ETIMEDOUT') {
        throw verifyError;
      }
      
      // For other errors, return transporter anyway (might still work)
      console.log(`🔄 Returning ${provider.name} transporter without verification...`);
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
