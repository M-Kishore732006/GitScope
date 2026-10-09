const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { canCommunicate, validateGroupMembers, isStudentAssignedToStaff } = require('../utils/chatPermissions');
const { getIO } = require('../socket');

/**
 * 1. GET /api/chat/contacts
 * Returns list of eligible contacts based on role and assignment rules
 */
const getEligibleContacts = async (req, res) => {
  try {
    const user = req.user;
    let contacts = [];

    if (user.role === 'teacher' || user.role === 'staff') {
      // Staff can ONLY see Students assigned to them
      const staffUser = await User.findById(user._id).select('assignedStudents');
      const staffArray = (staffUser?.assignedStudents || []).map(id => id.toString());

      contacts = await User.find({
        role: 'student',
        status: 'active',
        $or: [
          { assignedStaff: user._id },
          { _id: { $in: staffArray }, assignedStaff: { $in: [null, undefined] } }
        ]
      }).select('fullName username rollNumber email department year section githubUsername githubLinked isOnline lastSeen');
    } else if (user.role === 'student') {
      // Student can ONLY see Staff authorized to communicate with them
      let assignedStaffIds = [];
      if (user.assignedStaff) {
        assignedStaffIds.push(user.assignedStaff);
      } else {
        const staffWithStudent = await User.find({
          role: { $in: ['teacher', 'staff'] },
          assignedStudents: user._id
        }).select('_id');
        assignedStaffIds = staffWithStudent.map(s => s._id);
      }

      contacts = await User.find({
        _id: { $in: assignedStaffIds },
        role: { $in: ['teacher', 'staff'] },
        status: 'active'
      }).select('fullName username email department isOnline lastSeen');
    } else if (user.role === 'admin') {
      // Admin has system-level access to all active staff and students
      contacts = await User.find({
        _id: { $ne: user._id },
        status: 'active'
      }).select('fullName username email role rollNumber department year section githubUsername githubLinked isOnline lastSeen');
    }

    // Attach existing conversation and lastMessage data to each contact
    const enrichedContacts = await Promise.all(
      contacts.map(async (contact) => {
        const contactObj = contact.toObject();

        const conv = await Conversation.findOne({
          type: 'private',
          participants: { $all: [user._id, contact._id], $size: 2 }
        }).populate({
          path: 'lastMessage',
          select: 'content messageType createdAt status sender'
        });

        if (conv) {
          contactObj.conversationId = conv._id;
          contactObj.lastMessage = conv.lastMessage;
          contactObj.lastMessageAt = conv.lastMessageAt;
          const unreadMap = conv.unreadCounts || new Map();
          contactObj.unreadCount = (unreadMap instanceof Map ? unreadMap.get(user._id.toString()) : unreadMap[user._id.toString()]) || 0;
        } else {
          contactObj.conversationId = null;
          contactObj.lastMessage = null;
          contactObj.lastMessageAt = null;
          contactObj.unreadCount = 0;
        }

        return contactObj;
      })
    );

    res.json(enrichedContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Failed to retrieve eligible contacts' });
  }
};

/**
 * 2. GET /api/chat/conversations
 * Returns active conversations for the current user
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'fullName username email role rollNumber department year section githubUsername githubLinked isOnline lastSeen')
      .populate('groupAdmin', 'fullName username email role')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'fullName username' }
      })
      .sort({ lastMessageAt: -1 });

    const formatted = conversations.map((conv) => {
      const convObj = conv.toObject();
      const unreadMap = conv.unreadCounts || {};
      const unread = (unreadMap instanceof Map ? unreadMap.get(userId) : unreadMap[userId]) || 0;
      convObj.unreadCount = unread;
      return convObj;
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to load conversations' });
  }
};

/**
 * 3. POST /api/chat/conversations/private
 * Start or get existing 1-on-1 private chat with strict assignment check
 */
const getOrCreatePrivateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Verify permission between current user and target recipient
    const permitted = await canCommunicate(req.user._id, recipientId);
    if (!permitted) {
      return res.status(403).json({
        message: 'Permission denied: Staff can only communicate with assigned students, and students with assigned staff.'
      });
    }

    // Find existing private conversation
    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [req.user._id, recipientId], $size: 2 }
    })
      .populate('participants', 'fullName username email role rollNumber department year section githubUsername githubLinked isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'fullName username' }
      });

    if (!conversation) {
      const unreadMap = new Map();
      unreadMap.set(req.user._id.toString(), 0);
      unreadMap.set(recipientId.toString(), 0);

      const created = await Conversation.create({
        type: 'private',
        participants: [req.user._id, recipientId],
        lastMessageAt: new Date(),
        unreadCounts: unreadMap
      });

      conversation = await Conversation.findById(created._id)
        .populate('participants', 'fullName username email role rollNumber department year section githubUsername githubLinked isOnline lastSeen');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error creating private conversation:', error);
    res.status(500).json({ message: 'Failed to initiate conversation' });
  }
};

/**
 * 4. POST /api/chat/conversations/group
 * Create a new group chat with assigned students
 */
