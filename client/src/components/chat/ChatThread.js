import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaPaperPlane, FaPaperclip, FaTimes, FaSearch, FaArrowLeft, 
  FaUsers, FaCheck, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, 
  FaFileArchive, FaDownload, FaSpinner, FaTrash, FaGlobe 
} from 'react-icons/fa';
import { BsCheckAll } from 'react-icons/bs';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import MediaLightboxModal from './MediaLightboxModal';

const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateDivider = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileIcon = (mimetype, filename = '') => {
  const ext = filename.split('.').pop().toLowerCase();
  if (mimetype?.includes('pdf') || ext === 'pdf') return <FaFilePdf className="text-danger fs-4" />;
  if (mimetype?.includes('word') || ext === 'docx' || ext === 'doc') return <FaFileWord className="text-primary fs-4" />;
  if (mimetype?.includes('sheet') || mimetype?.includes('excel') || ext === 'xlsx' || ext === 'xls') return <FaFileExcel className="text-success fs-4" />;
  if (mimetype?.includes('zip') || ext === 'zip') return <FaFileArchive className="text-warning fs-4" />;
  return <FaFileAlt className="text-secondary fs-4" />;
};

const ChatThread = ({
  conversation,
  currentUserId,
  onBack,
  onOpenGroupMembers,
  onlineUsers,
  socket,
  typingUser
}) => {
  const { fetchTotalUnread, clearUnreadForConversation } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [deleteTargetMessage, setDeleteTargetMessage] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const isGroup = conversation?.type === 'group';
  const isGlobal = conversation?.type === 'global';
  const otherParticipant = (!isGroup && !isGlobal)
    ? conversation?.participants?.find(p => String(p._id) !== String(currentUserId)) || {} 
    : null;

  const presence = otherParticipant ? onlineUsers[otherParticipant._id] : null;
  const isOnline = presence ? presence.isOnline : otherParticipant?.isOnline;
  const lastSeen = presence?.lastSeen || otherParticipant?.lastSeen;

  // Fetch conversation messages
  const fetchMessages = useCallback(async () => {
    if (!conversation?._id) return;
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const url = `/api/chat/conversations/${conversation._id}/messages${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setMessages(res.data);

      // Emit read receipts & persist to backend
      if (socket) {
        socket.emit('message:read', {
          conversationId: conversation._id
        });
      }
      axios.post(`/api/chat/conversations/${conversation._id}/read`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      }).then(() => {
        if (fetchTotalUnread) fetchTotalUnread();
        if (clearUnreadForConversation) clearUnreadForConversation(conversation._id);
      }).catch(() => {});
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversation?._id, searchQuery, socket, fetchTotalUnread, clearUnreadForConversation]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Listen to socket events for this conversation
  useEffect(() => {
    if (!socket || !conversation?._id) return;

    const handleNewMessage = ({ message, conversationId }) => {
      if (String(conversationId) === String(conversation._id)) {
        setMessages(prev => {
          // Deduplicate if already present
          if (prev.some(m => String(m._id) === String(message._id))) return prev;
          return [...prev, message];
        });

        // If received from someone else, acknowledge delivery and read
        const senderIdStr = String(message.sender?._id || message.sender || '');
        const currentUserIdStr = String(currentUserId || '');
        if (senderIdStr !== currentUserIdStr) {
          socket.emit('message:delivered', {
            messageId: message._id,
            conversationId: conversation._id
          });
          socket.emit('message:read', {
            conversationId: conversation._id,
            messageIds: [message._id]
          });
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          if (userInfo?.token) {
            axios.post(`/api/chat/conversations/${conversation._id}/read`, {}, {
              headers: { Authorization: `Bearer ${userInfo.token}` }
            }).then(() => {
              if (fetchTotalUnread) fetchTotalUnread();
              if (clearUnreadForConversation) clearUnreadForConversation(conversation._id);
            }).catch(() => {});
          }
        }
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(m => String(m._id) === String(messageId) ? {
        ...m,
        isDeleted: true,
        content: 'This message was deleted',
        file: {},
        messageType: 'text'
      } : m));
    };

    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages(prev => prev.map(m => String(m._id) === String(messageId) ? { ...m, status } : m));
    };

    const handleReadUpdate = ({ conversationId, readerId }) => {
      if (String(conversationId) === String(conversation._id)) {
        setMessages(prev => prev.map(m => {
          const isMyMsg = String(m.sender?._id || m.sender || '') === String(currentUserId || '');
          if (isMyMsg) {
            const currentReadBy = m.readBy || [];
            const alreadyRead = currentReadBy.some(r => String(r.user?._id || r.user || '') === String(readerId || ''));
            return {
              ...m,
              status: 'read',
              readBy: alreadyRead ? currentReadBy : [...currentReadBy, { user: readerId, readAt: new Date() }]
            };
          }
          return m;
        }));
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('message:status_update', handleStatusUpdate);
    socket.on('message:read_update', handleReadUpdate);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('message:status_update', handleStatusUpdate);
      socket.off('message:read_update', handleReadUpdate);
    };
  }, [socket, conversation?._id, currentUserId, fetchTotalUnread, clearUnreadForConversation]);

  // Handle message deletion confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTargetMessage) return;

    try {
      setDeleting(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await axios.delete(`/api/chat/messages/${deleteTargetMessage._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      // Update locally immediately
      setMessages(prev => prev.map(m => String(m._id) === String(deleteTargetMessage._id) ? {
        ...m,
        isDeleted: true,
        content: 'This message was deleted',
        file: {},
        messageType: 'text'
      } : m));

      setDeleteTargetMessage(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message');
    } finally {
      setDeleting(false);
    }
  };

  // Handle typing debounce
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (!socket || !conversation?._id) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing:start', { conversationId: conversation._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing:stop', { conversationId: conversation._id });
    }, 2500);
  };

  // Handle File Attachment Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);

    // If image, create thumbnail preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const content = inputText.trim();

    if (!content && !selectedFile) return;

    try {
      setUploading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      let fileData = null;
      let messageType = 'text';

      // If file attached, upload first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await axios.post('/api/chat/upload', formData, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        fileData = uploadRes.data;
        messageType = fileData.isImage ? 'image' : 'file';
      }

      // Stop typing
      if (socket && isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit('typing:stop', { conversationId: conversation._id });
      }

      // Post message
      await axios.post(`/api/chat/conversations/${conversation._id}/messages`, {
        content,
        messageType,
        fileData,
        clientTempId: `temp-${Date.now()}`
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      // Clear input & attachments
      setInputText('');
      handleCancelFile();
    } catch (err) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setUploading(false);
    }
  };

  // Keyboard Enter to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render receipt icon for sent messages
  const renderReceiptIcon = (message) => {
    if (message.status === 'sending') {
      return <FaSpinner className="spinner-border spinner-border-sm text-light" style={{ width: 10, height: 10 }} />;
    }

    const currentUserIdStr = String(currentUserId || '');
    const isRead = message.status === 'read' || 
                   (message.readBy && message.readBy.some(r => String(r.user?._id || r.user || '') !== currentUserIdStr));

    if (isRead) {
      return <BsCheckAll className="receipt-icon read" title="Read" style={{ color: '#38bdf8', fontSize: '1.05rem' }} />;
    }

    const isDelivered = message.status === 'delivered' || 
                        (message.deliveredTo && message.deliveredTo.some(d => String(d.user?._id || d.user || '') !== currentUserIdStr));

    if (isDelivered) {
      return <BsCheckAll className="receipt-icon delivered" title="Delivered" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem' }} />;
    }

    return <FaCheck className="receipt-icon sent" title="Sent" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.8rem' }} />;
  };

  return (
    <div className="chat-main">
      {/* Header */}
      <div className="chat-main-header">
        <div className="d-flex align-items-center gap-2">
          {/* Back Button on Mobile */}
          <button 
            className="btn btn-sm text-muted d-md-none p-1 border-0" 
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <FaArrowLeft />
          </button>

          <div className="avatar-wrapper">
            <div 
              className="chat-avatar"
              style={{
                width: 40,
                height: 40,
                background: isGlobal 
                  ? 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)' 
                  : isGroup 
                    ? '#4f46e5' 
                    : '#6d5ef5',
                fontSize: '0.9rem'
              }}
            >
              {isGlobal ? <FaGlobe /> : isGroup ? <FaUsers /> : (otherParticipant?.fullName || otherParticipant?.username || 'U').charAt(0).toUpperCase()}
            </div>
            {!isGroup && !isGlobal && (
              <div className={`presence-dot ${isOnline ? 'online' : 'offline'}`} />
            )}
          </div>

          <div>
            <div className="fw-bold text-main small lh-1 d-flex align-items-center gap-2">
              <span>{isGlobal ? (conversation.name || 'Chat to All') : isGroup ? conversation.name : (otherParticipant?.fullName || otherParticipant?.username)}</span>
              {isGlobal && (
                <span className="badge rounded-pill bg-info-subtle text-info border border-info-subtle" style={{ fontSize: '0.65rem' }}>
                  Public Channel
                </span>
              )}
            </div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
              {isGlobal ? (
                <span className="text-primary fw-medium">
                  Visible to all Students, Staff & Admins
                </span>
              ) : isGroup ? (
                <span 
                  className="cursor-pointer text-primary" 
                  onClick={onOpenGroupMembers}
                  style={{ cursor: 'pointer' }}
                >
                  {conversation.participants?.length || 0} members • View details
                </span>
              ) : isOnline ? (
                <span className="text-success fw-semibold">● Online</span>
              ) : lastSeen ? (
                <span>Last seen {new Date(lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              ) : (
                <span>Offline</span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="d-flex align-items-center gap-2">
          {showSearch ? (
            <div className="position-relative">
              <input 
                type="text" 
                className="form-control form-control-sm pe-4 py-1" 
                placeholder="Search thread..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '160px', fontSize: '0.8rem' }}
                autoFocus
              />
              <button 
                className="btn btn-sm text-muted position-absolute p-0 border-0" 
                style={{ right: 8, top: 4 }}
                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              >
                <FaTimes style={{ fontSize: '0.75rem' }} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-sm btn-light border rounded-circle shadow-sm p-2 text-muted" 
              onClick={() => setShowSearch(true)}
              title="Search messages"
            >
              <FaSearch style={{ fontSize: '0.8rem' }} />
            </button>
          )}

          {isGroup && (
            <button 
              className="btn btn-sm btn-outline-primary rounded-pill small px-3 py-1 fw-semibold"
              onClick={onOpenGroupMembers}
            >
              Members
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="chat-messages-area">
        {loading ? (
          <div className="text-center py-5 text-muted small">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>Loading messages...</div>
          </div>
        ) : messages.length > 0 ? (
          (() => {
            let lastDate = null;
            return messages.map((msg, index) => {
              const senderIdStr = String(msg.sender?._id || msg.sender || '');
              const currentUserIdStr = String(currentUserId || '');
              const isSentByMe = Boolean(senderIdStr && currentUserIdStr && senderIdStr === currentUserIdStr);
              const msgDate = new Date(msg.createdAt).toDateString();
              const showDateDivider = msgDate !== lastDate;
              lastDate = msgDate;

              return (
                <React.Fragment key={msg._id || index}>
                  {showDateDivider && (
                    <div className="chat-date-divider">
                      <span>{formatDateDivider(msg.createdAt)}</span>
                    </div>
                  )}

                  <div className={`message-row ${isSentByMe ? 'sent' : 'received'}`}>
                    <div className="message-bubble">
                      {/* Sender name and role in group or global chats if received */}
                      {(isGroup || isGlobal) && !isSentByMe && (
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <span className="fw-bold text-primary small" style={{ fontSize: '0.75rem' }}>
                            {msg.sender?.fullName || msg.sender?.username}
                          </span>
                          {msg.sender?.role && (
                            <span 
                              className={`badge rounded-pill ${
                                msg.sender.role === 'admin' 
                                  ? 'bg-danger-subtle text-danger border border-danger-subtle' 
                                  : msg.sender.role === 'teacher' || msg.sender.role === 'staff'
                                    ? 'bg-primary-subtle text-primary border border-primary-subtle'
                                    : 'bg-success-subtle text-success border border-success-subtle'
                              }`}
                              style={{ fontSize: '0.62rem', padding: '1px 5px' }}
                            >
                              {msg.sender.role === 'teacher' || msg.sender.role === 'staff' ? 'Staff' : msg.sender.role === 'admin' ? 'Admin' : 'Student'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message Content or Deleted Notice */}
                      {msg.isDeleted ? (
                        <div className="fst-italic opacity-75 d-flex align-items-center gap-1 small py-1">
                          <FaTrash style={{ fontSize: '0.72rem' }} /> This message was deleted
                        </div>
                      ) : (
                        <>
                          {/* Text content */}
                          {msg.content && (
                            <div>{msg.content}</div>
                          )}

                          {/* Image Attachment */}
                          {msg.messageType === 'image' && msg.file?.path && (
                            <div className="mt-1">
                              <img 
                                src={msg.file.path} 
                                alt={msg.file.filename || 'Attachment'}
                                className="chat-image-preview shadow-sm"
                                onClick={() => setLightboxImage({ url: msg.file.path, filename: msg.file.filename })}
                              />
                            </div>
                          )}

                          {/* Document Attachment */}
                          {msg.messageType === 'file' && msg.file?.path && (
                            <div className="attachment-card">
                              <div>
                                {getFileIcon(msg.file.mimetype, msg.file.filename)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="fw-semibold text-truncate small" style={{ maxWidth: '170px' }}>
                                  {msg.file.filename}
                                </div>
                                <div className="small opacity-75" style={{ fontSize: '0.7rem' }}>
                                  {formatFileSize(msg.file.size)}
                                </div>
                              </div>
                              <a 
                                href={msg.file.path} 
                                download={msg.file.filename}
                                className="btn btn-sm btn-light border p-1 rounded-circle"
                                target="_blank" 
                                rel="noreferrer"
                                title="Download file"
                              >
                                <FaDownload style={{ fontSize: '0.75rem' }} />
                              </a>
                            </div>
                          )}
                        </>
                      )}

                      {/* Meta: Time, Receipts, and Delete Button */}
                      <div className="message-meta d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-1">
                          <span>{formatMessageTime(msg.createdAt)}</span>
                          {isSentByMe && renderReceiptIcon(msg)}
                        </div>

                        {isSentByMe && !msg.isDeleted && (
                          <button
                            type="button"
                            className="btn-msg-delete border-0 p-0 ms-2"
                            onClick={() => setDeleteTargetMessage(msg)}
                            title="Delete message"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            });
          })()
        ) : (
          <div className="text-center py-5 px-3 text-muted my-auto">
            <div className="fs-1 opacity-30 mb-2">{isGlobal ? '📢' : '👋'}</div>
            <h6 className="fw-bold mb-1">{isGlobal ? 'Welcome to Chat to All' : 'Start the Conversation'}</h6>
            <p className="small mb-0 text-muted" style={{ maxWidth: '340px', margin: '0 auto' }}>
              {isGlobal
                ? 'This is a public channel visible to all Students, Staff, and Admins. Anyone can participate and collaborate.'
                : isGroup 
                  ? `Send a message to everyone in ${conversation.name}.`
                  : `Send a message to ${otherParticipant?.fullName || otherParticipant?.username}.`}
            </p>
          </div>
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="message-row received">
            <div className="typing-box">
              <span className="small fw-semibold">{typingUser} is typing</span>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        {/* Attachment Preview Banner if selected */}
        {selectedFile && (
          <div className="attachment-preview-banner">
            <div className="d-flex align-items-center gap-2">
              {filePreview ? (
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} 
                />
              ) : (
                getFileIcon(selectedFile.type, selectedFile.name)
              )}
              <div>
                <div className="fw-semibold small text-truncate" style={{ maxWidth: '240px' }}>
                  {selectedFile.name}
                </div>
                <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="btn btn-sm text-danger border-0 p-1"
              onClick={handleCancelFile}
              title="Remove attachment"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="chat-input-row">
          {/* File Picker Button */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.docx,.doc,.xlsx,.xls,.zip"
          />

          <button 
            type="button" 
            className="btn-chat-action btn-light border text-muted shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image or File (PNG, JPG, PDF, DOCX, ZIP)"
          >
            <FaPaperclip />
          </button>

          {/* Message Textarea */}
          <textarea 
            className="chat-textarea"
            placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />

          {/* Send Button */}
          <button 
            type="submit" 
            className="btn-chat-action btn-send-message shadow"
            disabled={uploading || (!inputText.trim() && !selectedFile)}
            title="Send Message"
          >
            {uploading ? (
              <FaSpinner className="spinner-border spinner-border-sm" style={{ width: 16, height: 16 }} />
            ) : (
              <FaPaperPlane style={{ fontSize: '0.9rem' }} />
            )}
          </button>
        </form>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <MediaLightboxModal 
          show={!!lightboxImage} 
          onClose={() => setLightboxImage(null)}
          mediaUrl={lightboxImage.url}
          filename={lightboxImage.filename}
        />
      )}

      {/* Delete Message Confirmation Modal */}
      {deleteTargetMessage && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 bg-card">
              <div className="modal-body text-center p-4">
                <div 
                  className="rounded-circle bg-danger-subtle text-danger p-3 mx-auto mb-3 d-flex align-items-center justify-content-center" 
                  style={{ width: 60, height: 60 }}
                >
                  <FaTrash className="fs-4" />
                </div>
                <h5 className="fw-bold text-main mb-2">Delete Message?</h5>
                <p className="text-muted small mb-4">
                  This message will be deleted for everyone in this conversation. This action cannot be undone.
                </p>
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-light border text-muted w-50 py-2 rounded-3 fw-semibold" 
                    onClick={() => setDeleteTargetMessage(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger w-50 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatThread;
