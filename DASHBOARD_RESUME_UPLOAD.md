# Dashboard Resume Upload Integration

## Overview

t they are fetched in thisThis document details the integration of resume upload functionality into the job seeker dashboard with multiple access points and a dedicated resume display section. The implementation provides a seamless user experience for managing resumes with both upload and display capabilities.

## 🎯 Integration Points

### 1. Account Actions Section
The resume upload functionality is available in the Account Actions section:
- **Upload Resume Button**: Direct access to resume upload functionality
- **Consistent Placement**: Located with other account management actions
- **Easy Access**: Always visible for quick resume uploads

### 2. Dashboard "My Resumes" Card
The "My Resumes" card in Quick Actions provides:
- **Dynamic Resume Count**: Shows current number of uploaded resumes
- **Upload Button**: Alternative access to resume upload functionality
- **View All Button**: Links to the dedicated resumes page (when resumes exist)
- **Click Navigation**: Clicking anywhere on the card navigates to the resumes page

### 3. Resume Display Section
A dedicated section on the dashboard shows uploaded resumes:
- **Resume List**: Displays up to 3 most recent resumes
- **Resume Details**: Shows title, default status, and last updated date
- **Download Functionality**: Direct download buttons for each resume
- **View All Link**: Links to full resume management page when more than 3 resumes exist

### Key Features

1. **Multiple Access Points**: Upload functionality available in both Account Actions and My Resumes card
2. **Resume Display**: Dedicated section showing uploaded resumes with download capability
3. **Real-time Updates**: Resume count and display updates automatically after upload
4. **User-friendly Interface**: Clear visual feedback and intuitive controls
5. **Responsive Design**: Works across all device sizes

## 🔧 Backend Implementation

### API Endpoints

All backend endpoints are already implemented and ready for dashboard integration:

#### 1. Resume Upload
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

#### 3. Resume Statistics
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

### Database Schema

The `resumes` table includes all necessary fields for dashboard integration:

```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  summary TEXT,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  metadata JSONB,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Frontend Implementation

### 1. Account Actions Section

The upload button is integrated into the Account Actions section:

```typescript
<Button 
  variant="outline" 
  className="w-full justify-start h-auto p-3 flex-col items-start space-y-1 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
  onClick={handleUploadResume}
>
  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
  <span className="text-sm font-medium">Upload Resume</span>
</Button>
```

### 2. Dashboard "My Resumes" Card

The enhanced "My Resumes" card in Quick Actions:

```typescript
<Card 
  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full"
  onClick={() => router.push('/resumes')}
>
  <CardContent className="p-6 h-full flex flex-col justify-center">
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
        <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-base">My Resumes</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {resumes.length === 0 ? 'Upload your first resume' : `${resumes.length} resume${resumes.length !== 1 ? 's' : ''} uploaded`}
        </p>
      </div>
      <div className="flex space-x-2 mt-2">
        <Button 
          size="sm" 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleUploadResume()
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Upload className="w-3 h-3 mr-1" />
          Upload
        </Button>
        {resumes.length > 0 && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              router.push('/resumes')
            }}
          >
            View All
          </Button>
        )}
      </div>
    </div>
  </CardContent>
