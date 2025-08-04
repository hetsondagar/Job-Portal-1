# JobPortal Database Schema Documentation

## Overview
This document outlines the complete database schema for the JobPortal application, designed to support a production-level job portal similar to Naukri.com, Indeed, or Apna. The schema includes 22 models with comprehensive relationships and features for both job seekers and employers.

## Database Models

### 1. User Model
**Purpose**: Central user management for job seekers, employers, and admins

**Key Features**:
- Multi-role support (jobseeker, employer, admin)
- Enhanced authentication with email verification, password reset, 2FA
- Comprehensive profile management with skills, languages, certifications
- Privacy controls and notification preferences
- Account status tracking and verification levels

**Key Fields**:
- `userType`: ENUM('jobseeker', 'employer', 'admin')
- `emailVerificationToken`, `passwordResetToken`: Security tokens
- `twoFactorEnabled`, `twoFactorSecret`: 2FA support
- `skills`, `languages`, `certifications`: JSONB arrays
- `profileVisibility`, `contactVisibility`: Privacy controls
- `accountStatus`, `verificationLevel`: Account management
- `profileCompletion`: Profile completion percentage

### 2. Company Model
**Purpose**: Company profiles and information management

**Key Features**:
- Comprehensive company information with mission, vision, values
- Work environment and culture details
- Contact information and verification status
- Analytics tracking for job postings and applications
- SEO optimization fields

**Key Fields**:
- `mission`, `vision`, `values`: Company culture
- `workEnvironment`, `perks`: Work details
- `verificationStatus`: Company verification
- `totalJobsPosted`, `activeJobsCount`: Analytics
- `metaTitle`, `metaDescription`: SEO fields
- `companyStatus`: Company account status

### 3. Job Model
**Purpose**: Job posting management with comprehensive details

**Key Features**:
- Detailed job descriptions with requirements and benefits
- Salary ranges and compensation details
- Application tracking and analytics
- SEO optimization and search functionality

**Key Fields**:
- `title`, `description`, `requirements`: Job details
- `salaryMin`, `salaryMax`, `salaryCurrency`: Compensation
- `benefits`, `perks`: Additional benefits
- `applicationCount`, `viewCount`: Analytics
- `status`: Job posting status

### 4. JobCategory Model
**Purpose**: Job categorization and organization

**Key Features**:
- Hierarchical category structure
- Visual customization with icons and colors
- SEO-friendly slugs

**Key Fields**:
- `name`, `slug`, `description`: Category info
- `icon`, `color`: Visual customization
- `parentId`: Hierarchical structure
- `isActive`, `sortOrder`: Management

### 5. JobApplication Model
**Purpose**: Job application tracking and management

**Key Features**:
- Comprehensive application details
- Interview scheduling and feedback
- Status tracking throughout the hiring process
- Performance analytics

**Key Fields**:
- `status`: Application status (applied, reviewing, shortlisted, etc.)
- `coverLetter`, `expectedSalary`: Application details
- `interviewScheduledAt`, `interviewLocation`: Interview info
- `employerNotes`, `candidateNotes`: Communication
- `offerDetails`: Final offer information

### 6. JobBookmark Model
**Purpose**: Job bookmarking and organization

**Key Features**:
- Folder organization for bookmarks
- Priority levels and notes
- Application tracking from bookmarks

**Key Fields**:
- `folder`: Bookmark organization
- `priority`: Priority levels
- `notes`: Personal notes
- `isApplied`: Application tracking

### 7. JobAlert Model
**Purpose**: Job alert and notification management

**Key Features**:
- Customizable search criteria
- Multiple notification channels
- Frequency control

**Key Fields**:
- `keywords`, `locations`, `categories`: Search criteria
- `experienceLevel`, `salaryMin`, `salaryMax`: Filters
- `frequency`: Alert frequency
- `emailEnabled`, `pushEnabled`, `smsEnabled`: Channels

### 8. Requirement Model
**Purpose**: Employer requirements and candidate search

