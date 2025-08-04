const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const JobBookmark = sequelize.define('JobBookmark', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  folder: {
    type: DataTypes.STRING(50),
    defaultValue: 'default',
    comment: 'Bookmark folder/category'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Personal notes about the job'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  isApplied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  appliedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reminderDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Reminder to apply or follow up'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional bookmark data'
  }
}, {
  tableName: 'job_bookmarks',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['userId', 'jobId'],
      unique: true,
      name: 'unique_user_job_bookmark'
    },
    {
      fields: ['userId', 'folder']
    },
    {
      fields: ['userId', 'priority']
    },
    {
      fields: ['reminderDate']
    }
  ],
  hooks: {
    afterCreate: async (bookmark) => {
      // Update job bookmark count
      const { Job } = require('../config/index');
      const job = await Job.findByPk(bookmark.jobId);
      if (job) {
        await job.increment('bookmarkCount');
      }
    },
    afterDestroy: async (bookmark) => {
      // Update job bookmark count
      const { Job } = require('../config/index');
      const job = await Job.findByPk(bookmark.jobId);
      if (job) {
        await job.decrement('bookmarkCount');
      }
    }
  }
});

// Instance methods
JobBookmark.prototype.isOverdue = function() {
  return this.reminderDate && this.reminderDate < new Date();
};

JobBookmark.prototype.daysUntilReminder = function() {
  if (!this.reminderDate) return null;
  const now = new Date();
  const diffTime = this.reminderDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

JobBookmark.prototype.getPriorityColor = function() {
  const colors = {
    low: 'green',
    medium: 'yellow',
    high: 'red'
  };
  return colors[this.priority] || 'gray';
};

module.exports = JobBookmark; 