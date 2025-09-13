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
const CoverLetter = require('../models/CoverLetter');
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
const HotVacancy = require('../models/HotVacancy');
const HotVacancyPhoto = require('../models/HotVacancyPhoto');
const FeaturedJob = require('../models/FeaturedJob');
const ViewTracking = require('../models/ViewTracking');
const UserDashboard = require('../models/UserDashboard');
const SearchHistory = require('../models/SearchHistory');

// Define associations

// User associations
User.hasMany(Job, { foreignKey: 'created_by', as: 'postedJobs' });
User.hasMany(JobApplication, { foreignKey: 'user_id', as: 'jobApplications' });
User.hasMany(JobBookmark, { foreignKey: 'user_id', as: 'jobBookmarks' });
User.hasMany(JobAlert, { foreignKey: 'user_id', as: 'jobAlerts' });
User.hasMany(Requirement, { foreignKey: 'created_by', as: 'requirements' });
User.hasMany(RequirementApplication, { foreignKey: 'user_id', as: 'requirementApplications' });
User.hasMany(Resume, { foreignKey: 'user_id', as: 'resumes' });
User.hasMany(CoverLetter, { foreignKey: 'user_id', as: 'coverLetters' });
User.hasMany(WorkExperience, { foreignKey: 'user_id', as: 'workExperiences' });
User.hasMany(Education, { foreignKey: 'user_id', as: 'educations' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasMany(CompanyReview, { foreignKey: 'user_id', as: 'companyReviews' });
User.hasMany(CompanyFollow, { foreignKey: 'user_id', as: 'companyFollows' });
User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
// CandidateLike associations
User.hasMany(CandidateLike, { foreignKey: 'employer_id', as: 'givenCandidateLikes' });
User.hasMany(CandidateLike, { foreignKey: 'candidate_id', as: 'receivedCandidateLikes' });
CandidateLike.belongsTo(User, { foreignKey: 'employer_id', as: 'employer' });
CandidateLike.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });

// Company associations
Company.hasMany(Job, { foreignKey: 'company_id', as: 'jobs' });
Company.hasMany(CompanyReview, { foreignKey: 'company_id', as: 'reviews' });
Company.hasMany(CompanyFollow, { foreignKey: 'company_id', as: 'followers' });
Company.hasMany(User, { foreignKey: 'company_id', as: 'employees' });

// Job associations
Job.belongsTo(User, { foreignKey: 'created_by', as: 'employer' });
Job.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Job.hasMany(JobApplication, { foreignKey: 'job_id', as: 'jobApplications' });
Job.hasMany(JobBookmark, { foreignKey: 'job_id', as: 'bookmarks' });
Job.hasMany(JobPhoto, { foreignKey: 'job_id', as: 'photos' });

// JobCategory associations
JobCategory.belongsTo(JobCategory, { foreignKey: 'parent_id', as: 'parent' });
JobCategory.hasMany(JobCategory, { foreignKey: 'parent_id', as: 'children' });

// JobApplication associations
JobApplication.belongsTo(User, { foreignKey: 'user_id', as: 'applicant' });
JobApplication.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
JobApplication.belongsTo(Resume, { foreignKey: 'resume_id', as: 'jobResume' });
JobApplication.belongsTo(CoverLetter, { foreignKey: 'cover_letter_id', as: 'jobCoverLetter' });

// JobBookmark associations
JobBookmark.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
JobBookmark.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// JobPhoto associations
JobPhoto.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
JobPhoto.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// HotVacancy associations
HotVacancy.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
HotVacancy.belongsTo(User, { foreignKey: 'created_by', as: 'employer' });
// Note: Removed JobApplication association as hot_vacancy_id column doesn't exist in job_applications table
HotVacancy.hasMany(HotVacancyPhoto, { foreignKey: 'hot_vacancy_id', as: 'photos' });

