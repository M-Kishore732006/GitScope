import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBell, FaCheckCircle, FaExclamationCircle, FaTrophy, 
  FaSync, FaCheck, FaTrash, FaTimes, FaInfoCircle, FaExternalLinkAlt 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DEFAULT_NOTIFICATIONS = {
  student: [
    {
      id: 'n1',
      title: 'GitHub Sync Successful',
      message: 'Synced 12 public repositories and contribution calendar stats.',
      time: '10m ago',
      type: 'sync',
      read: false,
      link: '/student/repositories'
    },
    {
      id: 'n2',
      title: 'Achievement Unlocked! 🏆',
      message: 'You unlocked the "Consistent Coder" badge for reaching 10 commits.',
      time: '1h ago',
      type: 'achievement',
      read: false,
      link: '/student/achievements'
    },
    {
      id: 'n3',
      title: 'Leaderboard Ranking Updated',
      message: 'You have moved up in your Departmental Ranking!',
      time: '3h ago',
      type: 'rank',
      read: true,
      link: '/student/leaderboard'
    },
    {
      id: 'n4',
      title: 'GitScope System Notice',
      message: 'Weekly leaderboard calculation completed successfully.',
      time: '1d ago',
      type: 'info',
      read: true,
      link: '/student/dashboard'
    }
  ],
  staff: [
    {
      id: 'sn1',
      title: 'New Student Activity Detected',
      message: '5 assigned students updated their GitHub contribution streaks today.',
      time: '15m ago',
      type: 'info',
      read: false,
      link: '/staff/students'
    },
    {
      id: 'sn2',
      title: 'Weekly Student Report Ready',
      message: 'Automated analytics report generated for your student batch.',
      time: '2h ago',
      type: 'sync',
      read: false,
      link: '/staff/reports'
    },
    {
      id: 'sn3',
      title: 'Activity Threshold Warning',
      message: '2 students have been inactive on GitHub for over 14 days.',
      time: '1d ago',
      type: 'warning',
      read: true,
      link: '/staff/monitoring'
    }
  ],
  admin: [
    {
      id: 'an1',
      title: 'System Health Status OK',
      message: 'All automated background GitHub sync cron jobs running smoothly.',
      time: '5m ago',
      type: 'sync',
      read: false,
      link: '/admin/monitoring'
    },
    {
      id: 'an2',
      title: 'Staff Registration Alert',
      message: 'New staff member registered and pending student assignment.',
      time: '1h ago',
      type: 'info',
      read: false,
      link: '/admin/staff'
    },
    {
      id: 'an3',
      title: 'Audit Log Recorded',
      message: 'System configuration settings updated by admin.',
      time: '5h ago',
      type: 'warning',
      read: true,
      link: '/admin/audit-logs'
    }
  ]
};

const NotificationDropdown = ({ role = 'student' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD
  const popoverRef = useRef(null);

  const storageKey = `gitscope_notifications_${role}`;

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_NOTIFICATIONS[role] || DEFAULT_NOTIFICATIONS.student;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications, storageKey]);

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'achievement':
        return <FaTrophy className="text-warning fs-5" />;
      case 'sync':
        return <FaSync className="text-primary fs-5" />;
      case 'warning':
        return <FaExclamationCircle className="text-danger fs-5" />;
      default:
        return <FaInfoCircle className="text-secondary fs-5" />;
    }
  };

  return (
    <div className="position-relative d-inline-block" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button 
        type="button"
        className="btn btn-light rounded-circle shadow-sm border p-2 text-muted position-relative d-flex align-items-center justify-content-center theme-btn-icon"
        style={{ width: 40, height: 40 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View Notifications"
      >
        <FaBell className="fs-6" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light animate-pulse" style={{ fontSize: '0.65rem' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover / Mobile Drawer */}
      {isOpen && (
        <div 
          className="notification-popover shadow-lg rounded-4 border bg-card text-main mt-2 overflow-hidden animate-fadeIn"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '380px',
            maxWidth: '92vw',
            zIndex: 1100
          }}
        >
          {/* Popover Header */}
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-header">
            <div className="d-flex align-items-center gap-2">
              <h6 className="fw-bold mb-0">Notifications</h6>
              {unreadCount > 0 && (
                <span className="badge bg-primary rounded-pill small">{unreadCount} Unread</span>
              )}
            </div>

            <div className="d-flex align-items-center gap-1">
              {unreadCount > 0 && (
                <button 
                  className="btn btn-xs btn-link text-primary text-decoration-none fw-semibold p-0 me-2"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <FaCheck className="me-1" /> Read All
                </button>
              )}
              <button 
                className="btn btn-sm text-muted border-0 p-1"
                onClick={() => setIsOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-3 py-2 border-bottom bg-light-custom d-flex justify-content-between align-items-center">
            <div className="btn-group btn-group-sm">
              <button 
                className={`btn btn-xs ${filter === 'ALL' ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('ALL')}
              >
                All ({notifications.length})
              </button>
              <button 
                className={`btn btn-xs ${filter === 'UNREAD' ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('UNREAD')}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {notifications.length > 0 && (
              <button 
                className="btn btn-xs btn-link text-danger text-decoration-none p-0 fw-semibold"
                onClick={clearAll}
              >
                <FaTrash className="me-1" /> Clear
              </button>
            )}
          </div>

          {/* Notifications List Body */}
          <div className="notification-list-body" style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-3 border-bottom d-flex gap-3 align-items-start transition-all cursor-pointer ${
                    !notif.read ? 'bg-unread' : 'bg-read opacity-85'
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="p-2 rounded-circle bg-icon-wrapper flex-shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="fw-bold mb-0 text-truncate text-main" style={{ maxWidth: '190px', fontSize: '0.9rem' }}>
                        {notif.title}
                      </h6>
                      <span className="text-muted small ms-2" style={{ fontSize: '0.75rem' }}>
                        {notif.time}
                      </span>
                    </div>

                    <p className="text-muted small mb-2 lh-sm" style={{ fontSize: '0.825rem' }}>
                      {notif.message}
                    </p>

                    <div className="d-flex justify-content-between align-items-center">
                      {notif.link ? (
                        <Link 
                          to={notif.link}
                          className="text-primary text-decoration-none fw-semibold small d-flex align-items-center gap-1"
                          onClick={() => { markAsRead(notif.id); setIsOpen(false); }}
                        >
                          View details <FaExternalLinkAlt style={{ fontSize: '0.65rem' }} />
                        </Link>
                      ) : <span></span>}

                      <button 
                        className="btn btn-xs text-muted border-0 hover-danger p-0"
                        onClick={(e) => deleteNotification(notif.id, e)}
                        title="Dismiss notification"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5 px-3 text-muted">
                <FaCheckCircle className="fs-1 opacity-40 mb-2 text-success" />
                <p className="fw-bold mb-1">All Caught Up!</p>
                <p className="small mb-0">No {filter === 'UNREAD' ? 'unread ' : ''}notifications at the moment.</p>
              </div>
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-2 border-top text-center bg-header small">
            <span className="text-muted opacity-75">GitScope Real-Time Notification Center</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
