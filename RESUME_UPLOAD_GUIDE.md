# Resume Upload System - Implementation Guide

## Overview

This guide documents the comprehensive resume upload and management system implemented for jobseekers in the JobPortal application. The system provides secure file upload, storage, and management capabilities with full integration into the jobseeker dashboard.

## 🚀 Features Implemented

### Backend Features
- **Secure File Upload**: Multer-based file upload with validation
- **File Type Validation**: Supports PDF, DOC, and DOCX formats
- **File Size Limits**: 5MB maximum file size
- **Database Storage**: Resume metadata stored in PostgreSQL
- **User Authentication**: JWT-based authentication required
- **Default Resume Management**: Automatic default resume setting
- **Download Functionality**: Secure file download with tracking
- **Statistics Tracking**: Views and downloads counting
- **File Organization**: Organized storage in uploads directory

### Frontend Features
- **Dashboard Integration**: Resume management card in jobseeker dashboard
- **Dedicated Resume Page**: Full resume management interface
- **Account Settings**: Comprehensive account page with resume tab
- **Upload Modal**: User-friendly upload interface with validation
- **File Validation**: Client-side file type and size validation
- **Progress Feedback**: Upload progress indicators and success messages
- **Resume Statistics**: Dashboard showing resume analytics
- **Download Functionality**: One-click resume downloads

## 📁 File Structure

```
client/
├── app/
│   ├── dashboard/page.tsx          # Main dashboard with resume card
│   ├── account/page.tsx            # Account settings with resume tab
│   └── resumes/page.tsx            # Dedicated resume management page
├── components/
│   └── resume-management.tsx       # Reusable resume management component
└── lib/
    └── api.ts                      # API service with resume endpoints

server/
├── routes/
│   └── user.js                     # Resume upload and management endpoints
├── models/
│   └── Resume.js                   # Resume database model
├── migrations/
│   └── 20250810113805-resumes.js   # Database migration for resumes table
└── uploads/
    └── resumes/                    # File storage directory
```

## 🔧 Backend Implementation

### Database Schema

The `resumes` table includes:
- `id`: UUID primary key
- `user_id`: Foreign key to users table
- `title`: Resume title
- `summary`: Resume summary/description
- `is_default`: Boolean for default resume
- `is_public`: Boolean for public visibility
- `views`: View count
- `downloads`: Download count
- `metadata`: JSONB field for file metadata
- `last_updated`: Timestamp

### API Endpoints

#### 1. Upload Resume
```http
POST /user/resumes/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- resume: File (PDF, DOC, DOCX, max 5MB)
- title: String (optional)
- description: String (optional)
```

#### 2. Get Resumes
```http
GET /user/resumes
Authorization: Bearer <token>
```

#### 3. Get Resume Statistics
```http
GET /user/resumes/stats
Authorization: Bearer <token>
```

#### 4. Download Resume
```http
GET /user/resumes/:id/download
Authorization: Bearer <token>
```

#### 5. Set Default Resume
```http
PUT /user/resumes/:id/set-default
Authorization: Bearer <token>
```

#### 6. Delete Resume
```http
DELETE /user/resumes/:id
Authorization: Bearer <token>
```

### File Upload Configuration

```javascript
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/resumes',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});
```

## 🎨 Frontend Implementation

### Dashboard Integration

The resume management is integrated into the jobseeker dashboard with:
- Resume overview card showing recent resumes
- Quick upload button
- Download functionality
- Default resume indicators
- Link to full resume management page

### Account Settings Page

A comprehensive account settings page includes:
- Profile information
- Resume management tab
- Settings and preferences
- Security settings
- Resume statistics

### Resume Management Component

A reusable component that provides:
- Resume listing with metadata
- Upload functionality with validation
- Download, set default, and delete actions
- File type icons and size display
- Upload progress indicators

## 🔒 Security Features

### File Upload Security
- File type validation (whitelist approach)
- File size limits
- Secure file naming with unique suffixes
- Authentication required for all operations
- File storage outside web root

### Data Protection
- JWT authentication for all endpoints
- User-specific file access
- Input validation and sanitization
- SQL injection prevention through Sequelize ORM

## 📊 Analytics and Tracking

### Resume Statistics
- Total resumes count
- Total views across all resumes
- Total downloads across all resumes
- Recent resume activity
- Default resume tracking

### User Experience Metrics
- Upload success/failure rates
- File type distribution
- File size statistics
- User engagement metrics

## 🚀 Usage Instructions

### For Jobseekers

1. **Access Resume Management**:
   - Go to Dashboard → Resume Management card
   - Or navigate to Account Settings → Resumes tab
   - Or visit the dedicated Resumes page

2. **Upload Resume**:
   - Click "Upload Resume" button
   - Select PDF, DOC, or DOCX file (max 5MB)
   - Add optional title and description
   - First upload becomes default resume

3. **Manage Resumes**:
   - View all uploaded resumes
   - Set default resume
   - Download resumes
   - Delete unwanted resumes
   - View resume statistics

### For Developers

1. **Setup**:
   ```bash
   # Run database migrations
   npm run migrate
   
   # Test backend functionality
   node test-resume-upload.js
   ```

2. **Testing**:
   - Use the test script to verify backend setup
   - Test file upload with different file types
   - Verify authentication requirements
   - Check file storage and retrieval

## 🔧 Configuration

### Environment Variables

```env
# File upload settings
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads/resumes

# Database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobportal_dev
```

### File Storage

Files are stored in `server/uploads/resumes/` with the following structure:
```
uploads/
└── resumes/
    ├── resume-1234567890-123456789.pdf
    ├── resume-1234567891-123456790.docx
    └── resume-1234567892-123456791.doc
```

## 🐛 Troubleshooting

### Common Issues

1. **Upload Fails**:
   - Check file type (PDF, DOC, DOCX only)
   - Verify file size (max 5MB)
   - Ensure user is authenticated
   - Check uploads directory permissions

2. **Database Errors**:
   - Run migrations: `npm run migrate`
   - Check database connection
   - Verify Resume model configuration

3. **File Not Found**:
   - Check file path in uploads directory
   - Verify file permissions
   - Check metadata storage

### Debug Steps

1. Check server logs for error messages
2. Verify file upload directory exists
3. Test database connection
4. Check authentication token
5. Validate file format and size

## 📈 Future Enhancements

### Planned Features
- Resume parsing and data extraction
- Resume templates and builder
- Version control for resumes
- Resume sharing and collaboration
- Advanced analytics and insights
- Integration with job applications
- Resume optimization suggestions

### Technical Improvements
- Cloud storage integration (AWS S3, Google Cloud)
- File compression and optimization
- Advanced file validation
- Resume preview functionality
- Batch upload capabilities
- Resume comparison tools

## 📝 API Documentation

For detailed API documentation, see the individual endpoint implementations in `server/routes/user.js`.

## 🤝 Contributing

When contributing to the resume upload system:

1. Follow the existing code structure
2. Add proper error handling
3. Include file validation
4. Update tests and documentation
5. Follow security best practices

---

**Note**: This implementation provides a robust foundation for resume management in the JobPortal application, with room for future enhancements and scalability.
