
import React, {useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BackButton from '@/components/ui/BackButton';
import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';
import authStyles from '@/constants/styles/auth.styles';
import { colors } from '@/constants/theme';
const bee = require('../../../../assets/images/bee_astronanut.jpg');
const queen = require('../../../../assets/images/queen_bee.avif');
import { getSocket } from '@/lib/socket';

type Player = {
  id: string;
  name: string;
  points: number;
};

function useLeaderboardFeed(groupId: string | undefined) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !groupId) return;

    const onData = (data: { groupId: string; leaderboard: Player[] }) => {
      if (data.groupId === groupId) setPlayers(data.leaderboard);
    };

    const onUpdate = (data: { groupId: string; entries: Player[] }) => {
      if (data.groupId === groupId) setPlayers(data.entries);
    };

    socket.emit('getLeaderboard', { groupId });
    socket.on('leaderboardData', onData);
    socket.on('leaderboardUpdate', onUpdate);

    return () => {
      socket.off('leaderboardData', onData);
      socket.off('leaderboardUpdate', onUpdate);
    };
  }, [groupId]);

  return players;
}

export default function Leaderboard() {
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;
  const [tab, setTab] = useState<'Daily' | 'Weekly' | 'All time'>('Daily');

  const livePlayers = useLeaderboardFeed(groupId);

  const sorted = useMemo(() => {
    return livePlayers.slice().sort((a, b) => b.points - a.points);
  }, [livePlayers, tab]);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return(
    <LinearGradient
      colors={[colors.gradienttop, colors.gradientmid, colors.gradientbottom]}
      style={authStyles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <BackButton />

        <ThemedText type="title" style={styles.header}>
          Leaderboard
        </ThemedText>
        <ThemedText style={styles.subheader}>Group ID: {id}</ThemedText>

        <View style={styles.tabRow}>
          {(['Daily', 'Weekly', 'All time'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t ? styles.tabActive : undefined]}
            >
              <ThemedText style={[styles.tabText, tab === t ? styles.tabTextActive : undefined]}>{t}</ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Podium */}
        <View style={styles.podiumRow}>
          <View style={styles.podiumSide}>
            {top3[1] && (
              <View style={styles.podiumItem}>
                <Image source={bee} style={[styles.avatarLarge, styles.avatarSilverImage]} />
                <View style={styles.podiumCard}>
                  <ThemedText style={styles.podiumName}>{top3[1].name}</ThemedText>
                  <ThemedText style={styles.podiumPoints}>{top3[1].points}</ThemedText>
                </View>
              </View>
            )}
          </View>

          <View style={styles.podiumCenter}>
            {top3[0] && (
              <View style={styles.podiumItemCenter}>
                <Image source={queen} style={[styles.avatarXL, styles.avatarGoldImage]} />
                <View style={styles.podiumCardCenter}>
                  <ThemedText style={styles.podiumNameCenter}>{top3[0].name}</ThemedText>
                  <ThemedText style={styles.podiumPointsCenter}>{top3[0].points}</ThemedText>
                </View>
              </View>
            )}
          </View>

          <View style={styles.podiumSide}>
            {top3[2] && (
              <View style={styles.podiumItem}>
                <Image source={bee} style={[styles.avatarLarge, styles.avatarBronzeImage]} />
                <View style={styles.podiumCard}>
                  <ThemedText style={styles.podiumName}>{top3[2].name}</ThemedText>
                  <ThemedText style={styles.podiumPoints}>{top3[2].points}</ThemedText>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* List of remaining players in dark cards */}
        <View style={styles.listWrap}>
          <FlatList
            data={rest}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => (
              <View style={styles.listCard}>
                <View style={styles.listLeft}>
                  <View style={styles.avatarSmall}>
                    <ThemedText style={styles.avatarTextSmall}>{getInitials(item.name)}</ThemedText>
                  </View>
                  <View style={styles.nameCol}>
                    <ThemedText style={styles.nameBold}>{item.name}</ThemedText>
                    <ThemedText style={styles.username}>@username</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.points}>{item.points}</ThemedText>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function getInitials(name: string) {
  const parts = name.split(' ');
  const first = parts[0] ? parts[0][0] : '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingTop: 34,
    flexGrow: 1,
  },
  header: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '700',
    color: '#fff',
  },
  subheader: {
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.9,
    color: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    padding: 6,
    marginBottom: 18,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '800',
  },

  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  podiumSide: {
    flex: 1,
    alignItems: 'center',
  },
  podiumCenter: {
    flex: 1,
    alignItems: 'center',
  },
  podiumItem: {
    alignItems: 'center',
  },
  podiumItemCenter: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarXL: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarGold: {
    backgroundColor: '#FFD700',
  },
  avatarSilver: {
    backgroundColor: '#94A3B8',
  },
  avatarBronze: {
    backgroundColor: '#C76B2D',
  },
  avatarTextSmall: {
    color: '#fff',
    fontWeight: '700',
  },
  avatarTextXL: {
    color: '#111',
    fontWeight: '800',
  },
  /* image variants for top-3 */
  avatarSilverImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarGoldImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  avatarBronzeImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  podiumCard: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  podiumCardCenter: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  podiumName: {
    color: '#fff',
    fontWeight: '700',
  },
  podiumPoints: {
    color: '#fff',
    fontWeight: '700',
  },
  podiumNameCenter: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  podiumPointsCenter: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },

  listWrap: {
    marginTop: 6,
  },
  listCard: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nameCol: {
    flexDirection: 'column',
  },
  nameBold: {
    color: '#fff',
    fontWeight: '700',
  },
  username: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
  points: {
    color: '#fff',
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: 'transparent',
  },
});
