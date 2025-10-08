'use strict';

/**
 * Migration: Add performance indexes for hot vacancy queries
 * 
 * This migration adds database indexes to improve query performance
 * for hot vacancy filtering and sorting operations.
 * 
 * Date: 2025-01-08
 * Purpose: Performance optimization for hot vacancy features
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('📊 Adding performance indexes for hot vacancy queries...');
    
    try {
      // Index 1: Hot vacancy flag filter
      // Used when filtering jobs by isHotVacancy status
      await queryInterface.addIndex('jobs', ['ishotvacancy'], {
        name: 'idx_jobs_ishotvacancy',
        where: {
          ishotvacancy: true
        }
      });
      console.log('✅ Added index: idx_jobs_ishotvacancy');

      // Index 2: Hot vacancy status and payment
      // Used when filtering active, paid hot vacancies
      await queryInterface.addIndex('jobs', [
        'ishotvacancy', 
        'status', 
        'hotvacancypaymentstatus'
      ], {
        name: 'idx_jobs_hot_vacancy_status',
        where: {
          ishotvacancy: true
        }
      });
      console.log('✅ Added index: idx_jobs_hot_vacancy_status');

      // Index 3: Hot vacancy premium features
      // Used for sorting by super featured, urgent hiring, and boosted search
      await queryInterface.addIndex('jobs', [
        'ishotvacancy',
        'superfeatured',
        'urgenthiring',
        'boostedsearch',
        '"createdAt"' // Quote to preserve case for timestamp columns
      ], {
        name: 'idx_jobs_hot_vacancy_featured',
        where: {
          ishotvacancy: true
        }
      });
      console.log('✅ Added index: idx_jobs_hot_vacancy_featured');

      // Index 4: Hot vacancy tier level
      // Used when filtering by tier level (basic, premium, enterprise, super-premium)
      await queryInterface.addIndex('jobs', [
        'ishotvacancy',
        'tierlevel'
      ], {
        name: 'idx_jobs_hot_vacancy_tier',
        where: {
          ishotvacancy: true
        }
      });
      console.log('✅ Added index: idx_jobs_hot_vacancy_tier');

      // Index 5: Hot vacancy employer
      // Used when employer wants to see their own hot vacancies
      await queryInterface.addIndex('jobs', [
        'employer_id', // Using snake_case column name
        'ishotvacancy'
      ], {
        name: 'idx_jobs_employer_hot_vacancy'
      });
      console.log('✅ Added index: idx_jobs_employer_hot_vacancy');

      // Index 6: Hot vacancy valid till date
      // Used for filtering expired hot vacancies
      await queryInterface.addIndex('jobs', [
        'ishotvacancy',
        'valid_till' // Using snake_case column name
      ], {
        name: 'idx_jobs_hot_vacancy_valid',
        where: {
          ishotvacancy: true
        }
      });
      console.log('✅ Added index: idx_jobs_hot_vacancy_valid');

      console.log('🎉 All hot vacancy performance indexes added successfully!');
      
    } catch (error) {
      console.error('❌ Error adding indexes:', error.message);
      // Log but don't fail if indexes already exist
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Some indexes already exist, skipping...');
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔧 Removing hot vacancy performance indexes...');
    
    const indexesToRemove = [
      'idx_jobs_ishotvacancy',
      'idx_jobs_hot_vacancy_status',
      'idx_jobs_hot_vacancy_featured',
      'idx_jobs_hot_vacancy_tier',
      'idx_jobs_employer_hot_vacancy',
      'idx_jobs_hot_vacancy_valid'
    ];
    
    for (const indexName of indexesToRemove) {
      try {
        await queryInterface.removeIndex('jobs', indexName);
        console.log(`✅ Removed index: ${indexName}`);
      } catch (error) {
        console.error(`❌ Failed to remove index ${indexName}:`, error.message);
      }
    }
    
    console.log('✅ All hot vacancy performance indexes removed successfully!');
  }
};

