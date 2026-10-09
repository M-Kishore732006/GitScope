const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

let ioInstance = null;

// Track active connections: Map<userIdString, Set<socketId>>
const userSocketMap = new Map();

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    pingTimeout: 30000,
    pingInterval: 10000
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || 
                    socket.handshake.headers?.authorization?.split(' ')[1] ||
                    socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (user.status === 'deactivated' || user.status === 'inactive') {
        return next(new Error('Authentication error: User inactive or deactivated'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket auth error:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    // Track user socket ID
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    // Join personal user room for direct user alerts
    socket.join(`user:${userId}`);

    // If this is the user's first active connection, mark them online
    if (userSocketMap.get(userId).size === 1) {
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        // Broadcast presence change to all clients
        io.emit('user:presence', {
          userId,
          isOnline: true,
          lastSeen: new Date()
        });
      } catch (err) {
        console.error('Error updating user online status:', err);
      }
    }

    // Join conversation room with membership validation
    socket.on('conversation:join', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        const conv = await Conversation.findById(conversationId).select('participants');
        if (!conv) return;

        const isMember = conv.participants.some(p => p.toString() === userId);
        const isAdmin = socket.user.role === 'admin';

        if (isMember || isAdmin) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (err) {
        console.error('Error joining conversation room:', err);
      }
    });

    // Leave conversation room
    socket.on('conversation:leave', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Real-time Typing Indicator
    socket.on('typing:start', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        const conv = await Conversation.findById(conversationId).select('participants');
        if (!conv) return;

        const isMember = conv.participants.some(p => p.toString() === userId) || socket.user.role === 'admin';
        if (isMember) {
          socket.to(`conversation:${conversationId}`).emit('typing:start', {
            conversationId,
            userId,
            userName: socket.user.fullName || socket.user.username
          });
        }
      } catch (err) {
        console.error('Error emitting typing:start:', err);
      }
    });

    socket.on('typing:stop', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId
      });
    });

    // Message Delivery Receipt
    socket.on('message:delivered', async ({ messageId, conversationId }) => {
      try {
        if (!messageId || !conversationId) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        const alreadyDelivered = message.deliveredTo.some(d => d.user.toString() === userId);
        if (!alreadyDelivered) {
          message.deliveredTo.push({ user: socket.user._id, deliveredAt: new Date() });
          if (message.status === 'sent') {
            message.status = 'delivered';
          }
          await message.save();

          io.to(`conversation:${conversationId}`).emit('message:status_update', {
            messageId,
            conversationId,
            status: message.status,
            deliveredTo: message.deliveredTo
          });
        }
      } catch (err) {
        console.error('Error processing message:delivered:', err);
      }
    });

    // Message Read Receipt
    socket.on('message:read', async ({ conversationId, messageIds }) => {
      try {
        if (!conversationId) return;

        // Reset unread count for this user in Conversation
        const conv = await Conversation.findById(conversationId);
        if (conv) {
          if (!conv.unreadCounts) conv.unreadCounts = new Map();
          conv.unreadCounts.set(userId, 0);
          conv.markModified('unreadCounts');
          await conv.save();
        }

        // If specific messageIds passed or update all unread in conversation
        const query = {
          conversation: conversationId,
          'readBy.user': { $ne: socket.user._id },
          sender: { $ne: socket.user._id }
        };

        if (Array.isArray(messageIds) && messageIds.length > 0) {
          query._id = { $in: messageIds };
        }

        const unreadMessages = await Message.find(query);
        const readAt = new Date();

        for (const msg of unreadMessages) {
          msg.readBy.push({ user: socket.user._id, readAt });
          msg.status = 'read';
          await msg.save();
        }

        io.to(`conversation:${conversationId}`).emit('message:read_update', {
          conversationId,
          readerId: userId,
          readMessageIds: unreadMessages.map(m => m._id),
          readAt
        });

        // Also notify user room to sync badge
        io.to(`user:${userId}`).emit('conversation:unread_cleared', {
          conversationId
        });
      } catch (err) {
        console.error('Error processing message:read:', err);
      }
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      const userSockets = userSocketMap.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        // If no active connections remain for this user, mark offline
        if (userSockets.size === 0) {
          userSocketMap.delete(userId);
          const lastSeenTime = new Date();
          try {
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen: lastSeenTime
            });

            io.emit('user:presence', {
              userId,
              isOnline: false,
              lastSeen: lastSeenTime
            });
          } catch (err) {
            console.error('Error updating user offline status:', err);
          }
        }
      }
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return ioInstance;
};

const isUserOnline = (userId) => {
  const sockets = userSocketMap.get(userId.toString());
  return !!(sockets && sockets.size > 0);
};

module.exports = {
  initSocket,
  getIO,
  isUserOnline
};