// HotVacancyPhoto associations
HotVacancyPhoto.belongsTo(HotVacancy, { foreignKey: 'hot_vacancy_id', as: 'hotVacancy' });
HotVacancyPhoto.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// JobAlert associations
JobAlert.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Requirement associations
Requirement.belongsTo(User, { foreignKey: 'created_by', as: 'employer' });
Requirement.hasMany(RequirementApplication, { foreignKey: 'requirement_id', as: 'requirementApplications' });

// RequirementApplication associations
RequirementApplication.belongsTo(User, { foreignKey: 'user_id', as: 'candidate' });
RequirementApplication.belongsTo(Requirement, { foreignKey: 'requirement_id', as: 'requirement' });
RequirementApplication.belongsTo(Resume, { foreignKey: 'resume_id', as: 'requirementResume' });

// Resume associations
Resume.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Resume.hasMany(WorkExperience, { foreignKey: 'resume_id', as: 'resumeWorkExperiences' });
Resume.hasMany(Education, { foreignKey: 'resume_id', as: 'resumeEducations' });

// CoverLetter associations
CoverLetter.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// WorkExperience associations
WorkExperience.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
WorkExperience.belongsTo(Resume, { foreignKey: 'resume_id', as: 'workExperienceResume' });

// Education associations
Education.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Education.belongsTo(Resume, { foreignKey: 'resume_id', as: 'educationResume' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// CompanyReview associations
CompanyReview.belongsTo(User, { foreignKey: 'user_id', as: 'reviewer' });
CompanyReview.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// CompanyFollow associations
CompanyFollow.belongsTo(User, { foreignKey: 'user_id', as: 'follower' });
CompanyFollow.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'plan' });

// SubscriptionPlan associations
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });

// UserSession associations
UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });

// Interview associations
Interview.belongsTo(User, { foreignKey: 'employer_id', as: 'employer' });
Interview.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });
Interview.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
User.hasMany(Interview, { foreignKey: 'employer_id', as: 'conductedInterviews' });
User.hasMany(Interview, { foreignKey: 'candidate_id', as: 'attendedInterviews' });
Job.hasMany(Interview, { foreignKey: 'job_id', as: 'interviews' });

// Conversation associations
Conversation.belongsTo(User, { foreignKey: 'participant1_id', as: 'participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2_id', as: 'participant2' });
Conversation.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Conversation.belongsTo(JobApplication, { foreignKey: 'job_application_id', as: 'jobApplication' });
User.hasMany(Conversation, { foreignKey: 'participant1_id', as: 'conversationsAsParticipant1' });
User.hasMany(Conversation, { foreignKey: 'participant2_id', as: 'conversationsAsParticipant2' });
Job.hasMany(Conversation, { foreignKey: 'job_id', as: 'conversations' });
JobApplication.hasMany(Conversation, { foreignKey: 'job_application_id', as: 'conversations' });

// Message associations
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Message, { foreignKey: 'replyToMessageId', as: 'replyTo' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

// Payment associations
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId', as: 'payments' });

// Analytics associations
Analytics.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Analytics.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Analytics.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Analytics.belongsTo(JobApplication, { foreignKey: 'application_id', as: 'application' });
User.hasMany(Analytics, { foreignKey: 'user_id', as: 'analytics' });
Job.hasMany(Analytics, { foreignKey: 'job_id', as: 'analytics' });
Company.hasMany(Analytics, { foreignKey: 'company_id', as: 'analytics' });
JobApplication.hasMany(Analytics, { foreignKey: 'application_id', as: 'analytics' });

// FeaturedJob associations
FeaturedJob.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Job.hasMany(FeaturedJob, { foreignKey: 'job_id', as: 'featuredPromotions' });

// Sync database function
const syncDatabase = async (force = true) => {
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
  CoverLetter,
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
  HotVacancy,
  HotVacancyPhoto,
  FeaturedJob,
  ViewTracking,
  UserDashboard,
  SearchHistory,
  syncDatabase
}; 