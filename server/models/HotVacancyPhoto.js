'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HotVacancyPhoto = sequelize.define('HotVacancyPhoto', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    hotVacancyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hot_vacancies',
        key: 'id'
      }
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    altText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'HotVacancyPhoto',
    tableName: 'hot_vacancy_photos',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        fields: ['hotVacancyId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['isPrimary']
      },
      {
        fields: ['displayOrder']
      }
    ],
    hooks: {
      beforeCreate: async (photo) => {
        // Ensure only one primary photo per hot vacancy
        if (photo.isPrimary) {
          await HotVacancyPhoto.update(
            { isPrimary: false },
            { 
              where: { 
                hotVacancyId: photo.hotVacancyId,
                isPrimary: true 
              } 
            }
          );
        }
      },
      beforeUpdate: async (photo) => {
        // Ensure only one primary photo per hot vacancy
        if (photo.changed('isPrimary') && photo.isPrimary) {
          await HotVacancyPhoto.update(
            { isPrimary: false },
            { 
              where: { 
                hotVacancyId: photo.hotVacancyId,
                isPrimary: true,
                id: { [sequelize.Sequelize.Op.ne]: photo.id }
              } 
            }
          );
        }
      }
    }
  });

module.exports = HotVacancyPhoto;
