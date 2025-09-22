'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add region enum column to requirements if it doesn't exist
    const table = 'requirements';
    const column = 'region';
    // Create ENUM type and column
    await queryInterface.sequelize.transaction(async (t) => {
      // Some Postgres setups need the enum created explicitly before addColumn
      await queryInterface.sequelize.query(
        'DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = \"enum_requirements_region\") THEN CREATE TYPE \"enum_requirements_region\" AS ENUM (\'india\', \'gulf\', \'other\'); END IF; END $$;',
        { transaction: t }
      );

      await queryInterface.addColumn(
        table,
        column,
        {
          type: Sequelize.ENUM('india', 'gulf', 'other'),
          allowNull: true,
          defaultValue: 'india'
        },
        { transaction: t }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    const table = 'requirements';
    const column = 'region';
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn(table, column, { transaction: t });
      // Drop enum type if exists (Postgres)
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS \"enum_requirements_region\";', { transaction: t });
    });
  }
};


