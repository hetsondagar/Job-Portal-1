'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HotVacancyPhoto = sequelize.define('HotVacancyPhoto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hot_vacancy_id: {
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
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'HotVacancyPhoto',
  tableName: 'hot_vacancy_photos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false
});

module.exports = HotVacancyPhoto;