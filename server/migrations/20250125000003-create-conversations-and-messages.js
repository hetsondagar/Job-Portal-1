'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔄 Creating conversations and messages tables...');

      // Create conversations table first (referenced by messages)
      await queryInterface.createTable('conversations', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        participant1Id: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'participant1_id',
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        participant2Id: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'participant2_id',
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        jobApplicationId: {
          type: Sequelize.UUID,
          allowNull: true,
          field: 'job_application_id',
          references: {
            model: 'job_applications',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        jobId: {
          type: Sequelize.UUID,
          allowNull: true,
          field: 'job_id',
          references: {
            model: 'jobs',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        conversationType: {
          type: Sequelize.ENUM('general', 'job_application', 'interview', 'support'),
          allowNull: false,
          defaultValue: 'general',
          field: 'conversation_type'
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        lastMessageId: {
          type: Sequelize.UUID,
          allowNull: true,
          field: 'last_message_id'
          // Note: Foreign key will be added after messages table is created
        },
        lastMessageAt: {
          type: Sequelize.DATE,
          allowNull: true,
          field: 'last_message_at'
        },
        unreadCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          field: 'unread_count'
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          field: 'is_active'
        },
        isArchived: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          field: 'is_archived'
        },
        archivedBy: {
          type: Sequelize.UUID,
          allowNull: true,
          field: 'archived_by',
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        archivedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          field: 'archived_at'
        },
        metadata: {
          type: Sequelize.JSONB,
          defaultValue: {}
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      console.log('✅ Conversations table created');

      // Create messages table
      await queryInterface.createTable('messages', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        conversationId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'conversation_id',
          references: {
            model: 'conversations',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        senderId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'sender_id',
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        receiverId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'receiver_id',
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        messageType: {
          type: Sequelize.ENUM('text', 'image', 'file', 'system', 'notification'),
          allowNull: false,
          defaultValue: 'text',
          field: 'message_type'
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
          defaultValue: false,
          field: 'is_read'
        },
        readAt: {
          type: Sequelize.DATE,
          allowNull: true,
          field: 'read_at'
        },
        isDelivered: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          field: 'is_delivered'
        },
        deliveredAt: {
          type: Sequelize.DATE,
          allowNull: true,
          field: 'delivered_at'
        },
        isEdited: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          field: 'is_edited'
        },
        editedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          field: 'edited_at'
        },
        replyToMessageId: {
          type: Sequelize.UUID,
          allowNull: true,
          field: 'reply_to_message_id',
          references: {
            model: 'messages',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        metadata: {
          type: Sequelize.JSONB,
          defaultValue: {}
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      console.log('✅ Messages table created');

      // Now add the foreign key constraint for lastMessageId in conversations
      await queryInterface.addConstraint('conversations', {
        fields: ['last_message_id'],
        type: 'foreign key',
        name: 'conversations_last_message_fkey',
        references: {
          table: 'messages',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });

      console.log('✅ Added foreign key constraint for last_message_id');

      // Create indexes
      await queryInterface.addIndex('conversations', ['participant1_id']);
      await queryInterface.addIndex('conversations', ['participant2_id']);
      await queryInterface.addIndex('conversations', ['job_application_id']);
      await queryInterface.addIndex('conversations', ['job_id']);
      await queryInterface.addIndex('conversations', ['last_message_at']);
      await queryInterface.addIndex('conversations', ['is_active']);

      await queryInterface.addIndex('messages', ['conversation_id']);
      await queryInterface.addIndex('messages', ['sender_id']);
      await queryInterface.addIndex('messages', ['receiver_id']);
      await queryInterface.addIndex('messages', ['is_read']);
      await queryInterface.addIndex('messages', ['created_at']);
      await queryInterface.addIndex('messages', ['reply_to_message_id']);

      console.log('✅ Conversations and messages tables created successfully');
    } catch (error) {
      console.error('⚠️ Error creating conversations and messages tables:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Drop tables in reverse order
      await queryInterface.dropTable('messages');
      await queryInterface.dropTable('conversations');
      
      // Drop enums
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_conversations_conversationType";');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_messageType";');
      
      console.log('✅ Conversations and messages tables dropped');
    } catch (error) {
      console.error('⚠️ Error dropping conversations and messages tables:', error.message);
      throw error;
    }
  }
};
