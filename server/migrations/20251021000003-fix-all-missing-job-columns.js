'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔧 Fixing all missing job columns...');
    
    try {
      // Check current job table structure
      const tableInfo = await queryInterface.describeTable('jobs');
      console.log('📋 Current job table columns:', Object.keys(tableInfo));
      
      // List of columns that might be missing
      const missingColumns = [
        {
          name: 'job_type',
          definition: {
            type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance', 'temporary'),
            allowNull: true,
            defaultValue: 'full-time'
          }
        },
        {
          name: 'experience_level',
          definition: {
            type: Sequelize.ENUM('entry', 'mid', 'senior', 'executive'),
            allowNull: true,
            defaultValue: 'mid'
          }
        },
        {
          name: 'experience_min',
          definition: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
          }
        },
        {
          name: 'experience_max',
          definition: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 5
          }
        },
        {
          name: 'salary_min',
          definition: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          }
        },
        {
          name: 'salary_max',
          definition: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          }
        },
        {
          name: 'salary_currency',
          definition: {
            type: Sequelize.STRING(3),
            allowNull: true,
            defaultValue: 'USD'
          }
        },
        {
          name: 'salary_period',
          definition: {
            type: Sequelize.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
            allowNull: true,
            defaultValue: 'yearly'
          }
        },
        {
          name: 'is_salary_visible',
          definition: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
          }
        },
        {
          name: 'remote_work',
          definition: {
            type: Sequelize.ENUM('no', 'partial', 'full'),
            allowNull: true,
            defaultValue: 'no'
          }
        },
        {
          name: 'travel_required',
          definition: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
          }
        },
        {
          name: 'shift_timing',
          definition: {
            type: Sequelize.ENUM('day', 'night', 'rotating', 'flexible'),
            allowNull: true,
            defaultValue: 'day'
          }
        },
        {
          name: 'notice_period',
          definition: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 30
          }
        },
        {
          name: 'education',
          definition: {
            type: Sequelize.STRING,
            allowNull: true
          }
        },
        {
          name: 'certifications',
          definition: {
            type: Sequelize.JSONB,
            allowNull: true
          }
        },
        {
          name: 'languages',
          definition: {
            type: Sequelize.JSONB,
            allowNull: true
          }
        },
        {
          name: 'is_urgent',
          definition: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
          }
        },
        {
          name: 'is_featured',
          definition: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
          }
        },
        {
          name: 'is_premium',
          definition: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
          }
        },
        {
          name: 'views',
          definition: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
          }
        },
        {
          name: 'applications',
          definition: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
          }
        },
        {
          name: 'valid_till',
          definition: {
            type: Sequelize.DATE,
            allowNull: true
          }
        },
        {
          name: 'published_at',
          definition: {
            type: Sequelize.DATE,
            allowNull: true
          }
        },
        {
          name: 'closed_at',
          definition: {
            type: Sequelize.DATE,
            allowNull: true
          }
        },
        {
          name: 'tags',
          definition: {
            type: Sequelize.JSONB,
            allowNull: true
          }
        },
        {
          name: 'metadata',
          definition: {
            type: Sequelize.JSONB,
            allowNull: true
          }
        },
        {
          name: 'is_private',
          definition: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
          }
        },
        {
          name: 'visibility_type',
          definition: {
            type: Sequelize.ENUM('public', 'private', 'restricted'),
            allowNull: true,
            defaultValue: 'public'
          }
        },
        {
          name: 'allowed_viewers',
          definition: {
            type: Sequelize.JSONB,
            allowNull: true
          }
        },
        {
          name: 'referral_code',
          definition: {
            type: Sequelize.STRING,
            allowNull: true
          }
        }
      ];
      
      // Add missing columns
      for (const column of missingColumns) {
        if (!tableInfo[column.name]) {
          console.log(`📝 Adding ${column.name} column to jobs table...`);
          try {
            await queryInterface.addColumn('jobs', column.name, column.definition);
            console.log(`✅ Added ${column.name} column`);
          } catch (error) {
            console.warn(`⚠️ Could not add ${column.name}: ${error.message}`);
          }
        } else {
          console.log(`ℹ️ ${column.name} column already exists`);
        }
      }
      
      console.log('✅ All missing job columns fixed');
      
    } catch (error) {
      console.error('❌ Error fixing job columns:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting job column fixes...');
    
    try {
      const columnsToRemove = [
        'job_type', 'experience_level', 'experience_min', 'experience_max',
        'salary_min', 'salary_max', 'salary_currency', 'salary_period',
        'is_salary_visible', 'remote_work', 'travel_required', 'shift_timing',
        'notice_period', 'education', 'certifications', 'languages',
        'is_urgent', 'is_featured', 'is_premium', 'views', 'applications',
        'valid_till', 'published_at', 'closed_at', 'tags', 'metadata',
        'is_private', 'visibility_type', 'allowed_viewers', 'referral_code'
      ];
      
      for (const columnName of columnsToRemove) {
        try {
          await queryInterface.removeColumn('jobs', columnName);
          console.log(`✅ Removed ${columnName} column`);
        } catch (error) {
          console.warn(`⚠️ Could not remove ${columnName}: ${error.message}`);
        }
      }
      
      console.log('✅ Job column fixes reverted');
      
    } catch (error) {
      console.error('❌ Error reverting job column fixes:', error);
      throw error;
    }
  }
};
