# OAuth Debug Guide for Job Portal

## Current Status
✅ **OAuth Infrastructure is Working Correctly**
- OAuth URLs are being generated properly
- Google OAuth initiation is working
- OAuth callback handling is working
- Frontend callback pages are accessible

## Potential Issues and Solutions

### 1. Google OAuth App Configuration

**Issue**: Google OAuth app settings might not be configured correctly.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID
4. Click "Edit" and verify these settings:

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:8000
```

**Authorized redirect URIs:**
```
http://localhost:8000/api/oauth/google/callback
```

### 2. Environment Variables

**Issue**: OAuth credentials might not be loaded properly.

**Solution**:
1. Check your `.env` file in `Job-Portal/server/`:
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:8000/api/oauth/google/callback
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

2. Restart the server after making changes:
```bash
cd Job-Portal/server
npm start
```

### 3. Session Configuration

**Issue**: Session handling might not be working properly.

**Solution**:
1. Check that session middleware is configured in `server/index.js`
2. Verify session secret is set in `.env`:
```env
SESSION_SECRET=your-session-secret-key
```

### 4. Frontend JavaScript Errors

**Issue**: JavaScript errors might be preventing OAuth flow.

**Solution**:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try the OAuth flow and look for errors
4. Check Network tab for failed requests

### 5. CORS Issues

**Issue**: Cross-origin requests might be blocked.

**Solution**:
1. Verify CORS configuration in `server/index.js`
2. Ensure both frontend (port 3000) and backend (port 8000) are running
3. Check that `FRONTEND_URL` is set correctly

## Testing Steps

### Step 1: Test OAuth URLs
```bash
cd Job-Portal/server
node test-oauth-real-flow.js
```

### Step 2: Test in Browser
1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Check browser console for errors
4. Monitor server logs for OAuth callback errors

### Step 3: Test Employer OAuth
1. Go to `http://localhost:3000/employer-login`
2. Click "Sign in with Google"
3. Verify redirection to employer dashboard

## Debugging Commands

### Check Environment Variables
```bash
cd Job-Portal/server
node -e "require('dotenv').config(); console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');"
```

### Test OAuth Endpoints
```bash
curl "http://localhost:8000/api/oauth/urls?userType=jobseeker"
curl "http://localhost:8000/api/oauth/urls?userType=employer"
```

### Check Server Logs
Look for these log messages:
- `🔍 Google OAuth Initiation - Query params:`
- `📝 Stored OAuth state in session:`
- `🔍 Google OAuth Callback - Query params:`
- `🔍 Google OAuth Callback - Session state:`

## Common Error Messages

### "Invalid redirect URI"
- Check Google OAuth app settings
- Verify redirect URI matches exactly

### "Access denied"
- User cancelled OAuth flow
- Check OAuth consent screen configuration

### "OAuth not configured"
- Check environment variables
- Restart server after setting credentials

### "Authentication failed"
- Check server logs for detailed error
- Verify Google OAuth app is properly configured

## Expected OAuth Flow

### For Jobseekers:
1. User clicks "Sign in with Google" on `/login`
2. Frontend calls `apiService.getOAuthUrls('jobseeker')`
3. Backend returns: `http://localhost:8000/api/oauth/google`
4. User redirected to Google OAuth
5. Google redirects to: `http://localhost:8000/api/oauth/google/callback`
6. Backend processes callback and redirects to: `/oauth-callback`
7. Frontend redirects to: `/dashboard`

### For Employers:
1. User clicks "Sign in with Google" on `/employer-login`
2. Frontend calls `apiService.getOAuthUrls('employer')`
3. Backend returns: `http://localhost:8000/api/oauth/google?state=employer`
4. User redirected to Google OAuth
5. Google redirects to: `http://localhost:8000/api/oauth/google/callback`
6. Backend processes callback, detects `state=employer`, and redirects to: `/employer-oauth-callback`
7. Frontend redirects to: `/employer-dashboard`

## Support

If issues persist:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test OAuth flow step by step using the test scripts
4. Ensure both frontend and backend are running
5. Check browser console for JavaScript errors
