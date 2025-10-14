# 🚀 QUICK START - Local Development (SANVI Branch)

## ✅ STATUS: READY TO USE

Your **SANVI branch** now has **100% feature parity** with MAIN production branch, fully configured for local development.

---

## 📋 What Was Done

### ✅ All Production Features Replicated
- **40 Database Models** - All models from MAIN
- **28+ API Routes** - All production endpoints
- **100+ Frontend Pages** - All UI components
- **Employer Popup Fix** - Fully preserved and working
- **Smart SSL Detection** - Auto-detects local vs remote DB
- **Test Routes** - Available in development mode

### ✅ Configured for Local Development
- **Database:** Points to `localhost:5432` by default
- **CORS:** Configured for `localhost:3000` and `localhost:3001`
- **API URL:** Points to `http://localhost:8000/api`
- **Smart Defaults:** All environment variables have sensible local defaults

---

## 🎯 IMMEDIATE SETUP (5 Minutes)

### Step 1: Database Setup
```bash
# Check PostgreSQL is running
psql --version

# Create database
createdb jobportal_dev

# Verify it was created
psql -l | grep jobportal_dev
```

### Step 2: Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies (if not already done)
npm install

# Run migrations to create tables
npx sequelize-cli db:migrate

# (Optional) Create admin user
node scripts/seedAdminUser.js

# Start backend server
npm start
```

**Expected Output:**
```
✅ Database connected successfully
🔔 Test notification routes mounted at /api/test/notifications
Server running on port 8000
```

### Step 3: Frontend Setup (New Terminal)
```bash
# Navigate to client directory
cd client

# Install dependencies (if not already done)
npm install
# OR
pnpm install

# Start development server
npm run dev
# OR
pnpm dev
```

**Expected Output:**
```
Ready - started server on http://localhost:3000
```

### Step 4: Verify Everything Works
Open your browser and test:

1. **Backend Health Check:**
   - Visit: `http://localhost:8000/api/health`
   - Should show: `{"ok":true}`

2. **Frontend:**
   - Visit: `http://localhost:3000`
   - Should load the job portal homepage

3. **Test Registration:**
   - Go to: `http://localhost:3000/register`
   - Create a test account
   - Login and verify dashboard works

4. **Employer Dashboard Popup:**
   - Register as employer
   - Login to employer dashboard
   - Complete profile in popup
   - Logout and login again
   - ✅ Popup should NOT show (fix is working!)

---

## 📁 Project Structure

```
Job-Portal/
├── server/                    # Backend (Node.js + Express)
│   ├── config/               # Database, email, cloudinary configs
│   │   ├── database.js       # ✅ Configured for localhost
│   │   ├── index.js          # Models and associations
│   │   └── sequelize.js      # Database connection
│   ├── routes/               # API endpoints (28 files)
│   │   ├── auth.js           # Authentication
│   │   ├── user.js           # User management (with popup fix)
│   │   ├── jobs.js           # Job management
│   │   ├── companies.js      # Company management
│   │   └── test-notifications.js # ✅ Test routes (dev only)
│   ├── models/               # Database models (40 files)
│   ├── migrations/           # Database migrations (111 files)
│   ├── scripts/              # Utility scripts
│   │   ├── seedAdminUser.js  # ✅ Create admin user
│   │   ├── ensureAdminUser.js # ✅ Ensure admin exists
│   │   └── auto-migrate-on-deploy.js # ✅ Auto migrations
│   ├── controllers/          # Business logic
│   ├── middlewares/          # Auth, error handling
│   └── index.js              # ✅ Main server file (test routes enabled)
│
├── client/                    # Frontend (Next.js 14)
│   ├── app/                  # Pages (App Router)
│   │   ├── employer-dashboard/  # Employer features
│   │   ├── dashboard/           # Jobseeker features
│   │   ├── admin/              # Admin features
│   │   └── ...
│   ├── components/           # Reusable components
│   ├── lib/                  # Utilities
│   │   └── api.ts            # ✅ API client (localhost:8000)
│   └── hooks/                # Custom React hooks
│
└── MAIN_TO_SANVI_REPLICATION_COMPLETE.md  # Full documentation
```

---

## 🔧 Environment Variables (Optional)

### Backend (.env in server/)
```env
# Database (defaults to localhost if not set)
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=jobportal_dev
DB_HOST=localhost
DB_PORT=5432

# Server
PORT=8000
NODE_ENV=development

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this

# Email (for testing - optional)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass

# Cloudinary (for file uploads - optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env.local in client/)
```env
# API URL (defaults to localhost:8000 if not set)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Note:** If you don't create these files, the app will use the built-in defaults which work perfectly for local development!

---

## 🎓 Common Tasks

### Create Database Tables
```bash
cd server
npx sequelize-cli db:migrate
```

### Undo Last Migration
```bash
cd server
npx sequelize-cli db:migrate:undo
```

### Drop and Recreate Database
```bash
dropdb jobportal_dev
createdb jobportal_dev
cd server
npx sequelize-cli db:migrate
```

### Create Admin User
```bash
cd server
node scripts/seedAdminUser.js
```

