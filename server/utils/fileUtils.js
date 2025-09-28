const fs = require('fs');
const path = require('path');

/**
 * Enhanced file finder with comprehensive search and fallback mechanisms
 */
function findResumeFile(filename, metadata) {
  console.log('🔍 Enhanced file search for:', filename);
  console.log('🔍 Metadata:', metadata);
  
  const possiblePaths = [
    // Production paths (Render.com)
    path.join('/opt/render/project/src/uploads/resumes', filename),
    path.join('/opt/render/project/src/server/uploads/resumes', filename),
    path.join('/tmp/uploads/resumes', filename),
    // Development paths
    path.join(__dirname, '../uploads/resumes', filename),
    path.join(process.cwd(), 'server', 'uploads', 'resumes', filename),
    path.join(process.cwd(), 'uploads', 'resumes', filename),
    path.join('/tmp', 'uploads', 'resumes', filename),
    path.join('/var', 'tmp', 'uploads', 'resumes', filename),
    // Metadata-based paths
    metadata?.filePath ? path.join(process.cwd(), metadata.filePath.replace(/^\//, '')) : null,
    metadata?.filePath ? path.join('/', metadata.filePath.replace(/^\//, '')) : null,
    // Direct metadata filePath
    metadata?.filePath ? metadata.filePath : null
  ].filter(Boolean);

  console.log('🔍 Trying possible file paths:', possiblePaths);
  
  // Find the first existing file
  let filePath = possiblePaths.find(p => {
    try {
      return fs.existsSync(p);
    } catch (error) {
      console.log(`🔍 Error checking path ${p}:`, error.message);
      return false;
    }
  });
  
  if (!filePath) {
    console.log('❌ File does not exist in any of the expected locations');
    console.log('🔍 Checked paths:', possiblePaths);
    
    // Try to find the file by searching common directories
    const searchDirs = [
      path.join(__dirname, '../uploads'),
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd(), 'server', 'uploads'),
      '/tmp/uploads',
      '/var/tmp/uploads',
      '/opt/render/project/src/uploads',
      '/opt/render/project/src/server/uploads'
    ];
    
    for (const searchDir of searchDirs) {
      try {
        if (fs.existsSync(searchDir)) {
          console.log(`🔍 Searching in directory: ${searchDir}`);
          const files = fs.readdirSync(searchDir, { recursive: true });
          console.log(`🔍 Found ${files.length} items in ${searchDir}`);
          
          // Look for the specific filename
          const found = files.find(f => f.includes(filename));
          if (found) {
            filePath = path.join(searchDir, found);
            console.log(`✅ Found file at: ${filePath}`);
            break;
          }
        }
      } catch (error) {
        console.log(`🔍 Could not search in ${searchDir}:`, error.message);
      }
    }
  }
  
  if (!filePath) {
    console.log('❌ File not found after comprehensive search');
    // Log available files for debugging
    const debugDirs = [
      path.join(__dirname, '../uploads'),
      path.join(process.cwd(), 'uploads'),
      '/tmp/uploads'
    ];
    
    for (const debugDir of debugDirs) {
      try {
        if (fs.existsSync(debugDir)) {
          const files = fs.readdirSync(debugDir, { recursive: true });
          console.log(`🔍 Available files in ${debugDir}:`, files.slice(0, 10)); // Show first 10 files
        }
      } catch (error) {
        console.log(`🔍 Could not list files in ${debugDir}:`, error.message);
      }
    }
  }
  
  return filePath;
}

/**
 * Handle missing file gracefully with appropriate error response
 */
function handleMissingFile(res, filename, metadata) {
  console.log('❌ File not found:', filename);
  
  // If we have a filePath in metadata, try to redirect to it
  if (metadata?.filePath) {
    console.log('🔄 Attempting redirect to metadata filePath:', metadata.filePath);
    return res.redirect(metadata.filePath);
  }
  
  // Return appropriate error response
  return res.status(404).json({
    success: false,
    message: 'Resume file not found on server. The file may have been lost during server restart. Please re-upload your resume.',
    code: 'FILE_NOT_FOUND',
    filename: filename,
    metadata: metadata
  });
}

module.exports = {
  findResumeFile,
  handleMissingFile
};
