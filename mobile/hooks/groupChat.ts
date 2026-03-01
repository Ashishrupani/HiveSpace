import { useEffect, useCallback, useState, useRef } from 'react';
import { getSocket, emit } from '@/lib/socket';
import { ScrollView } from 'react-native';

export type Message = {
  id: string;
  text: string;
  sender: string;
  senderId?: string;
  time?: string;
  isOwn?: boolean;
};

/**
 * Manages group chat for a single group room.
 * Socket lifecycle (connect/disconnect) is handled by _layout.tsx.
 * This hook only manages room membership and messages.
 */
export const useGroupChat = (groupId: string, userId: string, userName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!groupId || !userId) return;

    const socket = getSocket();
    if (!socket) return;

    setMessages([]);

    const joinAndLoad = () => {
      emit('joinGroup', { groupId, userId });
      emit('getGroupMessages', { groupId });
    };

    // Socket may already be connected (managed by _layout.tsx)
    if (socket.connected) {
      joinAndLoad();
    } else {
      socket.once('connect', joinAndLoad);
    }

    const handleHistory = (data: any) => {
      if (data.groupId !== groupId) return;
      const loaded = data.messages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.senderName,
        senderId: msg.senderId,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: msg.senderId === userId,
      }));
      setMessages(loaded);
    };

    const handleNewMessage = (data: any) => {
      if (data.groupId !== groupId) return;
      const msg: Message = {
        id: data.id,
        text: data.text,
        sender: data.senderName || 'User',
        senderId: data.senderId,
        time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: data.senderId === userId,
      };
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    };

    socket.on('groupMessagesHistory', handleHistory);
    socket.on('groupMessage', handleNewMessage);

    return () => {
      emit('leaveGroup', { groupId, userId });
      socket.off('connect', joinAndLoad);
      socket.off('groupMessagesHistory', handleHistory);
      socket.off('groupMessage', handleNewMessage);
    };
  }, [groupId, userId]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      emit('sendGroupMessage', {
        groupId,
        text: text.trim(),
        senderId: userId,
        senderName: userName || userId,
      });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [groupId, userId, userName]
  );

  return { messages, sendMessage, scrollRef };
};
