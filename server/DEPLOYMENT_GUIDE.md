# Deployment Guide for Job Portal Backend

## Environment Variables Setup

Create a `.env` file in the server directory with the following variables:

```bash
# Database Configuration (Render PostgreSQL)
DB_HOST=dpg-d372gajuibrs738lnm5g-a.singapore-postgres.render.com
DB_PORT=5432
DB_USER=jobportal_dev_0u1u_user
DB_PASSWORD=yK9WCII787btQrSqZJVdq0Cx61rZoTsc
DB_NAME=jobportal_dev_0u1u

# Server Configuration
NODE_ENV=production
PORT=8000
JWT_SECRET=pL7nX2rQv9aJ4tGd8bE6wYcM5oF1uZsH3kD0jVxN7qR2lC8mT4gP9yK6hW3sA0z
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-key-make-it-very-long-and-secure-for-production-use

# CORS Configuration (Update with your actual URLs)
FRONTEND_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.onrender.com
CORS_ORIGIN=https://your-frontend-url.vercel.app

# Email Configuration (SendGrid) - Add your actual keys
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@jobportal.com
SENDGRID_FROM_NAME=JobPortal

# OAuth Configuration - Add your actual keys
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/oauth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://your-backend-url.onrender.com/api/oauth/facebook/callback

# File Upload (Cloudinary) - Add your actual keys
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Payment Gateway (Razorpay) - Add your actual keys
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# SMS Configuration (Twilio) - Add your actual keys
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Render Deployment Steps

1. **Connect your GitHub repository to Render**
2. **Set up a PostgreSQL database on Render**
3. **Create a new Web Service**
4. **Configure the following settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Node Version:** 18.x or higher

5. **Add Environment Variables in Render Dashboard:**
   - Copy all the environment variables from the .env file above
   - Update the URLs with your actual Render and Vercel URLs

6. **Deploy**

## Common Issues and Solutions

### Issue: "Cannot find module 'sequelize'"
**Solution:** This has been fixed by:
- Moving `sequelize-cli` to dependencies
- Adding proper error handling in production-start.js
- Ensuring all required dependencies are in package.json

### Issue: Database Connection Failed
**Solution:** 
- Verify database credentials in Render dashboard
- Ensure SSL is enabled for production (already configured)
- Check if the database is accessible from Render

### Issue: CORS Errors
**Solution:**
- Update FRONTEND_URL and CORS_ORIGIN with your actual Vercel URL
- Ensure the frontend URL is correct in environment variables

## Testing Deployment

After deployment, test these endpoints:
- `GET /health` - Health check
- `GET /api/health` - API health check
- `GET /api/jobs` - Test database connection

## Frontend Configuration

Update your frontend environment variables to point to your Render backend:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

## Security Notes

1. **Never commit .env files to version control**
2. **Use strong, unique secrets for JWT_SECRET and SESSION_SECRET**
3. **Enable HTTPS in production**
4. **Regularly rotate API keys and secrets**
