# Local Development Setup Guide - SANVI Branch

This guide explains how to set up the **sanvi** branch for local development (while main branch is for production).

## Quick Overview

- **sanvi branch**: Local development (PostgreSQL localhost, no SSL)
- **main branch**: Production deployment (Remote PostgreSQL with SSL)

## Prerequisites

1. **Node.js** v18+ and npm/pnpm
2. **PostgreSQL** v14+ installed locally
3. **Git** installed

## Setup Steps

### 1. Clone and Switch to Sanvi Branch

```bash
git clone https://github.com/hetsondagar/Job-Portal-1.git
cd Job-Portal-1
git checkout sanvi
```

### 2. Database Setup

Create local PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE jobportal_dev;

# Exit psql
\q
```

### 3. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file from example
cp env.example .env

# Edit .env with your local settings (important!)
# Make sure to set:
# - DB_HOST=localhost
# - DB_PORT=5432
# - DB_USER=postgres
# - DB_PASSWORD=<your-postgres-password>
# - DB_NAME=jobportal_dev
# - NODE_ENV=development
```

### 4. Fix Database Schema (If Needed)

If you encounter `column "template_data" does not exist` error:

```bash
# Run schema fix script
node scripts/fix-job-templates-schema.js

# Or reset database and run migrations
npm run db:migrate:undo:all
npm run db:migrate
```

### 5. Start Backend Server

```bash
npm run dev
```

Server should start on http://localhost:8000

### 6. Frontend Setup

Open a new terminal:

```bash
cd client

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start frontend
npm run dev
```

Frontend should start on http://localhost:3000

## Common Issues & Fixes

### Issue 1: Missing node-cron Module

**Error**: `Cannot find module 'node-cron'`

**Fix**:
```bash
cd server
npm install
```

### Issue 2: Template Data Column Error

**Error**: `column "template_data" does not exist`

**Fix**:
```bash
cd server
node scripts/fix-job-templates-schema.js
```

### Issue 3: Association Warnings

**Error**: `You have used the alias job/employer in two separate associations`

**Status**: ✅ Fixed in models (JobApplication.js and Interview.js)

### Issue 4: Database Connection Failed

**Error**: `Unable to connect to the database`

**Fix**:
1. Ensure PostgreSQL is running: `sudo service postgresql status`
2. Verify credentials in `.env` file
3. Check database exists: `psql -U postgres -l | grep jobportal`

## Environment Variables - Local Development

Key environment variables for `.env`:

```env
# Database (LOCAL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=jobportal_dev
NODE_ENV=development

# Server
PORT=8000
JWT_SECRET=your-secret-key-for-local-dev

# Email (Optional - use Gmail for testing)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
```

## Development Workflow

### Making Changes

1. Always work on the `sanvi` branch for local development
2. Test locally before committing
3. Commit with clear messages

```bash
git add .
git commit -m "feat: your feature description"
```

### Pushing Changes

```bash
# Push to sanvi branch
git push origin sanvi
```

### Merging to Main (Production)

⚠️ **IMPORTANT**: Only merge tested features from sanvi to main

```bash
# Switch to main
git checkout main
git pull origin main

# Merge sanvi branch
git merge sanvi

# Resolve conflicts if any, then:
git push origin main
```

## Project Structure

```
Job-Portal/
├── server/              # Backend (Node.js + Express)
│   ├── config/          # Database & email config
│   ├── controllers/     # Route controllers
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── migrations/      # Database migrations
│   ├── services/        # Business logic
│   └── scripts/         # Utility scripts
├── client/              # Frontend (Next.js)
│   ├── app/            # Next.js pages
│   ├── components/     # React components
│   └── lib/            # Utilities
└── docs/               # Documentation
```

## Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## Troubleshooting

### Reset Database

If database gets corrupted:

```bash
cd server

# Undo all migrations
npm run db:migrate:undo:all

# Run migrations again
npm run db:migrate

# Seed default data (if available)
npm run db:seed
```

### Clean Install

If dependencies are broken:

```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json .next
npm install
```

### View Server Logs

```bash
cd server
tail -f logs/app.log
```

## Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

If you encounter issues:
1. Check this guide first
2. Look for similar errors in project logs
3. Ensure all prerequisites are installed
4. Verify environment variables are correct

---

**Happy Coding! 🚀**

