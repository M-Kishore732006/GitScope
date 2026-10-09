import React, { useState } from 'react';
import { FaSearch, FaUsers, FaPlus, FaComments, FaGlobe } from 'react-icons/fa';

const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();

  // If today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // If yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Otherwise short date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ConversationList = ({
  conversations,
  loading,
  activeConversation,
  onSelectConversation,
  onCreateGroupClick,
  userRole,
  currentUserId,
  onlineUsers,
  typingStatusMap
}) => {
  const [filter, setFilter] = useState('ALL'); // ALL, GLOBAL, PRIVATE, GROUP
  const [search, setSearch] = useState('');

  const isStaffOrAdmin = userRole === 'teacher' || userRole === 'staff' || userRole === 'admin';

  const filteredConversations = (conversations || []).filter(c => {
    // Filter by type
    if (filter === 'GLOBAL' && c.type !== 'global') return false;
    if (filter === 'PRIVATE' && c.type !== 'private') return false;
    if (filter === 'GROUP' && c.type !== 'group') return false;

    // Filter by search
    if (!search.trim()) return true;
    const q = search.toLowerCase();

    if (c.type === 'global') {
      return (c.name || 'Chat to All').toLowerCase().includes(q) || 'public'.includes(q) || 'all'.includes(q);
    } else if (c.type === 'group') {
      return (c.name || '').toLowerCase().includes(q);
    } else {
      const other = c.participants?.find(p => p._id !== currentUserId) || {};
      return (
        (other.fullName || other.username || '').toLowerCase().includes(q) ||
        (other.rollNumber || '').toLowerCase().includes(q) ||
        (other.githubUsername || '').toLowerCase().includes(q)
      );
    }
  });

  return (
    <div className="d-flex flex-column h-100">
      {/* Top Search & Actions */}
      <div className="p-3 border-bottom bg-card">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="position-relative flex-grow-1">
            <FaSearch className="position-absolute text-muted small" style={{ left: 12, top: 12 }} />
            <input 
              type="text"
              className="chat-search-input"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isStaffOrAdmin && (
            <button 
              className="btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-1 shadow-sm px-3"
              onClick={onCreateGroupClick}
              title="Create Group Chat"
            >
              <FaPlus style={{ fontSize: '0.75rem' }} />
              <span className="small fw-semibold d-none d-sm-inline">Group</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="d-flex gap-1 overflow-auto py-1">
          <button 
            className={`btn btn-xs rounded-pill px-2 py-1 small fw-semibold ${
              filter === 'ALL' ? 'btn-primary' : 'btn-light border text-muted'
            }`}
            onClick={() => setFilter('ALL')}
            style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          >
            All
          </button>
          <button 
            className={`btn btn-xs rounded-pill px-2 py-1 small fw-semibold ${
              filter === 'GLOBAL' ? 'btn-primary' : 'btn-light border text-muted'
            }`}
            onClick={() => setFilter('GLOBAL')}
            style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          >
            <FaGlobe className="me-1" style={{ fontSize: '0.7rem' }} /> Chat to All
          </button>
          <button 
            className={`btn btn-xs rounded-pill px-2 py-1 small fw-semibold ${
              filter === 'PRIVATE' ? 'btn-primary' : 'btn-light border text-muted'
            }`}
            onClick={() => setFilter('PRIVATE')}
            style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          >
            Direct
          </button>
          <button 
            className={`btn btn-xs rounded-pill px-2 py-1 small fw-semibold ${
              filter === 'GROUP' ? 'btn-primary' : 'btn-light border text-muted'
            }`}
            onClick={() => setFilter('GROUP')}
            style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="chat-item-list">
        {loading ? (
          <div className="text-center py-5 text-muted small">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>Loading conversations...</div>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map(conv => {
            const isActive = activeConversation?._id === conv._id;
            const isGroup = conv.type === 'group';
            const isGlobal = conv.type === 'global';

            let title = conv.name;
            let otherParticipant = null;

            if (!isGroup && !isGlobal) {
              otherParticipant = conv.participants?.find(p => p._id !== currentUserId) || {};
              title = otherParticipant.fullName || otherParticipant.username || 'Direct Chat';
            } else if (isGlobal) {
              title = conv.name || 'Chat to All';
            }

            const presence = otherParticipant ? onlineUsers[otherParticipant._id] : null;
            const isOnline = presence ? presence.isOnline : otherParticipant?.isOnline;

            const isTyping = typingStatusMap && typingStatusMap[conv._id];

            return (
              <div 
                key={conv._id}
                className={`chat-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectConversation(conv)}
              >
                {/* Avatar */}
                <div className="avatar-wrapper">
                  <div 
                    className="chat-avatar"
                    style={{
                      background: isGlobal 
                        ? 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)' 
                        : isGroup 
                          ? '#4f46e5' 
                          : '#6d5ef5'
                    }}
                  >
                    {isGlobal ? (
                      <FaGlobe style={{ fontSize: '1.1rem' }} />
                    ) : isGroup ? (
                      <FaUsers style={{ fontSize: '1.1rem' }} />
                    ) : (
                      title.charAt(0).toUpperCase()
                    )}
                  </div>
                  {!isGroup && !isGlobal && (
                    <div className={`presence-dot ${isOnline ? 'online' : 'offline'}`} />
                  )}
                </div>

                {/* Conversation Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-1 overflow-hidden" style={{ maxWidth: '170px' }}>
                      <span className="fw-bold text-main small text-truncate">
                        {title}
                      </span>
                      {isGlobal && (
                        <span 
                          className="badge rounded-pill bg-info-subtle text-info border border-info-subtle py-0" 
                          style={{ fontSize: '0.62rem', padding: '1px 5px', flexShrink: 0 }}
                        >
                          Public
                        </span>
                      )}
                    </div>

                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {formatTimestamp(conv.lastMessageAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-truncate small" style={{ fontSize: '0.8rem', maxWidth: '210px' }}>
                      {isTyping ? (
                        <span className="text-primary fw-semibold fst-italic">
                          {isTyping} is typing...
                        </span>
                      ) : conv.lastMessage ? (
                        <span className={conv.unreadCount > 0 ? 'fw-bold text-main' : 'text-muted'}>
                          {(isGroup || isGlobal) && conv.lastMessage.sender?.fullName && (
                            <span className="fw-semibold text-primary me-1">
                              {conv.lastMessage.sender.fullName.split(' ')[0]}
                              {isGlobal && conv.lastMessage.sender.role && (
                                <span className="opacity-75" style={{ fontSize: '0.72rem' }}>
                                  ({conv.lastMessage.sender.role === 'teacher' || conv.lastMessage.sender.role === 'staff' ? 'Staff' : conv.lastMessage.sender.role === 'admin' ? 'Admin' : 'Student'})
                                </span>
                              )}:
                            </span>
                          )}
                          {conv.lastMessage.messageType === 'text' 
                            ? conv.lastMessage.content 
                            : conv.lastMessage.messageType === 'image' 
                              ? '📷 Image' 
                              : `📎 ${conv.lastMessage.file?.filename || 'File'}`}
                        </span>
                      ) : (
                        <span className="text-muted fst-italic">
                          {isGlobal ? 'Start chatting with everyone' : 'No messages yet'}
                        </span>
                      )}
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="unread-badge ms-2">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-5 px-3 text-muted">
            <FaComments className="fs-1 opacity-25 mb-2 text-primary" />
            <p className="fw-semibold small mb-1">No conversations found</p>
            <p className="small mb-0" style={{ fontSize: '0.75rem' }}>
              Switch filter to All or browse contacts to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
