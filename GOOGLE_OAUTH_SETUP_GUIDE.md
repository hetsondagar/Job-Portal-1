# Google OAuth Setup Guide for Job Portal

## Issue Identified
Google OAuth is failing for employers because the Google OAuth credentials are not configured in the environment variables.

## Step-by-Step Setup Guide

### 1. Create Google OAuth Application

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project (if needed)**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it "Job Portal OAuth" or similar
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type

5. **Configure OAuth Consent Screen**
   - If prompted, configure the OAuth consent screen:
     - App name: "Job Portal"
     - User support email: Your email
     - Developer contact information: Your email
     - Save and continue

6. **Configure OAuth Client**
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     http://localhost:8000
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:8000/api/oauth/google/callback
     ```
   - Click "Create"

7. **Copy Credentials**
   - You'll get a **Client ID** and **Client Secret**
   - Save these securely

### 2. Configure Environment Variables

1. **Create/Update .env file**
   - Navigate to `Job-Portal/server/`
   - Create a `.env` file (if it doesn't exist)
   - Add the following variables:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:8000/api/oauth/google/callback

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

2. **Replace the placeholder values:**
   - Replace `your-google-client-id-here` with your actual Google Client ID
   - Replace `your-google-client-secret-here` with your actual Google Client Secret

### 3. Restart the Server

1. **Stop the current server** (Ctrl+C in the terminal)
2. **Restart the server:**
   ```bash
   cd Job-Portal/server
   npm start
   ```

### 4. Test the Setup

1. **Run the OAuth test:**
   ```bash
   cd Job-Portal/server
   node test-oauth-complete-flow.js
   ```

2. **Expected output:**
   ```
   GOOGLE_CLIENT_ID: ✅ Set
   GOOGLE_CLIENT_SECRET: ✅ Set
   ```

3. **Test in browser:**
   - Go to http://localhost:3000/employer-login
   - Click "Sign in with Google"
   - Should redirect to Google OAuth

### 5. Troubleshooting

#### Common Issues:

1. **"Google OAuth is not configured" error:**
   - Check that `.env` file exists in `Job-Portal/server/`
   - Verify Client ID and Secret are correct
   - Restart the server after adding credentials

2. **"Invalid redirect URI" error:**
   - Make sure the redirect URI in Google Console matches exactly:
     ```
     http://localhost:8000/api/oauth/google/callback
     ```
   - Check for extra spaces or typos

3. **"Access denied" error:**
   - Verify the OAuth consent screen is configured
   - Check that the Google+ API is enabled

4. **CORS errors:**
   - Ensure `FRONTEND_URL` is set to `http://localhost:3000`
   - Check that the frontend is running on port 3000

#### Debug Steps:

1. **Check environment variables:**
   ```bash
   cd Job-Portal/server
   node -e "require('dotenv').config(); console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');"
   ```

2. **Check server logs:**
   - Look for OAuth-related errors in the server console
   - Check for any authentication failures

3. **Test OAuth endpoints:**
   ```bash
   cd Job-Portal/server
   node test-oauth-employer.js
   ```

### 6. Production Setup

For production deployment:

1. **Update Google OAuth settings:**
   - Add your production domain to authorized origins
   - Add production callback URL to authorized redirect URIs

2. **Update environment variables:**
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/oauth/google/callback
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://yourdomain.com
   ```

3. **Security considerations:**
   - Use strong, unique Client Secrets
   - Keep credentials secure and never commit them to version control
   - Use environment variables in production

## Verification

After setup, you should be able to:

1. ✅ Click "Sign in with Google" on employer login page
2. ✅ Be redirected to Google OAuth consent screen
3. ✅ Grant permissions and be redirected back
4. ✅ Land on employer dashboard as an employer user
5. ✅ Have a company automatically created for OAuth employers

## Support

If you continue to have issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the OAuth flow step by step using the test scripts
4. Ensure both frontend (port 3000) and backend (port 8000) are running
