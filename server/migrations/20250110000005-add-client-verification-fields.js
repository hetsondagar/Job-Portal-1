'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Adding client verification fields to agency_client_authorizations table...');
    
    try {
      // Add client verification token
      await queryInterface.addColumn('agency_client_authorizations', 'client_verification_token', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
      console.log('✅ Added client_verification_token');
      
      // Add token expiry
      await queryInterface.addColumn('agency_client_authorizations', 'client_verification_token_expiry', {
        type: Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Added client_verification_token_expiry');
      
      // Add client verification action
      await queryInterface.addColumn('agency_client_authorizations', 'client_verification_action', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'approved or rejected by client'
      });
      console.log('✅ Added client_verification_action');
      
      console.log('🎉 Client verification fields added successfully!');
    } catch (error) {
      console.error('❌ Error adding client verification fields:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('agency_client_authorizations', 'client_verification_token');
    await queryInterface.removeColumn('agency_client_authorizations', 'client_verification_token_expiry');
    await queryInterface.removeColumn('agency_client_authorizations', 'client_verification_action');
  }
};


