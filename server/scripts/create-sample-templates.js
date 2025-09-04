#!/usr/bin/env node

/**
 * Script to create sample job templates for testing
 * Run with: node server/scripts/create-sample-templates.js
 */

const { sequelize } = require('../config/sequelize');
const JobTemplate = require('../models/JobTemplate');
const User = require('../models/User');

const sampleTemplates = [
  {
    name: "Senior Software Engineer",
    description: "Full-stack development role for experienced engineers",
    category: "technical",
    isPublic: true,
    isDefault: true,
    templateData: {
      title: "Senior Software Engineer",
      department: "engineering",
      location: "Bangalore, Karnataka",
      type: "full-time",
      experience: "senior",
      salary: "₹15-25 LPA",
      description: "We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining high-quality software solutions that drive our business forward.\n\nKey Responsibilities:\n• Design and develop scalable web applications\n• Collaborate with cross-functional teams\n• Mentor junior developers\n• Participate in code reviews and technical discussions\n• Contribute to architectural decisions",
      requirements: "• Bachelor's degree in Computer Science or related field\n• 5+ years of software development experience\n• Strong proficiency in JavaScript, React, Node.js\n• Experience with databases (PostgreSQL, MongoDB)\n• Knowledge of cloud platforms (AWS, Azure, GCP)\n• Experience with DevOps practices\n• Strong problem-solving and communication skills",
      benefits: "• Competitive salary and equity\n• Health insurance and wellness programs\n• Flexible working hours and remote work options\n• Professional development opportunities\n• Modern tech stack and tools\n• Collaborative and inclusive work environment",
      skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker", "Git"]
    },
    tags: ["engineering", "full-stack", "senior", "javascript", "react"]
  },
  {
    name: "Product Manager",
    description: "Strategic product management role for tech products",
    category: "management",
    isPublic: true,
    isDefault: true,
    templateData: {
      title: "Product Manager",
      department: "product",
      location: "Mumbai, Maharashtra",
      type: "full-time",
      experience: "mid",
      salary: "₹12-20 LPA",
      description: "Join our product team as a Product Manager and help shape the future of our platform. You will work closely with engineering, design, and business teams to deliver exceptional user experiences.\n\nKey Responsibilities:\n• Define product strategy and roadmap\n• Gather and analyze user requirements\n• Collaborate with engineering teams on feature development\n• Monitor product performance and user feedback\n• Conduct market research and competitive analysis",
      requirements: "• Bachelor's degree in Business, Engineering, or related field\n• 3+ years of product management experience\n• Strong analytical and problem-solving skills\n• Experience with agile development methodologies\n• Excellent communication and presentation skills\n• Knowledge of product analytics tools\n• Understanding of user experience principles",
      benefits: "• Competitive compensation package\n• Comprehensive health benefits\n• Flexible work arrangements\n• Learning and development budget\n• Stock options\n• Team building activities",
      skills: ["Product Management", "Agile", "Analytics", "User Research", "Strategy", "Communication"]
    },
    tags: ["product", "management", "strategy", "analytics", "user-experience"]
  },
  {
    name: "UX Designer",
    description: "User experience design role for digital products",
    category: "technical",
    isPublic: true,
    isDefault: true,
    templateData: {
      title: "UX Designer",
      department: "design",
      location: "Delhi, NCR",
      type: "full-time",
      experience: "junior",
      salary: "₹8-15 LPA",
      description: "We're seeking a creative UX Designer to join our design team. You'll be responsible for creating intuitive and engaging user experiences across our digital products.\n\nKey Responsibilities:\n• Design user interfaces and experiences\n• Conduct user research and usability testing\n• Create wireframes, prototypes, and design specifications\n• Collaborate with product and engineering teams\n• Maintain design systems and style guides",
      requirements: "• Bachelor's degree in Design, HCI, or related field\n• 2+ years of UX/UI design experience\n• Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)\n• Understanding of user-centered design principles\n• Experience with prototyping tools\n• Strong portfolio showcasing design work\n• Knowledge of front-end development basics",
      benefits: "• Creative and collaborative work environment\n• Latest design tools and software\n• Professional development opportunities\n• Flexible working hours\n• Health and wellness benefits\n• Design conference attendance",
      skills: ["Figma", "User Research", "Prototyping", "UI Design", "Design Systems", "Usability Testing"]
    },
    tags: ["design", "ux", "ui", "user-research", "prototyping", "figma"]
  },
  {
    name: "Marketing Manager",
    description: "Digital marketing and growth role",
    category: "non-technical",
    isPublic: true,
    isDefault: true,
    templateData: {
      title: "Marketing Manager",
      department: "marketing",
      location: "Pune, Maharashtra",
      type: "full-time",
      experience: "mid",
      salary: "₹10-18 LPA",
      description: "Join our marketing team as a Marketing Manager and drive growth for our brand. You'll be responsible for developing and executing marketing strategies to increase brand awareness and customer acquisition.\n\nKey Responsibilities:\n• Develop and execute marketing campaigns\n• Manage digital marketing channels (SEO, SEM, Social Media)\n• Analyze marketing performance and ROI\n• Collaborate with sales and product teams\n• Manage marketing budget and resources\n• Create compelling marketing content",
      requirements: "• Bachelor's degree in Marketing, Business, or related field\n• 3+ years of marketing experience\n• Experience with digital marketing tools and platforms\n• Strong analytical and creative skills\n• Knowledge of SEO, SEM, and social media marketing\n• Excellent written and verbal communication skills\n• Experience with marketing automation tools",
      benefits: "• Performance-based bonuses\n• Marketing tools and software access\n• Conference and training opportunities\n• Flexible work environment\n• Health insurance\n• Team outings and events",
      skills: ["Digital Marketing", "SEO", "SEM", "Social Media", "Analytics", "Content Marketing", "Marketing Automation"]
    },
    tags: ["marketing", "digital-marketing", "growth", "seo", "social-media", "analytics"]
  },
  {
    name: "Data Scientist",
    description: "Advanced analytics and machine learning role",
    category: "technical",
    isPublic: true,
    isDefault: true,
    templateData: {
      title: "Data Scientist",
      department: "engineering",
      location: "Hyderabad, Telangana",
      type: "full-time",
      experience: "senior",
      salary: "₹18-30 LPA",
      description: "We're looking for a Data Scientist to join our analytics team. You'll work on complex data problems, build machine learning models, and provide insights that drive business decisions.\n\nKey Responsibilities:\n• Develop and implement machine learning models\n• Analyze large datasets to extract insights\n• Collaborate with engineering teams on data infrastructure\n• Present findings to stakeholders\n• Stay updated with latest ML/AI technologies\n• Design and conduct experiments",
      requirements: "• Master's degree in Data Science, Statistics, or related field\n• 4+ years of data science experience\n• Strong programming skills in Python/R\n• Experience with machine learning frameworks (TensorFlow, PyTorch)\n• Knowledge of SQL and big data technologies\n• Strong statistical and mathematical background\n• Experience with cloud platforms (AWS, GCP, Azure)",
      benefits: "• Competitive salary and equity\n• Access to latest ML tools and infrastructure\n• Conference and training opportunities\n• Flexible working arrangements\n• Health and wellness benefits\n• Research and development time",
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics", "AWS", "Data Analysis"]
    },
    tags: ["data-science", "machine-learning", "python", "analytics", "ai", "statistics"]
  }
];