**Key Features**:
- Detailed requirement specifications
- Skills and experience matching
- Candidate tracking

**Key Fields**:
- `title`, `description`: Requirement details
- `requiredSkills`, `preferredSkills`: Skills matching
- `experienceMin`, `experienceMax`: Experience range
- `salaryMin`, `salaryMax`: Salary expectations

### 9. RequirementApplication Model
**Purpose**: Applications to employer requirements

**Key Features**:
- Candidate applications to requirements
- Status tracking and communication
- Resume and document management

**Key Fields**:
- `status`: Application status
- `coverLetter`: Application details
- `resumeId`: Resume reference
- `employerNotes`: Internal notes

### 10. Resume Model
**Purpose**: Resume and CV management

**Key Features**:
- Multiple resume versions
- File management and parsing
- Skills extraction and matching

**Key Fields**:
- `title`, `summary`: Resume details
- `fileUrl`, `fileType`: File management
- `skills`: Extracted skills
- `isPrimary`: Primary resume flag

### 11. WorkExperience Model
**Purpose**: Work experience tracking

**Key Features**:
- Detailed work history
- Skills and achievements
- Duration and role tracking

**Key Fields**:
- `title`, `company`, `description`: Experience details
- `startDate`, `endDate`: Duration
- `skills`: Skills used
- `achievements`: Key achievements

### 12. Education Model
**Purpose**: Educational background tracking

**Key Features**:
- Academic history
- Certifications and achievements
- GPA and performance tracking

**Key Fields**:
- `degree`, `institution`: Education details
- `startDate`, `endDate`: Duration
- `gpa`, `percentage`: Performance
- `relevantCourses`: Course details

### 13. Notification Model
**Purpose**: System notification management

**Key Features**:
- Multi-type notifications
- Read/unread tracking
- Action-based notifications

**Key Fields**:
- `type`: Notification type
- `title`, `message`: Content
- `data`: Additional data
- `isRead`: Read status

### 14. CompanyReview Model
**Purpose**: Company review and rating system

**Key Features**:
- Comprehensive review system
- Rating aggregation
- Moderation and verification

**Key Fields**:
- `rating`, `title`, `review`: Review content
- `pros`, `cons`: Pros and cons
- `jobTitle`, `employmentStatus`: Context
- `isVerified`: Verification status

### 15. CompanyFollow Model
**Purpose**: Company following and updates

**Key Features**:
- Company following system
- Notification preferences
- Update tracking

**Key Fields**:
- `notificationPreferences`: Notification settings
- `followedAt`: Follow date
- `lastNotificationAt`: Last notification

### 16. Subscription Model
**Purpose**: Subscription and billing management

**Key Features**:
- Plan management
- Billing cycles and payments
- Feature access control

**Key Fields**:
- `status`: Subscription status
- `startDate`, `endDate`: Duration
- `billingCycle`: Billing frequency
- `features`: Feature access

### 17. SubscriptionPlan Model
**Purpose**: Available subscription plans

**Key Features**:
- Plan definitions and pricing
- Feature sets and limits
- Trial periods and popular flags

**Key Fields**:
- `name`, `description`: Plan details
- `monthlyPrice`, `yearlyPrice`: Pricing
- `features`: Feature set
- `trialDays`: Trial period

### 18. UserSession Model
**Purpose**: User session and authentication management

**Key Features**:
- Session tracking and security
- Device and location tracking
- Login method tracking

**Key Fields**:
- `sessionToken`, `refreshToken`: Authentication
- `deviceType`, `deviceInfo`: Device tracking
- `ipAddress`, `location`: Security
- `loginMethod`: Authentication method

### 19. Interview Model
**Purpose**: Interview scheduling and management

**Key Features**:
- Comprehensive interview management
- Multiple interview types
- Feedback and decision tracking

**Key Fields**:
- `interviewType`: Interview type
- `scheduledAt`, `duration`: Scheduling
- `location`, `meetingLink`: Location details
- `feedback`, `decision`: Results

### 20. Conversation Model
**Purpose**: Messaging and communication system

