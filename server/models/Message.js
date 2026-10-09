const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  content: {
    type: String,
    trim: true,
    default: ''
  },
  file: {
    filename: { type: String, default: '' },
    storedName: { type: String, default: '' },
    path: { type: String, default: '' },
    mimetype: { type: String, default: '' },
    size: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  deliveredTo: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveredAt: { type: Date, default: Date.now }
  }],
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  clientTempId: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ conversation: 1, _id: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
