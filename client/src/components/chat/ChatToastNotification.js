import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { FaTimes, FaCommentDots, FaUsers } from 'react-icons/fa';

const ChatToastNotification = () => {
  const { 
    toastNotification, 
    dismissToast, 
    clearUnreadForConversation, 
    setActiveConversationId 
  } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!toastNotification) return;

    // Auto dismiss after 6 seconds
    const timer = setTimeout(() => {
      dismissToast();
    }, 6000);

    return () => clearTimeout(timer);
  }, [toastNotification, dismissToast]);

  if (!toastNotification) return null;

  const handleClick = () => {
    const convId = toastNotification.conversationId;
    dismissToast();
    clearUnreadForConversation(convId);
    setActiveConversationId(convId);

    // Determine route based on user role
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const role = userInfo.role;
    const basePath = role === 'teacher' || role === 'staff' 
      ? '/staff/messages' 
      : role === 'admin' 
        ? '/admin/messages' 
        : '/student/messages';

    navigate(`${basePath}?conv=${convId}`);
  };

  return (
    <div 
      className="chat-toast" 
      onClick={handleClick}
      role="alert"
      aria-live="polite"
    >
      <div 
        className="chat-avatar" 
        style={{ width: 38, height: 38, fontSize: '0.875rem', flexShrink: 0 }}
      >
        {toastNotification.isGroup ? <FaUsers /> : <FaCommentDots />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="fw-bold text-main small text-truncate" style={{ maxWidth: '190px' }}>
            {toastNotification.conversationName}
          </span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
            Just now
          </span>
        </div>

        {toastNotification.isGroup && (
          <div className="text-primary fw-semibold" style={{ fontSize: '0.75rem' }}>
            {toastNotification.senderName}:
          </div>
        )}

        <div className="text-muted small text-truncate" style={{ fontSize: '0.8rem' }}>
          {toastNotification.content}
        </div>
      </div>

      <button 
        className="btn btn-sm text-muted p-0 border-0" 
        onClick={(e) => {
          e.stopPropagation();
          dismissToast();
        }}
        aria-label="Close notification"
      >
        <FaTimes style={{ fontSize: '0.85rem' }} />
      </button>
    </div>
  );
};

export default ChatToastNotification;
