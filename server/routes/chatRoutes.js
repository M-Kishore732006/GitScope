const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/chatUploadMiddleware');
const {
  getEligibleContacts,
  getConversations,
  getGlobalConversation,
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
} = require('../controllers/chatController');

// All chat routes are protected
router.use(protect);

// Contacts & Conversations
router.get('/contacts', getEligibleContacts);
router.get('/conversations', getConversations);
router.get('/conversations/global', getGlobalConversation);
router.post('/conversations/private', getOrCreatePrivateConversation);
router.post('/conversations/group', createGroupConversation);

// Messages
router.get('/conversations/:id/messages', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);
router.delete('/messages/:id', deleteMessage);
router.post('/conversations/:id/read', markConversationAsRead);
router.post('/conversations/:id/leave', leaveGroup);

// Attachments
router.post('/upload', upload.single('file'), uploadAttachment);
router.get('/attachments/:filename', downloadAttachment);

// Badges
router.get('/unread-count', getTotalUnreadCount);

module.exports = router;
