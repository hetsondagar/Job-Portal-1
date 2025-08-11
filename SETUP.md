# Job Portal - Setup Guide

This project includes a complete signup system with PostgreSQL integration and Sequelize ORM, connected to the existing frontend without any UI changes.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Database Setup

1. **Install PostgreSQL** if you haven't already
2. **Create a database**:
   ```sql
   CREATE DATABASE jobportal_dev;
   ```

## Environment Configuration

### Server (.env file in server directory)

Create a `.env` file in the `server` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=jobportal_dev
DB_NAME_TEST=jobportal_test

# Server Configuration
NODE_ENV=development
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
```

### Client (.env.local file in client directory)

Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Installation

### 1. Install Server Dependencies

```bash
cd server
npm install
```

### 2. Install Client Dependencies

```bash
cd client
npm install
```

## Running the Application

### 1. Start the Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:8000`

### 2. Start the Client

```bash
cd client
npm run dev
```

The client will start on `http://localhost:3000`

## Features Implemented

### Backend (Server)

- ✅ **PostgreSQL Integration** with Sequelize ORM
- ✅ **User Authentication** with JWT tokens
- ✅ **User Registration** with validation (works with existing frontend)
- ✅ **User Login** with password verification (works with existing frontend)
- ✅ **User Profile Management**
- ✅ **Password Hashing** with bcrypt
- ✅ **Input Validation** with express-validator
- ✅ **Error Handling** middleware
- ✅ **CORS Configuration**
- ✅ **Rate Limiting**
- ✅ **Security Headers** with helmet

### Frontend (Client)

- ✅ **Next.js 15** with TypeScript
- ✅ **Modern UI** with Tailwind CSS and shadcn/ui
- ✅ **Authentication Context** with React hooks
- ✅ **API Integration** with fetch
- ✅ **Form Validation** and error handling
- ✅ **Loading States** and user feedback
- ✅ **Responsive Design**
- ✅ **Dark Mode** support
- ✅ **No UI Changes** - existing forms work with backend

### Database Schema

The User model includes:

- **Basic Info**: id, email, password, firstName, lastName, phone
- **Account Type**: jobseeker, employer, admin
- **Profile Data**: headline, summary, skills, languages, certifications
- **Location**: currentLocation, willingToRelocate
- **Career**: expectedSalary, noticePeriod, experience
- **Security**: email verification, password reset, 2FA support
- **Preferences**: notification settings, privacy settings
- **Status**: account status, profile completion, verification level

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration (works with existing form)
- `POST /api/auth/login` - User login (works with existing form)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/change-password` - Change password
- `PUT /api/user/notifications` - Update notification preferences
- `DELETE /api/user/account` - Delete account

## Frontend Integration

The backend is designed to work with the existing frontend forms:

### Register Form Fields:
- `fullName` - Split into firstName and lastName in backend
- `email` - Email address
- `phone` - Phone number (optional)
- `password` - Password with validation
- `confirmPassword` - Password confirmation
- `experience` - Experience level (stored in preferences)
- `agreeToTerms` - Terms agreement
- `subscribeNewsletter` - Newsletter subscription

### Login Form Fields:
- `email` - Email address
- `password` - Password
- `rememberMe` - Remember me option

## Testing the Application

1. **Start both server and client**
2. **Navigate to** `http://localhost:3000/register`
3. **Create a new account** with the existing form
4. **You'll be redirected** to the dashboard after successful registration
5. **Test login** by going to `http://localhost:3000/login`

## Database Migrations

The server uses Sequelize with automatic table creation. Tables will be created automatically when you start the server for the first time.

To run migrations manually:
```bash
cd server
npm run db:migrate
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configured for secure cross-origin requests
- **Security Headers**: Implemented with helmet middleware

## Key Features

### No Frontend Changes Required
- ✅ Existing register form works with backend
- ✅ Existing login form works with backend
- ✅ All form fields are properly mapped
- ✅ Validation and error handling integrated
- ✅ Loading states and user feedback

### Backend Adapts to Frontend
- ✅ Accepts `fullName` and splits into `firstName`/`lastName`
- ✅ Stores `experience` in user preferences
- ✅ Handles optional fields like `phone`
- ✅ Validates all form inputs
- ✅ Returns proper error messages

## Next Steps

This is a foundation that you can build upon. Consider adding:

- Email verification system
- Password reset functionality
- File upload for resumes and avatars
- Job posting and application system
- Company profiles and management
- Search and filtering capabilities
- Real-time notifications
- Payment integration for premium features

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your database credentials in `.env`
- Verify the database exists

### Port Conflicts
- Change the PORT in server `.env` if 8000 is in use
- Update NEXT_PUBLIC_API_URL in client `.env.local` accordingly

### CORS Issues
- Ensure the CORS_ORIGIN in server `.env` matches your client URL
- Check that both server and client are running

## Support

If you encounter any issues, check:
1. Database connection and credentials
2. Environment variables are properly set
3. All dependencies are installed
4. Both server and client are running on the correct ports
