

module.exports = {
  development: {
    username: process.env.DB_USER || 'jobportal_dev_0u1u_user',
    password: process.env.DB_PASSWORD || 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
    database: process.env.DB_NAME || 'jobportal_dev_0u1u',
    host: process.env.DB_HOST || 'dpg-d372gajuibrs738lnm5g-a.singapore-postgres.render.com',
    port: process.env.DB_PORT || 5432,
    url: process.env.DB_URL || 'postgresql://jobportal_dev_0u1u_user:yK9WCII787btQrSqZJVdq0Cx61rZoTsc@dpg-d372gajuibrs738lnm5g-a/jobportal_dev_0u1u',
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  },
  test: {
    username: process.env.DB_USER || 'jobportal_test_0u1u_user',
    password: process.env.DB_PASSWORD || 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
    database: process.env.DB_NAME_TEST || 'jobportal_test_0u1u',
    host: process.env.DB_HOST || 'dpg-d372gajuibrs738lnm5g-a.singapore-postgres.render.com',
    port: process.env.DB_PORT || 5432,
    url: process.env.DB_URL || 'postgresql://jobportal_test_0u1u_user:yK9WCII787btQrSqZJVdq0Cx61rZoTsc@dpg-d372gajuibrs738lnm5g-a/jobportal_test_0u1u',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  },
  production: {
    username: process.env.DB_USER || 'jobportal_dev_0u1u_user',
    password: process.env.DB_PASSWORD || 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
    database: process.env.DB_NAME || 'jobportal_dev_0u1u',
    host: process.env.DB_HOST || 'dpg-d372gajuibrs738lnm5g-a.singapore-postgres.render.com',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 