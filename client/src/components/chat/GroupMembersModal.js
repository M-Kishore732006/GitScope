import React, { useState } from 'react';
import { FaTimes, FaUsers, FaUserGraduate, FaChalkboardTeacher, FaDoorOpen, FaGithub } from 'react-icons/fa';
import axios from 'axios';

const GroupMembersModal = ({ show, onClose, conversation, currentUserId, onLeftGroup }) => {
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');

  if (!show || !conversation) return null;

  const participants = conversation.participants || [];
  const groupAdmin = conversation.groupAdmin;

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group conversation?')) {
      return;
    }

    try {
      setLeaving(true);
      setError('');
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await axios.post(`/api/chat/conversations/${conversation._id}/leave`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      onLeftGroup(conversation._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave group');
      setLeaving(false);
    }
  };

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 bg-card text-main">
          <div className="modal-header border-bottom px-4 py-3">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
              <FaUsers className="text-primary" /> {conversation.name}
            </h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body px-4 py-3">
            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            {conversation.description && (
              <div className="mb-3 p-2 rounded bg-light-custom small text-muted">
                {conversation.description}
              </div>
            )}

            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>
                Group Participants ({participants.length})
              </span>
            </div>

            <div className="border rounded-3 p-2 bg-light-custom" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {participants.map(member => {
                const isAdmin = groupAdmin?._id === member._id || groupAdmin === member._id;
                const isMe = member._id === currentUserId;

                return (
                  <div 
                    key={member._id}
                    className="d-flex align-items-center justify-content-between p-2 rounded-2 mb-1 hover-bg"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="avatar-circle" 
                        style={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.8rem',
                          backgroundColor: isAdmin ? '#6d5ef5' : '#475569',
                          color: '#ffffff'
                        }}
                      >
                        {(member.fullName || member.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold small d-flex align-items-center gap-1">
                          {member.fullName || member.username}
                          {isMe && <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>You</span>}
                          {isAdmin && <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>Admin / Staff</span>}
                        </div>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {member.rollNumber ? `ID: ${member.rollNumber}` : member.email}
                          {member.githubUsername && (
                            <span className="ms-1 text-primary">
                              <FaGithub className="me-1" />{member.githubUsername}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {member.isOnline ? (
                        <span className="badge bg-success-subtle text-success small" style={{ fontSize: '0.65rem' }}>Online</span>
                      ) : (
                        <span className="text-muted small" style={{ fontSize: '0.65rem' }}>Offline</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-footer border-top px-4 py-2 d-flex justify-content-between">
            <button 
              type="button" 
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
              onClick={handleLeaveGroup}
              disabled={leaving}
            >
              <FaDoorOpen /> {leaving ? 'Leaving...' : 'Leave Group'}
            </button>

            <button 
              type="button" 
              className="btn btn-sm btn-secondary" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
