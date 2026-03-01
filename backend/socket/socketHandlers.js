
const userSocketMap = {}; // { userId: socketId }
const groupMessages = {}; // { groupId: Message[] }  — in-memory, resets on server restart

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function initializeSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // ── Chat ────────────────────────────────────────────────────────────────

    socket.on('joinGroup', ({ groupId, userId: uid }) => {
      socket.join(`group_${groupId}`);
      console.log(`User ${uid} joined group ${groupId}`);
    });

    socket.on('leaveGroup', ({ groupId, userId: uid }) => {
      socket.leave(`group_${groupId}`);
      console.log(`User ${uid} left group ${groupId}`);
    });

    socket.on('sendGroupMessage', (data) => {
      const { groupId, text, senderId, senderName } = data;
      if (!groupId || !text) return;

      const message = {
        id: String(Date.now()),
        groupId,
        text,
        senderId,
        senderName,
        timestamp: new Date(),
      };

      if (!groupMessages[groupId]) groupMessages[groupId] = [];
      groupMessages[groupId].push(message);

      io.to(`group_${groupId}`).emit('groupMessage', message);
    });

    socket.on('getGroupMessages', ({ groupId }) => {
      const messages = groupMessages[groupId] || [];
      socket.emit('groupMessagesHistory', { groupId, messages });
    });

    // ── Notifications (skeleton) ─────────────────────────────────────────────
    // Events: 'sendNotification' → emits 'notification' to target user
    // Shape: { toUserId, type, title, body, data }

    socket.on('sendNotification', ({ toUserId, type, title, body, data }) => {
      const targetSocketId = userSocketMap[toUserId];
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', { type, title, body, data });
      }
    });

    // ── Disconnect ───────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      delete userSocketMap[userId];
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
  });
}
