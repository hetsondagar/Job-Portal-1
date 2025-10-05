'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Jobs table indexes
    await queryInterface.addIndex('jobs', ['experienceMin'], { name: 'jobs_experience_min_idx' });
    await queryInterface.addIndex('jobs', ['experienceMax'], { name: 'jobs_experience_max_idx' });
    await queryInterface.addIndex('jobs', ['salaryMin'], { name: 'jobs_salary_min_idx' });
    await queryInterface.addIndex('jobs', ['remoteWork'], { name: 'jobs_remote_work_idx' });
    await queryInterface.addIndex('jobs', ['education'], { name: 'jobs_education_idx' });
    await queryInterface.addIndex('jobs', ['department'], { name: 'jobs_department_idx' });
    await queryInterface.addIndex('jobs', ['title'], { name: 'jobs_title_idx' });
    await queryInterface.addIndex('jobs', ['location'], { name: 'jobs_location_idx' });

    // GIN index on JSONB skills for fast contains
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS jobs_skills_gin_idx ON jobs USING GIN (skills)');

    // Companies table indexes
    await queryInterface.addIndex('companies', ['industry'], { name: 'companies_industry_idx' });
    await queryInterface.addIndex('companies', ['companyType'], { name: 'companies_company_type_idx' });
    await queryInterface.addIndex('companies', ['name'], { name: 'companies_name_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('jobs', 'jobs_experience_min_idx');
    await queryInterface.removeIndex('jobs', 'jobs_experience_max_idx');
    await queryInterface.removeIndex('jobs', 'jobs_salary_min_idx');
    await queryInterface.removeIndex('jobs', 'jobs_remote_work_idx');
    await queryInterface.removeIndex('jobs', 'jobs_education_idx');
    await queryInterface.removeIndex('jobs', 'jobs_department_idx');
    await queryInterface.removeIndex('jobs', 'jobs_title_idx');
    await queryInterface.removeIndex('jobs', 'jobs_location_idx');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS jobs_skills_gin_idx');

    await queryInterface.removeIndex('companies', 'companies_industry_idx');
    await queryInterface.removeIndex('companies', 'companies_company_type_idx');
    await queryInterface.removeIndex('companies', 'companies_name_idx');
  }
};


