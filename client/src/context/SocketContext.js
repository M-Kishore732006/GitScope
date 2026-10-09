import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const SocketContext = createContext();

// Subtle, pleasant notification sound using Web Audio API
const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio autoplay might be restricted before user gesture
  }
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);
  const activeConversationIdRef = useRef(null);

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem('userInfo');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const fetchTotalUnread = useCallback(async () => {
    const user = getStoredUser();
    if (!user?.token) return;
    try {
      const res = await axios.get('/api/chat/unread-count', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTotalUnread(res.data.totalUnread || 0);
    } catch (e) {
      // ignore
    }
  }, []);

  const setActiveConversationId = useCallback((id) => {
    activeConversationIdRef.current = id ? String(id) : null;
  }, []);

  const clearUnreadForConversation = useCallback((convId) => {
    if (!convId) return;
    const strId = String(convId);
    setToastNotification(prev => {
      if (prev && String(prev.conversationId) === strId) {
        return null;
      }
      return prev;
    });
    fetchTotalUnread();
  }, [fetchTotalUnread]);

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Connect Socket.io
    const socketUrl = process.env.REACT_APP_SOCKET_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      auth: { token: user.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    newSocket.on('connect', () => {
      setConnected(true);
      fetchTotalUnread();
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Real-time user presence updates
    newSocket.on('user:presence', ({ userId, isOnline, lastSeen }) => {
      setOnlineUsers(prev => ({
        ...prev,
        [userId]: { isOnline, lastSeen }
      }));
    });

    // New message notifications
    newSocket.on('notification:new_message', ({ message, conversation }) => {
      const stored = getStoredUser();
      const currentUserId = String(stored?._id || stored?.id || '');
      const senderId = String(message.sender?._id || message.sender || '');

      // NEVER show notification or increment unread for messages sent by the current user
      if (senderId && senderId === currentUserId) {
        return;
      }

      const currentActiveId = String(activeConversationIdRef.current || '');
      const targetConvId = String(conversation?._id || message.conversation?._id || message.conversation || '');

      // Check if user is currently looking at this conversation via URL params
      let currentUrlConvId = '';
      try {
        if (window.location.pathname.includes('/messages')) {
          const params = new URLSearchParams(window.location.search);
          currentUrlConvId = String(params.get('conv') || '');
        }
      } catch (e) {}

      const isCurrentChat = Boolean(
        targetConvId && (
          (currentActiveId && currentActiveId === targetConvId) ||
          (currentUrlConvId && currentUrlConvId === targetConvId)
        )
      );

      // Only show popup and increment unread if user is NOT currently inside this conversation
      if (!isCurrentChat) {
        playNotificationChime();
        setTotalUnread(prev => prev + 1);

        setToastNotification({
          id: Date.now(),
          conversationId: targetConvId,
          senderName: message.sender?.fullName || message.sender?.username || 'New Message',
          conversationName: conversation?.name || (message.sender?.fullName || message.sender?.username),
          isGroup: conversation?.type === 'group',
          content: message.messageType === 'text' 
            ? message.content 
            : message.messageType === 'image' 
              ? '📷 Sent an image' 
              : `📎 Sent file: ${message.file?.filename || 'Attachment'}`,
          timestamp: new Date()
        });
      } else {
        // User IS looking at this conversation! Ensure any toast for this conversation is dismissed
        setToastNotification(prev => {
          if (prev && String(prev.conversationId) === targetConvId) {
            return null;
          }
          return prev;
        });
      }
    });

    // Conversation read cleared
    newSocket.on('conversation:unread_cleared', ({ conversationId } = {}) => {
      if (conversationId) {
        setToastNotification(prev => {
          if (prev && String(prev.conversationId) === String(conversationId)) {
            return null;
          }
          return prev;
        });
      }
      fetchTotalUnread();
    });

    setSocket(newSocket);

    // Initial unread fetch
    fetchTotalUnread();

    return () => {
      newSocket.disconnect();
    };
  }, [fetchTotalUnread]);

  const joinConversation = useCallback((conversationId) => {
    if (socket && conversationId) {
      socket.emit('conversation:join', { conversationId: String(conversationId) });
    }
  }, [socket]);

  const leaveConversation = useCallback((conversationId) => {
    if (socket && conversationId) {
      socket.emit('conversation:leave', { conversationId: String(conversationId) });
    }
  }, [socket]);

  const dismissToast = () => {
    setToastNotification(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUsers,
        totalUnread,
        fetchTotalUnread,
        toastNotification,
        dismissToast,
        clearUnreadForConversation,
        setActiveConversationId,
        joinConversation,
        leaveConversation
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
