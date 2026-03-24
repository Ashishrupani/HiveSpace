import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { getSocket } from '@/lib/socket';

/**
 * Listens for 'notification' events from the server and shows a toast.
 * Server sends: { type, title, body, data? }
 * Mount this once at the top of the authenticated layout.
 */
export const useNotifications = (userId: string | null | undefined) => {
  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = ({ title, body }: { type: string; title: string; body: string }) => {
      Toast.show({ type: 'info', text1: title, text2: body });
    };

    socket.on('notification', handleNotification);
    return () => { socket.off('notification', handleNotification); };
  }, [userId]);
};
