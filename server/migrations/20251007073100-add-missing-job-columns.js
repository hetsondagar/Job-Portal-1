'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔧 Adding missing columns to jobs table...');
    
    // Add role column
    await queryInterface.addColumn('jobs', 'role', {
      type: Sequelize.STRING,
      allowNull: true
    });
    console.log('✅ Added role column');
    
    // Add industryType column (PostgreSQL will convert to lowercase)
    await queryInterface.addColumn('jobs', 'industryType', {
      type: Sequelize.STRING,
      allowNull: true
    });
    console.log('✅ Added industryType column');
    
    // Add roleCategory column (PostgreSQL will convert to lowercase)
    await queryInterface.addColumn('jobs', 'roleCategory', {
      type: Sequelize.STRING,
      allowNull: true
    });
    console.log('✅ Added roleCategory column');
    
    // Add employmentType column (PostgreSQL will convert to lowercase)
    await queryInterface.addColumn('jobs', 'employmentType', {
      type: Sequelize.STRING,
      allowNull: true
    });
    console.log('✅ Added employmentType column');
    
    console.log('🎉 All missing columns added successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔧 Removing added columns from jobs table...');
    
    await queryInterface.removeColumn('jobs', 'role');
    await queryInterface.removeColumn('jobs', 'industryType');
    await queryInterface.removeColumn('jobs', 'roleCategory');
    await queryInterface.removeColumn('jobs', 'employmentType');
    
    console.log('✅ All columns removed successfully!');
  }
};