const createGroupConversation = async (req, res) => {
  try {
    const { name, memberIds, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one student member' });
    }

    // Validate membership permissions (Staff can ONLY add assigned students)
    const validation = await validateGroupMembers(req.user._id, memberIds);
    if (!validation.valid) {
      return res.status(403).json({ message: validation.message });
    }

    // Ensure creator is included
    const allMembers = Array.from(new Set([req.user._id.toString(), ...memberIds]));

    const unreadMap = new Map();
    allMembers.forEach(id => unreadMap.set(id, 0));

    const group = await Conversation.create({
      type: 'group',
      name: name.trim(),
      description: (description || '').trim(),
      groupAdmin: req.user._id,
      participants: allMembers,
      lastMessageAt: new Date(),
      unreadCounts: unreadMap
    });

    const populatedGroup = await Conversation.findById(group._id)
      .populate('participants', 'fullName username email role rollNumber department year section githubUsername githubLinked isOnline lastSeen')
      .populate('groupAdmin', 'fullName username email role');

    // Notify all members in real-time
    try {
      const io = getIO();
      allMembers.forEach(memberId => {
        io.to(`user:${memberId}`).emit('group:created', populatedGroup);
      });
    } catch (e) {
      console.warn('Socket alert error:', e.message);
    }

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('Error creating group conversation:', error);
    res.status(500).json({ message: 'Failed to create group conversation' });
  }
};

/**
 * 5. GET /api/chat/conversations/:id/messages
 * Load message history with cursor/pagination & search
 */
const getConversationMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { before, search, limit = 50 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check membership
    const isMember = conversation.participants.some(p => p.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';
    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this conversation' });
    }

    const query = {
      conversation: conversationId
    };

    if (before) {
      query._id = { $lt: before };
    }

    if (search && search.trim()) {
      query.content = { $regex: search.trim(), $options: 'i' };
    }

    const maxLimit = Math.min(parseInt(limit, 10) || 50, 100);

    const messages = await Message.find(query)
      .sort({ _id: -1 }) // newest first for pagination slice
      .limit(maxLimit)
      .populate('sender', 'fullName username email role githubUsername')
      .populate('deliveredTo.user', 'fullName username')
      .populate('readBy.user', 'fullName username');

    // Return in chronological order
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to load messages' });
  }
};

/**
 * 6. POST /api/chat/conversations/:id/messages
 * Send message with persistence and real-time delivery
 */
const sendMessage = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { content, messageType = 'text', fileData, clientTempId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check membership
    const isMember = conversation.participants.some(p => p.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';
    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: 'Access denied: You cannot send messages to this conversation' });
    }

    // If private chat, verify ongoing assignment permission
    if (conversation.type === 'private' && !isAdmin) {
      const otherParticipantId = conversation.participants.find(
        p => p.toString() !== req.user._id.toString()
      );
      if (otherParticipantId) {
        const stillPermitted = await canCommunicate(req.user._id, otherParticipantId);
        if (!stillPermitted) {
          return res.status(403).json({
            message: 'Messaging restricted: Staff–Student assignment is no longer active.'
          });
        }
      }
    }

    // Sanitize message content to prevent XSS
    const sanitizedContent = (content || '')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();

    if (messageType === 'text' && !sanitizedContent) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      messageType,
      content: sanitizedContent,
      file: fileData || {},
      status: 'sent',
      deliveredTo: [{ user: req.user._id, deliveredAt: new Date() }],
      readBy: [{ user: req.user._id, readAt: new Date() }],
      clientTempId: clientTempId || ''
    });

    // Update conversation's last message & increment unread counts
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    if (!conversation.unreadCounts) {
      conversation.unreadCounts = new Map();
    }

    conversation.participants.forEach(p => {
      const pId = p.toString();
      if (pId !== req.user._id.toString()) {
        const currentCount = (conversation.unreadCounts instanceof Map 
          ? conversation.unreadCounts.get(pId) 
          : conversation.unreadCounts[pId]) || 0;

        if (conversation.unreadCounts instanceof Map) {
          conversation.unreadCounts.set(pId, currentCount + 1);
        } else {
          conversation.unreadCounts[pId] = currentCount + 1;
        }
      }
    });

    conversation.markModified('unreadCounts');
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName username email role githubUsername')
      .populate('deliveredTo.user', 'fullName username')
      .populate('readBy.user', 'fullName username');

    // Real-time broadcast
    try {
      const io = getIO();
      // Emit to conversation room
      io.to(`conversation:${conversation._id}`).emit('message:new', {
        message: populatedMessage,
        conversationId: conversation._id
      });

      // Also emit notification to each participant's individual room
      conversation.participants.forEach(p => {
        const pId = p.toString();
        if (pId !== req.user._id.toString()) {
          io.to(`user:${pId}`).emit('notification:new_message', {
            message: populatedMessage,
            conversation: {
              _id: conversation._id,
              type: conversation.type,
              name: conversation.type === 'group' ? conversation.name : req.user.fullName || req.user.username
            }
          });
        }
      });
    } catch (e) {
      console.warn('Real-time notification dispatch failed:', e.message);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

/**
 * 7. POST /api/chat/upload
 * Upload image or file attachment with validation
 */
const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file was rejected' });
    }

    const file = req.file;
    const isImage = file.mimetype.startsWith('image/');

    res.json({
      filename: file.originalname,
      storedName: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      isImage,
      url: `/api/chat/attachments/${file.filename}`
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Failed to upload attachment' });
  }
};

