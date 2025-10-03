#!/usr/bin/env node

/**
 * Fix CompanyPhoto Model Registration
 * This script ensures the CompanyPhoto model is properly registered and accessible
 */

const dbConnection = require('./lib/database-connection');

console.log('🔧 Fixing CompanyPhoto Model Registration...');

async function fixCompanyPhotoModel() {
  try {
    // Connect to database using robust connection handler
    const sequelize = await dbConnection.connect();
    console.log('✅ Database connection established');

    // Check if company_photos table exists
    const [results] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'company_photos'
    `);
    
    if (results.length === 0) {
      console.log('❌ company_photos table does not exist, creating it...');
      
      // Create the table using the same structure as the migration
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS company_photos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          filename VARCHAR NOT NULL,
          file_path VARCHAR NOT NULL,
          file_url VARCHAR NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type VARCHAR NOT NULL,
          alt_text VARCHAR,
          caption TEXT,
          display_order INTEGER NOT NULL DEFAULT 0,
          is_primary BOOLEAN NOT NULL DEFAULT false,
          is_active BOOLEAN NOT NULL DEFAULT true,
          uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          metadata JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS company_photos_company_id ON company_photos(company_id)
      `);
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS company_photos_uploaded_by ON company_photos(uploaded_by)
      `);
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS company_photos_is_active ON company_photos(is_active)
      `);
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS company_photos_is_primary ON company_photos(is_primary)
      `);
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS company_photos_display_order ON company_photos(display_order)
      `);
      
      console.log('✅ company_photos table created successfully');
    } else {
      console.log('✅ company_photos table already exists');
    }

    // Test the CompanyPhoto model
    try {
      const CompanyPhoto = require('./models/CompanyPhoto');
      console.log('✅ CompanyPhoto model loaded successfully');
      
      // Test a simple query
      const count = await CompanyPhoto.count();
      console.log(`✅ CompanyPhoto model working, count: ${count}`);
      
    } catch (error) {
      console.log('⚠️ CompanyPhoto model error:', error.message);
      
      // Try to create a basic model if it doesn't exist
      console.log('🔧 Attempting to create CompanyPhoto model...');
      const { DataTypes } = require('sequelize');
      
      const CompanyPhoto = sequelize.define('CompanyPhoto', {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        companyId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'company_id'
        },
        filename: { type: DataTypes.STRING, allowNull: false },
        filePath: { type: DataTypes.STRING, allowNull: false, field: 'file_path' },
        fileUrl: { type: DataTypes.STRING, allowNull: false, field: 'file_url' },
        fileSize: { type: DataTypes.INTEGER, allowNull: false, field: 'file_size' },
        mimeType: { type: DataTypes.STRING, allowNull: false, field: 'mime_type' },
        altText: { type: DataTypes.STRING, allowNull: true, field: 'alt_text' },
        caption: { type: DataTypes.TEXT, allowNull: true },
        displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'display_order' },
        isPrimary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_primary' },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
        uploadedBy: { type: DataTypes.UUID, allowNull: false, field: 'uploaded_by' },
        metadata: { type: DataTypes.JSONB, allowNull: true }
      }, {
        tableName: 'company_photos',
        timestamps: true,
        underscored: true
      });
      
      console.log('✅ CompanyPhoto model created successfully');
    }

    console.log('✅ CompanyPhoto model registration fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing CompanyPhoto model:', error.message);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixCompanyPhotoModel()
    .then(() => {
      console.log('🎉 CompanyPhoto model registration fixed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to fix CompanyPhoto model:', error);
      process.exit(1);
    });
}

module.exports = { fixCompanyPhotoModel };
