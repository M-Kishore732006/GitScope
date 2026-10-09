import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FaComments, FaUserGraduate, FaPlus, FaGlobe } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';
import ConversationList from '../../components/chat/ConversationList';
import ContactSelection from '../../components/chat/ContactSelection';
import ChatThread from '../../components/chat/ChatThread';
import CreateGroupModal from '../../components/chat/CreateGroupModal';
import GroupMembersModal from '../../components/chat/GroupMembersModal';
import '../../styles/chat.css';

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryConvId = searchParams.get('conv');

  const { 
    socket, 
    onlineUsers, 
    setActiveConversationId,
    joinConversation,
    leaveConversation,
    fetchTotalUnread,
    clearUnreadForConversation
  } = useSocket();

  const [activeTab, setActiveTab] = useState('CONVERSATIONS'); // CONVERSATIONS or CONTACTS
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [typingStatusMap, setTypingStatusMap] = useState({}); // { [convId]: userName }

  // Current User Info
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch {
      return {};
    }
  }, []);

  const currentUserId = userInfo._id || userInfo.id;
  const userRole = userInfo.role;

  // Immediate sync of queryConvId with SocketContext
  useEffect(() => {
    if (queryConvId) {
      setActiveConversationId(queryConvId);
    }
  }, [queryConvId, setActiveConversationId]);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback((conv) => {
    if (!conv) return;
    const convId = String(conv._id);
    setActiveConversation(conv);
    setActiveConversationId(convId);
    clearUnreadForConversation(convId);

    // Clear unread on select locally
    setConversations(prev => prev.map(c => 
      String(c._id) === convId ? { ...c, unreadCount: 0 } : c
    ));

    // Persist mark-as-read to server
    if (userInfo?.token) {
      axios.post(`/api/chat/conversations/${convId}/read`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      }).then(() => {
        fetchTotalUnread();
      }).catch(() => {});
    }

    if (socket) {
      socket.emit('message:read', { conversationId: convId });
    }
  }, [userInfo?.token, setActiveConversationId, clearUnreadForConversation, fetchTotalUnread, socket]);

  // 1. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    if (!userInfo?.token) return;
    try {
      setLoadingConversations(true);
      const res = await axios.get('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setConversations(res.data);

      // If queryConvId present, select it and mark as read
      if (queryConvId) {
        const found = res.data.find(c => String(c._id) === String(queryConvId));
        if (found) {
          const clearedFound = { ...found, unreadCount: 0 };
          setActiveConversation(clearedFound);
          setActiveConversationId(queryConvId);
          clearUnreadForConversation(queryConvId);

          axios.post(`/api/chat/conversations/${queryConvId}/read`, {}, {
            headers: { Authorization: `Bearer ${userInfo.token}` }
          }).then(() => {
            fetchTotalUnread();
          }).catch(() => {});

          if (socket) {
            socket.emit('message:read', { conversationId: queryConvId });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [userInfo?.token, queryConvId, socket, setActiveConversationId, clearUnreadForConversation, fetchTotalUnread]);

  // 2. Fetch Eligible Contacts
  const fetchContacts = useCallback(async () => {
    if (!userInfo?.token) return;
    try {
      setLoadingContacts(true);
      const res = await axios.get('/api/chat/contacts', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    fetchConversations();
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.token]);

  // Sync route query change if conversations already loaded
  useEffect(() => {
    if (queryConvId && conversations.length > 0) {
      const found = conversations.find(c => String(c._id) === String(queryConvId));
      if (found && String(activeConversation?._id) !== String(queryConvId)) {
        handleSelectConversation(found);
      }
    }
  }, [queryConvId, conversations, activeConversation?._id, handleSelectConversation]);

  // Sync active conversation with socket & URL
  useEffect(() => {
    if (activeConversation?._id) {
      const convId = String(activeConversation._id);
      setActiveConversationId(convId);
      joinConversation(convId);
      setSearchParams({ conv: convId }, { replace: true });
    } else if (queryConvId) {
      setActiveConversationId(queryConvId);
      joinConversation(queryConvId);
    } else {
      setActiveConversationId(null);
    }

    return () => {
      if (activeConversation?._id) {
        leaveConversation(String(activeConversation._id));
      }
    };
  }, [activeConversation?._id, queryConvId, setActiveConversationId, joinConversation, leaveConversation, setSearchParams]);

  // Real-time socket events for conversation list & typing
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ message, conversationId }) => {
      const convIdStr = String(conversationId);
      const activeIdStr = String(activeConversation?._id || queryConvId || '');
      const isCurrentlyActive = Boolean(activeIdStr && convIdStr === activeIdStr);

      setConversations(prev => {
        const idx = prev.findIndex(c => String(c._id) === convIdStr);
        if (idx !== -1) {
          const updated = [...prev];
          const conv = { ...updated[idx] };
          conv.lastMessage = message;
          conv.lastMessageAt = message.createdAt;

          // Increment unread ONLY if not currently active
          if (!isCurrentlyActive) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          } else {
            conv.unreadCount = 0;
          }

          // Move to top
          updated.splice(idx, 1);
          return [conv, ...updated];
        } else {
          // Re-fetch conversations if a brand new conversation arrived
          fetchConversations();
          return prev;
        }
      });
    };

    const handleMessageDeleted = ({ messageId, conversationId }) => {
      setConversations(prev => prev.map(c => {
        if (String(c._id) === String(conversationId)) {
          if (c.lastMessage?._id === messageId || String(c.lastMessage?._id) === String(messageId)) {
            return {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                content: 'This message was deleted',
                isDeleted: true
              }
            };
          }
        }
        return c;
      }));
    };

    const handleUnreadCleared = ({ conversationId } = {}) => {
      if (conversationId) {
        setConversations(prev => prev.map(c => 
          String(c._id) === String(conversationId) ? { ...c, unreadCount: 0 } : c
        ));
      }
      fetchTotalUnread();
    };

    const handleGroupCreated = (newGroup) => {
      setConversations(prev => [newGroup, ...prev.filter(c => c._id !== newGroup._id)]);
    };

    const handleTypingStart = ({ conversationId, userName }) => {
      setTypingStatusMap(prev => ({
        ...prev,
        [conversationId]: userName
      }));
    };

    const handleTypingStop = ({ conversationId }) => {
      setTypingStatusMap(prev => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('conversation:unread_cleared', handleUnreadCleared);
    socket.on('group:created', handleGroupCreated);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('conversation:unread_cleared', handleUnreadCleared);
      socket.off('group:created', handleGroupCreated);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, activeConversation?._id, queryConvId, fetchConversations, fetchTotalUnread]);

  // Selecting a contact initiates or opens a private conversation
  const handleSelectContact = async (contact) => {
    try {
      // If contact already has conversationId, open it
      if (contact.conversationId) {
        const existing = conversations.find(c => c._id === contact.conversationId);
        if (existing) {
          setActiveConversation(existing);
          setActiveTab('CONVERSATIONS');
          return;
        }
      }

      // Otherwise create/fetch private conversation via backend
      const res = await axios.post('/api/chat/conversations/private', {
        recipientId: contact._id
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      const conv = res.data;
      setConversations(prev => [conv, ...prev.filter(c => c._id !== conv._id)]);
      setActiveConversation(conv);
      setActiveTab('CONVERSATIONS');
      fetchTotalUnread();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start conversation with this contact.');
    }
  };

  const handleGroupCreated = (newGroup) => {
    setConversations(prev => [newGroup, ...prev.filter(c => c._id !== newGroup._id)]);
    setActiveConversation(newGroup);
    setActiveTab('CONVERSATIONS');
    fetchTotalUnread();
  };

  const handleLeftGroup = (groupId) => {
    setConversations(prev => prev.filter(c => c._id !== groupId));
    if (activeConversation?._id === groupId) {
      setActiveConversation(null);
    }
    fetchTotalUnread();
  };

  // Open the public "Chat to All" conversation
  const handleOpenGlobalChat = useCallback(async () => {
    try {
      const globalInList = conversations.find(c => c.type === 'global');
      if (globalInList) {
        handleSelectConversation(globalInList);
        setActiveTab('CONVERSATIONS');
        return;
      }

      if (userInfo?.token) {
        const res = await axios.get('/api/chat/conversations/global', {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        const globalConv = res.data;
        setConversations(prev => {
          const exists = prev.find(c => c.type === 'global');
          if (exists) return prev;
          return [globalConv, ...prev];
        });
        handleSelectConversation(globalConv);
        setActiveTab('CONVERSATIONS');
      }
    } catch (err) {
      console.error('Failed to open global chat:', err);
    }
  }, [conversations, handleSelectConversation, userInfo?.token]);

  return (
    <div className="chat-container">
      {/* LEFT PANEL */}
      <div className={`chat-sidebar ${activeConversation ? 'chat-sidebar-hidden d-none d-md-flex' : 'd-flex'}`}>
        {/* Sidebar Header */}
        <div className="chat-sidebar-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold mb-0 text-main d-flex align-items-center gap-2">
              <FaComments className="text-primary" /> Messages
            </h5>
          </div>

          <div className="d-flex align-items-center gap-1">
            <button 
              className="btn btn-sm btn-outline-info rounded-pill d-flex align-items-center gap-1 py-1 px-2 small"
              onClick={handleOpenGlobalChat}
              title="Open Chat to All (Public Channel)"
            >
              <FaGlobe style={{ fontSize: '0.72rem' }} />
              <span style={{ fontSize: '0.75rem' }}>Chat to All</span>
            </button>

            {(userRole === 'teacher' || userRole === 'staff' || userRole === 'admin') && (
              <button 
                className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-1 py-1 px-2 small"
                onClick={() => setShowCreateGroup(true)}
                title="Create new group chat"
              >
                <FaPlus style={{ fontSize: '0.7rem' }} />
                <span style={{ fontSize: '0.75rem' }}>Group</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher: Chats vs Contacts */}
        <div className="chat-tabs-bar">
          <button 
            className={`chat-tab-btn ${activeTab === 'CONVERSATIONS' ? 'active' : ''}`}
            onClick={() => setActiveTab('CONVERSATIONS')}
          >
            <FaComments /> Chats ({conversations.length})
          </button>
          <button 
            className={`chat-tab-btn ${activeTab === 'CONTACTS' ? 'active' : ''}`}
            onClick={() => setActiveTab('CONTACTS')}
          >
            <FaUserGraduate /> {userRole === 'student' ? 'My Staff' : 'My Students'}
          </button>
        </div>

        {/* Tab Body */}
        {activeTab === 'CONVERSATIONS' ? (
          <ConversationList 
            conversations={conversations}
            loading={loadingConversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            onCreateGroupClick={() => setShowCreateGroup(true)}
            userRole={userRole}
            currentUserId={currentUserId}
            onlineUsers={onlineUsers}
            typingStatusMap={typingStatusMap}
          />
        ) : (
          <ContactSelection 
            contacts={contacts}
            loading={loadingContacts}
            userRole={userRole}
            onSelectContact={handleSelectContact}
            onlineUsers={onlineUsers}
          />
        )}
      </div>

      {/* RIGHT PANEL (THREAD VIEW) */}
      <div className={`chat-main ${!activeConversation ? 'chat-main-hidden d-none d-md-flex' : 'd-flex'}`}>
        {activeConversation ? (
          <ChatThread 
            conversation={activeConversation}
            currentUserId={currentUserId}
            onBack={() => setActiveConversation(null)}
            onOpenGroupMembers={() => setShowGroupMembers(true)}
            onlineUsers={onlineUsers}
            socket={socket}
            typingUser={typingStatusMap[activeConversation._id]}
          />
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-4">
            <div 
              className="rounded-circle p-4 mb-3 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: 'rgba(109, 94, 245, 0.08)', width: 90, height: 90 }}
            >
              <FaComments className="text-primary" style={{ fontSize: '2.5rem' }} />
            </div>
            <h5 className="fw-bold text-main mb-1">GitScope Real-Time Collaboration</h5>
            <p className="text-muted small text-center mb-4" style={{ maxWidth: '380px' }}>
              Communicate with assigned contacts, organize student group discussions, or join the public Chat to All channel visible to all users.
            </p>

            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <button 
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2"
                onClick={handleOpenGlobalChat}
              >
                <FaGlobe /> Open Chat to All
              </button>
              <button 
                className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2"
                onClick={() => setActiveTab('CONTACTS')}
              >
                <FaUserGraduate /> Browse {userRole === 'student' ? 'Assigned Staff' : 'My Students'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal 
        show={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        eligibleStudents={contacts}
        onGroupCreated={handleGroupCreated}
        currentUserId={currentUserId}
      />

      <GroupMembersModal 
        show={showGroupMembers}
        onClose={() => setShowGroupMembers(false)}
        conversation={activeConversation}
        currentUserId={currentUserId}
        onLeftGroup={handleLeftGroup}
      />
    </div>
  );
};

export default ChatPage;
