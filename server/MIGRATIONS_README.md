# Database Migrations Guide

This document explains how to set up and manage the database for the JobPortal application using Sequelize migrations.

## Overview

The JobPortal application uses PostgreSQL as the database and Sequelize as the ORM. All database schema changes are managed through migrations to ensure version control and easy deployment.

## Database Schema

The application includes the following tables:

1. **users** - User accounts (job seekers, employers, admins)
2. **companies** - Company profiles and information
3. **jobs** - Job postings
4. **job_categories** - Job categorization
5. **job_applications** - Job applications from candidates
6. **resumes** - User resumes and CVs
7. **work_experiences** - Work history
8. **educations** - Educational background
9. **requirements** - Employer requirements
10. **applications** - Applications to requirements
11. **job_bookmarks** - Job bookmarking
12. **job_alerts** - Job alert subscriptions
13. **notifications** - System notifications
14. **company_reviews** - Company reviews and ratings
15. **company_follows** - Company following
16. **subscription_plans** - Available subscription plans
17. **subscriptions** - User subscriptions
18. **payments** - Payment transactions
19. **user_sessions** - User session management
20. **interviews** - Interview scheduling
21. **conversations** - Messaging conversations
22. **messages** - Individual messages
23. **analytics** - User behavior analytics

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** and **npm** installed
3. **Environment variables** configured (see `.env.example`)

## Environment Setup

1. Copy the environment file:
   ```bash
   cp env.example .env
   ```

2. Configure your database settings in `.env`:
   ```env
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=jobportal_dev
   DB_HOST=localhost
   DB_PORT=5432
   ```

## Database Initialization

### Quick Setup (Recommended)

Run the complete database initialization script:

```bash
npm run db:init
```

This script will:
- Test the database connection
- Run all migrations
- Sync models with the database
- Create any missing tables

### Manual Setup

If you prefer to run steps manually:

1. **Create the database:**
   ```bash
   npm run db:create
   ```

2. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

3. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

## Migration Commands

### Run Migrations
```bash
npm run db:migrate
```

### Undo Last Migration
```bash
npm run db:migrate:undo
```

### Undo All Migrations
```bash
npm run db:migrate:undo:all
```

### Check Migration Status
```bash
npx sequelize-cli db:migrate:status
```

## Creating New Migrations

To create a new migration:

```bash
npx sequelize-cli migration:generate --name migration-name
```

Example:
```bash
npx sequelize-cli migration:generate --name add-new-feature
```

This will create a new migration file in the `migrations/` directory.

## Migration File Structure

Each migration file follows this structure:

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Migration logic here
    await queryInterface.createTable('table_name', {
      // table definition
    });
  },

  async down (queryInterface, Sequelize) {
    // Rollback logic here
    await queryInterface.dropTable('table_name');
  }
};
```

## Database Sync vs Migrations

### When to Use Migrations
- **Production environments** - Always use migrations
- **Schema changes** - Use migrations for version control
- **Team development** - Migrations ensure consistency

### When to Use Sync
- **Development** - Quick prototyping
- **Testing** - Fresh database for tests
- **Initial setup** - First-time database creation

## Model Synchronization

The application includes automatic model synchronization that:

1. **Creates missing tables** based on model definitions
2. **Updates existing tables** to match model changes
3. **Maintains data integrity** during updates

### Sync Options

```javascript
// Force sync (drops and recreates all tables)
await sequelize.sync({ force: true });

// Alter sync (updates existing tables)
await sequelize.sync({ alter: true });

// Safe sync (only creates missing tables)
await sequelize.sync();
```

## Database Relationships

The migrations establish the following key relationships:

### User Relationships
- Users can have multiple jobs (as employers)
- Users can have multiple job applications (as candidates)
- Users can have multiple resumes, work experiences, and education records

### Company Relationships
- Companies can have multiple jobs
- Companies can have multiple reviews and followers

### Application Relationships
- Job applications can have multiple interviews
- Applications can have associated conversations

### Subscription Relationships
- Users can have multiple subscriptions
- Subscriptions can have multiple payments

## Indexes and Performance

The migrations include comprehensive indexing for:

- **Primary keys** - UUID-based with auto-generation
- **Foreign keys** - For relationship queries
- **Search fields** - Email, slug, status fields
- **Date fields** - For time-based queries
- **Status fields** - For filtering queries

## Data Types

The migrations use appropriate PostgreSQL data types:

- **UUID** - For primary keys and foreign keys
- **JSONB** - For flexible schema data (skills, preferences, etc.)
- **ENUM** - For constrained choice fields
- **DECIMAL** - For monetary values
- **TEXT** - For long text content
- **DATE/DATEONLY** - For date fields

## Constraints

The migrations include various constraints:

- **Unique constraints** - Prevent duplicate records
- **Foreign key constraints** - Maintain referential integrity
- **Check constraints** - Validate data ranges
- **Not null constraints** - Ensure required fields

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Check if PostgreSQL is running
   - Verify connection settings in `.env`

2. **Permission denied**
   - Ensure database user has proper permissions
   - Check database exists and is accessible

3. **Migration conflicts**
   - Check migration status: `npm run db:migrate:status`
   - Undo and re-run migrations if needed

4. **Model sync issues**
   - Check model definitions match migration schema
   - Verify foreign key relationships

### Reset Database

To completely reset the database:

```bash
npm run db:drop
npm run db:create
npm run db:migrate
npm run db:seed
```

## Production Deployment

For production deployment:

1. **Never use sync** - Always use migrations
2. **Backup database** before running migrations
3. **Test migrations** in staging environment first
4. **Monitor migration execution** for any errors
5. **Verify data integrity** after migration

## Best Practices

1. **Always backup** before running migrations
2. **Test migrations** in development first
3. **Use descriptive migration names**
4. **Include rollback logic** in migrations
5. **Document schema changes**
6. **Monitor performance** after schema changes

## Support

For issues with migrations or database setup:

1. Check the logs for error messages
2. Verify environment configuration
3. Test database connectivity
4. Review migration status
5. Check model definitions

## Additional Resources

- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Migration Best Practices](https://sequelize.org/docs/v6/other-topics/migrations/)
