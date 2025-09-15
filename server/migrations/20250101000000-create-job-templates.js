'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('job_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Template name for easy identification'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Template description'
      },
      category: {
        type: Sequelize.ENUM('technical', 'non-technical', 'management', 'entry-level', 'senior', 'custom'),
        allowNull: false,
        defaultValue: 'custom',
        comment: 'Template category for organization'
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether template is available to all employers'
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this is a system default template'
      },
      templateData: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Structured template data including all job fields'
      },
      usageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of times this template has been used'
      },
      lastUsedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last time this template was used'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether template is active and available'
      },
      tags: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: 'Tags for easy searching and categorization'
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: 'Template version for tracking changes'
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'User who created this template'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    try {
      await queryInterface.addIndex('job_templates', ['createdBy'], { name: 'job_templates_created_by' });
    } catch (error) {
      // Index might already exist, continue
      console.log('Index job_templates_created_by might already exist, skipping...');
    }
    
    try {
      await queryInterface.addIndex('job_templates', ['isPublic'], { name: 'job_templates_is_public' });
    } catch (error) {
      console.log('Index job_templates_is_public might already exist, skipping...');
    }
    
    try {
      await queryInterface.addIndex('job_templates', ['category'], { name: 'job_templates_category' });
    } catch (error) {
      console.log('Index job_templates_category might already exist, skipping...');
    }
    
    try {
      await queryInterface.addIndex('job_templates', ['isActive'], { name: 'job_templates_is_active' });
    } catch (error) {
      console.log('Index job_templates_is_active might already exist, skipping...');
    }
    
    try {
      await queryInterface.addIndex('job_templates', ['createdAt'], { name: 'job_templates_created_at' });
    } catch (error) {
      console.log('Index job_templates_created_at might already exist, skipping...');
    }

    // Insert some default templates
    await queryInterface.bulkInsert('job_templates', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Senior Software Engineer',
        description: 'Template for senior software engineering positions with comprehensive requirements',
        category: 'technical',
        isPublic: true,
        isDefault: true,
        templateData: Sequelize.literal(`'{
          "title": "Senior Software Engineer",
          "department": "engineering",
          "location": "Remote / Hybrid",
          "type": "full-time",
          "experience": "senior",
          "salary": "₹15-30 LPA",
          "description": "We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions.",
          "requirements": "• 5+ years of experience in software development\\n• Strong knowledge of modern programming languages (Java, Python, or JavaScript)\\n• Experience with cloud platforms (AWS, Azure, or GCP)\\n• Knowledge of microservices architecture\\n• Experience with CI/CD pipelines\\n• Strong problem-solving and communication skills",
          "benefits": "• Competitive salary and equity\\n• Health, dental, and vision insurance\\n• Flexible work arrangements\\n• Professional development opportunities\\n• Modern tech stack and tools",
          "skills": ["Java", "Python", "JavaScript", "AWS", "Microservices", "Docker", "Kubernetes"]
        }'::jsonb`),
        tags: Sequelize.literal(`'["engineering", "senior", "full-stack", "remote"]'::jsonb`),
        createdBy: Sequelize.literal('(SELECT id FROM "users" LIMIT 1)'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Marketing Manager',
        description: 'Template for marketing management roles with strategic focus',
        category: 'non-technical',
        isPublic: true,
        isDefault: true,
        templateData: Sequelize.literal(`'{
          "title": "Marketing Manager",
          "department": "marketing",
          "location": "Hybrid",
          "type": "full-time",
          "experience": "mid",
          "salary": "₹12-20 LPA",
          "description": "We are seeking a Marketing Manager to develop and execute marketing strategies that drive brand awareness and customer acquisition.",
          "requirements": "• 3+ years of experience in marketing\\n• Experience with digital marketing channels\\n• Knowledge of marketing automation tools\\n• Strong analytical and creative skills\\n• Experience with brand management\\n• Excellent communication and leadership skills",
          "benefits": "• Competitive salary package\\n• Health insurance\\n• Performance bonuses\\n• Professional development\\n• Collaborative work environment",
          "skills": ["Digital Marketing", "Brand Management", "Marketing Automation", "Analytics", "Social Media"]
        }'::jsonb`),
        tags: Sequelize.literal(`'["marketing", "management", "strategy", "digital"]'::jsonb`),
        createdBy: Sequelize.literal('(SELECT id FROM "users" LIMIT 1)'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Frontend Developer',
        description: 'Template for frontend development positions',
        category: 'technical',
        isPublic: true,
        isDefault: true,
        templateData: Sequelize.literal(`'{
          "title": "Frontend Developer",
          "department": "engineering",
          "location": "On-site / Hybrid",
          "type": "full-time",
          "experience": "junior",
          "salary": "₹8-15 LPA",
          "description": "We are looking for a Frontend Developer to create engaging user experiences and build responsive web applications.",
          "requirements": "• 1+ years of experience in frontend development\\n• Proficiency in HTML, CSS, and JavaScript\\n• Experience with modern frameworks (React, Vue, or Angular)\\n• Knowledge of responsive design principles\\n• Understanding of web performance optimization\\n• Good problem-solving skills",
          "benefits": "• Competitive salary\\n• Health insurance\\n• Learning and development budget\\n• Modern development tools\\n• Collaborative team environment",
          "skills": ["HTML", "CSS", "JavaScript", "React", "Vue.js", "Responsive Design"]
        }'::jsonb`),
        tags: Sequelize.literal(`'["frontend", "react", "javascript", "web-development"]'::jsonb`),
        createdBy: Sequelize.literal('(SELECT id FROM "users" LIMIT 1)'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('job_templates');
  }
};
