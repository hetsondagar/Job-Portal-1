/**
 * Fixed Database Configuration
 * Handles database connections properly for production deployment
 */

// Parse database URL if provided
function parseDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
  
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      return {
        username: url.username,
        password: url.password,
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1), // Remove leading slash
        ssl: true
      };
    } catch (error) {
      console.warn('Failed to parse DATABASE_URL:', error.message);
      return null;
    }
  }
  return null;
}

// Get database configuration
function getDatabaseConfig() {
  const parsedUrl = parseDatabaseUrl();
  
  if (parsedUrl) {
    return {
      username: parsedUrl.username,
      password: parsedUrl.password,
      host: parsedUrl.host,
      port: parsedUrl.port,
      database: parsedUrl.database,
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
    };
  }
  
  // Fallback to individual environment variables
  return {
    username: process.env.DB_USER || 'jobportal_dev_0u1u_user',
    password: process.env.DB_PASSWORD || 'yK9WCII787btQrSqZJVdq0Cx61rZoTsc',
    database: process.env.DB_NAME || 'jobportal_dev_0u1u',
    host: process.env.DB_HOST || 'dpg-d372gajuibrs738lnm5g-a.singapore-postgres.render.com',
    port: parseInt(process.env.DB_PORT) || 5432,
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
  };
}

const config = getDatabaseConfig();

module.exports = {
  development: config,
  test: config,
  production: config
};
