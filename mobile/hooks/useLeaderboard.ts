import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export type Player = {
  id: string;
  name: string;
  points: number;
};

export function useLeaderboardFeed(groupId: string | undefined) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !groupId) return;

    //full leaderboard data
    const onData = (data: { groupId: string; leaderboard: Player[] }) => {
      if (data.groupId !== groupId) return;
      setPlayers(data.leaderboard);
    };

    //point updated
    const onUpdate = (data: { groupId: string; entries: Player[] }) => {
      if (data.groupId !== groupId) return;
      setPlayers(data.entries);
    };

    const requestLeaderboard = () => socket.emit('getLeaderboard', { groupId });

    // leaderboard connection guard
    if (socket.connected) {
      requestLeaderboard();
    } else {
      socket.once('connect', requestLeaderboard);
    }

    socket.on('leaderboardData', onData);
    socket.on('leaderboardUpdate', onUpdate);

    return () => {
      socket.off('connect',requestLeaderboard);
      socket.off('leaderboardData', onData);
      socket.off('leaderboardUpdate', onUpdate);
    };
  }, [groupId]);

  return players;
}