/**
 * 8. GET /api/chat/attachments/:filename
 * Secure download/view of attachment - restricted to authenticated conversation participants
 */
const downloadAttachment = async (req, res) => {
  try {
    const filename = req.params.filename;
    // Sanitize filename to prevent path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(__dirname, '..', 'uploads', 'chat', safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Attachment file not found' });
    }

    // Verify authorized conversation membership
    const message = await Message.findOne({ 'file.storedName': safeFilename });
    if (message) {
      const conv = await Conversation.findById(message.conversation);
      if (conv) {
        const isMember = conv.participants.some(p => p.toString() === req.user._id.toString());
        const isAdmin = req.user.role === 'admin';
        if (!isMember && !isAdmin) {
          return res.status(403).json({ message: 'Access denied to this file attachment' });
        }
      }
    }

    // Serve file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Attachment download error:', error);
    res.status(500).json({ message: 'Failed to download attachment' });
  }
};

/**
 * 9. POST /api/chat/conversations/:id/read
 * Mark conversation messages as read
 */
const markConversationAsRead = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Reset unread count for current user
    if (!conversation.unreadCounts) {
      conversation.unreadCounts = new Map();
    }
    if (conversation.unreadCounts instanceof Map) {
      conversation.unreadCounts.set(userId, 0);
    } else {
      conversation.unreadCounts[userId] = 0;
    }
    conversation.markModified('unreadCounts');
    await conversation.save();

    // Update unread messages
    const readAt = new Date();
    await Message.updateMany(
      {
        conversation: conversationId,
        'readBy.user': { $ne: req.user._id },
        sender: { $ne: req.user._id }
      },
      {
        $push: { readBy: { user: req.user._id, readAt } },
        $set: { status: 'read' }
      }
    );

    // Notify room
    try {
      const io = getIO();
      io.to(`conversation:${conversationId}`).emit('message:read_update', {
        conversationId,
        readerId: userId,
        readAt
      });
      io.to(`user:${userId}`).emit('conversation:unread_cleared', {
        conversationId
      });
    } catch (e) {
      console.warn('Socket alert error:', e.message);
    }

    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Error marking conversation read:', error);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

/**
 * 10. POST /api/chat/conversations/:id/leave
 * Leave a group chat
 */
const leaveGroup = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
      return res.status(400).json({ message: 'Group conversation not found' });
    }

    // If user is admin/creator and only staff member, handle
    conversation.participants = conversation.participants.filter(
      p => p.toString() !== userId
    );

    await conversation.save();

    try {
      const io = getIO();
      io.to(`conversation:${conversationId}`).emit('group:member_left', {
        conversationId,
        userId,
        userName: req.user.fullName || req.user.username
      });
    } catch (e) {
      console.warn('Socket alert error:', e.message);
    }

    res.json({ message: 'You have left the group conversation' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Failed to leave group' });
  }
};

/**
 * 11. GET /api/chat/unread-count
 * Returns total unread messages count for badges
 */
const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const conversations = await Conversation.find({ participants: req.user._id });

    let total = 0;
    conversations.forEach(c => {
      const counts = c.unreadCounts || {};
      const val = (counts instanceof Map ? counts.get(userId) : counts[userId]) || 0;
      total += val;
    });

    res.json({ totalUnread: total });
  } catch (error) {
    console.error('Error calculating unread count:', error);
    res.status(500).json({ totalUnread: 0 });
  }
};

/**
 * 12. DELETE /api/chat/messages/:id
 * Delete a sent message (sender or admin only)
 */
const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender or admin can delete
    if (message.sender.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own sent messages' });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    message.file = {};
    message.messageType = 'text';
    await message.save();

    // If this was the conversation's last message, update lastMessage
    const conversation = await Conversation.findById(message.conversation);
    if (conversation && conversation.lastMessage && conversation.lastMessage.toString() === messageId) {
      const prevMessage = await Message.findOne({
        conversation: conversation._id,
        _id: { $ne: message._id },
        isDeleted: false
      }).sort({ createdAt: -1 });

      conversation.lastMessage = prevMessage ? prevMessage._id : null;
      conversation.markModified('lastMessage');
      await conversation.save();
    }

    // Emit real-time deletion
    try {
      const io = getIO();
      io.to(`conversation:${message.conversation}`).emit('message:deleted', {
        messageId: message._id,
        conversationId: message.conversation,
        isDeleted: true
      });
    } catch (e) {
      console.warn('Socket alert error:', e.message);
    }

    res.json({ message: 'Message deleted successfully', messageId: message._id });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

module.exports = {
  getEligibleContacts,
  getConversations,
  getOrCreatePrivateConversation,
  createGroupConversation,
  getConversationMessages,
  sendMessage,
  uploadAttachment,
  downloadAttachment,
  markConversationAsRead,
  leaveGroup,
  getTotalUnreadCount,
  deleteMessage
};