### Check Database Tables
```bash
psql jobportal_dev -c "\dt"
```

### View Users
```bash
psql jobportal_dev -c "SELECT id, email, user_type FROM \"User\" LIMIT 5;"
```

### View Jobs
```bash
psql jobportal_dev -c "SELECT id, title, status FROM \"Job\" LIMIT 5;"
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed
**Solution:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status
# OR on Windows
Get-Service postgresql*

# Start PostgreSQL if not running
sudo service postgresql start
# OR on Windows (as admin)
net start postgresql-x64-14
```

### Issue: Port 8000 Already in Use
**Solution:**
```bash
# Kill process on port 8000
# Linux/Mac:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: Port 3000 Already in Use
**Solution:**
```bash
# Use a different port
PORT=3001 npm run dev
```

### Issue: Migrations Fail
**Solution:**
```bash
# Reset database
dropdb jobportal_dev
createdb jobportal_dev

# Run migrations fresh
cd server
npx sequelize-cli db:migrate
```

### Issue: Cannot Find Module
**Solution:**
```bash
# Reinstall dependencies
cd server
rm -rf node_modules
npm install

cd ../client
rm -rf node_modules
npm install
```

---

## 📊 Development Workflow

### Daily Development
1. Start PostgreSQL
2. `cd server && npm start` (Terminal 1)
3. `cd client && npm run dev` (Terminal 2)
4. Code and test at `http://localhost:3000`

### Before Committing
1. Test all features you changed
2. Run linter: `npm run lint`
3. Check no console errors
4. Commit with descriptive message

### Testing New Features
1. Create feature on SANVI branch
2. Test thoroughly locally
3. When ready, merge to MAIN for production deployment

---

## ✨ Key Features Verified

### Authentication ✅
- User signup/login
- Employer signup/login
- OAuth (Google)
- Password reset
- Email verification

### Employer Features ✅
- Dashboard with popup fix
- Job posting
- Application management
- Company management
- Hot vacancies
- Featured jobs
- Requirements & candidates
- Interview scheduling
- Analytics

### Jobseeker Features ✅
- Dashboard (India & Gulf)
- Job search & filters
- Job applications
- Resume upload/management
- Cover letters
- Job bookmarks
- Job alerts
- Profile completion

### Admin Features ✅
- Dashboard
- User management
- Company management
- Job moderation
- Agency verifications
- Usage analytics

---

## 🔐 Default Credentials

### Admin User (after running seedAdminUser.js)
```
Email: admin@jobportal.com
Password: Admin@123456
```

### Test Employer (create manually)
```
Register at: http://localhost:3000/employer-register
Use any email/password
```

### Test Jobseeker (create manually)
```
Register at: http://localhost:3000/register
Use any email/password
```

---

## 📈 Next Steps

### Immediate (Today)
1. ✅ Setup local database
2. ✅ Run migrations
3. ✅ Start both servers
4. ✅ Test login/registration
5. ✅ Verify employer popup fix

### This Week
1. Explore all features
2. Test job posting flow
3. Test application flow
4. Familiarize with codebase
5. Start feature development

### Ongoing
1. Keep SANVI branch updated
2. Test features locally before deploying
3. Use MAIN branch for production
4. Regular database backups

---

## 🎯 Success Metrics

Your local development is working if:

- [x] ✅ Backend starts without errors
- [x] ✅ Frontend loads at localhost:3000
- [x] ✅ Database connections successful
- [x] ✅ Can create user accounts
- [x] ✅ Can login successfully
- [x] ✅ Employer dashboard loads
- [x] ✅ Profile popup shows/hides correctly
- [x] ✅ Can post jobs
- [x] ✅ Can apply to jobs
- [x] ✅ File uploads work

---

## 📞 Support

### Documentation
- Full details: `MAIN_TO_SANVI_REPLICATION_COMPLETE.md`
- This guide: `QUICK_START_LOCAL_DEVELOPMENT.md`

### Common Commands Reference
```bash
# Database
createdb jobportal_dev          # Create database
dropdb jobportal_dev            # Delete database
psql jobportal_dev              # Connect to database
npx sequelize-cli db:migrate    # Run migrations

# Backend
npm install                     # Install dependencies
npm start                       # Start server
node scripts/seedAdminUser.js   # Create admin

# Frontend
npm install                     # Install dependencies
npm run dev                     # Start dev server
npm run build                   # Build for production

# Git
git checkout sanvi              # Switch to local dev branch
git checkout main               # Switch to production branch
git status                      # Check changes
git add .                       # Stage all changes
git commit -m "message"         # Commit changes
```

---

## 🎉 You're Ready!

Your SANVI branch is fully configured and ready for local development. All production features work identically to MAIN, with the convenience of local database and testing.

**Start developing:**
```bash
cd server && npm start          # Terminal 1
cd client && npm run dev        # Terminal 2
# Open http://localhost:3000    # Browser
```

**Happy Coding! 🚀**

---

Last Updated: October 14, 2025  
Branch: sanvi (local development)  
Status: ✅ READY FOR USE

