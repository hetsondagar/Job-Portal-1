const { Notification, User, Company, Job, Requirement } = require('../config/index');
const emailService = require('./emailService');

class NotificationService {
  /**
   * Send shortlisting notification to candidate
   * @param {string} candidateId - ID of the candidate being shortlisted
   * @param {string} employerId - ID of the employer who shortlisted
   * @param {string} jobId - ID of the job (optional)
   * @param {string} requirementId - ID of the requirement (optional)
   * @param {object} context - Additional context data
   */
  static async sendShortlistingNotification(candidateId, employerId, jobId = null, requirementId = null, context = {}) {
    try {
      // Get candidate details
      const candidate = await User.findByPk(candidateId, {
        attributes: ['id', 'first_name', 'last_name', 'email', 'user_type']
      });

      if (!candidate) {
        console.error('❌ Candidate not found for shortlisting notification:', candidateId);
        return { success: false, message: 'Candidate not found' };
      }

      // Get employer details
      const employer = await User.findByPk(employerId, {
        attributes: ['id', 'first_name', 'last_name', 'email', 'companyId'],
        include: [{
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo']
        }]
      });

      if (!employer) {
        console.error('❌ Employer not found for shortlisting notification:', employerId);
        return { success: false, message: 'Employer not found' };
      }

      // Get job or requirement details
      let jobTitle = 'a position';
      let jobDetails = null;
      let applicationUrl = '/applications';

      if (jobId) {
        const job = await Job.findByPk(jobId, {
          attributes: ['id', 'title', 'companyId'],
          include: [{
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }]
        });
        if (job) {
          jobTitle = job.title;
          jobDetails = job;
          applicationUrl = `/applications?jobId=${jobId}`;
        }
      } else if (requirementId) {
        const requirement = await Requirement.findByPk(requirementId, {
          attributes: ['id', 'title', 'companyId'],
          include: [{
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }]
        });
        if (requirement) {
          jobTitle = requirement.title;
          jobDetails = requirement;
          applicationUrl = `/applications?requirementId=${requirementId}`;
        }
      }

      const companyName = employer.company?.name || 'Unknown Company';
      const candidateName = `${candidate.first_name} ${candidate.last_name}`.trim();

      // Create notification data
      const notificationData = {
        userId: candidateId,
        type: 'candidate_shortlisted',
        title: `Congratulations! You've been shortlisted`,
        message: `Great news! You've been shortlisted for ${jobTitle} at ${companyName}. The employer is interested in your profile and may contact you soon.`,
        shortMessage: `Shortlisted for ${jobTitle} at ${companyName}`,
        priority: 'high',
        actionUrl: applicationUrl,
        actionText: 'View Application',
        icon: 'user-check',
        metadata: {
          employerId,
          jobId,
          requirementId,
          companyName,
          jobTitle,
          shortlistedAt: new Date().toISOString(),
          ...context
        }
      };

      // Create notification in database
      const notification = await Notification.create(notificationData);

      console.log(`✅ Shortlisting notification created for candidate ${candidateId}`);

      // Send email notification
      try {
        await this.sendShortlistingEmail(candidate, employer, jobTitle, companyName, applicationUrl, context);
        console.log(`✅ Shortlisting email sent to ${candidate.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send shortlisting email:', emailError.message);
        // Don't fail the notification if email fails
      }

      return {
        success: true,
        notificationId: notification.id,
        message: 'Shortlisting notification sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending shortlisting notification:', error);
      return {
        success: false,
        message: 'Failed to send shortlisting notification',
        error: error.message
      };
    }
  }

  /**
   * Send shortlisting email to candidate
   */
  static async sendShortlistingEmail(candidate, employer, jobTitle, companyName, applicationUrl, context = {}) {
    const candidateName = `${candidate.first_name} ${candidate.last_name}`.trim();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const fullApplicationUrl = `${frontendUrl}${applicationUrl}`;

    const subject = `🎉 Congratulations! You've been shortlisted for ${jobTitle}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You've been shortlisted!</title>
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
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .highlight {
            background-color: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
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
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .company-info {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Job Portal</div>
            <h1 class="title">🎉 Congratulations!</h1>
          </div>
          
          <div class="content">
            <p>Hello ${candidateName},</p>
            
            <div class="highlight">
              <strong>Great news! You've been shortlisted for a position!</strong>
            </div>
            
            <p>We're excited to inform you that your application has caught the attention of employers and you've been shortlisted for:</p>
            
            <div class="company-info">
              <strong>Position:</strong> ${jobTitle}<br>
              <strong>Company:</strong> ${companyName}
            </div>
            
            <p>This means the employer is interested in your profile and may contact you soon for the next steps in the hiring process.</p>
            
            <div style="text-align: center;">
              <a href="${fullApplicationUrl}" class="button">View Your Application</a>
            </div>
            
            <h3>What happens next?</h3>
            <ul>
              <li>The employer may contact you directly</li>
              <li>You might be invited for an interview</li>
              <li>Keep your profile updated and resume ready</li>
              <li>Check your notifications regularly for updates</li>
            </ul>
            
            <p><strong>Pro tip:</strong> Make sure your contact information is up-to-date and your resume is current to maximize your chances of getting hired!</p>
            
            <p>Best of luck with your application!</p>
            
            <p>Best regards,<br>The Job Portal Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Job Portal. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Congratulations! You've been shortlisted!

Hello ${candidateName},

Great news! You've been shortlisted for ${jobTitle} at ${companyName}.

This means the employer is interested in your profile and may contact you soon for the next steps in the hiring process.

What happens next?
- The employer may contact you directly
- You might be invited for an interview
- Keep your profile updated and resume ready
- Check your notifications regularly for updates

View your application: ${fullApplicationUrl}

Best of luck with your application!

Best regards,
The Job Portal Team

© 2024 Job Portal. All rights reserved.
This is an automated notification. Please do not reply to this email.
    `;

    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM || 'noreply@jobportal.com'}>`,
      to: candidate.email,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    return await emailService.sendMail(mailOptions);
  }

  /**
   * Send application status change notification
   */
  static async sendApplicationStatusNotification(candidateId, employerId, applicationId, oldStatus, newStatus, context = {}) {
    try {
      // Get candidate details
      const candidate = await User.findByPk(candidateId, {
        attributes: ['id', 'first_name', 'last_name', 'email']
      });

      if (!candidate) {
        console.error('❌ Candidate not found for status notification:', candidateId);
        return { success: false, message: 'Candidate not found' };
      }

      // Get employer details
      const employer = await User.findByPk(employerId, {
        attributes: ['id', 'first_name', 'last_name', 'companyId'],
        include: [{
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }]
      });

      if (!employer) {
        console.error('❌ Employer not found for status notification:', employerId);
        return { success: false, message: 'Employer not found' };
      }

      const companyName = employer.company?.name || 'Unknown Company';
      const candidateName = `${candidate.first_name} ${candidate.last_name}`.trim();

      // Create notification based on status
      let notificationData = {};
      
      if (newStatus === 'shortlisted') {
        notificationData = {
          userId: candidateId,
          type: 'application_shortlisted',
          title: `Application Status Update`,
          message: `Your application status has been updated to "Shortlisted" for a position at ${companyName}. The employer is reviewing your profile.`,
          shortMessage: `Application shortlisted at ${companyName}`,
          priority: 'high',
          actionUrl: '/applications',
          actionText: 'View Applications',
          icon: 'check-circle',
          metadata: {
            employerId,
            applicationId,
            oldStatus,
            newStatus,
            companyName,
            updatedAt: new Date().toISOString(),
            ...context
          }
        };
      } else {
        notificationData = {
          userId: candidateId,
          type: 'application_status',
          title: `Application Status Update`,
          message: `Your application status has been updated to "${newStatus}" for a position at ${companyName}.`,
          shortMessage: `Application status: ${newStatus} at ${companyName}`,
          priority: 'medium',
          actionUrl: '/applications',
          actionText: 'View Applications',
          icon: 'check-circle',
          metadata: {
            employerId,
            applicationId,
            oldStatus,
            newStatus,
            companyName,
            updatedAt: new Date().toISOString(),
            ...context
          }
        };
      }

      // Create notification in database
      const notification = await Notification.create(notificationData);

      console.log(`✅ Application status notification created for candidate ${candidateId}`);

      return {
        success: true,
        notificationId: notification.id,
        message: 'Application status notification sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending application status notification:', error);
      return {
        success: false,
        message: 'Failed to send application status notification',
        error: error.message
      };
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  static async sendBulkNotifications(notifications) {
    try {
      const results = await Promise.allSettled(
        notifications.map(notification => Notification.create(notification))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      console.log(`✅ Bulk notifications: ${successful} successful, ${failed} failed`);

      return {
        success: true,
        successful,
        failed,
        total: notifications.length
      };
    } catch (error) {
      console.error('❌ Error sending bulk notifications:', error);
      return {
        success: false,
        message: 'Failed to send bulk notifications',
        error: error.message
      };
    }
  }
}

module.exports = NotificationService;
