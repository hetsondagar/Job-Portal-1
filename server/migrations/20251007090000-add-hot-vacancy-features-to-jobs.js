'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔥 Adding hot vacancy features to jobs table...');
    
    // Add hot vacancy fields to jobs table
    const hotVacancyFields = [
      { name: 'isHotVacancy', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'urgentHiring', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'multipleEmailIds', type: Sequelize.JSONB, defaultValue: [] },
      { name: 'boostedSearch', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'searchBoostLevel', type: Sequelize.ENUM('standard', 'premium', 'super', 'city-specific'), defaultValue: 'standard' },
      { name: 'citySpecificBoost', type: Sequelize.JSONB, defaultValue: [] },
      { name: 'videoBanner', type: Sequelize.STRING },
      { name: 'whyWorkWithUs', type: Sequelize.TEXT },
      { name: 'companyReviews', type: Sequelize.JSONB, defaultValue: [] },
      { name: 'autoRefresh', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'refreshDiscount', type: Sequelize.DECIMAL, defaultValue: 0 },
      { name: 'attachmentFiles', type: Sequelize.JSONB, defaultValue: [] },
      { name: 'officeImages', type: Sequelize.JSONB, defaultValue: [] },
      { name: 'companyProfile', type: Sequelize.TEXT },
      { name: 'proactiveAlerts', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'alertRadius', type: Sequelize.INTEGER, defaultValue: 50 },
      { name: 'alertFrequency', type: Sequelize.ENUM('immediate', 'daily', 'weekly'), defaultValue: 'immediate' },
      { name: 'featuredKeywords', type: Sequelize.JSONB, defaultValue: [] },
      { name: 'customBranding', type: Sequelize.JSONB, defaultValue: {} },
      { name: 'superFeatured', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'tierLevel', type: Sequelize.ENUM('basic', 'premium', 'enterprise', 'super-premium'), defaultValue: 'basic' },
      { name: 'externalApplyUrl', type: Sequelize.STRING },
      { name: 'hotVacancyPrice', type: Sequelize.DECIMAL },
      { name: 'hotVacancyCurrency', type: Sequelize.STRING, defaultValue: 'INR' },
      { name: 'hotVacancyPaymentStatus', type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' }
    ];
    
    for (const field of hotVacancyFields) {
      try {
        await queryInterface.addColumn('jobs', field.name, {
          type: field.type,
          allowNull: true,
          defaultValue: field.defaultValue
        });
        console.log(`✅ Added ${field.name} column`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Column ${field.name} already exists`);
        } else {
          console.error(`❌ Failed to add column ${field.name}:`, error.message);
        }
      }
    }
    
    console.log('🎉 All hot vacancy features added to jobs table successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔧 Removing hot vacancy features from jobs table...');
    
    const columnsToRemove = [
      'isHotVacancy',
      'urgentHiring',
      'multipleEmailIds',
      'boostedSearch',
      'searchBoostLevel',
      'citySpecificBoost',
      'videoBanner',
      'whyWorkWithUs',
      'companyReviews',
      'autoRefresh',
      'refreshDiscount',
      'attachmentFiles',
      'officeImages',
      'companyProfile',
      'proactiveAlerts',
      'alertRadius',
      'alertFrequency',
      'featuredKeywords',
      'customBranding',
      'superFeatured',
      'tierLevel',
      'externalApplyUrl',
      'hotVacancyPrice',
      'hotVacancyCurrency',
      'hotVacancyPaymentStatus'
    ];
    
    for (const column of columnsToRemove) {
      try {
        await queryInterface.removeColumn('jobs', column);
        console.log(`✅ Removed ${column} column`);
      } catch (error) {
        console.error(`❌ Failed to remove column ${column}:`, error.message);
      }
    }
    
    console.log('✅ All hot vacancy features removed from jobs table successfully!');
  }
};


