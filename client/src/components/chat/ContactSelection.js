import React, { useState } from 'react';
import { FaSearch, FaUserGraduate, FaGithub, FaCommentDots, FaChalkboardTeacher } from 'react-icons/fa';

const ContactSelection = ({ 
  contacts, 
  loading, 
  userRole, 
  onSelectContact, 
  onlineUsers 
}) => {
  const [search, setSearch] = useState('');

  const isStaff = userRole === 'teacher' || userRole === 'staff';
  const isStudent = userRole === 'student';

  const filteredContacts = (contacts || []).filter(c => {
    const q = search.toLowerCase();
    const nameMatch = (c.fullName || c.username || '').toLowerCase().includes(q);
    const idMatch = (c.rollNumber || '').toLowerCase().includes(q);
    const githubMatch = (c.githubUsername || '').toLowerCase().includes(q);
    const emailMatch = (c.email || '').toLowerCase().includes(q);
    return nameMatch || idMatch || githubMatch || emailMatch;
  });

  return (
    <div className="d-flex flex-column h-100">
      {/* Search Bar */}
      <div className="p-3 border-bottom bg-card">
        <div className="position-relative">
          <FaSearch className="position-absolute text-muted small" style={{ left: 12, top: 12 }} />
          <input 
            type="text"
            className="chat-search-input"
            placeholder={
              isStaff 
                ? "Search student by name, ID, or GitHub..." 
                : isStudent 
                  ? "Search assigned staff..." 
                  : "Search contacts..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Header Info */}
      <div className="px-3 py-2 bg-light-custom border-bottom d-flex align-items-center justify-content-between">
        <span className="small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
          {isStaff ? `Assigned Students (${filteredContacts.length})` : `Eligible Contacts (${filteredContacts.length})`}
        </span>
      </div>

      {/* Contacts List */}
      <div className="chat-item-list">
        {loading ? (
          <div className="text-center py-5 text-muted small">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>Loading contacts...</div>
          </div>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map(contact => {
            const presence = onlineUsers[contact._id];
            const isOnline = presence ? presence.isOnline : contact.isOnline;

            return (
              <div 
                key={contact._id} 
                className="chat-item"
                onClick={() => onSelectContact(contact)}
              >
                {/* Avatar with presence */}
                <div className="avatar-wrapper">
                  <div className="chat-avatar">
                    {(contact.fullName || contact.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className={`presence-dot ${isOnline ? 'online' : 'offline'}`} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-bold text-main small text-truncate" style={{ maxWidth: '170px' }}>
                      {contact.fullName || contact.username}
                    </span>

                    {contact.unreadCount > 0 && (
                      <span className="unread-badge">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* ID / Role / GitHub line */}
                  <div className="d-flex align-items-center gap-1 small text-muted mb-1 flex-wrap" style={{ fontSize: '0.72rem' }}>
                    {contact.rollNumber && (
                      <span className="badge bg-light text-secondary border px-1">
                        ID: {contact.rollNumber}
                      </span>
                    )}
                    {contact.department && (
                      <span className="text-muted">{contact.department}</span>
                    )}
                    {contact.githubUsername && (
                      <span className="badge bg-dark text-white d-flex align-items-center gap-1 px-1">
                        <FaGithub /> @{contact.githubUsername}
                      </span>
                    )}
                  </div>

                  {/* Last message or quick message indicator */}
                  <div className="small text-muted text-truncate" style={{ fontSize: '0.78rem' }}>
                    {contact.lastMessage ? (
                      <span>
                        {contact.lastMessage.messageType === 'text' 
                          ? contact.lastMessage.content 
                          : contact.lastMessage.messageType === 'image' 
                            ? '📷 Image' 
                            : '📎 Attachment'}
                      </span>
                    ) : (
                      <span className="text-primary opacity-75">
                        <FaCommentDots className="me-1" /> Click to open conversation
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-5 px-3 text-muted">
            <FaUserGraduate className="fs-1 opacity-25 mb-2" />
            <p className="fw-semibold small mb-1">No contacts found</p>
            <p className="small mb-0" style={{ fontSize: '0.75rem' }}>
              {isStaff 
                ? 'Only students assigned to you appear in your contacts.' 
                : 'No authorized contacts match your search query.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSelection;
