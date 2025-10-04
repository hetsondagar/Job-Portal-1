const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'job_application',
      'application_status',
      'job_recommendation',
      'company_update',
      'profile_view',
      'message',
      'system',
      'marketing',
      'interview_scheduled',
      'interview_cancelled',
      'interview_reminder',
      'candidate_shortlisted',
      'application_shortlisted',
      'preferred_job_posted'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  shortMessage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isEmailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isSMSSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPushSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  actionText: {
    type: DataTypes.STRING,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  hooks: {
    beforeCreate: async (notification) => {
      if (!notification.shortMessage) {
        notification.shortMessage = notification.message.substring(0, 200);
      }
    },
    beforeUpdate: async (notification) => {
      if (notification.changed('isRead') && notification.isRead) {
        notification.readAt = new Date();
      }
    }
  }
});

// Instance methods
Notification.prototype.getPriorityColor = function() {
  const priorityColors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  };
  return priorityColors[this.priority] || 'blue';
};

Notification.prototype.getTypeIcon = function() {
  const typeIcons = {
    job_application: 'briefcase',
    application_status: 'check-circle',
    job_recommendation: 'star',
    company_update: 'building',
    profile_view: 'eye',
    message: 'message-circle',
    system: 'settings',
    marketing: 'megaphone',
    candidate_shortlisted: 'user-check',
    application_shortlisted: 'check-circle',
    interview_scheduled: 'calendar',
    interview_cancelled: 'x-circle',
    interview_reminder: 'clock',
    preferred_job_posted: 'star'
  };
  return typeIcons[this.type] || 'bell';
};

Notification.prototype.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
};

Notification.prototype.getTimeAgo = function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffInMs = now - created;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
};

module.exports = Notification; 