'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔧 Adding missing columns to jobs table...');

    const columnExists = async (columnName) => {
      const [results] = await queryInterface.sequelize.query(
        `SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = :column LIMIT 1`,
        { replacements: { column: columnName } }
      );
      return results && results.length > 0;
    };

    if (!(await columnExists('role'))) {
      await queryInterface.addColumn('jobs', 'role', { type: Sequelize.STRING, allowNull: true });
      console.log('✅ Added role column');
    } else {
      console.log('ℹ️  role already exists, skipping');
    }

    if (!(await columnExists('industryType'))) {
      await queryInterface.addColumn('jobs', 'industryType', { type: Sequelize.STRING, allowNull: true });
      console.log('✅ Added industryType column');
    } else {
      console.log('ℹ️  industryType already exists, skipping');
    }

    if (!(await columnExists('roleCategory'))) {
      await queryInterface.addColumn('jobs', 'roleCategory', { type: Sequelize.STRING, allowNull: true });
      console.log('✅ Added roleCategory column');
    } else {
      console.log('ℹ️  roleCategory already exists, skipping');
    }

    if (!(await columnExists('employmentType'))) {
      await queryInterface.addColumn('jobs', 'employmentType', { type: Sequelize.STRING, allowNull: true });
      console.log('✅ Added employmentType column');
    } else {
      console.log('ℹ️  employmentType already exists, skipping');
    }

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
