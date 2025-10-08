'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔥 Adding premium hot vacancy features...');
    
    // Add urgent hiring column
    await queryInterface.addColumn('hot_vacancies', 'urgentHiring', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    console.log('✅ Added urgentHiring column');
    
    // Add multiple email IDs column
    await queryInterface.addColumn('hot_vacancies', 'multipleEmailIds', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });
    console.log('✅ Added multipleEmailIds column');
    
    // Add boosted search column
    await queryInterface.addColumn('hot_vacancies', 'boostedSearch', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
    console.log('✅ Added boostedSearch column');
    
    // Add search boost level enum
    await queryInterface.addColumn('hot_vacancies', 'searchBoostLevel', {
      type: Sequelize.ENUM('standard', 'premium', 'super', 'city-specific'),
      allowNull: false,
      defaultValue: 'premium'
    });
    console.log('✅ Added searchBoostLevel column');
    
    // Add city specific boost column
    await queryInterface.addColumn('hot_vacancies', 'citySpecificBoost', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });
    console.log('✅ Added citySpecificBoost column');
    
    // Add video banner column
    await queryInterface.addColumn('hot_vacancies', 'videoBanner', {
      type: Sequelize.STRING,
      allowNull: true
    });
    console.log('✅ Added videoBanner column');
    
    // Add why work with us column
    await queryInterface.addColumn('hot_vacancies', 'whyWorkWithUs', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    console.log('✅ Added whyWorkWithUs column');
    
    // Add company reviews column
    await queryInterface.addColumn('hot_vacancies', 'companyReviews', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });
    console.log('✅ Added companyReviews column');
    
    // Add auto refresh column
    await queryInterface.addColumn('hot_vacancies', 'autoRefresh', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    console.log('✅ Added autoRefresh column');
    
    // Add refresh discount column
    await queryInterface.addColumn('hot_vacancies', 'refreshDiscount', {
      type: Sequelize.DECIMAL,
      allowNull: true,
      defaultValue: 0
    });
    console.log('✅ Added refreshDiscount column');
    
    // Add attachment files column
    await queryInterface.addColumn('hot_vacancies', 'attachmentFiles', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });
    console.log('✅ Added attachmentFiles column');
    
    // Add office images column
    await queryInterface.addColumn('hot_vacancies', 'officeImages', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });
    console.log('✅ Added officeImages column');
    
    // Add company profile column
    await queryInterface.addColumn('hot_vacancies', 'companyProfile', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    console.log('✅ Added companyProfile column');
    
    // Add proactive alerts column
    await queryInterface.addColumn('hot_vacancies', 'proactiveAlerts', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
    console.log('✅ Added proactiveAlerts column');
    
    // Add alert radius column
    await queryInterface.addColumn('hot_vacancies', 'alertRadius', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 50
    });
    console.log('✅ Added alertRadius column');
    
    // Add alert frequency enum
    await queryInterface.addColumn('hot_vacancies', 'alertFrequency', {
      type: Sequelize.ENUM('immediate', 'daily', 'weekly'),
      allowNull: false,
      defaultValue: 'immediate'
    });
    console.log('✅ Added alertFrequency column');
    
    // Add featured keywords column
    await queryInterface.addColumn('hot_vacancies', 'featuredKeywords', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });
    console.log('✅ Added featuredKeywords column');
    
    // Add custom branding column
    await queryInterface.addColumn('hot_vacancies', 'customBranding', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    });
    console.log('✅ Added customBranding column');
    
    // Add super featured column
    await queryInterface.addColumn('hot_vacancies', 'superFeatured', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    console.log('✅ Added superFeatured column');
    
    // Add tier level enum
    await queryInterface.addColumn('hot_vacancies', 'tierLevel', {
      type: Sequelize.ENUM('basic', 'premium', 'enterprise', 'super-premium'),
      allowNull: false,
      defaultValue: 'premium'
    });
    console.log('✅ Added tierLevel column');
    
    console.log('🎉 All premium hot vacancy features added successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔧 Removing premium hot vacancy features...');
    
    const columnsToRemove = [
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
      'tierLevel'
    ];
    
    for (const column of columnsToRemove) {
      await queryInterface.removeColumn('hot_vacancies', column);
      console.log(`✅ Removed ${column} column`);
    }
    
    console.log('✅ All premium hot vacancy features removed successfully!');
  }
};

