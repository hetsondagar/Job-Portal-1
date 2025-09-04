const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.sendGridApiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@jobportal.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Job Portal';
    
    // Check if SendGrid API key is valid (starts with SG.) and force development mode for now
    if (this.sendGridApiKey && this.sendGridApiKey.startsWith('SG.') && false) { // Temporarily disabled
      sgMail.setApiKey(this.sendGridApiKey);
      this.useSendGrid = true;
      console.log('✅ Using SendGrid for email service');
    } else {
      this.useSendGrid = false;
      this.initializeNodemailer().then(() => {
        console.log('✅ Using Nodemailer for email service (development mode)');
      }).catch(error => {
        console.error('❌ Failed to initialize Nodemailer:', error.message);
      });
    }
  }

  async initializeNodemailer() {
    // Create a test account for development
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      // Use Ethereal Email for testing - create a real test account
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log('✅ Created Ethereal test account:', testAccount.user);
      } catch (error) {
        console.error('❌ Failed to create Ethereal test account:', error.message);
        // Fallback to basic configuration
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: process.env.ETHEREAL_USER || 'test@ethereal.email',
            pass: process.env.ETHEREAL_PASS || 'test123'
          }
        });
      }
    } else {
      // Use configured SMTP settings
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendPasswordResetEmail(toEmail, resetToken, userName = 'User') {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request - Job Portal';
    const htmlContent = this.getPasswordResetEmailTemplate(userName, resetUrl);
    const textContent = this.getPasswordResetEmailText(userName, resetUrl);

    try {
      if (this.useSendGrid) {
        return await this.sendWithSendGrid(toEmail, subject, htmlContent, textContent);
      } else {
        return await this.sendWithNodemailer(toEmail, subject, htmlContent, textContent);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWithSendGrid(toEmail, subject, htmlContent, textContent) {
    const msg = {
      to: toEmail,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Password reset email sent via SendGrid to:', toEmail);
      return { success: true, method: 'sendgrid' };
    } catch (error) {
      console.error('❌ SendGrid error:', error);
      throw error;
    }
  }

  async sendWithNodemailer(toEmail, subject, htmlContent, textContent) {
    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: toEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent via Nodemailer to:', toEmail);
      
      // Log preview URL for Ethereal emails in development
      if (process.env.NODE_ENV === 'development' && info.messageId) {
        console.log('📧 Email preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { success: true, method: 'nodemailer', messageId: info.messageId };
    } catch (error) {
      console.error('❌ Nodemailer error:', error);
      throw error;
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
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    try {
      await this.sendPasswordResetEmail(testEmail, 'test-token-123', 'Test User');
      return { success: true, message: 'Email service is working correctly' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async sendApplicationNotification(employerEmail, employerName, jobTitle, applicantName, applicantEmail) {
    try {
      const subject = `New Application for ${jobTitle}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Job Application</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">You have received a new application</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Application Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-top: 0;">Job Position</h3>
              <p style="font-size: 18px; font-weight: bold; color: #333; margin: 5px 0;">${jobTitle}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-top: 0;">Applicant Information</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${applicantName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${applicantEmail}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                View Application
              </a>
            </div>
            
            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; color: #6c757d; font-size: 14px;">
              <p>This is an automated notification from Job Portal. Please do not reply to this email.</p>
              <p>To manage your job postings and applications, visit your employer dashboard.</p>
            </div>
          </div>
        </div>
      `;

      const textContent = `
        New Job Application
        
        Dear ${employerName},
        
        You have received a new application for the position: ${jobTitle}
        
        Applicant Details:
        - Name: ${applicantName}
        - Email: ${applicantEmail}
        
        Please log in to your employer dashboard to view the full application details and manage this application.
        
        Best regards,
        Job Portal Team
      `;

      return await this.sendEmail(employerEmail, subject, htmlContent, textContent);
    } catch (error) {
      console.error('Error sending application notification:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
