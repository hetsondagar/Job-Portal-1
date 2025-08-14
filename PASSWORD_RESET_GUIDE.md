# Password Reset Functionality Guide

This guide explains the password reset functionality that has been implemented in the JobPortal application.

## Overview

The password reset system allows users to securely reset their passwords when they forget them. The system includes:

1. **Forgot Password** - Users can request a password reset link
2. **Reset Password** - Users can set a new password using a secure token
3. **Token Verification** - System validates reset tokens before allowing password changes

## Backend Implementation

### New API Endpoints

#### 1. Forgot Password
- **URL**: `POST /api/auth/forgot-password`
- **Purpose**: Generates and sends a password reset link
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "If an account with that email exists, a password reset link has been sent."
  }
  ```

#### 2. Reset Password
- **URL**: `POST /api/auth/reset-password`
- **Purpose**: Resets password using a valid token
- **Request Body**:
  ```json
  {
    "token": "reset-token-here",
    "password": "new-password-123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password has been reset successfully"
  }
  ```

#### 3. Verify Reset Token
- **URL**: `GET /api/auth/verify-reset-token/:token`
- **Purpose**: Validates if a reset token is valid and not expired
- **Response**:
  ```json
  {
    "success": true,
    "message": "Reset token is valid"
  }
  ```

### Database Changes

The User model already includes the necessary fields for password reset:
- `password_reset_token` - Stores the reset token
- `password_reset_expires` - Stores the token expiration time

### Security Features

1. **Token Expiration**: Reset tokens expire after 1 hour
2. **Secure Tokens**: Uses crypto.randomBytes(32) for secure token generation
3. **Password Validation**: Enforces strong password requirements
4. **Privacy**: Doesn't reveal if an email exists or not
5. **Token Cleanup**: Tokens are cleared after successful password reset

## Frontend Implementation

### New Pages

#### 1. Forgot Password Page (`/forgot-password`)
- Clean, modern design matching the existing login page
- Email input with validation
- Success state showing confirmation message
- Option to resend reset link

#### 2. Reset Password Page (`/reset-password`)
- Token validation from URL parameters
- Password and confirm password fields
- Password strength requirements display
- Success state with security tips

#### 3. Employer Forgot Password Page (`/employer-forgot-password`)
- Separate page for employer password reset
- Matches employer login page styling
- Same functionality as regular forgot password

### API Integration

The `apiService` has been updated with new methods:

```typescript
// Request password reset
await apiService.forgotPassword({ email: "user@example.com" })

// Reset password with token
await apiService.resetPassword({ 
  token: "reset-token", 
  password: "new-password" 
})

// Verify reset token
await apiService.verifyResetToken("reset-token")
```

## Usage Flow

### For Job Seekers
1. User clicks "Forgot password?" on login page
2. User enters email on `/forgot-password` page
3. System sends reset link (currently logged to console)
4. User clicks link in email, goes to `/reset-password?token=xxx`
5. User enters new password and confirms
6. User is redirected to login page

### For Employers
1. User clicks "Forgot password?" on employer login page
2. User enters email on `/employer-forgot-password` page
3. Same flow as job seekers

## Email Integration (TODO)

Currently, the reset links are logged to the console. In production, you should:

1. **Configure Email Service**: Set up SendGrid or similar email service
2. **Create Email Templates**: Design professional email templates
3. **Send Reset Emails**: Implement actual email sending in the forgot password endpoint

Example email template structure:
```html
Subject: Reset Your JobPortal Password

Hi [User Name],

You requested to reset your password. Click the link below to set a new password:

[Reset Link]

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
JobPortal Team
```

## Environment Variables

Make sure these environment variables are set:

```env
# Frontend URL for reset links
FRONTEND_URL=http://localhost:3000

# Email configuration (for production)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@jobportal.com
SENDGRID_FROM_NAME=JobPortal
```

## Testing

### Manual Testing
1. Start both server and client
2. Go to `/forgot-password`
3. Enter an email address
4. Check server console for reset link
5. Click the link to test reset functionality

### API Testing
You can test the endpoints using tools like Postman or curl:

```bash
# Request password reset
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Reset password (replace with actual token)
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token", "password": "NewPassword123"}'
```

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent abuse
2. **Email Verification**: Ensure email addresses are verified before allowing reset
3. **Audit Logging**: Log password reset attempts for security monitoring
4. **HTTPS**: Always use HTTPS in production
5. **Token Storage**: Consider using Redis for token storage in production

## Future Enhancements

1. **SMS Reset**: Add SMS-based password reset option
2. **Security Questions**: Implement security questions as backup
3. **Password History**: Prevent reuse of recent passwords
4. **Account Lockout**: Lock accounts after multiple failed attempts
5. **Two-Factor Authentication**: Add 2FA for additional security

## Troubleshooting

### Common Issues

1. **Token Not Found**: Check if token is properly generated and stored
2. **Token Expired**: Ensure tokens are not expired (1 hour limit)
3. **Email Not Sent**: Check email service configuration
4. **Frontend URL Issues**: Verify FRONTEND_URL environment variable

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

This will show detailed logs including reset token generation and validation.