</Card>
```

### 3. Resume Display Section

A dedicated section showing uploaded resumes:

```typescript
{/* Resume Display Section */}
{resumes.length > 0 && (
  <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>My Resumes</span>
        </div>
        <Badge variant="outline" className="text-sm">
          {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {resumes.slice(0, 3).map((resume) => (
          <div key={resume.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {resume.title}
                  </p>
                  {resume.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Updated {new Date(resume.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadResume(resume.id)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {resumes.length > 3 && (
          <div className="flex justify-center pt-3 border-t border-slate-200 dark:border-slate-700">
            <Link href="/resumes">
              <Button variant="ghost" size="sm">
                View All {resumes.length} Resumes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)}
```

### Upload Modal

The upload modal provides a user-friendly interface for resume uploads:

```typescript
{/* Resume Upload Modal */}
{showResumeModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Upload Resume
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowResumeModal(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="resume-file">Select File</Label>
          <Input
            id="resume-file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            ref={fileInputRef}
            disabled={uploading}
          />
          <p className="text-sm text-slate-500 mt-1">
            Supported formats: PDF, DOC, DOCX (max 5MB)
          </p>
        </div>

        {uploading && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600 dark:text-blue-400">Uploading resume...</span>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-white mb-2">Upload Tips:</h4>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>• Use PDF format for best compatibility</li>
            <li>• Keep file size under 5MB</li>
            <li>• Ensure your resume is up-to-date</li>
            <li>• First upload will be set as default</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowResumeModal(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
```

### File Upload Handler

The file upload handler includes comprehensive validation and error handling:

```typescript
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  // File validation
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    toast.error('Invalid file type. Please upload PDF, DOC, or DOCX files only.')
    return
  }

  if (file.size > maxSize) {
    toast.error('File size too large. Please upload a file smaller than 5MB.')
    return
  }

  try {
    setUploading(true)
    const response = await apiService.uploadResumeFile(file)
    if (response.success) {
      toast.success('Resume uploaded successfully!')
      fetchResumes()
      setShowResumeModal(false)
      
      // If this is the first resume, show additional info
      if (resumes.length === 0) {
        toast.success('This resume has been set as your default resume.')
      }
    }
  } catch (error) {
    console.error('Error uploading resume:', error)
    toast.error('Failed to upload resume. Please try again.')
  } finally {
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
}
```

### Download Handler

The download handler for resume files:

```typescript
const handleDownloadResume = async (resumeId: string) => {
  try {
    await apiService.downloadResume(resumeId)
    toast.success('Resume downloaded successfully')
  } catch (error) {
    console.error('Error downloading resume:', error)
    toast.error('Failed to download resume')
  }
}
```

## 🔒 Security Features

### File Upload Security
- **File Type Validation**: Whitelist approach for PDF, DOC, DOCX
- **File Size Limits**: 5MB maximum file size
- **Secure File Naming**: Unique suffixes to prevent conflicts
- **Authentication Required**: JWT token validation for all operations
- **File Storage**: Files stored outside web root

### Data Protection
- **User-specific Access**: Users can only access their own resumes
- **Input Validation**: Comprehensive validation on frontend and backend
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **XSS Prevention**: Proper content type headers and sanitization

## 📊 User Experience Features

### Visual Feedback
- **Loading States**: Upload progress indicators
- **Success Messages**: Toast notifications for successful operations
- **Error Handling**: Clear error messages for failed operations
- **File Validation**: Immediate feedback for invalid files

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Dark mode support
- **Responsive Design**: Works on all device sizes

### Performance
- **Optimized Uploads**: Efficient file handling
- **Caching**: Resume data cached for faster loading
- **Lazy Loading**: Resume list loads on demand
- **Error Recovery**: Graceful handling of network issues

## 🚀 Usage Instructions

### For Job Seekers

1. **Access Resume Upload**:
   - **Option 1**: Go to Dashboard → Account Actions → "Upload Resume"
   - **Option 2**: Go to Dashboard → "My Resumes" card → "Upload" button

2. **Upload Process**:
   - Select PDF, DOC, or DOCX file (max 5MB)
   - File is automatically validated
   - Upload progress is shown
   - Success message appears when complete

3. **View Uploaded Resumes**:
   - **Dashboard Display**: Resumes appear in dedicated "My Resumes" section
   - **Download**: Click download button on any resume
   - **View All**: Click "View All" to see complete resume management page
   - **Resume Count**: Updates automatically in "My Resumes" card

### For Developers

1. **Testing Backend**:
   ```bash
   node test-dashboard-resume-upload.js
   ```

2. **API Testing**:
   ```bash
   # Test upload endpoint
   curl -X POST http://localhost:8000/api/user/resumes/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "resume=@/path/to/resume.pdf"
   ```

3. **Frontend Testing**:
   - Navigate to dashboard
   - Test upload functionality from both access points
   - Verify resume display section appears after upload
   - Check download functionality
   - Verify resume count updates

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

# JWT settings
JWT_SECRET=your-secret-key
```

### File Storage Structure

```
server/
└── uploads/
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

2. **Resume Display Not Updating**:
   - Check network connection
   - Verify API response
   - Check browser console for errors
   - Refresh page if needed

3. **Download Not Working**:
   - Check file exists in uploads directory
   - Verify file permissions
   - Check authentication token
   - Verify resume ID is correct

### Debug Steps

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Test file upload with different file types
4. Check database connection
5. Verify authentication token

## 📈 Future Enhancements

### Planned Features
- **Drag & Drop Upload**: Enhanced upload interface
- **Resume Preview**: Thumbnail previews in display section
- **Bulk Upload**: Multiple file upload support
- **Resume Templates**: Pre-built resume templates
- **Version Control**: Resume version history

### Technical Improvements
- **Cloud Storage**: AWS S3 integration
- **File Compression**: Automatic file optimization
- **Resume Parsing**: Extract data from uploaded resumes
- **Advanced Analytics**: Detailed upload statistics
- **Real-time Updates**: WebSocket integration

## 📝 API Response Examples

### Successful Upload
```json
{
  "success": true,
  "data": {
    "resumeId": "uuid-here",
    "filename": "resume-1234567890-123456789.pdf",
    "title": "Resume - John Doe",
    "isDefault": true,
    "fileSize": 245760,
    "originalName": "John_Doe_Resume.pdf"
  }
}
```

### Resume Statistics
```json
{
  "success": true,
  "data": {
    "totalResumes": 3,
    "hasDefaultResume": true,
    "defaultResumeId": "uuid-here",
    "recentResumes": [
      {
        "id": "uuid-here",
        "title": "Resume - John Doe",
        "lastUpdated": "2024-01-15T10:30:00Z",
        "isDefault": true,
        "views": 5,
        "downloads": 2
      }
    ],
    "totalViews": 15,
    "totalDownloads": 8
  }
}
```

---

**Note**: This dashboard integration provides multiple access points for resume upload and a dedicated display section, ensuring users can easily upload resumes and view their uploaded content directly on the dashboard.
