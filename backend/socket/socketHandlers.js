
import mongoose from 'mongoose';
import Group from '../models/group.schema.js';

const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

//send notifiction for online users only
function sendNotification(io, userId, { type, title, body, data }) {
  const socketId = userSocketMap[userId];
  if (!socketId) return; 
  io.to(socketId).emit('notification', { type, title, body, data });
}

// Call this from any controller when group scores change.
// entries: [{ id, name, points }]
export function pushLeaderboardUpdate(io, groupId, entries) {
  io.to(`group_${groupId}`).emit('leaderboardUpdate', { groupId, entries });
}

export function initializeSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    //add user and brosdcast the updated list
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    //chat 
    socket.on('joinGroup', ({ groupId, userId: uid }) => {
      socket.join(`group_${groupId}`);
      console.log(`User ${uid} joined group ${groupId}`);
    });

    socket.on('leaveGroup', ({ groupId, userId: uid }) => {
      socket.leave(`group_${groupId}`);
      console.log(`User ${uid} left group ${groupId}`);
    });

    socket.on('sendGroupMessage', async (data) => {
      const { groupId, text, senderId, senderName } = data;
      if (!groupId || !text || !mongoose.isValidObjectId(groupId)) return;

      const msgId = new mongoose.Types.ObjectId();
      const timestamp = new Date();

      const chatEntry = {
        _id: msgId,
        senderUID: senderId,
        senderName: senderName || senderId,
        message: text,
        timestamp,
      };

      //get the list of online members 
      let group;
      try {
        group = await Group.findOneAndUpdate(
          { _id: groupId },
          { $push: { chat: chatEntry } },
          { new: false, projection: { UID: 1 } }
        );
      } catch (err) {
        console.error('[socket] sendGroupMessage DB error:', err.message);
        return;
      }

      // send the message to all online members
      io.to(`group_${groupId}`).emit('groupMessage', {
        id: msgId.toString(),
        groupId,
        text,
        senderId,
        senderName: senderName || senderId,
        timestamp,
      });

      //nofification to offline members FIXME: clean up task seperate out the notifications so we can jsut single user groups or all user bradcast
      const roomSockets = io.sockets.adapter.rooms.get(`group_${groupId}`) ?? new Set();
      const notifBody = text.length > 60 ? text.slice(0, 60) + '…' : text;

      for (const memberId of (group?.UID ?? [])) {
        if (memberId === senderId) continue;//skip the sender

        const memberSocketId = userSocketMap[memberId];
        if (!memberSocketId || roomSockets.has(memberSocketId)) continue;

        sendNotification(io, memberId, {
          type: 'chat',
          title: senderName || 'New message',
          body: notifBody,
          data: { groupId },
        });
      }
    });

    socket.on('getGroupMessages', async ({ groupId }) => {
      if (!groupId || !mongoose.isValidObjectId(groupId)) {
        return socket.emit('groupMessagesHistory', { groupId, messages: [] });
      }

      try {
        const group = await Group.findById(groupId, { chat: 1 });
        const messages = (group?.chat ?? []).map((m) => ({
          id: m._id.toString(),
          text: m.message,
          senderId: m.senderUID,
          senderName: m.senderName || m.senderUID,
          timestamp: m.timestamp,
        }));
        socket.emit('groupMessagesHistory', { groupId, messages });
      } catch (err) {
        console.error('[socket] getGroupMessages DB error:', err.message);
        socket.emit('groupMessagesHistory', { groupId, messages: [] });
      }
    });

    // notifications (WIP)
    // Events: 'sendNotification'  emits 'notification' to target user
    // Shape: { toUserId, type, title, body, data }

    socket.on('sendNotification', ({ toUserId, type, title, body, data }) => {
      sendNotification(io, toUserId, { type, title, body, data });//FIXME:auth check needs to be added in some way 
    });

    // leaderboard
    socket.on('getLeaderboard', async ({ groupId }) => {
      if (!groupId || !mongoose.isValidObjectId(groupId)) {
        return socket.emit('leaderboardData', { groupId, leaderboard: [] });
      }

      try {
        const group = await Group.findById(groupId, { UID: 1 });
        const leaderboard = (group?.UID ?? []).map((userId) => ({
          id: userId,
          name: userId, //FIXME placeholder until you have user name lookup
          points: 0,    //FIXME placeholder until scoring is decided
        }));
        socket.emit('leaderboardData', { groupId, leaderboard });
      } catch (err) {
        console.error('[socket] getLeaderboard DB error:', err.message);
        socket.emit('leaderboardData', { groupId, leaderboard: [] });
      }
    });

    //disconnect websocket 
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      delete userSocketMap[userId];
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
  });
}
