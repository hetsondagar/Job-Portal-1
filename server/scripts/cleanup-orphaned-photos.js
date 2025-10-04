const { CompanyPhoto } = require('../config');
const fs = require('fs');
const path = require('path');

async function cleanupOrphanedPhotos() {
  try {
    console.log('🧹 Starting cleanup of orphaned company photos...');
    
    // Get all company photos from database
    const allPhotos = await CompanyPhoto.findAll();
    console.log(`📊 Found ${allPhotos.length} photos in database`);
    
    let orphanedCount = 0;
    let validCount = 0;
    
    for (const photo of allPhotos) {
      const filePath = path.join(__dirname, '..', 'uploads', 'company-photos', photo.filename);
      
      if (fs.existsSync(filePath)) {
        validCount++;
        console.log(`✅ Photo exists: ${photo.filename}`);
      } else {
        orphanedCount++;
        console.log(`❌ Orphaned photo: ${photo.filename}`);
        
        // Delete from database
        await photo.destroy();
        console.log(`🗑️ Deleted orphaned record for: ${photo.filename}`);
      }
    }
    
    console.log(`\n📈 Cleanup Summary:`);
    console.log(`✅ Valid photos: ${validCount}`);
    console.log(`❌ Orphaned photos removed: ${orphanedCount}`);
    console.log(`🧹 Cleanup completed successfully!`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupOrphanedPhotos()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupOrphanedPhotos };
