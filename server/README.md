# JobPortal Backend API

A comprehensive job portal backend built with Node.js, Express, Sequelize ORM, and PostgreSQL database.

## 🚀 Features

- **User Management**: Job seekers and employers with role-based access
- **Company Management**: Complete company profiles with verification
- **Job Postings**: Full CRUD operations for job listings
- **Requirements Management**: Employer hiring requirements system
- **Application System**: Job application tracking and management
- **Resume Management**: Job seeker profile and resume system
- **Work Experience & Education**: Detailed professional history
- **Notifications**: Real-time notification system
- **Authentication**: JWT-based authentication with Google OAuth
- **File Upload**: Resume and document upload support
- **Search & Filtering**: Advanced search capabilities
- **Analytics**: Dashboard analytics and reporting

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES7+)
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Authentication**: JWT + Passport.js
- **File Upload**: Multer + Cloudinary
- **Email**: SendGrid
- **SMS**: Twilio
- **Payment**: Razorpay
- **Validation**: Joi + Express Validator
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=jobportal_dev
DB_NAME_TEST=jobportal_test

# Server Configuration
NODE_ENV=development
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Add other required environment variables...
```

### 4. Database Setup

#### Option A: Using Sequelize CLI (Recommended)

```bash
# Create database
npm run db:create

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

#### Option B: Using Initialization Script

```bash
# Initialize database with sample data
node scripts/init-db.js
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:8000`

## 📊 Database Schema

### Core Models

1. **User** - Job seekers and employers
2. **Company** - Company profiles and information
3. **Job** - Job postings and listings
4. **Requirement** - Employer hiring requirements
5. **Application** - Job applications and tracking
6. **Resume** - Job seeker resumes and profiles
7. **WorkExperience** - Professional work history
8. **Education** - Educational background
9. **Notification** - User notifications system

### Key Relationships

- Users belong to Companies (for employers)
- Jobs belong to Companies and are posted by Users
- Applications connect Jobs, Applicants, and Companies
- Requirements belong to Companies and are created by Users
- Resumes, WorkExperience, and Education belong to Users

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with nodemon

# Database
npm run db:create        # Create database
npm run db:drop          # Drop database
npm run db:migrate       # Run migrations
npm run db:migrate:undo  # Undo last migration
npm run db:seed          # Seed database
npm run db:seed:undo     # Undo seeding

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode

# Production
npm start                # Start production server
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh JWT token

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Delete user

### Company Endpoints

- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Job Endpoints

- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create job posting
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/apply` - Apply for job

### Requirement Endpoints

- `GET /api/requirements` - List requirements
- `POST /api/requirements` - Create requirement
- `GET /api/requirements/:id` - Get requirement details
- `PUT /api/requirements/:id` - Update requirement
- `DELETE /api/requirements/:id` - Delete requirement

### Application Endpoints

- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Withdraw application

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 Project Structure

```
server/
├── config/                 # Configuration files
│   ├── database.js        # Database configuration
│   └── sequelize.js       # Sequelize instance
├── models/                # Database models
│   ├── User.js           # User model
│   ├── Company.js        # Company model
│   ├── Job.js            # Job model
│   ├── Requirement.js    # Requirement model
│   ├── Application.js    # Application model
│   ├── Resume.js         # Resume model
│   ├── WorkExperience.js # Work experience model
│   ├── Education.js      # Education model
│   ├── Notification.js   # Notification model
│   └── index.js          # Model associations
├── controller/            # Route controllers
├── routes/               # API routes
├── middleware/           # Custom middleware
├── services/             # Business logic
├── utils/                # Utility functions
├── scripts/              # Database scripts
│   └── init-db.js       # Database initialization
├── tests/                # Test files
├── .sequelizerc          # Sequelize CLI config
├── package.json          # Dependencies
└── README.md            # This file
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --grep "User"
```

## 🚀 Deployment

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- Database credentials
- JWT secret
- API keys for external services
- CORS origins
- Rate limiting settings

### Database Migration

```bash
# Run migrations in production
NODE_ENV=production npm run db:migrate
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Database Migrations

To create a new migration:

```bash
npx sequelize-cli migration:generate --name migration-name
```

To run migrations:

```bash
npm run db:migrate
```

To undo migrations:

```bash
npm run db:migrate:undo
```

## 🌱 Seeding Data

To create seeders:

```bash
npx sequelize-cli seed:generate --name seeder-name
```

To run seeders:

```bash
npm run db:seed
```

To undo seeders:

```bash
npm run db:seed:undo
```

## 📈 Monitoring

The application includes:

- Request logging with Morgan
- Error tracking with Winston
- Performance monitoring
- Health check endpoints

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection
- Helmet.js security headers 