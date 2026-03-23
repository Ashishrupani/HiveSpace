import { useEffect, useCallback, useState, useRef } from 'react';
import { connectSocket, getSocket, emit } from '@/lib/socket';
import { ScrollView } from 'react-native';

export type Message = {
  id: string;
  text: string;
  sender: string;
  senderId?: string;
  time?: string;
  isOwn?: boolean;
};

export const useGroupChat = (groupId: string, userId: string, userName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!groupId || !userId) return;

    connectSocket(userId);
    const socket = getSocket()!;

    setMessages([]);// clear messages when  changing groups

    const joinAndLoad = () => {
      emit('joinGroup', { groupId, userId });
      emit('getGroupMessages', { groupId });
    };

    //wait for socket connect 
    if (socket.connected) {
      joinAndLoad();
    } else {
      socket.once('connect', joinAndLoad);
    }

    const handleHistory = (data: any) => {
      if (data.groupId !== groupId) return;
      setMessages(
        data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.senderName ?? msg.senderId ?? 'User',
          senderId: msg.senderId,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: msg.senderId === userId,
        }))
      );
    };

    const handleNewMessage = (data: any) => {
      if (data.groupId !== groupId) return;
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          text: data.text,
          sender: data.senderName ?? data.senderId ?? 'User',
          senderId: data.senderId,
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: data.senderId === userId,
        },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    };

    socket.on('groupMessagesHistory', handleHistory);
    socket.on('groupMessage', handleNewMessage);

    return () => {
      //clean up when leaving the chat 
      emit('leaveGroup', { groupId, userId });
      socket.off('connect', joinAndLoad);
      socket.off('groupMessagesHistory', handleHistory);
      socket.off('groupMessage', handleNewMessage);
    };
  }, [groupId, userId]);

  // braodcast the message 
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
