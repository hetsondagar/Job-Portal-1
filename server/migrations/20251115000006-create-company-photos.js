'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_photos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'companies', key: 'id' },
        onDelete: 'CASCADE'
      },
      filename: { type: Sequelize.STRING, allowNull: false },
      file_path: { type: Sequelize.STRING, allowNull: false },
      file_url: { type: Sequelize.STRING, allowNull: false },
      file_size: { type: Sequelize.INTEGER, allowNull: false },
      mime_type: { type: Sequelize.STRING, allowNull: false },
      alt_text: { type: Sequelize.STRING },
      caption: { type: Sequelize.TEXT },
      display_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_primary: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      uploaded_by: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      metadata: { type: Sequelize.JSONB },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    try { await queryInterface.addIndex('company_photos', ['company_id'], { name: 'company_photos_company_id' }); } catch (e) {}
    try { await queryInterface.addIndex('company_photos', ['company_id', 'display_order'], { name: 'company_photos_company_id_display_order' }); } catch (e) {}
    try { await queryInterface.addIndex('company_photos', ['company_id', 'is_primary'], { name: 'company_photos_company_id_is_primary' }); } catch (e) {}
    try { await queryInterface.addIndex('company_photos', ['is_active'], { name: 'company_photos_is_active' }); } catch (e) {}
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('company_photos');
  }
};



