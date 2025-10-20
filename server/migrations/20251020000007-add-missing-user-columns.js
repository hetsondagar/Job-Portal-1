'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add missing user columns
      await queryInterface.addColumn('users', 'current_company', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Current company name for job seekers'
      }, { transaction });

      await queryInterface.addColumn('users', 'current_role', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Current role/position for job seekers'
      }, { transaction });

      await queryInterface.addColumn('users', 'highest_education', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Highest education level'
      }, { transaction });

      await queryInterface.addColumn('users', 'field_of_study', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Field of study'
      }, { transaction });

      await queryInterface.addColumn('users', 'preferred_job_titles', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Preferred job titles'
      }, { transaction });

      await queryInterface.addColumn('users', 'preferred_industries', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Preferred industries'
      }, { transaction });

      await queryInterface.addColumn('users', 'preferred_company_size', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Preferred company size'
      }, { transaction });

      await queryInterface.addColumn('users', 'preferred_work_mode', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Preferred work mode (remote, hybrid, on-site)'
      }, { transaction });

      await queryInterface.addColumn('users', 'preferred_employment_type', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Preferred employment type (full-time, part-time, etc.)'
      }, { transaction });

      await queryInterface.addColumn('users', 'designation', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'User designation'
      }, { transaction });

      await queryInterface.addColumn('users', 'department', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'User department'
      }, { transaction });

      await transaction.commit();
      console.log('✅ Added missing user columns successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding user columns:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove the added columns
      await queryInterface.removeColumn('users', 'current_company', { transaction });
      await queryInterface.removeColumn('users', 'current_role', { transaction });
      await queryInterface.removeColumn('users', 'highest_education', { transaction });
      await queryInterface.removeColumn('users', 'field_of_study', { transaction });
      await queryInterface.removeColumn('users', 'preferred_job_titles', { transaction });
      await queryInterface.removeColumn('users', 'preferred_industries', { transaction });
      await queryInterface.removeColumn('users', 'preferred_company_size', { transaction });
      await queryInterface.removeColumn('users', 'preferred_work_mode', { transaction });
      await queryInterface.removeColumn('users', 'preferred_employment_type', { transaction });
      await queryInterface.removeColumn('users', 'designation', { transaction });
      await queryInterface.removeColumn('users', 'department', { transaction });

      await transaction.commit();
      console.log('✅ Removed user columns successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing user columns:', error);
      throw error;
    }
  }
};
