# OAuth Authentication Setup Guide

This guide will help you set up Google and Facebook OAuth authentication for your Job Portal application.

## Prerequisites

- Node.js and npm installed
- PostgreSQL database running
- Google Cloud Console account
- Facebook Developer account

## Backend Setup

### 1. Install Dependencies

The required dependencies are already installed:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `passport-facebook` - Facebook OAuth strategy

### 2. Database Migration

The OAuth fields have been added to the users table. Run the migration:

```bash
cd server
npm run db:migrate
```

### 3. Environment Variables

Create a `.env` file in the server directory with the following OAuth variables:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/oauth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:8000/api/oauth/facebook/callback

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:8000/api/oauth/google/callback` (for development)
   - `https://yourdomain.com/api/oauth/google/callback` (for production)
5. Copy the Client ID and Client Secret

### 3. Update Environment Variables

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Choose "Consumer" app type
4. Fill in app details

### 2. Configure OAuth Settings

1. Go to "Facebook Login" > "Settings"
2. Add Valid OAuth Redirect URIs:
   - `http://localhost:8000/api/oauth/facebook/callback` (for development)
   - `https://yourdomain.com/api/oauth/facebook/callback` (for production)
3. Copy the App ID and App Secret

### 3. Update Environment Variables

```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## Frontend Setup

### 1. OAuth Callback Page

The OAuth callback page has been created at `/oauth-callback` to handle the redirect from OAuth providers.

### 2. Updated Login Page

The login page now includes functional Google and Facebook OAuth buttons that:
- Show loading states
- Handle errors gracefully
- Redirect to OAuth providers
- Process authentication tokens

## Testing OAuth

### 1. Start the Backend Server

```bash
cd server
npm run dev
```

### 2. Start the Frontend

```bash
cd client
npm run dev
```

### 3. Test OAuth Flow

1. Go to `http://localhost:3000/login`
2. Click on "Google" or "Facebook" button
3. Complete the OAuth flow
4. You should be redirected back to the application and logged in

## OAuth Flow Overview

1. **User clicks OAuth button** → Frontend requests OAuth URL from backend
2. **Backend returns OAuth URL** → Frontend redirects to OAuth provider
3. **User authenticates** → OAuth provider redirects to backend callback
4. **Backend processes callback** → Creates/updates user and generates JWT token
5. **Backend redirects to frontend** → With JWT token in URL parameters
6. **Frontend processes token** → Stores token and user data, redirects to dashboard

## Security Considerations

1. **Environment Variables**: Never commit OAuth secrets to version control
2. **HTTPS**: Use HTTPS in production for secure OAuth communication
3. **Token Storage**: JWT tokens are stored in localStorage (consider httpOnly cookies for production)
4. **CORS**: Configure CORS properly to allow only trusted domains
5. **Rate Limiting**: OAuth endpoints are protected by rate limiting

## Production Deployment

### 1. Update Callback URLs

Update the callback URLs in both Google and Facebook OAuth settings to use your production domain.

### 2. Environment Variables

Set production environment variables:
```env
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/oauth/google/callback
FACEBOOK_CALLBACK_URL=https://api.yourdomain.com/api/oauth/facebook/callback
```

### 3. SSL Certificate

Ensure your production server has a valid SSL certificate for secure OAuth communication.

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Check that callback URLs match exactly in OAuth provider settings
2. **"Client ID not found"**: Verify environment variables are set correctly
3. **"CORS errors"**: Ensure CORS is configured properly for your domains
4. **"Database errors"**: Run migrations to ensure OAuth fields are added to the users table

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed OAuth flow logs in the console.

## Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check the server logs for backend errors
3. Verify all environment variables are set correctly
4. Ensure OAuth provider settings match your callback URLs
