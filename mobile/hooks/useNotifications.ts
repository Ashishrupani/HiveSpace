import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export type AppNotification = {
  type: string;   // e.g. 'chat', 'leaderboard', 'goal'
  title: string;
  body: string;
  data?: Record<string, any>;
  receivedAt: Date;
};

/**
 * Listens for real-time notifications from the server.
 *
 * The server emits 'notification' events via the 'sendNotification' socket event.
 * Shape: { type, title, body, data }
 *
 * TODO: wire up to in-app notification UI / push notifications.
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (payload: Omit<AppNotification, 'receivedAt'>) => {
      const notification: AppNotification = { ...payload, receivedAt: new Date() };
      console.log('[notification]', notification);
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, []);

  const clearNotifications = () => setNotifications([]);

  return { notifications, clearNotifications };
};
