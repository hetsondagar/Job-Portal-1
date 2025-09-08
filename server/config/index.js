const { sequelize } = require('./sequelize');

// Import all models
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const JobCategory = require('../models/JobCategory');
const JobApplication = require('../models/JobApplication');
const JobBookmark = require('../models/JobBookmark');
const JobAlert = require('../models/JobAlert');
const Requirement = require('../models/Requirement');
const RequirementApplication = require('../models/Application');
const Resume = require('../models/Resume');
const WorkExperience = require('../models/WorkExperience');
const Education = require('../models/Education');
const Notification = require('../models/Notification');
const CompanyReview = require('../models/CompanyReview');
const CompanyFollow = require('../models/CompanyFollow');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSession = require('../models/UserSession');
const Interview = require('../models/Interview');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Payment = require('../models/Payment');
const Analytics = require('../models/Analytics');
const JobPhoto = require('../models/JobPhoto');
const CandidateLike = require('../models/CandidateLike');

// Define associations

// User associations
User.hasMany(Job, { foreignKey: 'employerId', as: 'postedJobs' });
User.hasMany(JobApplication, { foreignKey: 'userId', as: 'jobApplications' });
User.hasMany(JobApplication, { foreignKey: 'employerId', as: 'receivedApplications' });
User.hasMany(JobBookmark, { foreignKey: 'userId', as: 'jobBookmarks' });
User.hasMany(JobAlert, { foreignKey: 'userId', as: 'jobAlerts' });
User.hasMany(Requirement, { foreignKey: 'createdBy', as: 'requirements' });
User.hasMany(RequirementApplication, { foreignKey: 'userId', as: 'requirementApplications' });
User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes' });
User.hasMany(WorkExperience, { foreignKey: 'userId', as: 'workExperiences' });
User.hasMany(Education, { foreignKey: 'userId', as: 'educations' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(CompanyReview, { foreignKey: 'userId', as: 'companyReviews' });
User.hasMany(CompanyFollow, { foreignKey: 'userId', as: 'companyFollows' });
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
// CandidateLike associations
User.hasMany(CandidateLike, { foreignKey: 'employerId', as: 'givenCandidateLikes' });
User.hasMany(CandidateLike, { foreignKey: 'candidateId', as: 'receivedCandidateLikes' });
CandidateLike.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
CandidateLike.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

// Company associations
Company.hasMany(Job, { foreignKey: 'companyId', as: 'jobs' });
Company.hasMany(CompanyReview, { foreignKey: 'companyId', as: 'reviews' });
Company.hasMany(CompanyFollow, { foreignKey: 'companyId', as: 'followers' });
Company.hasMany(User, { foreignKey: 'company_id', as: 'employees' });

// Job associations
Job.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
Job.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Job.hasMany(JobApplication, { foreignKey: 'jobId', as: 'jobApplications' });
Job.hasMany(JobBookmark, { foreignKey: 'jobId', as: 'bookmarks' });
Job.hasMany(JobPhoto, { foreignKey: 'jobId', as: 'photos' });

// JobCategory associations
JobCategory.belongsTo(JobCategory, { foreignKey: 'parentId', as: 'parent' });
JobCategory.hasMany(JobCategory, { foreignKey: 'parentId', as: 'children' });

// JobApplication associations
JobApplication.belongsTo(User, { foreignKey: 'userId', as: 'applicant' });
JobApplication.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
JobApplication.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
JobApplication.belongsTo(Resume, { foreignKey: 'resumeId', as: 'jobResume' });

// JobBookmark associations
JobBookmark.belongsTo(User, { foreignKey: 'userId', as: 'user' });
JobBookmark.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// JobPhoto associations
JobPhoto.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
JobPhoto.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// JobAlert associations
JobAlert.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Requirement associations
Requirement.belongsTo(User, { foreignKey: 'createdBy', as: 'employer' });
Requirement.hasMany(RequirementApplication, { foreignKey: 'requirementId', as: 'requirementApplications' });

// RequirementApplication associations
RequirementApplication.belongsTo(User, { foreignKey: 'userId', as: 'candidate' });
RequirementApplication.belongsTo(Requirement, { foreignKey: 'requirementId', as: 'requirement' });
RequirementApplication.belongsTo(Resume, { foreignKey: 'resumeId', as: 'requirementResume' });

// Resume associations
Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Resume.hasMany(WorkExperience, { foreignKey: 'resumeId', as: 'resumeWorkExperiences' });
Resume.hasMany(Education, { foreignKey: 'resumeId', as: 'resumeEducations' });

// WorkExperience associations
WorkExperience.belongsTo(User, { foreignKey: 'userId', as: 'user' });
WorkExperience.belongsTo(Resume, { foreignKey: 'resumeId', as: 'workExperienceResume' });

// Education associations
Education.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Education.belongsTo(Resume, { foreignKey: 'resumeId', as: 'educationResume' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// CompanyReview associations
CompanyReview.belongsTo(User, { foreignKey: 'userId', as: 'reviewer' });
CompanyReview.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// CompanyFollow associations
CompanyFollow.belongsTo(User, { foreignKey: 'userId', as: 'follower' });
CompanyFollow.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'plan' });

// SubscriptionPlan associations
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });

// UserSession associations
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions' });

// Interview associations
Interview.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
Interview.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });
Interview.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Interview.belongsTo(JobApplication, { foreignKey: 'jobApplicationId', as: 'jobApplication' });
User.hasMany(Interview, { foreignKey: 'employerId', as: 'conductedInterviews' });
User.hasMany(Interview, { foreignKey: 'candidateId', as: 'attendedInterviews' });
Job.hasMany(Interview, { foreignKey: 'jobId', as: 'interviews' });
JobApplication.hasMany(Interview, { foreignKey: 'jobApplicationId', as: 'interviews' });

// Conversation associations
Conversation.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });
Conversation.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Conversation.belongsTo(JobApplication, { foreignKey: 'jobApplicationId', as: 'jobApplication' });
User.hasMany(Conversation, { foreignKey: 'participant1Id', as: 'conversationsAsParticipant1' });
User.hasMany(Conversation, { foreignKey: 'participant2Id', as: 'conversationsAsParticipant2' });
Job.hasMany(Conversation, { foreignKey: 'jobId', as: 'conversations' });
JobApplication.hasMany(Conversation, { foreignKey: 'jobApplicationId', as: 'conversations' });

// Message associations
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Message, { foreignKey: 'replyToMessageId', as: 'replyTo' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

// Payment associations
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId', as: 'payments' });

// Analytics associations
Analytics.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Analytics.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Analytics.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Analytics.belongsTo(JobApplication, { foreignKey: 'applicationId', as: 'application' });
User.hasMany(Analytics, { foreignKey: 'userId', as: 'analytics' });
Job.hasMany(Analytics, { foreignKey: 'jobId', as: 'analytics' });
Company.hasMany(Analytics, { foreignKey: 'companyId', as: 'analytics' });
JobApplication.hasMany(Analytics, { foreignKey: 'applicationId', as: 'analytics' });

// Sync database function
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};

// Export all models and sync function
module.exports = {
  sequelize,
  User,
  Company,
  Job,
  JobCategory,
  JobApplication,
  JobBookmark,
  JobAlert,
  Requirement,
  RequirementApplication,
  Resume,
  WorkExperience,
  Education,
  Notification,
  CompanyReview,
  CompanyFollow,
  Subscription,
  SubscriptionPlan,
  UserSession,
  Interview,
  Message,
  Conversation,
  Payment,
  Analytics,
  JobPhoto,
  CandidateLike,
  syncDatabase
}; 