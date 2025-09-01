const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  participant1Id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  participant2Id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  jobApplicationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'job_applications',
      key: 'id'
    }
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  conversationType: {
    type: DataTypes.ENUM('application', 'general', 'interview', 'support'),
    allowNull: false,
    defaultValue: 'general'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastMessageId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  unreadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  archivedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  archivedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'conversations',
  indexes: [
    {
      fields: ['participant1Id']
    },
    {
      fields: ['participant2Id']
    },
    {
      fields: ['jobApplicationId']
    },
    {
      fields: ['job_id']
    },
    {
      fields: ['lastMessageAt']
    },
    {
      fields: ['is_active']
    },
    {
      unique: true,
      fields: ['participant1Id', 'participant2Id', 'jobApplicationId']
    }
  ],
  hooks: {
    beforeCreate: (conversation) => {
      // Ensure participant1Id is always the smaller UUID for consistency
      if (conversation.participant1Id > conversation.participant2Id) {
        [conversation.participant1Id, conversation.participant2Id] = 
        [conversation.participant2Id, conversation.participant1Id];
      }
    }
  }
});

// Instance methods
Conversation.prototype.getOtherParticipant = function(userId) {
  return this.participant1Id === userId ? this.participant2Id : this.participant1Id;
};

Conversation.prototype.isParticipant = function(userId) {
  return this.participant1Id === userId || this.participant2Id === userId;
};

Conversation.prototype.markAsRead = function(userId) {
  this.unreadCount = 0;
  return this.save();
};

Conversation.prototype.archive = function(userId) {
  this.isArchived = true;
  this.archivedBy = userId;
  this.archivedAt = new Date();
  return this.save();
};

Conversation.prototype.unarchive = function() {
  this.isArchived = false;
  this.archivedBy = null;
  this.archivedAt = null;
  return this.save();
};

Conversation.prototype.getFormattedLastMessageTime = function() {
  if (!this.lastMessageAt) return null;
  
  const now = new Date();
  const messageTime = new Date(this.lastMessageAt);
  const diffInHours = (now - messageTime) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`;
  } else {
    return messageTime.toLocaleDateString();
  }
};

module.exports = Conversation; 