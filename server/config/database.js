

// Helper function to determine if SSL should be used
const shouldUseSSL = (host) => {
  // Don't use SSL for localhost or local development databases
  if (!host || host === 'localhost' || host === '127.0.0.1' || host.includes('localhost')) {
    return false;
  }
  // Use SSL for remote databases (Render, AWS, etc.)
  return true;
};

const getDialectOptions = (host) => {
  if (shouldUseSSL(host)) {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
  }
  return {}; // No SSL for local databases
};

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'jobportal_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    url: process.env.DB_URL || 'postgresql://postgres:password@localhost:5432/jobportal_dev',
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
    },
    dialectOptions: getDialectOptions(process.env.DB_HOST)
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME_TEST || 'jobportal_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    url: process.env.DB_URL || 'postgresql://postgres:password@localhost:5432/jobportal_test',
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
    },
    dialectOptions: getDialectOptions(process.env.DB_HOST)
  },
  production: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'jobportal_dev',
    host: process.env.DB_HOST || 'localhost',
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
    dialectOptions: getDialectOptions(process.env.DB_HOST)
  }
};
