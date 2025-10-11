'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add natureOfBusiness field (JSONB array for multi-select)
    await queryInterface.addColumn('companies', 'nature_of_business', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Nature of business: SaaS, PaaS, B2B, B2C, D2C, etc.'
    });

    // Add companyTypes field (JSONB array for multi-select)
    await queryInterface.addColumn('companies', 'company_types', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Company types: Corporate, Foreign MNC, Indian MNC, Startup, etc.'
    });

    console.log('✅ Added nature_of_business and company_types columns to companies table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'nature_of_business');
    await queryInterface.removeColumn('companies', 'company_types');
  }
};

