import React, { useEffect } from 'react';
import DrawerNavigation from '@/components/drawerNavigation';
import { useAuth } from '@clerk/clerk-expo';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useNotifications } from '@/hooks/useNotifications';

export default function HomeLayout() {
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;
    connectSocket(userId);
    return () => { disconnectSocket(); };
  }, [userId]);

  useNotifications(userId);

  return (
    <>
      <DrawerNavigation />
    </>
  );
}

/* Notes
 * This layout component sets up the home screen with a drawer navigation.
 */