async function createSampleTemplates() {
  try {
    console.log('🚀 Starting to create sample job templates...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Find a user to associate templates with (or create a system user)
    let systemUser = await User.findOne({ where: { email: 'system@jobportal.com' } });
    
    if (!systemUser) {
      console.log('📝 Creating system user for templates...');
      systemUser = await User.create({
        first_name: 'System',
        last_name: 'User',
        email: 'system@jobportal.com',
        password: 'system_password_hash', // This should be hashed in real implementation
        user_type: 'employer',
        is_active: true
      });
    }
    
    console.log('👤 System user found/created:', systemUser.id);
    
    // Create templates
    for (const templateData of sampleTemplates) {
      try {
        const existingTemplate = await JobTemplate.findOne({
          where: { name: templateData.name, isDefault: true }
        });
        
        if (existingTemplate) {
          console.log(`⏭️  Template "${templateData.name}" already exists, skipping...`);
          continue;
        }
        
        const template = await JobTemplate.create({
          ...templateData,
          createdBy: systemUser.id
        });
        
        console.log(`✅ Created template: "${template.name}" (${template.id})`);
      } catch (error) {
        console.error(`❌ Error creating template "${templateData.name}":`, error.message);
      }
    }
    
    console.log('🎉 Sample templates creation completed!');
    
    // Display summary
    const totalTemplates = await JobTemplate.count();
    const publicTemplates = await JobTemplate.count({ where: { isPublic: true } });
    const defaultTemplates = await JobTemplate.count({ where: { isDefault: true } });
    
    console.log('\n📊 Template Summary:');
    console.log(`   Total Templates: ${totalTemplates}`);
    console.log(`   Public Templates: ${publicTemplates}`);
    console.log(`   Default Templates: ${defaultTemplates}`);
    
  } catch (error) {
    console.error('❌ Error creating sample templates:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createSampleTemplates();
}

module.exports = { createSampleTemplates, sampleTemplates };
