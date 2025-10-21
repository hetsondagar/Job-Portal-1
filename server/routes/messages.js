'use strict';

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Company = require('../models/Company');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // Tokens elsewhere use id
    const uid = decoded.id || decoded.userId;
    const User = require('../models/User');
    const user = await User.findByPk(uid);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Get all conversations for a user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ],
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'participant1',
          attributes: ['id', 'first_name', 'last_name', 'email', 'user_type', 'company_id']
        },
        {
          model: User,
          as: 'participant2',
          attributes: ['id', 'first_name', 'last_name', 'email', 'user_type', 'company_id']
        }
      ],
      order: [['lastMessageAt', 'DESC']]
    });

    // Transform conversations to include other participant info
    const transformedConversations = conversations.map(conv => {
      const otherParticipant = conv.participant1Id === req.user.id ? conv.participant2 : conv.participant1;
      const isUnread = conv.unreadCount > 0;
      
      return {
        id: conv.id,
        title: conv.title,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount,
        isUnread,
        otherParticipant: {
          id: otherParticipant.id,
          name: `${otherParticipant.first_name} ${otherParticipant.last_name}`,
          email: otherParticipant.email,
          userType: otherParticipant.user_type,
          company: otherParticipant.company_id ? { id: otherParticipant.company_id } : null
        },
        lastMessage: null, // We'll fetch this separately if needed
        metadata: conv.metadata
      };
    });

    res.json({
      success: true,
      data: transformedConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// List company coworkers (recruiters/admins in same company) to start chats
router.get('/company-users', authenticateToken, async (req, res) => {
  try {
    if (!req.user.company_id) {
      return res.json({ success: true, data: [] })
    }
    const coworkers = await User.findAll({
      where: {
        company_id: req.user.company_id,
        id: { [Op.ne]: req.user.id },
        user_type: { [Op.in]: ['employer', 'admin'] }
      },
      attributes: ['id', 'first_name', 'last_name', 'email', 'user_type']
    })
    return res.json({ success: true, data: coworkers.map(u => ({
      id: u.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
      email: u.email,
      userType: u.user_type
    })) })
  } catch (error) {
    console.error('Error listing company users:', error)
    return res.status(500).json({ success: false, message: 'Failed to list users' })
  }
})

// Start (or fetch existing) conversation with a coworker in same company
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { receiverId, title } = req.body || {}
    if (!receiverId) return res.status(400).json({ success: false, message: 'receiverId is required' })

    // Validate coworker and same company
    const receiver = await User.findByPk(receiverId)
    if (!receiver) return res.status(404).json({ success: false, message: 'User not found' })
    if (!req.user.company_id || String(receiver.company_id) !== String(req.user.company_id)) {
      return res.status(403).json({ success: false, message: 'Users are not in the same company' })
    }

    // Normalize participants order as in model hook
    const p1 = req.user.id < receiverId ? req.user.id : receiverId
    const p2 = req.user.id < receiverId ? receiverId : req.user.id

    // Use raw SQL to avoid column name mapping issues
    const [rows] = await sequelize.query(
      'SELECT "id" FROM "conversations" WHERE "participant1Id" = :p1 AND "participant2Id" = :p2 AND "isActive" = true LIMIT 1;',
      { replacements: { p1, p2 }, type: sequelize.QueryTypes.SELECT }
    )
    if (rows && rows.id) {
      return res.json({ success: true, data: { id: rows.id } })
    }
    const uuid = require('uuid').v4()
    const [created] = await sequelize.query(
      'INSERT INTO "conversations" ("id","participant1Id","participant2Id","conversationType","title","isActive","created_at","updated_at") VALUES (:id,:p1,:p2,:type,:title,true, NOW(), NOW()) RETURNING "id";',
      { replacements: { id: uuid, p1, p2, type: 'general', title: title || null }, type: sequelize.QueryTypes.INSERT }
    )
    const createdId = created?.id || (Array.isArray(created) ? created[0]?.id : undefined)
    return res.json({ success: true, data: { id: createdId || uuid } })
  } catch (error) {
    console.error('Error starting conversation:', error)
    return res.status(500).json({ success: false, message: 'Failed to start conversation' })
  }
})

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant in conversation (raw SQL to honor camelCase columns)
    const [convRows] = await sequelize.query(
      'SELECT "id" FROM "conversations" WHERE "id" = :cid AND ("participant1Id" = :uid OR "participant2Id" = :uid) LIMIT 1;',
      { replacements: { cid: conversationId, uid: req.user.id }, type: sequelize.QueryTypes.SELECT }
    )

    if (!convRows || !convRows.id) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Get messages with pagination
    const offset = (page - 1) * limit;
    const messages = await Message.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'user_type', 'company_id']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Mark messages as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      { 
        where: { 
          conversationId, 
          receiverId: req.user.id,
          isRead: false 
        } 
      }
    );

    // Update conversation unread count (raw SQL)
    await sequelize.query('UPDATE "conversations" SET "unreadCount" = 0, "updated_at" = NOW() WHERE "id" = :cid', {
      replacements: { cid: conversationId },
      type: sequelize.QueryTypes.UPDATE
    })

    // Transform messages
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      messageType: msg.messageType,
      createdAt: msg.created_at,
      isRead: msg.isRead,
      isFromMe: msg.senderId === req.user.id,
      sender: {
        id: msg.sender.id,
        name: `${msg.sender.first_name} ${msg.sender.last_name}`,
        userType: msg.sender.user_type,
        company: msg.sender.company_id ? { id: msg.sender.company_id } : null
      },
      metadata: msg.metadata
    }));

    res.json({
      success: true,
      data: {
        messages: transformedMessages.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Message.count({ where: { conversationId } })
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text' } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify user is participant in conversation (raw SQL to honor camelCase columns)
    const [convRows] = await sequelize.query(
      'SELECT "id", "participant1Id", "participant2Id" FROM "conversations" WHERE "id" = :cid AND ("participant1Id" = :uid OR "participant2Id" = :uid) LIMIT 1;',
      { replacements: { cid: conversationId, uid: req.user.id }, type: sequelize.QueryTypes.SELECT }
    )

    if (!convRows || !convRows.id) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Determine receiver
    const receiverId = convRows.participant1Id === req.user.id ? convRows.participant2Id : convRows.participant1Id;

    // Create message
    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      receiverId,
      messageType,
      content: content.trim()
    });

    // Update conversation (raw SQL)
    await sequelize.query('UPDATE "conversations" SET "lastMessageId" = :mid, "lastMessageAt" = NOW(), "unreadCount" = COALESCE("unreadCount",0) + 1, "updated_at" = NOW() WHERE "id" = :cid', {
      replacements: { cid: conversationId, mid: message.id },
      type: sequelize.QueryTypes.UPDATE
    })

    res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.created_at,
        isFromMe: true,
        sender: {
          id: req.user.id,
          name: `${req.user.first_name} ${req.user.last_name}`,
          userType: req.user.user_type
        }
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Mark conversation as read
router.put('/conversations/:conversationId/read', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Mark all messages as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      { 
        where: { 
          conversationId, 
          receiverId: req.user.id,
          isRead: false 
        } 
      }
    );

    // Update conversation unread count
    await conversation.update({ unreadCount: 0 });

    res.json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark conversation as read'
    });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await Conversation.sum('unreadCount', {
      where: {
        [Op.or]: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ],
        isActive: true
      }
    });

    res.json({
      success: true,
      data: {
        unreadCount: unreadCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

module.exports = router;
