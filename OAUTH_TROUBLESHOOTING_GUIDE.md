# OAuth Troubleshooting Guide

## ✅ **Current Status - Backend Working**

The backend OAuth functionality is **fully working**:

- ✅ Google OAuth credentials are configured
- ✅ OAuth URLs endpoint is working
- ✅ Google OAuth redirect is working
- ✅ CORS is properly configured
- ✅ Environment variables are loaded correctly

## 🔍 **Potential Frontend Issues**

### 1. **Frontend Environment Variables**

Create a `.env.local` file in the `client` directory:

```env
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### 2. **Frontend Development Server**

Make sure the frontend is running:

```bash
cd client
npm run dev
```

### 3. **Browser Console Errors**

Check the browser console for any JavaScript errors when clicking the Google OAuth button.

## 🧪 **Testing Steps**

### Step 1: Test Backend (Already Working)
```bash
cd server
node test-frontend-oauth.js
```

### Step 2: Test Frontend
1. Open `http://localhost:3000/login`
2. Open browser developer tools (F12)
3. Go to Console tab
4. Click the "Google" button
5. Check for any error messages

### Step 3: Check Network Tab
1. In browser developer tools, go to Network tab
2. Click the "Google" button
3. Look for any failed requests to `/api/oauth/urls` or `/api/oauth/google`

## 🔧 **Common Issues and Solutions**

### Issue 1: "Failed to get OAuth URL"
**Solution:** Check if the frontend can reach the backend API

### Issue 2: "Invalid redirect URI" from Google
**Solution:** Verify the callback URL in Google Cloud Console matches:
```
http://localhost:8000/api/oauth/google/callback
```

### Issue 3: CORS errors
**Solution:** The backend CORS is already configured correctly

### Issue 4: Frontend not running
**Solution:** Start the frontend development server

## 📋 **Complete Setup Verification**

### Backend Verification ✅
- [x] Server running on port 8000
- [x] Google OAuth credentials configured
- [x] OAuth routes working
- [x] CORS configured
- [x] Environment variables loaded

### Frontend Verification (To Check)
- [ ] Frontend running on port 3000
- [ ] API calls working
- [ ] No JavaScript errors
- [ ] OAuth button clickable
- [ ] Redirect working

## 🚀 **Quick Fix Commands**

```bash
# 1. Ensure backend is running
cd server
npm run dev

# 2. Ensure frontend is running (in new terminal)
cd client
npm run dev

# 3. Test OAuth flow
# Open http://localhost:3000/login
# Click Google button
# Check browser console for errors
```

## 📞 **Debug Information**

If you're still having issues, please provide:

1. **Browser console errors** (if any)
2. **Network tab requests** (if any failed)
3. **Current URL when error occurs**
4. **Steps to reproduce the issue**

## 🎯 **Expected Flow**

1. User clicks "Google" button on `/login`
2. Frontend calls `/api/oauth/urls`
3. Backend returns Google OAuth URL
4. Frontend redirects to Google OAuth URL
5. User authenticates with Google
6. Google redirects to `/api/oauth/google/callback`
7. Backend processes callback and redirects to frontend
8. Frontend receives token and logs user in

## ✅ **Current Working Status**

- **Backend OAuth**: ✅ Fully Working
- **Frontend OAuth**: ⚠️ Needs verification
- **Password Reset**: ✅ Fully Working
- **Forgot Password**: ✅ Fully Working

The backend is completely ready. The issue is likely in the frontend setup or browser configuration.
