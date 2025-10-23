'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id'
        }
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      receiverId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      messageType: {
        type: Sequelize.ENUM('text', 'image', 'file', 'system', 'interview_invite', 'application_update'),
        allowNull: false,
        defaultValue: 'text'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      attachments: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isDelivered: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      editedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      replyToMessageId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'messages',
          key: 'id'
        }
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('messages', ['conversationId'], { name: 'messages_conversation_id' });
    await queryInterface.addIndex('messages', ['senderId'], { name: 'messages_sender_id' });
    await queryInterface.addIndex('messages', ['receiverId'], { name: 'messages_receiver_id' });
    await queryInterface.addIndex('messages', ['isRead'], { name: 'messages_is_read' });
    await queryInterface.addIndex('messages', ['created_at'], { name: 'messages_created_at' });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  }
};
