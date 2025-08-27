# Google OAuth & Dashboard Stats Fix Guide

## 🔧 Issues Fixed

This guide addresses two main issues:
1. **Google Profile Sync Unable** - OAuth profile synchronization failures
2. **Failed to Load Dashboard Stats** - Dashboard statistics loading errors

## 🚀 Quick Fix Steps

### 1. Environment Setup
Ensure your `.env` file has all required variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/oauth/google/callback

# Server URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Database
DATABASE_URL=your-database-url
```

### 2. Database Migration
Run the OAuth fields migration:

```bash
cd Job-Portal/server
npm run migrate
```

### 3. Test the Fixes
Run the comprehensive test script:

```bash
cd Job-Portal/server
node test-oauth-dashboard-fix.js
```

## 🔍 Detailed Troubleshooting

### Google OAuth Issues

#### Problem: "Google profile sync unable"
**Causes:**
- Expired access tokens
- Invalid refresh tokens
- Google API rate limiting
- Network connectivity issues

**Solutions:**

1. **Check Token Expiration**
   ```javascript
   // The fix automatically handles token refresh
   if (user.oauth_token_expires_at && new Date() > user.oauth_token_expires_at) {
     // Token will be automatically refreshed
   }
   ```

2. **Verify Google OAuth Setup**
   - Ensure Google Cloud Console project is active
   - Verify OAuth consent screen is configured
   - Check that redirect URIs are correct

3. **Test OAuth Flow**
   ```bash
   # Test OAuth URLs endpoint
   curl http://localhost:8000/api/oauth/urls
   ```

#### Problem: OAuth Callback Failures
**Causes:**
- Incorrect callback URLs
- Missing state parameters
- Session issues

**Solutions:**

1. **Check Callback URL Configuration**
   ```javascript
   // In Google Cloud Console, ensure these URLs are added:
   http://localhost:8000/api/oauth/google/callback
   http://localhost:3000/oauth-callback
   http://localhost:3000/employer-oauth-callback
   ```

2. **Verify State Parameter Handling**
   ```javascript
   // State parameter is now properly stored in session
   if (req.query.state) {
     req.session.oauthState = req.query.state;
   }
   ```

### Dashboard Stats Issues

#### Problem: "Failed to load dashboard stats"
**Causes:**
- Missing Analytics table
- Database connection issues
- Authentication problems
- Missing data relationships

**Solutions:**

1. **Check Database Tables**
   ```sql
   -- Verify Analytics table exists
   SELECT * FROM analytics LIMIT 1;
   
   -- Check table structure
   DESCRIBE analytics;
   ```

2. **Run Database Migrations**
   ```bash
   cd Job-Portal/server
   npm run migrate
   ```

3. **Test Database Connection**
   ```bash
   node -e "
   const { sequelize } = require('./config/sequelize');
   sequelize.authenticate().then(() => console.log('✅ DB Connected')).catch(console.error);
   "
   ```

#### Problem: Empty Dashboard Stats
**Causes:**
- No applications in database
- No profile views tracked
- Analytics not being recorded

**Solutions:**

1. **Create Sample Data**
   ```javascript
   // The fix handles missing data gracefully
   // Stats will show 0 instead of failing
   ```

2. **Enable Analytics Tracking**
   ```javascript
   // Analytics events are automatically tracked
   // Profile views, job applications, etc.
   ```

## 🛠️ Code Fixes Applied

### 1. Enhanced Dashboard Stats Endpoint
- Added comprehensive error handling
- Graceful handling of missing data
- Better logging for debugging
- Support for both jobseeker and employer stats

### 2. Improved Google OAuth Sync
- Automatic token refresh
- Retry logic for API calls
- Better error messages
- Fallback handling for failed syncs

### 3. Robust Error Handling
- Individual try-catch blocks for each operation
- Detailed error logging
- Graceful degradation when services fail

## 📊 Testing Your Fix

### 1. Run the Test Script
```bash
cd Job-Portal/server
node test-oauth-dashboard-fix.js
```

### 2. Manual Testing Steps

#### Test OAuth Flow:
1. Go to `/login` or `/employer-login`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Verify profile data is synced

#### Test Dashboard Stats:
1. Login to the application
2. Navigate to dashboard
3. Check that stats load without errors
4. Verify data is displayed correctly

### 3. Browser Console Checks
- Open browser developer tools
- Check for JavaScript errors
- Monitor network requests
- Verify API responses

## 🔧 Advanced Debugging

### 1. Enable Debug Logging
```javascript
// Add to your .env file
DEBUG=oauth:*,dashboard:*
NODE_ENV=development
```

### 2. Check Server Logs
```bash
# Monitor server logs in real-time
tail -f Job-Portal/server/logs/app.log
```

### 3. Database Debugging
```sql
-- Check OAuth users
SELECT id, email, oauth_provider, oauth_id FROM users WHERE oauth_provider != 'local';

-- Check Analytics data
SELECT eventType, COUNT(*) FROM analytics GROUP BY eventType;

-- Check recent applications
SELECT * FROM job_applications ORDER BY createdAt DESC LIMIT 5;
```

## 🚨 Common Error Messages

### OAuth Errors:
- `"Google OAuth is not configured"` → Check environment variables
- `"Token expired and could not be refreshed"` → Re-authenticate with Google
- `"Failed to fetch Google profile data"` → Check network connectivity

### Dashboard Errors:
- `"Failed to fetch dashboard stats"` → Check database connection
- `"Analytics table not found"` → Run database migrations
- `"Authentication required"` → Check JWT token

## 📞 Support

If you're still experiencing issues:

1. **Check the logs** for detailed error messages
2. **Run the test script** to identify specific problems
3. **Verify environment variables** are correctly set
4. **Test with a fresh database** to rule out data corruption

## 🎯 Success Indicators

You'll know the fixes are working when:

✅ **OAuth Flow:**
- Google login works without errors
- Profile data is automatically synced
- No "sync unable" error messages

✅ **Dashboard Stats:**
- Stats load without errors
- Numbers display correctly (even if 0)
- No "failed to load" messages
- Recent applications show properly

✅ **Overall:**
- No console errors in browser
- Server logs show successful operations
- Test script passes all checks