**Key Features**:
- Conversation management
- Unread message tracking
- Archiving and organization

**Key Fields**:
- `participant1Id`, `participant2Id`: Participants
- `conversationType`: Conversation type
- `lastMessageAt`, `unreadCount`: Activity
- `isArchived`: Archive status

### 21. Message Model
**Purpose**: Individual message management

**Key Features**:
- Message content and types
- Read/delivered tracking
- Reply and editing support

**Key Fields**:
- `messageType`: Message type
- `content`: Message content
- `isRead`, `isDelivered`: Status
- `replyToMessageId`: Reply tracking

### 22. Payment Model
**Purpose**: Payment processing and billing

**Key Features**:
- Multiple payment methods
- Gateway integration
- Refund and failure handling

**Key Fields**:
- `paymentType`: Payment type
- `amount`, `currency`: Financial details
- `paymentMethod`, `paymentGateway`: Processing
- `status`: Payment status

### 23. Analytics Model
**Purpose**: User behavior and analytics tracking

**Key Features**:
- Comprehensive event tracking
- User behavior analysis
- Performance metrics

**Key Fields**:
- `eventType`, `eventCategory`: Event classification
- `pageUrl`, `referrerUrl`: Navigation
- `deviceType`, `browser`: Device info
- `duration`: Engagement metrics

## Key Relationships

### User-Centric Relationships
- **User → Jobs**: Employers can post multiple jobs
- **User → JobApplications**: Users can apply to multiple jobs
- **User → Resumes**: Users can have multiple resumes
- **User → WorkExperience**: Users can have multiple work experiences
- **User → Education**: Users can have multiple education records

### Company-Centric Relationships
- **Company → Jobs**: Companies can post multiple jobs
- **Company → CompanyReviews**: Companies can receive multiple reviews
- **Company → CompanyFollow**: Companies can have multiple followers

### Application-Centric Relationships
- **JobApplication → Interview**: Applications can have multiple interviews
- **JobApplication → Conversation**: Applications can have associated conversations
- **JobApplication → Message**: Applications can have multiple messages

### Subscription-Centric Relationships
- **Subscription → Payment**: Subscriptions can have multiple payments
- **User → Subscription**: Users can have multiple subscriptions

## Database Features

### Security & Authentication
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure session tokens with expiry
- **Two-Factor Authentication**: TOTP support
- **Account Locking**: Brute force protection
- **Email Verification**: Token-based verification

### Performance Optimization
- **Indexes**: Comprehensive indexing on frequently queried fields
- **JSONB Fields**: Flexible schema for complex data
- **UUID Primary Keys**: Distributed ID generation
- **Soft Deletes**: Data preservation with status flags

### Scalability Features
- **Modular Design**: Independent model relationships
- **Flexible Schema**: JSONB fields for extensibility
- **Audit Trails**: Comprehensive tracking and analytics
- **Multi-tenancy Ready**: User and company isolation

### Business Intelligence
- **Analytics Tracking**: Comprehensive user behavior tracking
- **Performance Metrics**: Application and job performance
- **Search Analytics**: Query and filter analysis
- **Conversion Tracking**: Application and interview tracking

## Production Considerations

### Data Integrity
- **Foreign Key Constraints**: Proper referential integrity
- **Validation Rules**: Comprehensive field validation
- **Unique Constraints**: Email, slug, and business rule constraints
- **Check Constraints**: Data range and format validation

### Monitoring & Maintenance
- **Audit Logs**: Comprehensive change tracking
- **Performance Monitoring**: Query performance tracking
- **Data Archiving**: Historical data management
- **Backup Strategy**: Regular backup and recovery

### Security Compliance
- **GDPR Compliance**: Data privacy and deletion
- **Data Encryption**: Sensitive data protection
- **Access Control**: Role-based permissions
- **Audit Trails**: Comprehensive activity logging

This schema provides a solid foundation for a production-level job portal with comprehensive features for both job seekers and employers, robust security, and excellent scalability potential. 