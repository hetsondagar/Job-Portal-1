# SANVI vs MAIN Branch - Complete Guide

## Branch Strategy Overview

This project uses a **dual-branch strategy** for managing local development and production deployment:

```
┌─────────────────────────────────────────────────────────────┐
│                    SANVI BRANCH (Local)                     │
│                                                               │
│  Purpose: Local Development & Testing                        │
│  Database: PostgreSQL on localhost                           │
│  SSL: Disabled                                                │
│  Environment: development                                     │
│  Port: 8000 (backend) + 3000 (frontend)                      │
│                                                               │
│  ✅ Use for: Daily development, testing features             │
│  ✅ Database: localhost:5432                                 │
│  ✅ No SSL required                                          │
│  ✅ Full error logging                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
                      (Test & Merge)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     MAIN BRANCH (Production)                │
│                                                               │
│  Purpose: Production Deployment                              │
│  Database: Remote PostgreSQL (Render, AWS, etc.)             │
│  SSL: Enabled (required)                                     │
│  Environment: production                                      │
│  Port: Dynamic (assigned by platform)                        │
│                                                               │
│  ✅ Use for: Live production deployment                      │
│  ✅ Database: Remote with SSL                                │
│  ✅ Optimized performance                                    │
│  ✅ Minimal logging                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Differences

### Environment Variables

#### SANVI Branch (.env)
```env
# Local Development Settings
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_local_password
DB_NAME=jobportal_dev

PORT=8000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Email - Use Gmail for testing
GMAIL_USER=your-test-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# OAuth - Use localhost callbacks
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Logging - Verbose
LOG_LEVEL=debug
```

#### MAIN Branch (.env)
```env
# Production Settings
NODE_ENV=production
DB_HOST=your-production-db.render.com
DB_PORT=5432
DB_USER=production_user
DB_PASSWORD=secure_production_password
DB_NAME=jobportal_production
DB_URL=postgresql://user:pass@host:5432/db?sslmode=require

PORT=8000
FRONTEND_URL=https://yourapp.com
BACKEND_URL=https://api.yourapp.com

# Email - Use production SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=SG.xxx

# OAuth - Use production callbacks
GOOGLE_CALLBACK_URL=https://api.yourapp.com/api/auth/google/callback

# Logging - Minimal
LOG_LEVEL=error
```

---

## Database Configuration

### SANVI Branch - Local PostgreSQL

**Connection**:
```javascript
// server/config/database.js
development: {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log, // Full SQL logging
  dialectOptions: {} // No SSL
}
```

**Setup**:
```bash
# Create local database
psql -U postgres
CREATE DATABASE jobportal_dev;
\q

# Run migrations
cd server
npm run db:migrate

# Fix schema (if needed)
node scripts/fix-job-templates-schema.js
```

### MAIN Branch - Production PostgreSQL

**Connection**:
```javascript
// server/config/database.js
production: {
  host: process.env.DB_HOST,
  port: 5432,
  dialect: 'postgres',
  logging: false, // No SQL logging
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
}
```

**Setup**:
- Database provided by hosting platform (Render, Heroku, etc.)
- Automatic SSL certificate handling
- Connection pooling optimized for production

---

## Development Workflow

### Working on SANVI Branch

```bash
# 1. Pull latest changes
git checkout sanvi
git pull origin sanvi

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Setup environment
cd server
cp env.example .env
# Edit .env with local settings

# 4. Fix database schema (first time)
node scripts/fix-job-templates-schema.js

# 5. Start development servers
cd server && npm run dev       # Terminal 1
cd client && npm run dev       # Terminal 2

# 6. Make your changes...

# 7. Commit and push
git add .
git commit -m "feat: your feature"
git push origin sanvi
```

### Deploying to MAIN Branch

```bash
# 1. Ensure sanvi is working
cd server && npm run dev
curl http://localhost:8000/health

# 2. Switch to main
git checkout main
git pull origin main

# 3. Merge sanvi into main
git merge sanvi

# 4. Resolve conflicts (if any)
# Edit conflicted files
git add .
git commit -m "merge: sanvi to main"

# 5. Push to production
git push origin main

# 6. Production deployment happens automatically
# (if using CI/CD like Render, Vercel, etc.)
```

---

## Key Differences Summary

| Feature | SANVI (Local) | MAIN (Production) |
|---------|---------------|-------------------|
| **Environment** | `development` | `production` |
| **Database** | localhost:5432 | Remote + SSL |
| **Logging** | Verbose (all SQL) | Minimal (errors only) |
| **Error Details** | Full stack traces | Generic messages |
| **CORS** | localhost:3000 | yourapp.com |
| **OAuth Callback** | localhost:8000 | api.yourapp.com |
| **Port** | 8000 (fixed) | Dynamic (platform) |
| **SSL** | Disabled | Enabled (required) |
| **Rate Limiting** | 1000 req/15min | 100 req/15min |
| **Session Store** | MemoryStore | Redis/Database |

---

## Testing Before Merge

### Checklist Before Merging SANVI → MAIN

- [ ] Server starts without errors
- [ ] Database migrations run successfully
- [ ] All API endpoints respond correctly
- [ ] Authentication (OTP + OAuth) works
- [ ] File uploads work
- [ ] Email sending works
- [ ] No console errors or warnings
- [ ] Environment variables documented
- [ ] README updated (if needed)

### Quick Test Commands

```bash
# Health check
curl http://localhost:8000/health

# Database connection
node -e "const {testConnection} = require('./server/config/sequelize'); testConnection();"

# Check for errors
npm run dev 2>&1 | grep -E "ERROR|⚠️|❌"
```

---

## Troubleshooting

### Issue: Accidentally Worked on MAIN Branch

```bash
# Save your work
git stash

# Switch to sanvi
git checkout sanvi

# Apply your work
git stash pop

# Commit on sanvi
git add .
git commit -m "your changes"
git push origin sanvi
```

### Issue: SANVI and MAIN Diverged

```bash
# On sanvi branch
git fetch origin main
git merge origin/main

# Resolve conflicts
# Then push
git push origin sanvi
```

### Issue: Need to Hotfix Production

```bash
# Directly on main (emergency only!)
git checkout main
git pull origin main

# Make minimal fix
# Edit files...

git add .
git commit -m "hotfix: critical issue"
git push origin main

# Then merge back to sanvi
git checkout sanvi
git merge main
git push origin sanvi
```

---

## Best Practices

### ✅ DO:
- Always develop on **sanvi** branch
- Test thoroughly before merging to main
- Keep main branch clean and stable
- Use meaningful commit messages
- Document environment variable changes
- Run schema fixes after DB changes

### ❌ DON'T:
- Don't commit directly to main (except emergencies)
- Don't push broken code to sanvi
- Don't forget to update documentation
- Don't skip testing before merging
- Don't hardcode environment-specific values

---

## Quick Reference

### Switch Branches
```bash
git checkout sanvi    # Local development
git checkout main     # Production
```

### Check Current Branch
```bash
git branch --show-current
```

### Compare Branches
```bash
git diff sanvi main
```

### View Branch History
```bash
git log sanvi..main   # Commits in main but not sanvi
git log main..sanvi   # Commits in sanvi but not main
```

---

## Summary

| Branch | Purpose | Use When |
|--------|---------|----------|
| **sanvi** | Local development | Daily coding, testing, debugging |
| **main** | Production | Deploying stable, tested code |

**Golden Rule**: Develop on sanvi, deploy from main! 🚀

---

**Last Updated**: October 14, 2025  
**Status**: ✅ Both branches configured and working

