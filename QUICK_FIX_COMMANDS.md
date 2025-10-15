# Quick Fix Commands - Sanvi Branch (Local Development)

## 🚨 If Server Won't Start

### Issue: Missing Dependencies
```bash
cd server
npm install
```

### Issue: Database Schema Problems
```bash
cd server
node scripts/fix-job-templates-schema.js
```

### Issue: Database Connection Failed
```bash
# Check if PostgreSQL is running
# Windows:
Get-Service postgresql*

# If not running, start it:
# net start postgresql-x64-14
```

### Issue: Port Already in Use
```bash
# Windows PowerShell - Kill process on port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force

# Then restart server
cd server
npm run dev
```

## 🔄 Reset Everything

### Complete Reset (Nuclear Option)
```bash
# Stop server (Ctrl+C if running)

# Backend cleanup
cd server
rm -rf node_modules
rm package-lock.json
npm install

# Database reset
npm run db:migrate:undo:all
npm run db:migrate
node scripts/fix-job-templates-schema.js

# Start server
npm run dev
```

## ✅ Verify Everything Works

### Check 1: Database Connection
```bash
cd server
node -e "const {testConnection} = require('./config/sequelize'); testConnection();"
```

### Check 2: Server Health
```bash
# After starting server (npm run dev)
curl http://localhost:8000/health
```

### Check 3: Dependencies
```bash
cd server
npm list node-cron
```

## 🎯 One-Liner Setup (Fresh Clone)

```bash
git clone https://github.com/hetsondagar/Job-Portal-1.git && cd Job-Portal-1 && git checkout sanvi && cd server && npm install && node scripts/fix-job-templates-schema.js && npm run dev
```

## 📋 Environment Variables Quick Check

```bash
cd server
cat .env | grep -E "DB_HOST|DB_PORT|DB_NAME|NODE_ENV"
```

Should show:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobportal_dev
NODE_ENV=development
```

## 🐛 Common Error Messages & Fixes

| Error | Command to Fix |
|-------|----------------|
| `Cannot find module 'node-cron'` | `cd server && npm install` |
| `column "template_data" does not exist` | `cd server && node scripts/fix-job-templates-schema.js` |
| `Unable to connect to database` | Check PostgreSQL service is running |
| `Port 8000 already in use` | Kill process and restart |
| `Association warnings` | Already fixed in models (just restart) |

## 💡 Tips

1. **Always run from project root**: `C:\Users\WINNER\Desktop\repo\Job-Portal`
2. **Use PowerShell**: Not CMD (better error messages)
3. **Check logs**: Look for red ❌ or ⚠️ symbols
4. **Health check first**: `curl http://localhost:8000/health`

---

**Last Updated**: October 14, 2025

